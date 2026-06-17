const { callAI, callAIStream, generateEmbedding } = require("../aiClient.js");
const { classifyRetrievalClass } = require("../classifyRetrieval.js");
const { getAnswerInstructions } = require("./answerPrompts.js");
const Project = require("../../projects/project.schema.js");
const Task = require("../../tasks/task.schema.js");
const TaskContent = require("../../taskContent/taskContent.schema.js");
const TaskChunkEmbedding = require("../../taskContent/taskChunkEmbedding.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

// --- RRF: merges vector and BM25 ranked lists into one ---

// Reciprocal Rank Fusion — merges multiple ranked lists into one
// Each doc scores sum of 1/(k + rank) across all lists it appears in
function reciprocalRankFusion(lists, k = 60) {
  const scores = new Map();
  for (const list of lists) {
    list.forEach((doc, rank) => {
      const key = doc._id.toString();
      const entry = scores.get(key) || { doc, score: 0 };
      entry.score += 1 / (k + rank + 1);
      scores.set(key, entry);
    });
  }
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map((e) => ({ ...e.doc, _rrfScore: e.score }));
}

// Server-Sent Events helper. `data:` lines must be followed by a blank line
// per the SSE spec. We JSON-encode each event so the client can parse a
// stable payload shape regardless of which event type fired.
function writeSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

async function chatProvider(req, res) {
  // Streaming mode is enabled per-request via ?stream=true so the existing
  // JSON callers (eval scripts, debug tools) keep working unchanged.
  const streaming = req.query.stream === "true";
  // Stage callback: writes an SSE event when streaming, no-op otherwise.
  // Inserted at real pipeline boundaries (analyzing, retrieving, generating)
  // so the client UI reflects what the server is actually doing — not
  // hardcoded progress phrases.
  const onStage = streaming
    ? (stage) => writeSSE(res, { type: "stage", stage })
    : () => {};

  if (streaming) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
  }

  try {
    const { projectId } = req.params;
    const { messages } = req.body; // [{ role: "user"|"assistant", content: string }]

    // ?strategy=chunked (default) uses TaskChunkEmbedding collection
    // ?strategy=single uses the one-vector-per-task embedding on TaskContent
    // ?strategy=fullcontext dumps all task plainText into the prompt — no retrieval, baseline comparison
    // ?strategy=hybrid BM25 (Atlas Search) + vector search merged via Reciprocal Rank Fusion
    const strategy = ["single", "fullcontext", "hybrid"].includes(req.query.strategy)
      ? req.query.strategy
      : "chunked";
    const debug = req.query.debug === "true";
    // ?promptMode=baseline (default) uses the legacy answer-instruction block.
    // ?promptMode=routed picks one of three class-specific contracts
    // (FACT/LIST/OPEN) based on classifyRetrievalClass's output.
    // If the classifier returned null (failure), routed silently falls back
    // to baseline so a routed request can never be worse than baseline.
    const promptMode = req.query.promptMode === "routed" ? "routed" : "baseline";

    // CHUNK_RETRIEVAL_CONFIG=150:50 selects which stored chunk version to retrieve against
    // defaults to first entry in CHUNK_CONFIGS, or 300/50 if neither is set
    // _chunkConfig query param overrides env — for eval scripts only, not a user-facing feature
    const chunkFilter = (() => {
      const param = req.query._chunkConfig || process.env.CHUNK_RETRIEVAL_CONFIG;
      if (param) {
        const [size, overlap] = param.split(":").map(Number);
        return { chunkSize: size, chunkOverlap: overlap };
      }
      try {
        const { size, overlap } = JSON.parse(process.env.CHUNK_CONFIGS)[0];
        return { chunkSize: size, chunkOverlap: overlap };
      } catch { return { chunkSize: 300, chunkOverlap: 50 }; }
    })();

    const [project, currentMember] = await Promise.all([
      Project.findById(projectId).lean(),
      Member.findOne({ user: req.user?.sub, project: projectId }),
    ]);

    if (!project) {
      if (streaming) {
        writeSSE(res, { type: "error", message: "Project not found." });
        return res.end();
      }
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Project not found." });
    }
    if (!currentMember) {
      if (streaming) {
        writeSSE(res, { type: "error", message: "You do not have permission to access this project." });
        return res.end();
      }
      return res.status(StatusCodes.FORBIDDEN).json({ message: "You do not have permission to access this project." });
    }

    // First visible stage: server is parsing the request, kicking off the
    // classifier, and starting to assemble project context. The frontend
    // shows "Analyzing your question…" while this runs.
    onStage("analyzing");
    // Retrieval-mode classifier — kicked off here, after project existence
    // and membership are confirmed, so we never spend a classifier call on
    // 404/403 paths (auth probes, expired sessions, deleted projects). The
    // project+membership check is one round trip (~30-80ms); the classifier
    // is much longer (~300-500ms), so it still runs in parallel with the
    // members/tasks fetch, embedding, and retrieval below — wall-clock cost
    // approaches zero by the time we await it before the answer LLM call.
    // Stateless on purpose: only the latest user message, no history.
    // Currently used only for telemetry/debug; prompt routing wires in next phase.
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m) => m.role === "user")
      : null;
    const classifyStart = lastUserMessage ? Date.now() : null;
    const retrievalClassPromise = lastUserMessage
      ? classifyRetrievalClass(lastUserMessage.content).catch((err) => {
          errorLogger(`Retrieval-class classification failed: ${err.message}`, req, err);
          return null;
        })
      : Promise.resolve(null);

    // fetch compact project context (always included)
    const [members, allTasks] = await Promise.all([
      Member.find({ project: projectId }).populate("user", "firstName lastName").lean(),
      Task.find({ project: projectId }).select("title description status priority dueDate").lean(),
    ]);

    const now = new Date();

    const memberList = members
      .map((m) => `- ${m.user ? `${m.user.firstName} ${m.user.lastName}` : "Unknown"} (${m.role})`)
      .join("\n");

    const taskSummaryList = allTasks
      .map((t) => {
        const due = t.dueDate ? new Date(t.dueDate).toDateString() : "no due date";
        const overdue = t.dueDate && new Date(t.dueDate) < now && t.status !== "completed" ? " ⚠ OVERDUE" : "";
        return `- "${t.title}" [${t.status}, ${t.priority} priority, due: ${due}${overdue}]\n  Description: ${t.description}`;
      })
      .join("\n");

    // Second visible stage: retrieval. We're about to embed the query (if
    // not in fullcontext mode) and run Atlas Vector Search / BM25 / RRF.
    // The frontend shows "Searching project knowledge…" while this runs.
    if (lastUserMessage && allTasks.length > 0) onStage("retrieving");
    // RAG: embed the latest user message and retrieve semantically relevant task contents
    // (lastUserMessage was identified above next to the classifier kickoff)
    let retrievedContext = "";
    let debugChunks = []; // only populated when ?debug=true
    let hybridStats = null; // {vectorCount, bm25Count, bm25Errored} — hybrid only, surfaces silent BM25 fallback

    if (lastUserMessage && allTasks.length > 0) {
      try {
        if (strategy === "fullcontext") {
          // --- FULLCONTEXT STRATEGY (no retrieval — baseline comparison) ---
          // Fetch all task plainText and dump into context.
          // Gives the AI the same information RAG would retrieve, but without selection.
          const allContents = await TaskContent.find(
            { task: { $in: allTasks.map((t) => t._id) } }
          ).select("task plainText").lean();

          const taskMap = Object.fromEntries(allTasks.map((t) => [t._id.toString(), t]));

          retrievedContext = allContents
            .filter((c) => c.plainText?.trim())
            .map((c) => {
              const task = taskMap[c.task.toString()];
              return `### ${task?.title ?? "Unknown task"}\n${c.plainText}`;
            })
            .join("\n\n---\n\n");

          if (debug) {
            debugChunks = allContents
              .filter((c) => c.plainText?.trim())
              .map((c) => ({
                task: taskMap[c.task.toString()]?.title ?? "Unknown",
                words: c.plainText.trim().split(/\s+/).length,
              }));
          }
        } else {
          const queryEmbedding = await generateEmbedding(lastUserMessage.content);

          if (strategy === "hybrid") {
            // --- HYBRID STRATEGY: Atlas Search BM25 + vector search merged via RRF ---
            const projectOid = new mongoose.Types.ObjectId(projectId);

            // 1. Vector search (wide net)
            const vectorResults = await TaskChunkEmbedding.aggregate([
              {
                $vectorSearch: {
                  index: "taskChunkEmbedding_vector_index",
                  path: "embedding",
                  queryVector: queryEmbedding,
                  numCandidates: 100,
                  limit: 20,
                  filter: { project: projectOid, ...chunkFilter },
                },
              },
              { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskInfo" } },
              { $unwind: "$taskInfo" },
              { $project: { chunkText: 1, chunkIndex: 1, chunkSize: 1, chunkOverlap: 1, task: 1, "taskInfo.title": 1, "taskInfo.description": 1, score: { $meta: "vectorSearchScore" } } },
            ]);

            // 2. BM25 full-text search via Atlas Search (Lucene BM25 scoring)
            // Requires Atlas Search index "taskChunkEmbedding_text_index" on taskchunkembeddings,
            // mapping (dynamic:false): chunkText "string", project "objectId",
            // chunkSize "number", chunkOverlap "number".
            // NOTE: the chunkSize/chunkOverlap equals-filters below match NOTHING if those two
            // fields aren't mapped — BM25 silently returns 0 results (bm25Count=0, no error).
            let bm25Results = [];
            let bm25Errored = false;
            try {
              bm25Results = await TaskChunkEmbedding.aggregate([
                {
                  $search: {
                    index: "taskChunkEmbedding_text_index",
                    compound: {
                      filter: [
                        { equals: { path: "project", value: projectOid } },
                        { equals: { path: "chunkSize", value: chunkFilter.chunkSize } },
                        { equals: { path: "chunkOverlap", value: chunkFilter.chunkOverlap } },
                      ],
                      should: [{ text: { query: lastUserMessage.content, path: "chunkText" } }],
                      minimumShouldMatch: 1,
                    },
                  },
                },
                { $limit: 20 },
                { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskInfo" } },
                { $unwind: "$taskInfo" },
                {
                  $project: {
                    chunkText: 1, chunkIndex: 1, chunkSize: 1, chunkOverlap: 1, task: 1,
                    "taskInfo.title": 1, "taskInfo.description": 1,
                    score: { $meta: "searchScore" },
                  },
                },
              ]);
            } catch (bm25Error) {
              // Atlas Search index missing or unavailable — falls back to vector-only
              bm25Errored = true;
              errorLogger(`BM25 search failed (index may not exist): ${bm25Error.message}`, req, bm25Error);
            }

            // record retrieval composition so eval/debug can detect a silent BM25 fallback
            hybridStats = { vectorCount: vectorResults.length, bm25Count: bm25Results.length, bm25Errored };

            // 3. RRF merge → top 8
            const merged = reciprocalRankFusion([vectorResults, bm25Results]).slice(0, 8);

            if (merged.length > 0) {
              retrievedContext = merged
                .map((r) => `### ${r.taskInfo.title} (chunk ${r.chunkIndex + 1}, size=${r.chunkSize}, overlap=${r.chunkOverlap})\nDescription: ${r.taskInfo.description}\nContent excerpt:\n${r.chunkText}`)
                .join("\n\n---\n\n");
              if (debug) {
                debugChunks = merged.map((r) => ({
                  task: r.taskInfo.title,
                  chunkIndex: r.chunkIndex,
                  rrfScore: Math.round(r._rrfScore * 10000) / 10000,
                  preview: r.chunkText.split(" ").slice(0, 20).join(" ") + "...",
                }));
              }
            }
          } else if (strategy === "chunked") {
          // --- CHUNKED STRATEGY ---
          // Atlas Vector Search index: "taskChunkEmbedding_vector_index" on taskchunkembeddings
          // vector field: embedding (1536 dims, cosine), filter field: project
          const results = await TaskChunkEmbedding.aggregate([
            {
              $vectorSearch: {
                index: "taskChunkEmbedding_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 8,
                filter: { project: new mongoose.Types.ObjectId(projectId), ...chunkFilter },
              },
            },
            {
              $lookup: {
                from: "tasks",
                localField: "task",
                foreignField: "_id",
                as: "taskInfo",
              },
            },
            { $unwind: "$taskInfo" },
            {
              $project: {
                chunkText: 1,
                chunkIndex: 1,
                chunkSize: 1,
                chunkOverlap: 1,
                "taskInfo.title": 1,
                "taskInfo.description": 1,
                score: { $meta: "vectorSearchScore" },
              },
            },
          ]);

          if (results.length > 0) {
            retrievedContext = results
              .map(
                (r) =>
                  `### ${r.taskInfo.title} (chunk ${r.chunkIndex + 1}, size=${r.chunkSize}, overlap=${r.chunkOverlap})\nDescription: ${r.taskInfo.description}\nContent excerpt:\n${r.chunkText}`
              )
              .join("\n\n---\n\n");
            if (debug) {
              debugChunks = results.map((r) => ({
                task: r.taskInfo.title,
                chunkIndex: r.chunkIndex,
                score: r.score,
                preview: r.chunkText.split(" ").slice(0, 20).join(" ") + "...",
              }));
            }
          }
        } else {
          // --- SINGLE STRATEGY ---
          // Atlas Vector Search index: "taskContent_vector_index" on taskcontents
          // vector field: embedding (1536 dims, cosine), filter field: task
          const taskIds = allTasks.map((t) => t._id);

          const results = await TaskContent.aggregate([
            {
              $vectorSearch: {
                index: "taskContent_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 50,
                limit: 3,
                filter: { task: { $in: taskIds } },
              },
            },
            {
              $lookup: {
                from: "tasks",
                localField: "task",
                foreignField: "_id",
                as: "taskInfo",
              },
            },
            { $unwind: "$taskInfo" },
            {
              $project: {
                plainText: 1,
                "taskInfo.title": 1,
                "taskInfo.description": 1,
                score: { $meta: "vectorSearchScore" },
              },
            },
          ]);

          if (results.length > 0) {
            retrievedContext = results
              .map(
                (r) =>
                  `### ${r.taskInfo.title}\nDescription: ${r.taskInfo.description}\nContent:\n${r.plainText || "(no content)"}`
              )
              .join("\n\n---\n\n");
            if (debug) {
              debugChunks = results.map((r) => ({
                task: r.taskInfo.title,
                score: r.score,
                preview: (r.plainText || "").split(" ").slice(0, 20).join(" ") + "...",
              }));
            }
          }
        } // end if/else chunked vs single
        } // end else (not fullcontext)
      } catch (ragError) {
        // non-fatal: fall back to compact summary only
        errorLogger(`RAG retrieval failed (strategy=${strategy}): ${ragError.message}`, req, ragError);
      }
    }

    // Await classifier result (kicked off above, in parallel with retrieval)
    // Must happen BEFORE building systemPrompt so the answer-instruction
    // block can vary by class when ?promptMode=routed.
    const retrievalClass = await retrievalClassPromise;
    const classifyMs = classifyStart ? Date.now() - classifyStart : null;

    const answerInstructions = getAnswerInstructions(promptMode, retrievalClass);

    const systemPrompt = `You are a project management assistant for the project "${project.name}".
${project.description ? `Project description: ${project.description}` : ""}

## Team (${members.length} member${members.length !== 1 ? "s" : ""})
${memberList || "No members yet"}

## All Tasks (overview)
${taskSummaryList || "No tasks yet"}
${
  retrievedContext
    ? `\n## Relevant Task Details (retrieved for your question)\n${retrievedContext}`
    : ""
}

${answerInstructions}`;

    const aiMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Third visible stage: the model is generating. Fires just before the
    // LLM call so the frontend can swap the "Searching…" status for
    // "Generating answer…" right when streamed tokens are about to start.
    onStage("generating");

    const debugPayload = debug
      ? {
          strategy,
          chunkFilter,
          retrieved: debugChunks,
          retrievalClass,
          classifyMs,
          promptMode,
          // Resolved class actually used to pick the prompt (null + routed -> fell back to baseline)
          promptClass: promptMode === "routed" && retrievalClass ? retrievalClass : "BASELINE",
          ...(hybridStats ? { hybrid: hybridStats } : {}),
        }
      : null;

    if (streaming) {
      try {
        for await (const token of callAIStream(aiMessages, 1000)) {
          writeSSE(res, { type: "token", text: token });
        }
      } catch (streamError) {
        errorLogger(`Streaming chat call failed: ${streamError.message}`, req, streamError);
        writeSSE(res, {
          type: "error",
          message: "The model call failed partway through. Please try again.",
        });
        return res.end();
      }
      if (debugPayload) writeSSE(res, { type: "debug", debug: debugPayload });
      writeSSE(res, { type: "done" });
      return res.end();
    }

    const reply = await callAI(aiMessages, 1000);
    const response = { message: reply };
    if (debugPayload) response._debug = debugPayload;
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    errorLogger(`Error in AI chat: ${error.message}`, req, error);
    if (streaming) {
      writeSSE(res, {
        type: "error",
        message: "Unable to process your request, please try again later.",
      });
      return res.end();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = chatProvider;

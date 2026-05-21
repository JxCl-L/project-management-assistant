const { callAI, generateEmbedding } = require("../aiClient.js");
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

async function chatProvider(req, res) {
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

    const [project, currentMember] = await Promise.all([
      Project.findById(projectId).lean(),
      Member.findOne({ user: req.user?.sub, project: projectId }),
    ]);

    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Project not found." });
    }
    if (!currentMember) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "You do not have permission to access this project." });
    }

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

    // RAG: embed the latest user message and retrieve semantically relevant task contents
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    let retrievedContext = "";
    let debugChunks = []; // only populated when ?debug=true

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
                  filter: { project: projectOid },
                },
              },
              { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskInfo" } },
              { $unwind: "$taskInfo" },
              { $project: { chunkText: 1, chunkIndex: 1, chunkSize: 1, chunkOverlap: 1, task: 1, "taskInfo.title": 1, "taskInfo.description": 1, score: { $meta: "vectorSearchScore" } } },
            ]);

            // 2. BM25 full-text search via Atlas Search (Lucene BM25 scoring)
            // Requires Atlas Search index "taskChunkEmbedding_text_index" on taskchunkembeddings
            // with chunkText mapped as "string" and project mapped as "objectId"
            let bm25Results = [];
            try {
              bm25Results = await TaskChunkEmbedding.aggregate([
                {
                  $search: {
                    index: "taskChunkEmbedding_text_index",
                    compound: {
                      filter: [{ equals: { path: "project", value: projectOid } }],
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
              errorLogger(`BM25 search failed (index may not exist): ${bm25Error.message}`, req, bm25Error);
            }

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
                filter: { project: new mongoose.Types.ObjectId(projectId) },
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

Answer the user's questions based on the context above. If the information is not available in the context, say so clearly. Be concise and helpful.`;

    const aiMessages = [{ role: "system", content: systemPrompt }, ...messages];

    const reply = await callAI(aiMessages, 1000);

    const response = { message: reply };
    if (debug) response._debug = { strategy, retrieved: debugChunks };
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    errorLogger(`Error in AI chat: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = chatProvider;

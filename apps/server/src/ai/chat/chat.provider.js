const { callAI, callAIStream } = require("../aiClient.js");
const { classifyAnswerMode } = require("./classifyAnswerMode.js");
const { getAnswerInstructions } = require("./answerPrompts.js");
const Project = require("../../projects/project.schema.js");
const Task = require("../../tasks/task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

const { writeSSE, initSSE, makeStageEmitter } = require("./sse.js");
const { resolveChunkFilter } = require("./chunkConfig.js");
const { runRetrieval, resolveStrategyName } = require("./retrieval/index.js");
const { buildSystemPrompt } = require("./buildSystemPrompt.js");

function pickLastUserMessage(messages) {
  return Array.isArray(messages)
    ? [...messages].reverse().find((m) => m.role === "user")
    : null;
}

function sendError(res, streaming, status, message) {
  if (streaming) {
    writeSSE(res, { type: "error", message });
    return res.end();
  }
  return res.status(status).json({ message });
}

async function chatProvider(req, res) {
  // Streaming mode is enabled per-request via ?stream=true so the existing
  // JSON callers (eval scripts, debug tools) keep working unchanged.
  const streaming = req.query.stream === "true";
  const onStage = makeStageEmitter(res, streaming);
  if (streaming) initSSE(res);

  try {
    const { projectId } = req.params;
    const { messages } = req.body;

    const strategy = resolveStrategyName(req.query.strategy);
    const debug = req.query.debug === "true";
    // ?promptMode=routed picks a class-specific contract (FACT/LIST/OPEN) from
    // classifyAnswerMode's output. If the classifier returns null (failure),
    // routed silently falls back to baseline so it can never be worse.
    const promptMode = req.query.promptMode === "routed" ? "routed" : "baseline";
    const chunkFilter = resolveChunkFilter(req);

    const [project, currentMember] = await Promise.all([
      Project.findById(projectId).lean(),
      Member.findOne({ user: req.user?.sub, project: projectId }),
    ]);

    if (!project) {
      return sendError(res, streaming, StatusCodes.NOT_FOUND, "Project not found.");
    }
    if (!currentMember) {
      return sendError(res, streaming, StatusCodes.FORBIDDEN, "You do not have permission to access this project.");
    }

    // First visible stage: server is parsing the request, kicking off the
    // classifier, and starting to assemble project context.
    onStage("analyzing");

    // Classifier kicked off AFTER auth so we never spend a call on 404/403.
    // Runs in parallel with member/task fetch and retrieval below.
    const lastUserMessage = pickLastUserMessage(messages);
    const classifyStart = lastUserMessage ? Date.now() : null;
    const answerModePromise = lastUserMessage
      ? classifyAnswerMode(lastUserMessage.content).catch((err) => {
          errorLogger(`Answer-mode classification failed: ${err.message}`, req, err);
          return null;
        })
      : Promise.resolve(null);

    const [members, allTasks] = await Promise.all([
      Member.find({ project: projectId }).populate("user", "firstName lastName").lean(),
      Task.find({ project: projectId }).select("title description status priority dueDate").lean(),
    ]);

    // Second visible stage: retrieval.
    let retrievedContext = "";
    let debugChunks = [];
    let hybridStats = null;

    if (lastUserMessage && allTasks.length > 0) {
      onStage("retrieving");
      try {
        const result = await runRetrieval(strategy, {
          projectId,
          allTasks,
          lastUserMessage,
          chunkFilter,
          debug,
          req,
        });
        retrievedContext = result.retrievedContext;
        debugChunks = result.debugChunks;
        hybridStats = result.hybridStats ?? null;
      } catch (ragError) {
        // non-fatal: fall back to compact summary only
        errorLogger(`RAG retrieval failed (strategy=${strategy}): ${ragError.message}`, req, ragError);
      }
    }

    // Await classifier — must resolve before systemPrompt so routed mode
    // can pick the class-specific answer contract.
    const answerMode = await answerModePromise;
    const classifyMs = classifyStart ? Date.now() - classifyStart : null;
    const answerInstructions = getAnswerInstructions(promptMode, answerMode);

    const systemPrompt = buildSystemPrompt({
      project,
      members,
      tasks: allTasks,
      retrievedContext,
      answerInstructions,
    });

    const aiMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Third visible stage: generation. Fires right before the LLM call so
    // the client can swap "Searching…" for "Generating answer…" as tokens start.
    onStage("generating");

    const debugPayload = debug
      ? {
          strategy,
          chunkFilter,
          retrieved: debugChunks,
          answerMode,
          classifyMs,
          promptMode,
          // Resolved class actually used (null + routed → fell back to baseline)
          promptClass: promptMode === "routed" && answerMode ? answerMode : "BASELINE",
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
    return sendError(
      res,
      streaming,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Unable to process your request, please try again later."
    );
  }
}

module.exports = chatProvider;

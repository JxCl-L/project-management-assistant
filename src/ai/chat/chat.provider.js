const { callAI, generateEmbedding } = require("../aiClient.js");
const Project = require("../../projects/project.schema.js");
const Task = require("../../tasks/task.schema.js");
const TaskContent = require("../../taskContent/taskContent.schema.js");
const TaskChunkEmbedding = require("../../taskContent/taskChunkEmbedding.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function chatProvider(req, res) {
  try {
    const { projectId } = req.params;
    const { messages } = req.body; // [{ role: "user"|"assistant", content: string }]
    // ?strategy=chunked (default) uses TaskChunkEmbedding collection
    // ?strategy=single uses the one-vector-per-task embedding on TaskContent
    const strategy = req.query.strategy === "single" ? "single" : "chunked";
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
        const queryEmbedding = await generateEmbedding(lastUserMessage.content);

        if (strategy === "chunked") {
          // --- CHUNKED STRATEGY ---
          // Atlas Vector Search index: "taskChunkEmbedding_vector_index" on taskchunkembeddings
          // vector field: embedding (1536 dims, cosine), filter field: project
          const results = await TaskChunkEmbedding.aggregate([
            {
              $vectorSearch: {
                index: "taskChunkEmbedding_vector_index",
                path: "embedding",
                queryVector: queryEmbedding,
                numCandidates: 50,
                limit: 5,
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
        }
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

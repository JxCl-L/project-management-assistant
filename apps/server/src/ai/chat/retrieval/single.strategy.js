const TaskContent = require("../../../taskContent/taskContent.schema.js");
const { generateEmbedding } = require("../../aiClient.js");

// SINGLE — one vector per task on TaskContent.
// Atlas Vector Search index: "taskContent_vector_index" on taskcontents
// vector field: embedding (1536 dims, cosine), filter field: task
async function singleStrategy({ allTasks, lastUserMessage, debug }) {
  const queryEmbedding = await generateEmbedding(lastUserMessage.content);
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
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskInfo" } },
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

  if (results.length === 0) return { retrievedContext: "", debugChunks: [] };

  const retrievedContext = results
    .map(
      (r) =>
        `### ${r.taskInfo.title}\nDescription: ${r.taskInfo.description}\nContent:\n${r.plainText || "(no content)"}`
    )
    .join("\n\n---\n\n");

  const debugChunks = debug
    ? results.map((r) => ({
        task: r.taskInfo.title,
        score: r.score,
        preview: (r.plainText || "").split(" ").slice(0, 20).join(" ") + "...",
      }))
    : [];

  return { retrievedContext, debugChunks };
}

module.exports = { singleStrategy };

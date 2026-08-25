const mongoose = require("mongoose");
const TaskChunkEmbedding = require("../../../taskContent/taskChunkEmbedding.schema.js");
const { generateEmbedding } = require("../../aiClient.js");

// CHUNKED — many chunks per task on TaskChunkEmbedding.
// Atlas Vector Search index: "taskChunkEmbedding_vector_index" on taskchunkembeddings
// vector field: embedding (1536 dims, cosine), filter field: project
async function chunkedStrategy({ projectId, lastUserMessage, chunkFilter, debug }) {
  const queryEmbedding = await generateEmbedding(lastUserMessage.content);

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
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskInfo" } },
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

  if (results.length === 0) return { retrievedContext: "", debugChunks: [] };

  const retrievedContext = results
    .map(
      (r) =>
        `### ${r.taskInfo.title} (chunk ${r.chunkIndex + 1}, size=${r.chunkSize}, overlap=${r.chunkOverlap})\nDescription: ${r.taskInfo.description}\nContent excerpt:\n${r.chunkText}`
    )
    .join("\n\n---\n\n");

  const debugChunks = debug
    ? results.map((r) => ({
        task: r.taskInfo.title,
        chunkIndex: r.chunkIndex,
        score: r.score,
        preview: r.chunkText.split(" ").slice(0, 20).join(" ") + "...",
      }))
    : [];

  return { retrievedContext, debugChunks };
}

module.exports = { chunkedStrategy };

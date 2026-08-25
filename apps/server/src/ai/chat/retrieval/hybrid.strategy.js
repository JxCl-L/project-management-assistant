const mongoose = require("mongoose");
const TaskChunkEmbedding = require("../../../taskContent/taskChunkEmbedding.schema.js");
const { generateEmbedding } = require("../../aiClient.js");
const errorLogger = require("../../../helpers/errorLogger.helper.js");
const { reciprocalRankFusion } = require("./rrf.js");

// HYBRID — Atlas Vector Search + BM25 full-text merged via Reciprocal Rank Fusion.
//
// BM25 index requirement: Atlas Search index "taskChunkEmbedding_text_index" on
// taskchunkembeddings, mapping (dynamic:false): chunkText "string",
// project "objectId", chunkSize "number", chunkOverlap "number".
// NOTE: the chunkSize/chunkOverlap equals-filters below match NOTHING if those
// two fields aren't mapped — BM25 silently returns 0 results (no error).
// `hybridStats.bm25Count === 0 && !bm25Errored` is the signal for that case.
async function hybridStrategy({ projectId, lastUserMessage, chunkFilter, debug, req }) {
  const queryEmbedding = await generateEmbedding(lastUserMessage.content);
  const projectOid = new mongoose.Types.ObjectId(projectId);

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
    {
      $project: {
        chunkText: 1, chunkIndex: 1, chunkSize: 1, chunkOverlap: 1, task: 1,
        "taskInfo.title": 1, "taskInfo.description": 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

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
    // Atlas Search index missing or unavailable — falls back to vector-only.
    bm25Errored = true;
    errorLogger(`BM25 search failed (index may not exist): ${bm25Error.message}`, req, bm25Error);
  }

  const hybridStats = {
    vectorCount: vectorResults.length,
    bm25Count: bm25Results.length,
    bm25Errored,
  };

  const merged = reciprocalRankFusion([vectorResults, bm25Results]).slice(0, 8);

  if (merged.length === 0) {
    return { retrievedContext: "", debugChunks: [], hybridStats };
  }

  const retrievedContext = merged
    .map((r) => `### ${r.taskInfo.title} (chunk ${r.chunkIndex + 1}, size=${r.chunkSize}, overlap=${r.chunkOverlap})\nDescription: ${r.taskInfo.description}\nContent excerpt:\n${r.chunkText}`)
    .join("\n\n---\n\n");

  const debugChunks = debug
    ? merged.map((r) => ({
        task: r.taskInfo.title,
        chunkIndex: r.chunkIndex,
        rrfScore: Math.round(r._rrfScore * 10000) / 10000,
        preview: r.chunkText.split(" ").slice(0, 20).join(" ") + "...",
      }))
    : [];

  return { retrievedContext, debugChunks, hybridStats };
}

module.exports = { hybridStrategy };

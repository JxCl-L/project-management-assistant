const { generateEmbedding } = require("./aiClient.js");
const { chunkText } = require("./chunker.js");
const TaskContent = require("../taskContent/taskContent.schema.js");
const TaskChunkEmbedding = require("../taskContent/taskChunkEmbedding.schema.js");

/**
 * Generates and saves both single-chunk and chunked embeddings for a task's content.
 * Marks embeddingStale: false on TaskContent when done.
 *
 * Called from:
 *  - embeddingDebouncer (after debounce delay following a content save)
 *  - getTaskContent (fire-and-forget when embeddingStale is true on page visit)
 *
 * @param {{ taskContentId, taskId, projectId, taskTitle, taskDescription }} params
 */
async function generateTaskEmbeddings({ taskContentId, taskId, projectId, taskTitle, taskDescription }) {
  // re-fetch plainText at call time — always embed the latest saved content
  const fresh = await TaskContent.findById(taskContentId).select("plainText").lean();
  const text = fresh?.plainText || "";

  if (!text.trim()) return;

  // single-chunk embedding
  try {
    const embedding = await generateEmbedding(`${taskTitle}\n${taskDescription}\n${text}`);
    await TaskContent.findByIdAndUpdate(taskContentId, { embedding, embeddingStale: false });
  } catch (err) {
    console.error(`[generateTaskEmbeddings] single-chunk failed for task ${taskId}:`, err.message);
  }

  // chunked embeddings
  try {
    const chunkSize = parseInt(process.env.CHUNK_SIZE) || 300;
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP) || 50;
    const chunks = chunkText(text, chunkSize, chunkOverlap);

    await TaskChunkEmbedding.deleteMany({ taskContent: taskContentId });

    const chunkDocs = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await generateEmbedding(`${taskTitle}\n${taskDescription}\n${chunk}`);
        return {
          taskContent: taskContentId,
          task: taskId,
          project: projectId,
          chunkIndex: index,
          chunkText: chunk,
          embedding,
          chunkSize,
          chunkOverlap,
        };
      })
    );

    await TaskChunkEmbedding.insertMany(chunkDocs);
  } catch (err) {
    console.error(`[generateTaskEmbeddings] chunked failed for task ${taskId}:`, err.message);
  }
}

module.exports = { generateTaskEmbeddings };

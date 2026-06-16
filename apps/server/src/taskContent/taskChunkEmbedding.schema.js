const { Schema, model } = require("mongoose");

/**
 * Stores one embedding per text chunk derived from a TaskContent document.
 * Multiple chunks per TaskContent when plainText exceeds chunkSize words.
 *
 * Atlas Vector Search index required on this collection:
 *   index name : "taskChunkEmbedding_vector_index"
 *   vector field: embedding (1536 dims, cosine)
 *   filter field: project (for scoping search to a single project)
 */
const taskChunkEmbeddingSchema = new Schema(
  {
    taskContent: {
      type: Schema.Types.ObjectId,
      ref: "TaskContent",
      required: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    // record settings used — lets you compare different experiments in Atlas
    chunkSize: {
      type: Number,
      required: true,
    },
    chunkOverlap: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// fast delete of old chunks when content is re-saved
taskChunkEmbeddingSchema.index({ taskContent: 1 });
// used as filter field in $vectorSearch to scope results to a project
taskChunkEmbeddingSchema.index({ project: 1 });

const TaskChunkEmbedding = model("TaskChunkEmbedding", taskChunkEmbeddingSchema);

module.exports = TaskChunkEmbedding;

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env.development") });

// override chunk settings for this RAG test run
process.env.CHUNK_SIZE = "150";
process.env.CHUNK_OVERLAP = "50";

const TaskContent = require("../src/taskContent/taskContent.schema");
const TaskChunkEmbedding = require("../src/taskContent/taskChunkEmbedding.schema");
const Task = require("../src/tasks/task.schema");
const { generateTaskEmbeddings } = require("../src/ai/generateTaskEmbeddings");

const RAG_TEST_DB = "fullstackTasks_rag_test";

async function backfill() {
  await mongoose.connect(process.env.DATABASE_URL, { dbName: RAG_TEST_DB });
  console.log(`✅ Connected to MongoDB: ${RAG_TEST_DB}`);
  console.log(`   CHUNK_SIZE=${process.env.CHUNK_SIZE}, CHUNK_OVERLAP=${process.env.CHUNK_OVERLAP}\n`);

  const staleContents = await TaskContent.find({ embeddingStale: true }).lean();
  console.log(`📋 Found ${staleContents.length} stale TaskContent(s) to process\n`);

  if (staleContents.length === 0) {
    console.log("Nothing to do. All embeddings are up to date.");
    process.exit(0);
  }

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < staleContents.length; i++) {
    const tc = staleContents[i];

    const task = await Task.findById(tc.task).select("title description project").lean();
    if (!task) {
      console.warn(`  [${i + 1}/${staleContents.length}] ⚠️  Task not found for TaskContent ${tc._id} — skipping`);
      failed++;
      continue;
    }

    process.stdout.write(`  [${i + 1}/${staleContents.length}] "${task.title}" ... `);

    try {
      await generateTaskEmbeddings({
        taskContentId: tc._id,
        taskId: task._id,
        projectId: task.project,
        taskTitle: task.title,
        taskDescription: task.description,
      });

      // count chunks saved
      const chunkCount = await TaskChunkEmbedding.countDocuments({ taskContent: tc._id });
      console.log(`✅  (${chunkCount} chunks)`);
      succeeded++;
    } catch (err) {
      console.log(`❌  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Backfill complete — ${succeeded} succeeded, ${failed} failed`);
  console.log("----------------------------");
  console.log("Next step: create the Atlas Vector Search index on");
  console.log(`  database   : ${RAG_TEST_DB}`);
  console.log("  collection : taskchunkembeddings");
  console.log("  index name : taskChunkEmbedding_vector_index");
  console.log("  field      : embedding (1536 dims, cosine)");
  console.log("  filter     : project");
  console.log("----------------------------");

  process.exit(failed > 0 ? 1 : 0);
}

backfill().catch((err) => {
  console.error("❌ Backfill failed:", err);
  process.exit(1);
});

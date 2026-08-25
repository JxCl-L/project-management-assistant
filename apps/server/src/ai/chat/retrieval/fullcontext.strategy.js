const TaskContent = require("../../../taskContent/taskContent.schema.js");

// FULLCONTEXT — no retrieval. Dumps every task's plainText into the prompt.
// Baseline for comparing against RAG strategies: same information, no selection.
async function fullcontextStrategy({ allTasks, debug }) {
  const allContents = await TaskContent.find(
    { task: { $in: allTasks.map((t) => t._id) } }
  ).select("task plainText").lean();

  const taskMap = Object.fromEntries(allTasks.map((t) => [t._id.toString(), t]));
  const withText = allContents.filter((c) => c.plainText?.trim());

  const retrievedContext = withText
    .map((c) => {
      const task = taskMap[c.task.toString()];
      return `### ${task?.title ?? "Unknown task"}\n${c.plainText}`;
    })
    .join("\n\n---\n\n");

  const debugChunks = debug
    ? withText.map((c) => ({
        task: taskMap[c.task.toString()]?.title ?? "Unknown",
        words: c.plainText.trim().split(/\s+/).length,
      }))
    : [];

  return { retrievedContext, debugChunks };
}

module.exports = { fullcontextStrategy };

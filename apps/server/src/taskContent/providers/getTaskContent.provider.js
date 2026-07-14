const TaskContent = require("../taskContent.schema.js");
const Task = require("../../tasks/task.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const { scheduleEmbedding } = require("../../ai/embeddingDebouncer.js");
const { generateTaskEmbeddings } = require("../../ai/generateTaskEmbeddings.js");

async function getTaskContentProvider(req, res) {
  const { projectId, taskId } = req.params;

  try {
    // check task exist + grab title/description for the catch-up embedding job
    const task = await Task.findOne({ _id: taskId, project: projectId }).select("title description");
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task not found.",
      });
    }

    // fetch task contents (keep embeddingStale so we can decide on catch-up)
    const taskContents = await TaskContent.findOne(
      { task: taskId },
      { embedding: 0 }
    );
    if (!taskContents) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task content not found.",
      });
    }

    // Catch-up: if a prior save's debounced embedding job was lost (e.g. server
    // restart inside the debounce window), re-schedule it here. Fire-and-forget —
    // never block the read on it.
    if (taskContents.embeddingStale && taskContents.plainText?.trim()) {
      scheduleEmbedding(taskId, () =>
        generateTaskEmbeddings({
          taskContentId: taskContents._id,
          taskId,
          projectId,
          taskTitle: task.title,
          taskDescription: task.description,
        })
      );
    }

    const { embeddingStale: _omit, ...response } = taskContents.toObject();
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    errorLogger(
      `Error while fetching task contents: ${error.message}`,
      req,
      error
    );
    // return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getTaskContentProvider;

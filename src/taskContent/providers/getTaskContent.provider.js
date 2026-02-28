const TaskContent = require("../taskContent.schema.js");
const Task = require("../../tasks/task.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function getTaskContentProvider(req, res) {
  const { projectId, taskId } = req.params;

  try {
    // check task exist
    const taskExists = await Task.exists({ _id: taskId, project: projectId });
    if (!taskExists) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task not found.",
      });
    }

    // fetch task contents
    const taskContents = await TaskContent.findOne({
      task: taskId,
    });
    if (!taskContents) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task content not found.",
      });
    }

    return res.status(StatusCodes.OK).json(taskContents);
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

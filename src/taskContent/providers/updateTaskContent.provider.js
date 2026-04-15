const TaskContent = require("../taskContent.schema.js");
const Task = require("../../tasks/task.schema.js");
const User = require("../../users/user.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const { getIO } = require("../../socket/io.js");

async function updateTaskContentProvider(req, res) {
  const validatedData = matchedData(req);
  const { projectId, taskId } = req.params;
  const { content, plainText } = validatedData;

  try {
    // check if task exists
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task not found.",
      });
    }

    // fetch task content
    const taskContent = await TaskContent.findOne({task: taskId}); 
    if (!taskContent) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task content not found.",
      });
    }

    // update content fields
    taskContent.content = content;
    taskContent.plainText = plainText;
    taskContent.lastEditedBy = req.user.sub;
    taskContent.lastEditedAt = new Date();
    
    await taskContent.save();

    // broadcast task:content-updated to all clients in the task room
    const user = await User.findById(req.user.sub).select("firstName lastName");
    getIO().to(`task:${taskId}`).emit("task:content-updated", {
      taskId,
      content: taskContent.content,
      plainText: taskContent.plainText,
      savedBy: {
        userId: req.user.sub,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
      },
    });

    return res.status(StatusCodes.OK).json(taskContent);
  } catch (error) {
    errorLogger("Error while updating task content", req, error);
    return res
      // .status(StatusCodes.GATEWAY_TIMEOUT)
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: "Unable to process your request, please try again later.",
      });
  }
}

module.exports = updateTaskContentProvider;

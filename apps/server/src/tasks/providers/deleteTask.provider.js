const Task = require("../task.schema.js");
const TaskContent = require("../../taskContent/taskContent.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function deleteTaskProvider(req, res) {
  const validatedData = matchedData(req);

  try {
    const deletedTask = await Task.deleteOne({ _id: validatedData["_id"] });

    if (deletedTask.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await TaskContent.deleteOne({ task: validatedData["_id"] });

    res.status(StatusCodes.OK).json(deletedTask);
  } catch (error) {
    errorLogger("Error while deleting task", req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = deleteTaskProvider;

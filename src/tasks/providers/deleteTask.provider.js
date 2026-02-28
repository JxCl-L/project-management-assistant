const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function deleteTaskProvider(req, res) {
  const validatedData = matchedData(req);

  try {
    // authorization check, replace with middldeware
    // const isManager = await Member.findOne({
    //   user: req.user?.sub,
    //   role: "manager",
    //   project: req.body["_id"],
    // });

    // if (!isManager) {
    //   return res.status(StatusCodes.FORBIDDEN).json({
    //     message: "You do not have permission to delete task in this project.",
    //   });
    // }

    const deletedTask = await Task.deleteOne({ _id: validatedData["_id"] });

    if (deletedTask.deletedCount === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(StatusCodes.OK).json(deletedTask);
  } catch (error) {
    errorLogger("Error while deleting task", req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = deleteTaskProvider;

const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const User = require("../../users/user.schema.js");

async function getTaskProvider(req, res) {

  try {
    // authorization check, replace with middldeware
    // const isMember = await Member.find({
    //   user: req.user?.sub,
    //   project: req.params.projectId,
    // });

    // if (!isMember || isMember.length === 0) {
    //   return res.status(StatusCodes.FORBIDDEN).json({
    //     message: "You do not have permission to view tasks in this project.",
    //   });
    // }

    const task = await Task.find({
      _id: req.params.taskId,
      project: req.params.projectId,
    }).populate('createdBy', '-password');

    if (!task || task.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task not found.",
      });
    }

    return res.status(StatusCodes.OK).json(task);
  } catch (error) {
    errorLogger(`Error while fetching task: ${error.message}`, req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getTaskProvider;

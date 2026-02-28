const Project = require("../project.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const Task = require("../../tasks/task.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function deleteProjectProvider(req, res) {
  const validatedData = matchedData(req);

  try {
    const isManager = await Member.find({
      user: req.user?.sub,
      role: "manager",
      project: req.body["_id"],
    });

    if (!isManager || isManager.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to delete this project.",
      });
    }
    const deletedProject = await Project.deleteOne({
      _id: validatedData["_id"],
    });
    const deletedMembers = await Member.deleteMany({
      project: validatedData["_id"],
    });
    const deletedTasks = await Task.deleteMany({
      project: validatedData["_id"],
    });

    res.status(StatusCodes.OK).json({ deletedProject, deletedMembers, deletedTasks });
  } catch (error) {
    errorLogger("Error while deleting project", req, error);
    return res
      .status(StatusCodes.GATEWAY_TIMEOUT)
      .json({
        reason:
          "Unable to process your delete project request, please try again later.",
      });
  }
}

module.exports = deleteProjectProvider;

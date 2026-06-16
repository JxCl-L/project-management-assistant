const Project = require("../project.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const Member = require("../../projectMembers/member.schema.js");
const User = require("../../users/user.schema.js");
const {
  getPermissionsForRole,
} = require("../../helpers/permissions.helper.js");

async function getProjectProvider(req, res) {

  try {

    const project = await Project.findById(req.params.projectId);

    const currentUserRecord = await Member.findOne({
      user: req.user?.sub,
      project: req.params.projectId,
    });
    const currentUserRole = currentUserRecord ? currentUserRecord.role : null;
    // console.log("Current user role in project:", currentUserRole);

    const creatorRecord = await User.findById(project?.createdBy).lean();
    delete creatorRecord.password;
    // console.log("Creator record:", creatorRecord);

    const finalResponse = {
      ...project.toObject(),
      currentUserRole,
      permissions: getPermissionsForRole(currentUserRole),
      creatorRecord,
    };
    // console.log("Fetched project:", finalResponse);

    return res.status(StatusCodes.OK).json(finalResponse);
  } catch (error) {
    errorLogger(`Error while fetching project: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      // change from GATEWAY_TIMEOUT to INTERNAL_SERVER_ERROR
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getProjectProvider;

const Project = require("../project.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function updateProjectProvider(req, res) {
  const validatedData = matchedData(req);

  try {
    // access authorization
    const isManager = await Member.find({
      user: req.user?.sub,
      role: "manager",
      project: req.body["_id"],
    });

    if (!isManager || isManager.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to update this project.",
      });
    }
    // 1. fetch project by __id
    const project = await Project.findById(req.body["_id"]);
    // 2. only update the fields that are provided in the request body
    project.name = validatedData.name || project.name;
    project.description = validatedData.description || project.description;
    // 3. save the updated project back to database
    await project.save();
    // 4. return the updated project
    return res.status(StatusCodes.OK).json(project);
  } catch (error) {
    errorLogger("Error while updating project", req, error);
    return res
      .status(StatusCodes.GATEWAY_TIMEOUT)
      .json({
        message: "Unable to process your request, please try again later.",
      });
  }
}

module.exports = updateProjectProvider;

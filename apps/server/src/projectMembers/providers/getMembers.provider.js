const Member = require("../member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function getMembersProvider(req, res) {
  const data = matchedData(req); // get only validated query parameters
  console.log("Fetching tasks with query:", data);
  try {
    // authorization check
    const isMember = await Member.exists({
      user: req.user?.sub,
      project: req.params.projectId,
    });

    if (!isMember) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to view members in this project.",
      });
    }

    // fetch members by project id
    const members = await Member.find({
      project: req.params.projectId,
    }).populate('user', 'firstName lastName email');;
    // console.log("Request: ",req);

    return res.status(StatusCodes.OK).json(members);
  } catch (error) {
    errorLogger(`Error while fetching tasks: ${error.message}`, req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}
module.exports = getMembersProvider;

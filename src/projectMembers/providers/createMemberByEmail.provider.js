const Member = require("../member.schema.js");
const User = require("../../users/user.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function createMemberByEmailProvider(req, res) {
  console.log("Creating task with data:", req.body); // incoming data may contain extra fields

  const validatedResult = matchedData(req);
  console.log("Validated data:", validatedResult);
  console.log("Project ID from params:", req.params.projectId);

  try {

    // authorization check

    // console.log("Checking if user is manager...");
    // console.log("Validated user:", req.user);
    // console.log("Project ID:", req.params.projectId);
    const isManager = await Member.findOne({
      user: req.user?.sub,
      role: "manager",
      project: req.params.projectId,
    });

    // console.log("isManager:", isManager);

    if (!isManager) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message:
          "You do not have permission to create members in this project.",
      });
    }

    // find user by email

    const user = await User.findOne({ email: validatedResult.email });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "No user found with the provided email address.",
      });
    }

    // check if the user is already a member of the project

    const existingMember = await Member.findOne({
      user: user._id,
      project: req.params.projectId,
    });
    if (existingMember) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "This user is already a member of the project.",
      });
    }

    // create new member

    const member = new Member({
      user: user._id,
      role: validatedResult.role,
      project: req.params.projectId,
    });
    await member.save();

    return res.status(StatusCodes.CREATED).json(member);
  } catch (error) {
    errorLogger(
      `WOW Error creating a new member: ${error.message}`,
      req,
      error
    );

    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = createMemberByEmailProvider;

const Task = require("../task.schema.js");
const TaskContent = require("../../taskContent/taskContent.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function createTaskProvider(req, res) {
  // authorization check, replace with middldeware
  // const isManagerOrEditor = await Member.findOne({
  //   user: req.user?.sub,
  //   role: { $in: ["manager", "editor"] },
  //   project: req.params.projectId,
  // });

  // console.log("isManagerOrEditor:", isManagerOrEditor);

  // if (!isManagerOrEditor) {
  //   return res.status(StatusCodes.FORBIDDEN).json({
  //     message: "You do not have permission to create task in this project.",
  //   });
  // }

  // console.log("Creating task with data:", req.body); // incoming data may contain extra fields

  const validatedResult = req.body; // this will filter out any extra fields not defined in the validator
  // console.log("Validated data:", validatedResult);
  // console.log("Req", req.params);
  // console.log("Project ID:", req.params.projectId);

  const task = new Task({
    ...validatedResult,
    createdBy: req.user.sub,
    project: req.params.projectId,
  }); // use only validated data to create new Task, not req.body directly

  try {
    await task.save();

    await new TaskContent({
      task: task._id,
      lastEditedBy: req.user.sub,
      lastEditedAt: new Date(),
    }).save();

    return res.status(StatusCodes.CREATED).json(task);
  } catch (error) {
    // console.error("Error creating task:", error); // this error usually from database or db connection
    errorLogger(`WOW Error creating a new task: ${error.message}`, req, error);

    return res
      .status(StatusCodes.GATEWAY_TIMEOUT)
      .json({
        message: "Unable to process your request, please try again later.",
      });
  }
}

module.exports = createTaskProvider;

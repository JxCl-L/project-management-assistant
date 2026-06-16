const Task = require("../../tasks/task.schema.js");
const TaskContent = require("../taskContent.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function createTaskContentProvider(req, res) {
  // permission check: middleware already checks
  // const isManagerOrEditor = await Member.findOne({
  //   user: req.user?.sub,
  //   role: { $in: ["manager", "editor"] },
  //   project: req.params.projectId,
  // });

  //   console.log("isManager:", isManager);

  // if (!isManagerOrEditor) {
  //   return res.status(StatusCodes.FORBIDDEN).json({
  //     message: "You do not have permission to create task in this project.",
  //   });
  // }

  // console.log("Creating task with data:", req.body); // incoming data may contain extra fields

  // const validatedResult = matchedData(req); // no need validator here
  const { projectId, taskId } = req.params;

  try {
    // check if task exists
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Task not found in this project.",
      });
    }

    // check task content uniqueness
    const existingTaskContent = await TaskContent.findOne({ task: taskId });
    if (existingTaskContent) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Task content already exists for this task.",
      });
    }

    // create new task content
    const taskContent = new TaskContent({
      task: taskId,
      lastEditedBy: req.user.sub,
      lastEditedAt: new Date(),
      // content, plainText, contentType will use defaults from schema
    });

    await taskContent.save();
    return res.status(StatusCodes.CREATED).json(taskContent);
  } catch (error) {
    errorLogger(
      `WOW Error creating a new task content: ${error.message}`,
      req,
      error
    );

    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({ // INTERNAL_SERVER_ERROR or this? 
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = createTaskContentProvider;

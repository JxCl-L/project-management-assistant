const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function updateTaskProvider(req, res) {
  const validatedData = matchedData(req);

  try {
    // authorization check, replace with middldeware
    // const isManagerOrEditor = await Member.findOne({
    //   user: req.user?.sub,
    //   role: { $in: ["manager", "editor"] },
    //   project: req.params.projectId,
    // });

    // console.log("isManagerOrEditor:", isManagerOrEditor);

    // if (!isManagerOrEditor) {
    //   return res.status(StatusCodes.FORBIDDEN).json({
    //     message: "You do not have permission to modify task in this project.",
    //   });
    // }

    // 1. fetch task by __id
    const task = await Task.findById(req.body["_id"]);
    // 2. only update the fields that are provided in the request body
    task.title = validatedData.title || task.title;
    task.description = validatedData.description || task.description;
    task.dueDate = validatedData.dueDate || task.dueDate;
    task.priority = validatedData.priority || task.priority;
    task.status = validatedData.status || task.status;
    // 3. save the updated task back to database
    await task.save();
    // 4. return the updated task
    return res.status(StatusCodes.OK).json(task);
  } catch (error) {
    errorLogger("Error while updating task", req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = updateTaskProvider;

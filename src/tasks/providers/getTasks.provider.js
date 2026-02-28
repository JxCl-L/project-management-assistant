const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const User = require("../../users/user.schema.js");

async function getTasksProvider(req, res) {
  const data = matchedData(req); // get only validated query parameters
  console.log("Fetch tasks from req.params.projectID:", req.params.projectId);
  // console.log("Fetch tasks from data.projectID:", data.projectId);
  console.log("Fetching tasks with query:", data);

  try {
    const isMember = await Member.find({
      user: req.user?.sub,
      project: req.params.projectId,
    });

    if (!isMember || isMember.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to view tasks in this project.",
      });
    }

    // get task counts
    const totalTasks = await Task.countDocuments({
      project: req.params.projectId,
    });
    const completedTasks = await Task.countDocuments({
      project: req.params.projectId,
      status: "completed",
    });
    const todoTasks = await Task.countDocuments({
      project: req.params.projectId,
      status: "todo",
    });
    const inProgressTasks = await Task.countDocuments({
      project: req.params.projectId,
      status: "inProgress",
    });

    // pagination
    const currentPage = parseInt(data.page);
    const limit = parseInt(data.limit);
    const order = data.order;
    let statusFilter = data.status;

    // handle empty status filter
    if (statusFilter === "") {
      // Skip all database queries for empty filter
      return res.status(StatusCodes.OK).json({
        data: [],
        pagination: {
          meta: {
            itemsPerPage: limit,
            totalItems: totalTasks,
            filteredItems: 0,
            currentPage: currentPage,
            totalPages: 0,
            completedTasks: completedTasks,
            todoTasks: todoTasks,
            inProgressTasks: inProgressTasks,
            order: order,
            status: statusFilter,
            statusArray: [],
          },
          links: {
            first: null,
            last: null,
            currentPage: null,
            next: null,
            previous: null,
          },
        },
      });
    }

    // build query
    const statusArray = statusFilter.split(",").map((status) => status.trim());
    // handle missing status filter
    if (statusFilter === undefined || statusFilter === null) {
      statusFilter = "todo,inProgress";
      statusArray = ["todo", "inProgress"];
    }
    const statusQuery = { status: { $in: statusArray } };

    const filteredCount = await Task.countDocuments({
      project: req.params.projectId,
      ...statusQuery,
    });

    // calculate pagination
    const totalPages = Math.ceil(filteredCount / limit);
    const nextPage = currentPage < totalPages ? currentPage + 1 : currentPage;
    const previousPage = currentPage > 1 ? currentPage - 1 : 1;

    // const baseUrl = `${req.protocol}://${req.get("host")}${
    //   req.originalUrl.split("?")[0]
    // }`;
    const pathWithoutQuery = req.originalUrl.split("?")[0];

    console.log("Query params:", { limit, totalPages, order });
    console.log("User ID:", req.user.sub);
    console.log("Total tasks for project:", totalTasks);

    const tasks = await Task.find({
      project: req.params.projectId,
      ...statusQuery,
    })
      .limit(limit)
      .skip((currentPage - 1) * limit)
      .sort({ createdAt: order === "asc" ? 1 : -1 })
      .populate("createdBy", "firstName lastName email"); // populate createdBy with user details

    let finalResponse = {
      data: tasks,
      pagination: {
        meta: {
          itemsPerPage: limit,
          totalItems: totalTasks,
          filteredItems: filteredCount,
          currentPage: currentPage,
          totalPages: totalPages,
          completedTasks: completedTasks,
          todoTasks: todoTasks,
          inProgressTasks: inProgressTasks,
          order: order,
          status: statusFilter,
          statusArray: statusArray,
        },
        links: {
          first: `${pathWithoutQuery}/?limit=${limit}&page=${1}&order=${order}&status=${statusFilter}`,
          last: `${pathWithoutQuery}/?limit=${limit}&page=${totalPages}&order=${order}&status=${statusFilter}`,
          currentPage: `${pathWithoutQuery}/?limit=${limit}&page=${currentPage}&order=${order}&status=${statusFilter}`,
          next: `${pathWithoutQuery}/?limit=${limit}&page=${nextPage}&order=${order}&status=${statusFilter}`,
          previous: `${pathWithoutQuery}/?limit=${limit}&page=${previousPage}&order=${order}&status=${statusFilter}`,
        },
      },
    };
    return res.status(StatusCodes.OK).json(finalResponse);
  } catch (error) {
    errorLogger(`Error while fetching tasks: ${error.message}`, req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getTasksProvider;

const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const mongoose = require("mongoose");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function getTasksProvider(req, res) {
  const data = matchedData(req);
  const t0 = Date.now();
  console.log(`\n⏱  [getTasks] START — project: ${req.params.projectId}`);

  try {
    // 1. Auth check
    const t1 = Date.now();
    const isMember = await Member.find({
      user: req.user?.sub,
      project: req.params.projectId,
    });
    console.log(`⏱  [getTasks] auth check:        ${Date.now() - t1}ms`);

    if (!isMember || isMember.length === 0) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You do not have permission to view tasks in this project.",
      });
    }

    // 2. Parse params early so status is available for the aggregation
    const currentPage = parseInt(data.page);
    const limit = parseInt(data.limit);
    const order = data.order;
    let statusFilter = data.status;

    // normalise missing status
    if (statusFilter === undefined || statusFilter === null) {
      statusFilter = "todo,inProgress";
    }

    const statusArray = statusFilter === ""
      ? []
      : statusFilter.split(",").map((s) => s.trim());

    // 3. Single aggregation replaces 5 countDocuments round-trips
    const t2 = Date.now();
    const projectId = new mongoose.Types.ObjectId(req.params.projectId);

    const [counts] = await Task.aggregate([
      { $match: { project: projectId } },
      {
        $facet: {
          total:      [{ $count: "count" }],
          completed:  [{ $match: { status: "completed"  } }, { $count: "count" }],
          todo:       [{ $match: { status: "todo"        } }, { $count: "count" }],
          inProgress: [{ $match: { status: "inProgress" } }, { $count: "count" }],
          // { $in: [] } correctly matches nothing when statusArray is empty
          filtered:   [{ $match: { status: { $in: statusArray } } }, { $count: "count" }],
        },
      },
    ]);
    console.log(`⏱  [getTasks] all counts ($facet): ${Date.now() - t2}ms`);

    const totalTasks      = counts.total[0]?.count      ?? 0;
    const completedTasks  = counts.completed[0]?.count  ?? 0;
    const todoTasks       = counts.todo[0]?.count       ?? 0;
    const inProgressTasks = counts.inProgress[0]?.count ?? 0;
    const filteredCount   = counts.filtered[0]?.count   ?? 0;

    // 4. Early return for empty status filter
    if (statusFilter === "") {
      return res.status(StatusCodes.OK).json({
        data: [],
        pagination: {
          meta: {
            itemsPerPage: limit,
            totalItems: totalTasks,
            filteredItems: 0,
            currentPage,
            totalPages: 0,
            completedTasks,
            todoTasks,
            inProgressTasks,
            order,
            status: statusFilter,
            statusArray: [],
          },
          links: { first: null, last: null, currentPage: null, next: null, previous: null },
        },
      });
    }

    // 5. Pagination calculations
    const statusQuery   = { status: { $in: statusArray } };
    const totalPages    = Math.ceil(filteredCount / limit);
    const nextPage      = currentPage < totalPages ? currentPage + 1 : currentPage;
    const previousPage  = currentPage > 1 ? currentPage - 1 : 1;
    const pathWithoutQuery = req.originalUrl.split("?")[0];

    // 6. Fetch the actual task documents
    const t3 = Date.now();
    const tasks = await Task.find({ project: req.params.projectId, ...statusQuery })
      .limit(limit)
      .skip((currentPage - 1) * limit)
      .sort({ createdAt: order === "asc" ? 1 : -1 })
      .populate("createdBy", "firstName lastName email");
    console.log(`⏱  [getTasks] find + populate:   ${Date.now() - t3}ms`);
    console.log(`⏱  [getTasks] TOTAL:             ${Date.now() - t0}ms\n`);

    return res.status(StatusCodes.OK).json({
      data: tasks,
      pagination: {
        meta: {
          itemsPerPage: limit,
          totalItems: totalTasks,
          filteredItems: filteredCount,
          currentPage,
          totalPages,
          completedTasks,
          todoTasks,
          inProgressTasks,
          order,
          status: statusFilter,
          statusArray,
        },
        links: {
          first:       `${pathWithoutQuery}/?limit=${limit}&page=1&order=${order}&status=${statusFilter}`,
          last:        `${pathWithoutQuery}/?limit=${limit}&page=${totalPages}&order=${order}&status=${statusFilter}`,
          currentPage: `${pathWithoutQuery}/?limit=${limit}&page=${currentPage}&order=${order}&status=${statusFilter}`,
          next:        `${pathWithoutQuery}/?limit=${limit}&page=${nextPage}&order=${order}&status=${statusFilter}`,
          previous:    `${pathWithoutQuery}/?limit=${limit}&page=${previousPage}&order=${order}&status=${statusFilter}`,
        },
      },
    });
  } catch (error) {
    errorLogger(`Error while fetching tasks: ${error.message}`, req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getTasksProvider;

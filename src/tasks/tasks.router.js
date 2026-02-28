const express = require("express");
const { body, validationResult } = require("express-validator");
const tasksController = require("./tasks.controller.js");
const { StatusCodes } = require("http-status-codes");
const createTaskValidator = require("./validators/createTask.validator.js");
const getTasksValidator = require("./validators/getTasks.validator.js");
const getTaskValidator = require("./validators/getTask.validator.js");
const updateTaskValidator = require("./validators/updateTask.validator.js");
const deleteTaskValidator = require("./validators/deleteTask.validator.js");
const authenticateToken = require("../middleware/authenticateToken.middleware.js");
const checkPermission = require("../middleware/checkPermission.middleware.js");

const tasksRouter = express.Router({ mergeParams: true }); // to access parent route params like :projectId

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /tasks:
 *   get:
 *     summary: Get all tasks with pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tasks needed to return in a single response
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination of the task response
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: 'asc'
 *           enum: [ 'asc', 'desc' ]
 *         description: Order of the tasks based on dueDate, either ascending or descending
 *     responses:
 *       200:
 *         description: Task list retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 200
 *               message: "OK"
 *               data:
 *                 - _id: 68ce4d6df151766023b3cf07
 *                   title: "Create a new video"
 *                   description: "A video about creating a new task"
 *                   status: "todo"
 *                   priority: "normal"
 *                   dueDate: "2025-01-01T23:59:59Z"
 *
 *       401:
 *        description: Unauthorized, missing or invalid token
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 401
 *               message: "Unauthorized, missing or invalid token"
 *               error:
 *                 message: "You are not authorized to perform this request"
 *       403:
 *        description: Forbidden error
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 403
 *               message: "Forbidden"
 *               error:
 *                 message: "Invalid token. Please login again."
 *
 */

tasksRouter.get(
  "/",
  authenticateToken,
//   checkPermission("tasks", "GET"), // all can get tasks
  getTasksValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return tasksController.handleGetTasks(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

tasksRouter.get(
  "/:taskId",
  authenticateToken,
  checkPermission("task", "GET"),
  getTaskValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return tasksController.handleGetTask(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 201
 *               message: "Task created successfully"
 *               data:
 *                 _id: 68ce4d6df151766023b3cf07
 *                 title: "Create a new video"
 *                 description: "A video about creating a new task"
 *                 status: "todo"
 *                 priority: "normal"
 *                 dueDate: "2025-01-01T23:59:59Z"
 *
 *       401:
 *        description: Unauthorized, missing or invalid token
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 401
 *               message: "Unauthorized, missing or invalid token"
 *               error:
 *                 message: "You are not authorized to perform this request"
 *       403:
 *        description: Forbidden error
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 403
 *               message: "Forbidden"
 *               error:
 *                 message: "Invalid token. Please login again."
 *
 */

tasksRouter.post(
  "/",
  authenticateToken,
  checkPermission("tasks", "POST"),
  createTaskValidator,
  (req, res) => {
    const result = validationResult(req);
    // console.log(result);

    if (result.isEmpty()) {
      tasksController.handlePostTasks(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /tasks:
 *   patch:
 *     summary: Update an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 200
 *               message: "Task updated successfully"
 *               data:
 *                 _id: 68ce4d6df151766023b3cf07
 *                 title: "Create a new video"
 *                 description: "A video about creating a new task"
 *                 status: "todo"
 *                 priority: "normal"
 *                 dueDate: "2025-01-01T23:59:59Z"
 *
 *       401:
 *        description: Unauthorized, missing or invalid token
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 401
 *               message: "Unauthorized, missing or invalid token"
 *               error:
 *                 message: "You are not authorized to perform this request"
 *       403:
 *        description: Forbidden error
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 403
 *               message: "Forbidden"
 *               error:
 *                 message: "Invalid token. Please login again."
 *
 */

tasksRouter.patch(
  "/",
  authenticateToken,
  checkPermission("tasks", "PATCH"),
  updateTaskValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return tasksController.handlePatchTasks(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

/**
 * @swagger
 *
 * components:
 *  securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /tasks:
 *   delete:
 *     summary: Delete an existing task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskDelete'
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 200
 *               message: "Task deleted successfully"
 *               data:
 *                 acknowledged: true
 *                 deletedCount: 1
 *
 *       401:
 *        description: Unauthorized, missing or invalid token
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 401
 *               message: "Unauthorized, missing or invalid token"
 *               error:
 *                 message: "You are not authorized to perform this request"
 *       403:
 *        description: Forbidden error
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 403
 *               message: "Forbidden"
 *               error:
 *                 message: "Invalid token. Please login again."
 *
 */

tasksRouter.delete(
  "/",
  authenticateToken,
  checkPermission("tasks", "DELETE"),
  deleteTaskValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return tasksController.handleDeleteTasks(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

module.exports = tasksRouter;

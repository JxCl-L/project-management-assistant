const express = require("express");
const { body, validationResult } = require("express-validator");
const taskContentController = require("./taskContent.controller.js");
const { StatusCodes } = require("http-status-codes");
const createTaskContentValidator = require("./validators/createTaskContent.validator.js");
const getTaskContentValidator = require("./validators/getTaskContent.validator.js");
const updateTaskContentValidator = require("./validators/updateTaskContent.validator.js");
const rewriteTaskContentValidator = require("./validators/rewriteTaskContent.validator.js");
// const deleteTaskContentValidator = require("./validators/deleteTaskContent.validator.js");
const authenticateToken = require("../middleware/authenticateToken.middleware.js");
const checkPermission = require("../middleware/checkPermission.middleware.js");

const taskContentRouter = express.Router({ mergeParams: true }); // to access parent route params like :projectId

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

taskContentRouter.get(
  "/",
  authenticateToken,
  checkPermission("taskContent", "GET"),
  getTaskContentValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return taskContentController.handleGetTaskContent(req, res);
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

taskContentRouter.post(
  "/",
  authenticateToken,
  checkPermission("taskContent", "POST"),
  createTaskContentValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      taskContentController.handlePostTaskContent(req, res);
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

taskContentRouter.patch(
  "/",
  authenticateToken,
  checkPermission("taskContent", "PATCH"),
  updateTaskContentValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return taskContentController.handlePatchTaskContent(req, res);
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

// taskContentRouter.delete(
//   "/",
//   authenticateToken,
//   checkPermission("taskContent", "DELETE"),
//   deleteTaskContentValidator,
//   (req, res) => {
//     const result = validationResult(req);

//     if (result.isEmpty()) {
//       return taskContentController.handleDeleteTaskContent(req, res);
//     } else {
//       res.status(StatusCodes.BAD_REQUEST).json(result.array());
//     }
//   }
// );

taskContentRouter.post(
  "/rewrite",
  authenticateToken,
  checkPermission("taskContent", "GET"),
  rewriteTaskContentValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return taskContentController.handleRewriteTaskContent(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

module.exports = taskContentRouter;
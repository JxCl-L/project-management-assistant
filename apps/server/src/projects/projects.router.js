const express = require("express");
const { body, validationResult } = require("express-validator");
const projectsController = require("./projects.controller.js");
const { StatusCodes } = require("http-status-codes");
const createProjectValidator = require("./validators/createProject.validator.js");
const getProjectsValidator = require("./validators/getProjects.validator.js");
const getProjectValidator = require("./validators/getProject.validator.js");
const updateProjectValidator = require("./validators/updateProject.validator.js");
const deleteProjectValidator = require("./validators/deleteProject.validator.js");
const generateProjectSummaryValidator = require("./validators/generateProjectSummary.validator.js");
const getCalendarValidator = require("./validators/getCalendar.validator.js");
const authenticateToken = require("../middleware/authenticateToken.middleware.js");
const checkPermission = require("../middleware/checkPermission.middleware.js");

const projectsRouter = express.Router();

projectsRouter.post(
  "/",
  authenticateToken,
//   checkPermission("projects", "POST"), // anyone can create project
  createProjectValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      projectsController.handlePostProjects(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

projectsRouter.patch(
  "/",
  authenticateToken,
  checkPermission("projects", "PATCH"),
  updateProjectValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return projectsController.handlePatchProjects(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

projectsRouter.get(
  "/",
  authenticateToken,
//   checkPermission("projects", "GET"), // all can get projects
  getProjectsValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return projectsController.handleGetProjects(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

projectsRouter.get(
  "/dashboard",
  authenticateToken,
  (req, res) => projectsController.handleGetDashboard(req, res)
);

projectsRouter.get(
  "/calendar",
  authenticateToken,
  getCalendarValidator,
  (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return projectsController.handleGetCalendar(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

projectsRouter.get(
  "/:projectId",
  authenticateToken,
  checkPermission("project", "GET"),
  getProjectValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return projectsController.handleGetProject(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);


projectsRouter.get(
  "/:projectId/summary",
  authenticateToken,
  checkPermission("project", "GET"),
  generateProjectSummaryValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return projectsController.handleGetProjectSummary(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

projectsRouter.delete(
  "/",
  authenticateToken,
  checkPermission("projects", "DELETE"),
  deleteProjectValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return projectsController.handleDeleteProjects(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

module.exports = projectsRouter;

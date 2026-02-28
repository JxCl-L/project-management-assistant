const express = require("express");
const { body, validationResult } = require("express-validator");
const membersController = require("./members.controller.js");
const { StatusCodes } = require("http-status-codes");
const createMemberValidator = require("./validators/createMember.validator.js");
const getMembersValidator = require("./validators/getMembers.validator.js");
const updateMemberValidator = require("./validators/updateMember.validator.js");
const deleteMemberValidator = require("./validators/deleteMember.validator.js");
const createMemberByEmailValidator = require("./validators/createMemberByEmail.validator.js");
const authenticateToken = require("../middleware/authenticateToken.middleware.js");
const checkPermission = require("../middleware/checkPermission.middleware.js");

const membersRouter = express.Router({ mergeParams: true }); // to access parent route params like :projectId

membersRouter.post(
  "/",
  authenticateToken,
  checkPermission("members", "POST"),
  createMemberValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return membersController.handlePostMembers(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

membersRouter.patch(
  "/",
  authenticateToken,
  checkPermission("members", "PATCH"),
  updateMemberValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return membersController.handlePatchMembers(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

membersRouter.get(
  "/",
  authenticateToken,
  checkPermission("members", "GET"),
  getMembersValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return membersController.handleGetMembers(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

membersRouter.delete(
  "/",
  authenticateToken,
  checkPermission("members", "DELETE"),
  deleteMemberValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return membersController.handleDeleteMembers(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

membersRouter.post(
  "/email",
  authenticateToken,
  checkPermission("members", "POST"),
  createMemberByEmailValidator,
  (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      return membersController.handlePostMembersByEmail(req, res);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
  }
);

module.exports = membersRouter;

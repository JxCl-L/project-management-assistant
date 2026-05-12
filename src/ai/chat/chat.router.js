const express = require("express");
const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const authenticateToken = require("../../middleware/authenticateToken.middleware.js");
const checkPermission = require("../../middleware/checkPermission.middleware.js");
const chatValidator = require("./chat.validator.js");
const chatController = require("./chat.controller.js");

const chatRouter = express.Router({ mergeParams: true }); // access :projectId from parent route

chatRouter.post(
  "/",
  authenticateToken,
  checkPermission("projectChat", "POST"),
  chatValidator,
  (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return chatController.handlePostChat(req, res);
    }
    return res.status(StatusCodes.BAD_REQUEST).json(result.array());
  }
);

module.exports = chatRouter;

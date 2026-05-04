const { param } = require("express-validator");

const rewriteTaskValidator = [
  param("projectId", "Valid project id is required").notEmpty().isMongoId(),
  param("taskId", "Valid task id is required").notEmpty().isMongoId(),
];

module.exports = rewriteTaskValidator;

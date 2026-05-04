const { param } = require("express-validator");

const rewriteTaskContentValidator = [
  param("projectId", "Valid project id is required").notEmpty().isMongoId(),
  param("taskId", "Valid task id is required").notEmpty().isMongoId(),
];

module.exports = rewriteTaskContentValidator;

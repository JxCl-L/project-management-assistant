const { param } = require("express-validator");

const getTaskValidator = [
  param("projectId", "valid project id is required").notEmpty().isMongoId(),
  param("taskId", "valid task id is required").notEmpty().isMongoId(),
];

module.exports = getTaskValidator;
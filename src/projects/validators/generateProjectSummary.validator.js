const { param } = require("express-validator");

const generateProjectSummaryValidator = [
  param("projectId", "Valid project id is required").notEmpty().isMongoId(),
];

module.exports = generateProjectSummaryValidator;

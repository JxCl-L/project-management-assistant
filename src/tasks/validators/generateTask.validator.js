const { param, body } = require("express-validator");

const generateTaskValidator = [
  param("projectId", "Valid project id is required").notEmpty().isMongoId(),
  body("prompt", "Prompt is required and must be a non-empty string")
    .notEmpty()
    .isString()
    .isLength({ max: 500 }),
];

module.exports = generateTaskValidator;

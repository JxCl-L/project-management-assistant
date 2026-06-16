const { body, param } = require("express-validator");

const updateTaskContentValidator = [
  param("projectId").notEmpty().isMongoId(),
  param("taskId").notEmpty().isMongoId(),

  body("content")
    .exists().withMessage("Content is required")
    .isString().withMessage("Content must be a string")
    .notEmpty().withMessage("Content cannot be empty")
    .custom((value) => {
      try {
        JSON.parse(value); // Validate it's valid JSON
        return true;
      } catch (e) {
        throw new Error("Content must be valid JSON string");
      }
    }),

  body("plainText")
    .exists().withMessage("Plain text is required")
    .isString().withMessage("Plain text must be a string")
    .isLength({ max: 10000 })
    .withMessage("Plain text must be at most 10,000 characters"),
];

module.exports = updateTaskContentValidator;

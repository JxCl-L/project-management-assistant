const { body } = require("express-validator");

const chatValidator = [
  body("messages")
    .isArray({ min: 1 })
    .withMessage("messages must be a non-empty array"),
  body("messages.*.role")
    .isIn(["user", "assistant"])
    .withMessage("Each message role must be 'user' or 'assistant'"),
  body("messages.*.content")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Each message must have non-empty content"),
];

module.exports = chatValidator;

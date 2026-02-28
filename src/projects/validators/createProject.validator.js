const { body } = require('express-validator');

const createProjectValidator = [
    body("name", "The name cannot be empty").notEmpty(),
    body("name", "The name must be a string").isString(),
    body("name", "The name must be at most 100 characters long").isLength({ max: 100 }),
    body("name").trim(),
    body("description", "The description cannot be empty and must be a string")
        .notEmpty().isString().trim(),
    body("description", "The description must be at most 500 characters long")
        .isLength({ max: 500 }),
];

module.exports = createProjectValidator;
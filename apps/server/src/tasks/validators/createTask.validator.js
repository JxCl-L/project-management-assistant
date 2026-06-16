const { body } = require('express-validator');

const createTaskValidator = [
    body("title", "The title cannot be empty").notEmpty(),
    body("title", "The title must be a string").isString(),
    body("title", "The title must be at most 100 characters long").isLength({ max: 100 }),
    body("title").trim(),
    body("dueDate", "The dueDate needs to be a valid ISO8601 string")
        .notEmpty()
        .isISO8601(),
    body("description", "The description cannot be empty and must be a string")
        .notEmpty().isString().trim(),
    body("description", "The description must be at most 500 characters long")
        .isLength({ max: 500 }),
    body("priority").isIn(['low', 'normal', 'high']).withMessage("Priority must be one of the following values: 'low', 'normal', 'high'"),
    body("status").isIn(['todo', 'inProgress', 'completed']).withMessage("Status must be one of the following values: 'todo', 'inProgress', 'completed'"),
    // body("user", "User ID must be a valid MongoDB ObjectId").notEmpty().isMongoId(),
];

module.exports = createTaskValidator;
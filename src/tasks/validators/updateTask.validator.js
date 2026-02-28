const {body} = require("express-validator");

const updateTaskValidator = [
    body("_id", "valid document id is required").notEmpty().isMongoId(),
    body("title", "title must be a string").optional().isString().trim(),
    body("title", "title must be less than 100 characters").optional().isLength({ max: 100 }),
    body("dueDate", "The dueDate needs to be a valid ISO8601 string")
        .optional()
        .isISO8601(),
    body("description", "The description cannot be empty and must be a string")
        .optional().isString().trim(),
    body("description", "The description must be at most 500 characters long")
        .optional().isLength({ max: 500 }),
    body("priority").optional().isIn(['low', 'normal', 'high']).withMessage("Priority must be one of the following values: 'low', 'normal', 'high'"),
    body("status").optional().isIn(['todo', 'inProgress', 'completed']).withMessage("Status must be one of the following values: 'todo', 'inProgress', 'completed'"),

];

module.exports = updateTaskValidator;

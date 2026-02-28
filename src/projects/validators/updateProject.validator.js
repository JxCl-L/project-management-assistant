const {body} = require("express-validator");

const updateProjectValidator = [
    body("_id", "valid document id is required").notEmpty().isMongoId(),
    body("name", "name must be a string").optional().isString().trim(),
    body("name", "name must be less than 100 characters").optional().isLength({ max: 100 }),
    body("description", "The description cannot be empty and must be a string")
        .optional().isString().trim(),
    body("description", "The description must be at most 500 characters long")
        .optional().isLength({ max: 500 }),
];

module.exports = updateProjectValidator;

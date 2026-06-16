const { param } = require("express-validator");

const getProjectValidator = [
    param("projectId", "valid project id is required").notEmpty().isMongoId(),
];

module.exports = getProjectValidator;
const {body} = require("express-validator");

const deleteProjectValidator = [
    body("_id", "valid document id is required").notEmpty().isMongoId(),
];

module.exports = deleteProjectValidator;

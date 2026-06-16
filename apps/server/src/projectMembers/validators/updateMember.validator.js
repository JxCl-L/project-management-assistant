const {body} = require("express-validator");

const updateMemberValidator = [
    body("_id", "valid document id is required").notEmpty().isMongoId(),
    body("role", "Role must be one of the following values: 'manager', 'editor', 'viewer'").notEmpty().isIn(['manager', 'editor', 'viewer']),
];

module.exports = updateMemberValidator;

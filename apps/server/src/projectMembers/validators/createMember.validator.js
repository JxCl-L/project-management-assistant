const { body } = require('express-validator');

const createMemberValidator = [
    body("user", "User must be a valid MongoDB ObjectId").notEmpty().isMongoId(),
    body("role", "Role must be one of the following values: 'manager', 'editor', 'viewer'").notEmpty().isIn(['manager', 'editor', 'viewer']),
];

module.exports = createMemberValidator;
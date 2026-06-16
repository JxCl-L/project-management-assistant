const { body } = require('express-validator');

const createMemberByEmailValidator = [
    body("email", "Email must be a valid email address").notEmpty().isEmail(),
    body("role", "Role must be one of the following values: 'manager', 'editor', 'viewer'").notEmpty().isIn(['manager', 'editor', 'viewer']),
];

module.exports = createMemberByEmailValidator;
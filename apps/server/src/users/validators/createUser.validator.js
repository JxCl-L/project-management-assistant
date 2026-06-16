const {body} = require("express-validator");

const createUserValidator = [
    body("firstName", "firstName is required and must be a string")
        .isString().notEmpty().isLength({ max: 100 }).trim(),
    body("lastName", "lastName must be a string")
        .isString().optional().isLength({ max: 100 }).trim(),
    body("email", "Email is required and must be a valid email address")
        .isEmail().notEmpty().isLength({ max: 200 }).trim(),
    body("password", "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*^&]).{8,}$/)
        .notEmpty().isLength({ min: 8 }),

];

module.exports = createUserValidator;
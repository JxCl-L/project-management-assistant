const { query } = require("express-validator");

const getMembersValidator = [
    query("limit", "limit must a valid integer").optional().isInt().toInt({ min: 1 }),
    query("limit").customSanitizer((value, {req}) => {
        return value ? value : 5;
    }),
    query("page", "page must a valid integer").optional().isInt().toInt({ min: 1 }),
    query("page").customSanitizer((value, {req}) => {
        return value ? value : 1;
    }),
    query("order", "order must be either 'asc' or 'desc'").optional().isIn(['asc', 'desc']),
    query("order").customSanitizer((value, {req}) => {
        return value ? value : 'asc';
    }),
];

module.exports = getMembersValidator;
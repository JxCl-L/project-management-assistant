const { query } = require("express-validator");

const getProjectsValidator = [
    query("sortBy", "sortBy must be one of 'updated at', 'created at' and 'name' ").optional().isIn(['updatedAt', 'createdAt', 'name']),
    query("sortBy").customSanitizer((value, {req}) => {
        return value ? value : 'createdAt';
    }),
    query("order", "order must be either 'asc' or 'desc'").optional().isIn(['asc', 'desc']),
    query("order").customSanitizer((value, {req}) => {
        return value ? value : 'asc';
    }),
    query("search", "search must be a valid string").optional().isString(),
    query("search").customSanitizer((value, {req}) => {
        return value ? value : '';
    }),
];

module.exports = getProjectsValidator;
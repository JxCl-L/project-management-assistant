const { query } = require("express-validator");

const getCalendarValidator = [
  query("from", "from must be a valid ISO 8601 date (e.g. 2026-06-01)")
    .optional()
    .isISO8601(),
  query("to", "to must be a valid ISO 8601 date (e.g. 2026-06-30)")
    .optional()
    .isISO8601(),
];

module.exports = getCalendarValidator;

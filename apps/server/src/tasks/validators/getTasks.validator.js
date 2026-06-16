const { query } = require("express-validator");

const getTasksValidator = [
  query("limit", "limit must a valid integer")
    .optional()
    .isInt()
    .toInt({ min: 1 }),
  query("limit").customSanitizer((value, { req }) => {
    return value ? value : 5;
  }),
  query("page", "page must a valid integer")
    .optional()
    .isInt()
    .toInt({ min: 1 }),
  query("page").customSanitizer((value, { req }) => {
    return value ? value : 1;
  }),
  query("order", "order must be either 'asc' or 'desc'")
    .optional()
    .isIn(["asc", "desc"]),
  query("order").customSanitizer((value, { req }) => {
    return value ? value : "asc";
  }),
  query(
    "status",
    "status must be a comma-separated list of 'todo', 'inProgress', 'completed'"
  )
    .optional()
    .custom((value, { req }) => {
      // Skip validation if value is empty or whitespace only
      if (!value || value.trim() === "") {
        return true;
      }

      const statusArray = value.split(",").map((status) => status.trim());
      const validStatuses = ["todo", "inProgress", "completed"];
      for (let status of statusArray) {
        if (!validStatuses.includes(status)) {
          throw new Error(
            "Status must be one or more of 'todo', 'inProgress', 'completed'"
          );
        }
      }
      return true;
    }),
];

module.exports = getTasksValidator;

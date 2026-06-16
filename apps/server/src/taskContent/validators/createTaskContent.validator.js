const { body, param } = require('express-validator');

const createTaskValidator = [
    param('projectId', 'valid project id is required').notEmpty().isMongoId(),
    param('taskId', 'valid task id is required').notEmpty().isMongoId(),
];

module.exports = createTaskValidator;
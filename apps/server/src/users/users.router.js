const express = require("express");
const usersController = require("./users.controller.js");
const createUserValidator = require("./validators/createUser.validator.js");
const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");

const usersRouter = express.Router();


/**
 * @swagger
 * 
 * /users/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 201
 *               message: "User created successfully"
 *               data:
 *                 _id: 68ce4d6df151766023b3cf07
 *                 firstName: "Cloudia"
 *                 lastName: "Li"
 *                 email: "cloudia@example.com"
 * 
 *       401:
 *        description: Unauthorized, missing or invalid token
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 401
 *               message: "Unauthorized, missing or invalid token"
 *               error:
 *                 message: "You are not authorized to perform this request"
 *       403:
 *        description: Forbidden error
 *        content:
 *           application/json:
 *             example:
 *               status: "error"
 *               statusCode: 403
 *               message: "Forbidden"
 *               error:
 *                 message: "Invalid token. Please login again."
 *
 */


usersRouter.post("/create", createUserValidator, (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return usersController.handleCreateUser(req, res);
    } else {
        res.status(StatusCodes.BAD_REQUEST).json(result.array());
    }
});

module.exports = usersRouter; 
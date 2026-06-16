const express = require("express");
const authController = require("./auth.controller.js")
const {StatusCodes} = require("http-status-codes");
const { validateBody } = require("../middleware/validateBody.js");
const { LoginSchema } = require("@pm/schemas");

const authRouter = express.Router();


/**
 * @swagger
 * 
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             example:
 *               status: "success"
 *               statusCode: 200
 *               message: "OK"
 *               data:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGNjYmFhOTg1NDU3NTI0YTgwOTI4NDgiLCJlbWFpbCI6ImNsb3VkaWFAZXhhbXBsZS5jb20iLCJpYXQiOjE3NTgzNTA2NjMsImV4cCI6MTc1ODQzNzA2M30.fL_ATtClTjq67hYyu38vrPdwixM0JOiF_zDQdsCSvRI"
 * 
 */


authRouter.post("/login", validateBody(LoginSchema), (req, res) => {
    return authController.handleLogin(req, res);
});

module.exports = authRouter;

/** 
 * @swagger
 * 
 * components:
 *  schemas:
 *     Login:
 *       type: object
 *       required:
 *        - email
 *        - password
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user, a valid email address
 *         password:
 *           type: string
 *           description: The password of the user, must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.
 *           minLength: 8
 *       example:
 *         email: "cloudia@example.com"
 *         password: "Password123#"
 */

const { min } = require("date-fns");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    firstName: { 
        type: String, 
        required: [true, "firstName is required"],
        trim: true,
        maxLength: [100, "firstName must be at most 100 characters long"]
    },
    lastName: { 
        type: String, 
        required: false,
        trim: true,
        maxLength: [100, "lastName must be at most 100 characters long"]
    },
    email: { 
        type: String, 
        required: [true, "email is required"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ .test(email);
            },
            message: ()=>`Please enter a valid email address`,
        }
    },
    password: { 
        type: String, 
        required: [true, "password is required"],
        // minLength: [8, "password must be at least 8 characters long"],
        // validate: {
        //     validator: function(password) {
        //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*^&]).{8,}$/.test(password);
        //     },
        //     message: ()=>`Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.`,
        // }
    }
});

const User = model("User", userSchema);

module.exports = User;

/** 
 * @swagger
 * 
 * components:
 *  schemas:
 *     User:
 *       type: object
 *       required:
 *        - firstName
 *        - email
 *        - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           maxLength: 100
 *         email:
 *           type: string
 *           description: The email of the user, a valid email address
 *         password:
 *           type: string
 *           description: The password of the user, must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.
 *           minLength: 8
 *       example:
 *         firstName: "Cloudia"
 *         lastName: "Li"
 *         email: "cloudia@example.com"
 *         password: "Password123#"
 */

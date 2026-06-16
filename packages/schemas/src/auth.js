const { z } = require("zod");

const passwordValidation =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*^&]).{8,}$/;

const LoginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

const SignupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .max(100, { message: "First name must be at most 100 characters long" }),
  lastName: z
    .string()
    .trim()
    .max(100, { message: "Last name must be at most 100 characters long" })
    .optional(),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(200, { message: "Email must be at most 200 characters long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(passwordValidation, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

module.exports = { LoginSchema, SignupSchema };

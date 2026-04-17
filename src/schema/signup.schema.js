import { z } from "zod";

const passwordValidation = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*^&]).{8,}$/);

export const SignupSchema = z.object({
    firstName: z.string()
        .min(3, {message: "First name must be at least 3 characters long"})
        .max(100, {message: "First name must be at most 100 characters long"}),
    lastName: z.string()
        .max(100, {message: "Last name must be at most 100 characters long"})
        .optional(),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .regex(passwordValidation, {message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."}),
});
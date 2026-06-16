const { z } = require("zod");

const CreateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be at most 500 characters long" })
    .optional(),
});

const UpdateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(100, { message: "Name must be at most 100 characters long" }),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description must be at most 500 characters long" })
    .optional(),
});

module.exports = { CreateProjectSchema, UpdateProjectSchema };

const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

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

// _id is added to the payload by the client at mutate time (not part of the
// form state), and used by the server to locate the project. Optional in the
// schema so the FE form (which doesn't carry it) still validates.
const UpdateProjectSchema = z.object({
  _id: z
    .string()
    .regex(objectIdRegex, { message: "Project id must be a valid MongoDB ObjectId" })
    .optional(),
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

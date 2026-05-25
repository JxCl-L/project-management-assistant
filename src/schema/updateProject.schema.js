import { z } from "zod";

export const UpdateProjectSchema = z.object({
    name: z.string().trim().min(1, "Project name is required").max(100),
    description: z.string().trim().max(500, "Description must be at most 500 characters").optional(),
});
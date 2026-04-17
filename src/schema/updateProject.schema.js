import { z } from "zod";

export const UpdateProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100),
    description: z.string().max(500, "Description must be at most 500 characters").optional(),
});
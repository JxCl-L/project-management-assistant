import { z } from "zod";

export const CreateProjectSchema = z.object({
    name: z.string().trim().min(1, "Project name is required").max(100, "Name must be at most 100 characters long"),
    description: z.string().trim().max(500, "Description must be at most 500 characters long").optional(),
});
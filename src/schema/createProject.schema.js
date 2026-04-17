import { z } from "zod";

export const CreateProjectSchema = z.object({
    name: z.string().max(100, {message: "Name must be at most 100 characters long"}),
    description: z.string().max(500, {message: "Description must be at most 500 characters long"}),
});
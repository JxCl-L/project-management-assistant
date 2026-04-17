import { z } from "zod";

export const CreateMemberSchema = z.object({
  user: z
    .string()
    .min(1, { message: "User is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "User must be a valid MongoDB ObjectId",
    }),
  role: z.enum(["manager", "editor", "viewer"]),
});

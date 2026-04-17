import { z } from "zod";

export const DeleteMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Project id is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Project id must be a valid MongoDB ObjectId",
    }),
});

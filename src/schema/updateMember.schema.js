import { z } from "zod";

export const UpdateMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Member id is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Member id must be a valid MongoDB ObjectId",
    }),
  role: z.enum(["manager", "editor", "viewer"]),
});

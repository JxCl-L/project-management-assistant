import { z } from "zod";

// Not wired up: the UI invites members by email via CreateMemberByEmailSchema
// in addMemberDialog. Kept as a reference of the by-id BE contract.
export const CreateMemberSchema = z.object({
  user: z
    .string()
    .min(1, { message: "User is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "User must be a valid MongoDB ObjectId",
    }),
  role: z.enum(["manager", "editor", "viewer"]),
});

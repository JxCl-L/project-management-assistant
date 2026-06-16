import { z } from "zod";

// Not wired up: deleteConfirmationDialog calls useDeleteMember with a
// server-returned memberId, so no client-side schema check is needed.
// Kept as a reference of the BE contract.
export const DeleteMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Member id is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Member id must be a valid MongoDB ObjectId",
    }),
});

import { z } from "zod";

// Not wired up: manageMembersDialog calls useUpdateMember directly. memberId
// is server-returned and role is a constrained <Select>, so no client-side
// schema check is needed. Kept as a reference of the BE contract.
export const UpdateMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Member id is required" })
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Member id must be a valid MongoDB ObjectId",
    }),
  role: z.enum(["manager", "editor", "viewer"]),
});

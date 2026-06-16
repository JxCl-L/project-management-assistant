const { z } = require("zod");

const roleEnum = z.enum(["manager", "editor", "viewer"]);
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const CreateMemberByEmailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  role: roleEnum,
});

// Not wired up on the client: the UI invites members by email via
// CreateMemberByEmailSchema. Kept as a reference of the by-id contract.
const CreateMemberSchema = z.object({
  user: z
    .string()
    .min(1, { message: "User is required" })
    .regex(objectIdRegex, { message: "User must be a valid MongoDB ObjectId" }),
  role: roleEnum,
});

// Not wired up on the client: the manage-members dialog calls useUpdateMember
// directly with a server-returned memberId and a constrained <Select>, so no
// client-side schema check is needed. Kept as a reference of the BE contract.
const UpdateMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Member id is required" })
    .regex(objectIdRegex, {
      message: "Member id must be a valid MongoDB ObjectId",
    }),
  role: roleEnum,
});

// Not wired up on the client: the delete-confirmation dialog calls
// useDeleteMember with a server-returned memberId. Kept as a reference of
// the BE contract.
const DeleteMemberSchema = z.object({
  _id: z
    .string()
    .min(1, { message: "Member id is required" })
    .regex(objectIdRegex, {
      message: "Member id must be a valid MongoDB ObjectId",
    }),
});

module.exports = {
  CreateMemberByEmailSchema,
  CreateMemberSchema,
  UpdateMemberSchema,
  DeleteMemberSchema,
};

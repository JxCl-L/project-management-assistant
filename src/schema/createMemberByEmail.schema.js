import { z } from "zod";

export const CreateMemberByEmailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.enum(["manager", "editor", "viewer"]),
});

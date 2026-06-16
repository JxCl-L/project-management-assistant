import { z } from "zod";

export const TaskGeneratePromptSchema = z.object({
  prompt: z.string().trim()
    .min(3, { message: "Please describe the task in a few more words" })
    .max(500, { message: "Prompt must be at most 500 characters" }),
});

export const ChatMessageSchema = z.object({
  content: z.string().trim()
    .min(1, { message: "Message cannot be empty" })
    .max(4000, { message: "Message must be at most 4000 characters" }),
});

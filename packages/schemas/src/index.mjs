// ESM facade. Re-exports the CJS index as native ESM named exports so
// Vite/ESBuild can statically resolve named imports without falling back
// to the CJS-as-default-import shim. The single source of truth still
// lives in the CJS files alongside; nothing is duplicated here.

import pkg from "./index.js";

export const {
  LoginSchema,
  SignupSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateTaskSchema,
  CreateMemberByEmailSchema,
  CreateMemberSchema,
  UpdateMemberSchema,
  DeleteMemberSchema,
  TaskGeneratePromptSchema,
  ChatMessageSchema,
  PERMISSIONS,
  canPerformAction,
} = pkg;

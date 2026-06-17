// Shared zod schemas consumed by both apps/server (CommonJS require) and
// apps/client (ESM import via Vite). Single source of truth so client and
// server can't drift on field names, lengths, or enums.

module.exports = {
  ...require("./auth"),
  ...require("./project"),
  ...require("./task"),
  ...require("./member"),
  ...require("./aiPrompt"),
};

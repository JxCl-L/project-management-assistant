// ESM facade. Re-exports the CJS index as native ESM named exports so
// Vite/ESBuild can statically resolve named imports without falling back
// to the CJS-as-default-import shim. Single source of truth still lives
// in the CJS file alongside; nothing duplicated.

import pkg from "./index.js";

export const { PERMISSIONS, canPerformAction } = pkg;

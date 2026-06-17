// Permissions are owned by the shared @pm/permissions package so client
// and server validate against the same table. Keeping this thin
// re-export so FE callers can keep importing from `@/lib/permissions`
// (the familiar per-app path) while the source of truth lives once in
// packages/permissions.

export { PERMISSIONS, canPerformAction } from "@pm/permissions";

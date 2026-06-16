// Permissions are owned by the shared @pm/schemas package so client and
// server can't drift. This file is kept as a re-export only — if anything
// in the server still does `require("../settings/permissions")` it now
// transparently gets the canonical table instead of a stale local copy.

const { PERMISSIONS } = require("@pm/schemas");

module.exports = PERMISSIONS;

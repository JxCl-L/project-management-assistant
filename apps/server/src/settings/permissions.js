// Permissions are owned by the shared @pm/permissions package so client
// and server can't drift. This file is kept as a re-export only — if
// anything in the server still does `require("../settings/permissions")`
// it now transparently gets the canonical table.

const { PERMISSIONS } = require("@pm/permissions");

module.exports = PERMISSIONS;

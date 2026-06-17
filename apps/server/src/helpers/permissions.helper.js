const { canPerformAction } = require("@pm/permissions");

/**
 * Derive a flat object of per-action booleans from the shared permission
 * table, attached to project responses so the client can gate UI without
 * re-implementing the rules. Both client and server thus agree on what
 * each role can do, because the answer comes from one helper backed by
 * one table.
 *
 * @param {string} role - User role (manager, editor, viewer) or null
 * @returns {object} Flag object consumed by the React components
 */
const getPermissionsForRole = (role) => ({
  // Projects
  canEditProject:   canPerformAction(role, "projects", "PATCH"),
  canDeleteProject: canPerformAction(role, "projects", "DELETE"),

  // Tasks
  canCreateTask: canPerformAction(role, "tasks", "POST"),
  canEditTask:   canPerformAction(role, "tasks", "PATCH"),
  canDeleteTask: canPerformAction(role, "tasks", "DELETE"),

  // Task content (rich text editor)
  canEditTaskContent: canPerformAction(role, "taskContent", "PATCH"),

  // Members
  canViewMembers:   canPerformAction(role, "members", "GET"),
  canCreateMembers: canPerformAction(role, "members", "POST"),
  canEditMembers:   canPerformAction(role, "members", "PATCH"),
  canDeleteMembers: canPerformAction(role, "members", "DELETE"),
});

module.exports = { getPermissionsForRole };

// Single source of truth for project-scoped RBAC. Consumed by both the
// Express checkPermission middleware (apps/server) and any client-side
// permission gating (apps/client/src/lib/permissions.js re-exports from
// here). Keeps client and server from drifting on what each role can do.

// Casing convention: action keys are UPPERCASE HTTP verbs. The
// canPerformAction helper normalises any incoming casing so call sites
// can use "get" or "GET" interchangeably without surprise.

const PERMISSIONS = {
  projects: {
    POST: ["viewer", "editor", "manager"], // anyone signed in can create
    PATCH: ["manager"],
    DELETE: ["manager"],
  },
  project: {
    GET: ["viewer", "editor", "manager"],
  },
  tasks: {
    GET: ["viewer", "editor", "manager"],
    POST: ["editor", "manager"],
    PATCH: ["editor", "manager"],
    DELETE: ["manager"],
  },
  task: {
    GET: ["viewer", "editor", "manager"],
  },
  members: {
    GET: ["viewer", "editor", "manager"],
    POST: ["manager"],
    PATCH: ["manager"],
    DELETE: ["manager"],
  },
  taskContent: {
    GET: ["viewer", "editor", "manager"],
    POST: ["editor", "manager"],
    PATCH: ["editor", "manager"],
    DELETE: ["manager"],
  },
  projectChat: {
    POST: ["viewer", "editor", "manager"],
  },
};

function canPerformAction(role, resource, action) {
  if (!role) return false;
  const verb = String(action).toUpperCase();
  return PERMISSIONS[resource]?.[verb]?.includes(role) ?? false;
}

module.exports = { PERMISSIONS, canPerformAction };

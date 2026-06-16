const permissions = {
  projects: {
    PATCH: ["manager"],
    DELETE: ["manager"],
  },
  project: {
    GET: ["viewer", "editor", "manager"],
  },
  tasks: {
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

module.exports = permissions;
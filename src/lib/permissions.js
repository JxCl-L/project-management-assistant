export const PERMISSIONS = {
  projects: {
    patch: ["manager"],
    delete: ["manager"],
  },
  tasks: {
    post: ["editor", "manager"],
    patch: ["editor", "manager"],
    delete: ["manager"],
  },
  members: {
    get: ["viewer", "editor", "manager"],
    post: ["manager"],
    patch: ["manager"],
    delete: ["manager"],
  },
};

export const canPerformAction = (roleInProject, resource, action) => {
  if (!roleInProject) return false;
  return PERMISSIONS[resource]?.[action]?.includes(roleInProject) || false;
};
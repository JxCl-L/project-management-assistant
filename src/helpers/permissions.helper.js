const permissions = require("../settings/permissions.js");

/**
 * Get all permissions for a given role
 * @param {string} role - User role (manager, editor, viewer)
 * @returns {object} Permission object with boolean values
 */
const getPermissionsForRole = (role) => {
  if (!role) {
    return {
      canEditProject: false,
      canDeleteProject: false,
      canCreateTask: false,
      canEditTask: false,
      canDeleteTask: false,
      canViewMembers: false,
      canCreateMembers: false,
      canEditMembers: false,
      canDeleteMembers: false,
    };
  }

  return {
    // Projects
    canEditProject: permissions.projects.PATCH?.includes(role) || false,
    canDeleteProject: permissions.projects.DELETE?.includes(role) || false,
    
    // Tasks
    canCreateTask: permissions.tasks.POST?.includes(role) || false,
    canEditTask: permissions.tasks.PATCH?.includes(role) || false,
    canDeleteTask: permissions.tasks.DELETE?.includes(role) || false,
    
    // Members
    canViewMembers: permissions.members.GET?.includes(role) || false,
    canCreateMembers: permissions.members.POST?.includes(role) || false,
    canEditMembers: permissions.members.PATCH?.includes(role) || false,
    canDeleteMembers: permissions.members.DELETE?.includes(role) || false,
  };
};

module.exports = { getPermissionsForRole };
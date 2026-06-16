// middleware/checkPermission.js
const { StatusCodes } = require("http-status-codes");
const { canPerformAction } = require("@pm/schemas");
const Member = require("../projectMembers/member.schema.js");

/**
 * Middleware to check if user has permission for a resource action within a project
 * @param {string} resource - Resource name (project, task, member)
 * @param {string} action - Action name (GET, POST, PATCH, DELETE)
 */
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    // no check for users or creating/getting projects
    try {
      // Extract projectId from request params or body
      let projectId = req.params.projectId;
      console.log("checkPermission middleware - projectId from params:", projectId);
      if (
        resource === "projects" &&
        (action === "PATCH" || action === "DELETE")
      ) {
        projectId = req.body._id;
      }

      if (!projectId) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Project ID is required" });
      }

      // Get user ID from authenticated request
      const userId = req.user.sub;

      // Fetch membership info
      const membership = await Member.findOne({
        project: projectId,
        user: userId,
      });

      if (!membership) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "You are not a member of this project" });
      }

      const userRole = membership.role;

      // Check if role has permission (shared with the client via @pm/schemas)
      const hasPermission = canPerformAction(userRole, resource, action);

      if (!hasPermission) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: `Insufficient permissions. ${userRole} cannot ${action} ${resource}`,
        });
      }

    //   // Attach role and projectId to request for use in controllers
    //   req.userRole = userRole;
    //   req.projectId = projectId;

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error checking permissions" });
    }
  };
};

module.exports = checkPermission;

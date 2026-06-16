const Project = require("../project.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const Member = require("../../projectMembers/member.schema.js");
const {
  getPermissionsForRole,
} = require("../../helpers/permissions.helper.js");

async function getProjectsProvider(req, res) {
  const data = matchedData(req); // get only validated query parameters
  console.log("Fetching projects with query:", data);

  try {
    const memberRecords = await Member.find({ user: req.user?.sub })
      .populate("project")
      .lean(); // ⭐ ADD .lean() to get plain JavaScript objects

    if (!memberRecords.length) {
      return res.status(StatusCodes.OK).json({
        data: [],
        total: 0,
        message: "No projects found for this user.",
      });
    }

    // const userProjects = memberRecords.map((record) => record.project);

    const { sortBy = "createdAt", order = "asc", search = "" } = data;
    const sortOrder = order === "asc" ? 1 : -1;

    let projectsWithPermissions = memberRecords
      .filter((record) => {
        // search filter
        if (search && record.project?.name) {
          return record.project.name
            .toLowerCase()
            .includes(search.toLowerCase());
        }
        return true; // include all if no search term
      })
      .map((record) => ({
        ...record.project,
        userRole: record.role,
        permissions: getPermissionsForRole(record.role),
        membershipId: record._id,
      }));

    // apply sorting
    projectsWithPermissions.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });

    console.log("Fetched projects:", projectsWithPermissions);

    let finalResponse = {
      data: projectsWithPermissions,
      sortBy,
      order,
      search,
      total: projectsWithPermissions.length,
    };

    return res.status(StatusCodes.OK).json(finalResponse);
  } catch (error) {
    errorLogger(`Error while fetching projects: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      // change from GATEWAY_TIMEOUT to INTERNAL_SERVER_ERROR
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getProjectsProvider;

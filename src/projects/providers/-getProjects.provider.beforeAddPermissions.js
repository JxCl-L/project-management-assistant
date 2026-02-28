const Project = require("../project.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const Member = require("../../projectMembers/member.schema.js");

async function getProjectsProvider(req, res) {
  const data = matchedData(req); // get only validated query parameters
  console.log("Fetching projects with query:", data);

  try {
    const memberRecords = await Member.find({ user: req.user?.sub });

    if (!memberRecords.length) {
      return res.status(StatusCodes.OK).json({
        data: [],
        total: 0,
        message: "No projects found for this user.",
      });
    }

    const userProjects = memberRecords.map((record) => record.project);

    const { sortBy = "createdAt", order = "asc", search = "" } = data;
    const sortOrder = order === "asc" ? 1 : -1;

    const filters = {
      _id: { $in: userProjects },
      name: { $regex: search, $options: "i" }, // case-insensitive search on name
    };

    const projects = await Project.find(filters).sort({
      [sortBy]: sortOrder,
    }); // sort by user-specified field [sortBy] and the order of sortOrder
    const projectCount = await Project.countDocuments(filters);

    console.log(`Total projects found: ${projectCount}`);
    console.log("Fetched projects:", projects);

    let finalResponse = {
      data: projects,
      sortBy,
      order,
      search,
      total: projectCount,
    };
    return res.status(StatusCodes.OK).json(finalResponse);
  } catch (error) {
    errorLogger(`Error while fetching projects: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ // change from GATEWAY_TIMEOUT to INTERNAL_SERVER_ERROR
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getProjectsProvider;

const Task = require("../../tasks/task.schema.js");
const Project = require("../project.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function getDashboardProvider(req, res) {
  try {
    const userId = req.user.sub;
    const now = new Date();

    const memberships = await Member.find({ user: userId }, "project").lean();
    const projectIds = memberships.map((m) => m.project);

    if (projectIds.length === 0) {
      return res.status(StatusCodes.OK).json({
        taskCounts: {},
        overdueTasks: [],
        nextDueTasks: [],
      });
    }

    const [projectDocs, facetResult] = await Promise.all([
      Project.find({ _id: { $in: projectIds } }, "name").lean(),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
          $facet: {
            taskCountsRaw: [
              {
                $group: {
                  _id: { project: "$project", status: "$status" },
                  count: { $sum: 1 },
                },
              },
            ],
            overdueTasks: [
              { $match: { dueDate: { $lt: now }, status: { $ne: "completed" } } },
              { $project: { _id: 1, title: 1, project: 1, dueDate: 1, priority: 1 } },
            ],
            nextDueTasks: [
              { $match: { dueDate: { $gte: now }, status: { $ne: "completed" } } },
              { $sort: { dueDate: 1 } },
              { $limit: 5 },
              { $project: { _id: 1, title: 1, project: 1, dueDate: 1, priority: 1, status: 1 } },
            ],
          },
        },
      ]),
    ]);

    const projectNameMap = {};
    projectDocs.forEach((p) => {
      projectNameMap[p._id.toString()] = p.name;
    });

    // Build taskCounts map — only include projects that have at least one task
    const taskCounts = {};
    facetResult[0].taskCountsRaw.forEach(({ _id, count }) => {
      const key = _id.project.toString();
      if (!taskCounts[key]) {
        taskCounts[key] = {
          projectName: projectNameMap[key],
          todo: 0,
          inProgress: 0,
          completed: 0,
          total: 0,
        };
      }
      taskCounts[key][_id.status] = count;
      taskCounts[key].total += count;
    });

    const overdueTasks = facetResult[0].overdueTasks.map((t) => ({
      _id: t._id,
      title: t.title,
      projectId: t.project,
      projectName: projectNameMap[t.project.toString()],
      dueDate: t.dueDate,
      priority: t.priority,
    }));

    const nextDueTasks = facetResult[0].nextDueTasks.map((t) => ({
      _id: t._id,
      title: t.title,
      projectId: t.project,
      projectName: projectNameMap[t.project.toString()],
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
    }));

    return res.status(StatusCodes.OK).json({
      taskCounts,
      overdueTasks,
      nextDueTasks,
    });
  } catch (error) {
    errorLogger(`Error while fetching dashboard: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getDashboardProvider;

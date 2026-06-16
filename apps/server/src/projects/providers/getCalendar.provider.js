const Task = require("../../tasks/task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function getCalendarProvider(req, res) {
  try {
    const userId = req.user.sub;
    const { from, to } = req.query;

    const memberships = await Member.find({ user: userId }, "project").lean();
    const projectIds = memberships.map((m) => m.project);

    if (projectIds.length === 0) {
      return res.status(StatusCodes.OK).json({ tasks: [] });
    }

    const matchFilter = { project: { $in: projectIds } };
    if (from || to) {
      matchFilter.dueDate = {};
      if (from) matchFilter.dueDate.$gte = new Date(from);
      if (to)   matchFilter.dueDate.$lte = new Date(to);
    }

    const tasks = await Task.find(matchFilter, {
      _id: 1,
      title: 1,
      project: 1,
      dueDate: 1,
      status: 1,
      priority: 1,
    })
      .populate("project", "name")
      .sort({ dueDate: 1 })
      .lean();

    const formatted = tasks.map((t) => ({
      _id: t._id,
      title: t.title,
      projectId: t.project._id,
      projectName: t.project.name,
      dueDate: t.dueDate,
      status: t.status,
      priority: t.priority,
    }));

    return res.status(StatusCodes.OK).json({ tasks: formatted });
  } catch (error) {
    errorLogger(`Error while fetching calendar tasks: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = getCalendarProvider;

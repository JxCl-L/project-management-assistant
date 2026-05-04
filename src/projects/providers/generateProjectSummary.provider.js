const { callAI } = require("../../ai/aiClient.js");
const Project = require("../project.schema.js");
const Task = require("../../tasks/task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function generateProjectSummaryProvider(req, res) {
  try {
    const project = await Project.findById(req.params.projectId).lean();

    if (!project) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Project not found." });
    }

    const currentMember = await Member.findOne({
      user: req.user?.sub,
      project: req.params.projectId,
    });

    if (!currentMember) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "You do not have permission to access this project." });
    }

    const [members, allTasks] = await Promise.all([
      Member.find({ project: req.params.projectId })
        .populate("user", "firstName lastName email")
        .lean(),
      Task.find({ project: req.params.projectId })
        .select("title status priority dueDate")
        .sort({ dueDate: 1 })
        .lean(),
    ]);

    const now = new Date();

    // task stats
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = allTasks.filter((t) => t.status === "inProgress").length;
    const todoTasks = allTasks.filter((t) => t.status === "todo").length;
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
    ).length;
    const highPriorityPending = allTasks.filter(
      (t) => t.priority === "high" && t.status !== "completed"
    ).length;

    // format members for prompt
    const memberList = members
      .map((m) => {
        const name = m.user
          ? `${m.user.firstName} ${m.user.lastName}`
          : "Unknown";
        return `- ${name} (${m.role})`;
      })
      .join("\n");

    // format all tasks for prompt — key fields only to keep tokens low
    const taskList = allTasks
      .map((t) => {
        const due = t.dueDate
          ? new Date(t.dueDate).toDateString()
          : "no due date";
        const overdue =
          t.dueDate && new Date(t.dueDate) < now && t.status !== "completed"
            ? " ⚠ OVERDUE"
            : "";
        return `- "${t.title}" [${t.status}, ${t.priority} priority, due: ${due}${overdue}]`;
      })
      .join("\n");

    const messages = [
      {
        role: "system",
        content:
          "You are a project management assistant. Generate professional project status summaries in 4-6 sentences. Cover: overall progress, team composition, high-priority or overdue concerns, and recommended next steps.",
      },
      {
        role: "user",
        content: `Generate a thorough project summary:

Project: ${project.name}
Description: ${project.description || "No description provided"}
Created: ${new Date(project.createdAt).toDateString()}

Team (${members.length} member${members.length !== 1 ? "s" : ""}):
${memberList || "No members yet"}

Task Statistics:
- Total: ${totalTasks}
- Completed: ${completedTasks} (${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
- In progress: ${inProgressTasks}
- Todo: ${todoTasks}
- Overdue: ${overdueTasks}
- High priority & pending: ${highPriorityPending}

All Tasks:
${taskList || "No tasks yet"}`,
      },
    ];

    const summary = await callAI(messages);

    return res.status(StatusCodes.OK).json({
      summary,
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        highPriorityPending,
        teamSize: members.length,
      },
    });
  } catch (error) {
    errorLogger(
      `Error while generating project summary: ${error.message}`,
      req,
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to generate project summary, please try again later.",
    });
  }
}

module.exports = generateProjectSummaryProvider;

const { callAI } = require("../../ai/aiClient.js");
const Task = require("../task.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function rewriteTaskProvider(req, res) {
  try {
    const task = await Task.findById(req.params.taskId).lean();

    if (!task) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Task not found." });
    }

    const isMember = await Member.findOne({
      user: req.user?.sub,
      project: req.params.projectId,
    });

    if (!isMember) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "You do not have permission to access this task." });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a project management assistant. Rewrite task titles and descriptions to be clearer, more actionable, and professional. " +
          "Return ONLY a JSON object with keys 'title' and 'description'. No explanation, no markdown, just the JSON.",
      },
      {
        role: "user",
        content: `Rewrite this task to be clearer and more actionable:

Title: ${task.title}
Description: ${task.description}
Priority: ${task.priority}
Status: ${task.status}

Return JSON: { "title": "...", "description": "..." }`,
      },
    ];

    const raw = await callAI(messages, 300);

    let rewritten;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      rewritten = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "AI returned an unexpected format. Please try again.",
      });
    }

    return res.status(StatusCodes.OK).json({
      original: {
        title: task.title,
        description: task.description,
      },
      rewritten: {
        title: rewritten.title,
        description: rewritten.description,
      },
    });
  } catch (error) {
    errorLogger(`Error while rewriting task: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to rewrite task, please try again later.",
    });
  }
}

module.exports = rewriteTaskProvider;

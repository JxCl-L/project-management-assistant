const { callAI } = require("../../ai/aiClient.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

const VALID_PRIORITIES = ["low", "normal", "high"];
const VALID_STATUSES = ["todo", "inProgress"];

async function generateTaskProvider(req, res) {
  try {
    const isMember = await Member.findOne({
      user: req.user?.sub,
      project: req.params.projectId,
    });

    if (!isMember) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "You do not have permission to access this project." });
    }

    const { prompt } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const messages = [
      {
        role: "system",
        content: `You are a project management assistant. Generate a structured task from a user's description.
Return ONLY a valid JSON object with these exact keys:
- title: string (concise, action-oriented, max 100 characters)
- description: string (clear and helpful details, max 500 characters)
- priority: one of "low", "normal", "high"
- status: one of "todo", "inProgress"
- dueDate: a date string in YYYY-MM-DD format — suggest a reasonable deadline based on the task complexity. Today is ${today}.
No explanation, no markdown, just the raw JSON object.`,
      },
      {
        role: "user",
        content: `Generate a task for: ${prompt}`,
      },
    ];

    const raw = await callAI(messages, 400);

    let generated;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      generated = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "AI returned an unexpected format. Please try again.",
      });
    }

    return res.status(StatusCodes.OK).json({
      title: String(generated.title || "").slice(0, 100),
      description: String(generated.description || "").slice(0, 500),
      priority: VALID_PRIORITIES.includes(generated.priority) ? generated.priority : "normal",
      status: VALID_STATUSES.includes(generated.status) ? generated.status : "todo",
      dueDate: generated.dueDate || null,
    });
  } catch (error) {
    errorLogger(`Error while generating task: ${error.message}`, req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to generate task, please try again later.",
    });
  }
}

module.exports = generateTaskProvider;

function formatMemberList(members) {
  return members
    .map((m) => `- ${m.user ? `${m.user.firstName} ${m.user.lastName}` : "Unknown"} (${m.role})`)
    .join("\n");
}

function formatTaskSummaryList(tasks, now = new Date()) {
  return tasks
    .map((t) => {
      const due = t.dueDate ? new Date(t.dueDate).toDateString() : "no due date";
      const overdue = t.dueDate && new Date(t.dueDate) < now && t.status !== "completed" ? " ⚠ OVERDUE" : "";
      return `- "${t.title}" [${t.status}, ${t.priority} priority, due: ${due}${overdue}]\n  Description: ${t.description}`;
    })
    .join("\n");
}

function buildSystemPrompt({ project, members, tasks, retrievedContext, answerInstructions }) {
  const memberList = formatMemberList(members);
  const taskSummaryList = formatTaskSummaryList(tasks);

  return `You are a project management assistant for the project "${project.name}".
${project.description ? `Project description: ${project.description}` : ""}

## Team (${members.length} member${members.length !== 1 ? "s" : ""})
${memberList || "No members yet"}

## All Tasks (overview)
${taskSummaryList || "No tasks yet"}
${
  retrievedContext
    ? `\n## Relevant Task Details (retrieved for your question)\n${retrievedContext}`
    : ""
}

${answerInstructions}`;
}

module.exports = { buildSystemPrompt };

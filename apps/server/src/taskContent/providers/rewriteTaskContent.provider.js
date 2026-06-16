const { callAI } = require("../../ai/aiClient.js");
const TaskContent = require("../taskContent.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

// Parse inline markdown (bold, italic, code) into Tiptap inline nodes
function parseInline(text) {
  const nodes = [];
  let i = 0;

  while (i < text.length) {
    // Bold + italic: ***text***
    if (text[i] === "*" && text[i + 1] === "*" && text[i + 2] === "*") {
      const end = text.indexOf("***", i + 3);
      if (end !== -1) {
        const content = text.slice(i + 3, end);
        if (content) nodes.push({ type: "text", text: content, marks: [{ type: "bold" }, { type: "italic" }] });
        i = end + 3;
        continue;
      }
    }

    // Bold: **text**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        const content = text.slice(i + 2, end);
        if (content) nodes.push({ type: "text", text: content, marks: [{ type: "bold" }] });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text*
    if (text[i] === "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        const content = text.slice(i + 1, end);
        if (content) nodes.push({ type: "text", text: content, marks: [{ type: "italic" }] });
        i = end + 1;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        const content = text.slice(i + 1, end);
        if (content) nodes.push({ type: "text", text: content, marks: [{ type: "code" }] });
        i = end + 1;
        continue;
      }
    }

    // Plain text — consume until next special char
    let j = i;
    while (j < text.length && text[j] !== "*" && text[j] !== "`") j++;
    if (j > i) {
      nodes.push({ type: "text", text: text.slice(i, j) });
      i = j;
    } else {
      // Unmatched marker — treat as plain text
      nodes.push({ type: "text", text: text[i] });
      i++;
    }
  }

  return nodes.filter((n) => n.text !== "");
}

function toTiptapJson(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line — skip
    if (!line.trim()) { i++; continue; }

    // Heading: # / ## / ###
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        attrs: { level: headingMatch[1].length },
        content: parseInline(headingMatch[2].trim()),
      });
      i++;
      continue;
    }

    // Bullet list: lines starting with - or *
    if (/^[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        const content = lines[i].replace(/^[-*+]\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInline(content) }],
        });
        i++;
      }
      blocks.push({ type: "bulletList", content: items });
      continue;
    }

    // Ordered list: lines starting with 1. 2. etc.
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        const content = lines[i].replace(/^\d+\.\s+/, "");
        items.push({
          type: "listItem",
          content: [{ type: "paragraph", content: parseInline(content) }],
        });
        i++;
      }
      blocks.push({ type: "orderedList", attrs: { start: 1 }, content: items });
      continue;
    }

    // Regular paragraph
    const inlineContent = parseInline(line.trim());
    if (inlineContent.length > 0) {
      blocks.push({ type: "paragraph", content: inlineContent });
    }
    i++;
  }

  return JSON.stringify({
    type: "doc",
    content: blocks.length > 0 ? blocks : [{ type: "paragraph" }],
  });
}

async function rewriteTaskContentProvider(req, res) {
  try {
    const taskContent = await TaskContent.findOne({
      task: req.params.taskId,
    }).lean();

    if (!taskContent) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Task content not found." });
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

    const originalText = taskContent.plainText?.trim();

    if (!originalText) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Task content is empty — nothing to rewrite." });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a project management assistant. Rewrite task content to be clearer, better structured, and more professional. " +
          "Preserve the meaning and key details. Return only the rewritten plain text, no extra commentary.",
      },
      {
        role: "user",
        content: `Rewrite this task content:\n\n${originalText}`,
      },
    ];

    const rewrittenText = await callAI(messages, 800);

    return res.status(StatusCodes.OK).json({
      original: {
        plainText: originalText,
      },
      rewritten: {
        plainText: rewrittenText.trim(),
        tiptapJson: toTiptapJson(rewrittenText.trim()),
      },
    });
  } catch (error) {
    errorLogger(
      `Error while rewriting task content: ${error.message}`,
      req,
      error
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Unable to rewrite task content, please try again later.",
    });
  }
}

module.exports = rewriteTaskContentProvider;

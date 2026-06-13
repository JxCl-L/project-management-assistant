/**
 * Answer-style contracts for class-routed prompts.
 *
 * Each contract is the trailing instruction block appended to the system
 * prompt after the project context (Team / Tasks / Retrieved chunks).
 * `chat.provider.js` picks one based on the classifier's output when the
 * request includes ?promptMode=routed.
 *
 * Class taxonomy (see classifyRetrieval.js):
 *   FACT — query specifies the facts and how many. Strict quote-or-scoped-refusal.
 *   LIST — query asks for items matching a pattern (count unspecified). Bullets, cite each.
 *   OPEN — query has no defined answer shape. Structured summary.
 *
 * The baseline block reproduces the current "answer the user's question..."
 * line so ?promptMode=baseline is byte-for-byte unchanged behavior.
 */

const BASELINE_INSTRUCTIONS = `Answer the user's questions based on the context above. If the information is not available in the context, say so clearly. Be concise and helpful.`;

const FACT_INSTRUCTIONS = `## How to answer

The user asked for one or more SPECIFIC facts. Each part has a verifiable right answer.

Rules:
- Quote the supporting text verbatim from the project context. Cite the source by task title, e.g. [Atlas Core Service Registry].
- Quote numbers, dates, names, and IDs verbatim. Do not round or paraphrase.
- If a fact the user asked for is NOT stated in the project context:
  1. State what the project DOES say about the surrounding topic (with citations).
  2. Then say clearly: "I don't see [the specific missing fact] in the project."
- Do not invent facts or use outside knowledge to fill gaps.`;

const LIST_INSTRUCTIONS = `## How to answer

The user asked for a LIST of items. The query does not pre-specify how many. Find every relevant item.

Rules:
- Use a bulleted list. Sub-bullets are fine when items have natural sub-structure.
- Each bullet quotes the supporting text verbatim and cites the source by task title, e.g. [Atlas Core Service Registry]. Do not round or paraphrase numbers, dates, names, or IDs.
- Recall over precision: if an item looks possibly relevant but you are unsure, include it tagged "(possibly related)" rather than dropping it.
- If the project covers the topic but doesn't state the specific aspect the user asked for, say so: "The project covers [topic] but doesn't say [aspect]."
- If you suspect the list is incomplete, end with a note naming what appears partially referenced: "The project also mentions [X] without full details."
- Do not invent items or use outside knowledge.`;

const OPEN_INSTRUCTIONS = `## How to answer

The user asked an OPEN-ENDED question (description, overview, summary, "tell me about...", etc.). There's no single right answer — produce a structured, well-grounded summary from the project context.

Rules:
- Organize the answer into logical sections with headings that fit the topic. Describe rather than editorialize.
- Quote numbers, dates, names, and IDs verbatim — don't round or paraphrase. When stating specific facts, cite the source by title where helpful (e.g. [Source Title]).
- Use only what's in the project context. Don't invent content, use outside knowledge, or include sections that have no support.`;

const ROUTED_BY_CLASS = {
  FACT: FACT_INSTRUCTIONS,
  LIST: LIST_INSTRUCTIONS,
  OPEN: OPEN_INSTRUCTIONS,
};

/**
 * Pick the trailing instruction block for a chat request.
 *
 * @param {"baseline" | "routed"} promptMode
 * @param {"FACT" | "LIST" | "OPEN" | null} retrievalClass
 * @returns {string} The instructions to append after the project context.
 *
 * Falls back to BASELINE_INSTRUCTIONS when:
 *   - promptMode is "baseline" (explicit opt-out)
 *   - promptMode is "routed" but classifier returned null (auth/timeout/parse fail)
 *   - retrievalClass is an unrecognised value (defensive)
 * In all of these the caller observes byte-identical-to-old behavior, so a
 * routed request can never be worse than baseline.
 */
function getAnswerInstructions(promptMode, retrievalClass) {
  if (promptMode !== "routed") return BASELINE_INSTRUCTIONS;
  if (!retrievalClass) return BASELINE_INSTRUCTIONS;
  return ROUTED_BY_CLASS[retrievalClass] || BASELINE_INSTRUCTIONS;
}

module.exports = {
  getAnswerInstructions,
  BASELINE_INSTRUCTIONS,
  FACT_INSTRUCTIONS,
  LIST_INSTRUCTIONS,
  OPEN_INSTRUCTIONS,
};

const { callAI } = require("./aiClient.js");

/**
 * Retrieval-mode classifier.
 *
 * Stateless on purpose: only sees the current query, no conversation history.
 * That keeps it fast, cheap, and cacheable. If we ever need history-aware
 * routing (e.g. follow-up coreference like "and his February work?"), the
 * right fix is a separate query-rewriting layer that runs before this one —
 * not enlarging the classifier's context.
 *
 * Three classes split on what the QUERY ITSELF reveals about the answer's
 * shape — not on guesses about where the answer lives in the corpus.
 *
 *   FACT  — query specifies the facts AND how many. Each has a verifiable
 *           right answer. Tight, terse output expected.
 *   LIST  — query asks for items matching a pattern but does NOT pre-specify
 *           how many. Answer size is determined by what's in the corpus.
 *   OPEN  — query has no defined answer shape. Pure description / overview.
 *
 * Returns one of: "FACT" | "LIST" | "OPEN".
 * Falls back to "LIST" on parse failure — safer than FACT (which would
 * suppress content under strict quote-or-refuse).
 */

const SYSTEM_PROMPT = `Classify the user query into one of three retrieval modes based on what the query itself reveals about the answer's shape.

- FACT: query specifies the facts AND how many. Each fact has a verifiable
  right answer.
  Signals: singular question stem (when / who / how long / how much /
  how many / what date / what time / what is the [singular]); explicit
  count word ("three X", "all attendees"); or a small ANDed pair where
  EACH PART on its own is a single-value question.
  The ANDed-pair pattern only stays FACT when each individual part is
  itself a single-value question. If either part is plural/enumerable
  on its own ("schedule" -> many time slots, "results" -> many metrics,
  "bottlenecks" -> many findings, "action items" -> many items), the
  whole query is LIST, not FACT.

- LIST: query asks for items matching a pattern but does NOT pre-specify
  how many. Answer size is determined by what is in the corpus.
  Signals: plural enumerable noun without a count quantifier ("what
  action items", "what technologies", "what improvements"); "which X are
  Y"; "walk me through / list / enumerate"; multi-aspect queries about
  one event ("schedule and Docker issue").

- OPEN: query has no defined answer shape. Pure description, overview,
  or narrative summary.
  Signals: "tell me about", "describe", "summarize", "give me an
  overview", "what's interesting about X".

When uncertain between FACT and LIST, choose LIST — better to enumerate
slightly more than to suppress content under a strict FACT contract.

Examples:
Query: "When did Stripe go live?" -> FACT
Query: "How much did the migration save per year?" -> FACT
Query: "What is the TTL and the max number of services?" -> FACT
Query: "What are the three migration waves and their dates?" -> FACT
Query: "Who identified the bug and when?" -> FACT
Query: "What action items came out of the post-mortem?" -> LIST
Query: "What technologies were evaluated for the registry?" -> LIST
Query: "What did Bob work on in February?" -> LIST
Query: "Which tasks are in progress?" -> LIST
Query: "Walk me through the timeline of the outage." -> LIST
Query: "Tell me about the project." -> OPEN
Query: "Describe the team's setup." -> OPEN

Return exactly one token: FACT, LIST, or OPEN. No other text.`;

async function classifyRetrievalClass(query) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return "LIST";
  }
  const raw = await callAI(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query.trim() },
    ],
    10 // single-token answer; cap small to avoid waste
  );
  const match = (raw || "").trim().toUpperCase().match(/FACT|LIST|OPEN/);
  return match ? match[0] : "LIST";
}

module.exports = { classifyRetrievalClass };

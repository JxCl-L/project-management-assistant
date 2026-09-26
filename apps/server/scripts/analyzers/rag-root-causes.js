/**
 * Root-cause taxonomy for non-success cells.
 *
 * A `diagnosis` label answers "what kind of failure" (e.g. generation_partial,
 * boundary_split). It doesn't tell you WHY — a generation_partial could be
 * attention dilution OR overconfident attribution OR value confusion, and the
 * remedies for each are completely different.
 *
 * This module attaches a `rootCause` tag (one of the keys in CAUSES) to each
 * non-success row. The mapping is hand-curated based on the manual analysis
 * in scripts/reruns-baseline/answer-quality-summary.md and the .md report
 * verdict texts. Edit MAP_BASELINE / MAP_ROUTED to add new cells.
 *
 * Wildcards: use "*" as a strategy to apply a root cause to every strategy
 * of that case (useful for cases like G1 / G2 where the same root cause
 * applies across the board).
 */

// Each cause declares its `parentDiagnosis` — the matrix diagnosis it always
// rolls up to. The viewer uses this to color-match cause pills with the
// parent diagnosis pill and group them visually.
const CAUSES = {
  // ─── Generation partial / generation miss ────────────────────────────────
  attention_dilution: {
    label: "Attention dilution",
    parentDiagnosis: "generation_partial",
    short:
      "Model had every fact in context but dropped a fine-grained detail (time, percentile, mid-list item). Happens with long context — fullcontext, single, whole-task retrieval, or any case where the answer chunk IS retrieved but the model stops reading early.",
  },
  overconfident_attribution: {
    label: "Overconfident attribution",
    parentDiagnosis: "generation_partial",
    short:
      "Model bridges a gap with a plausible-but-unsupported claim. Classic case: source says X was the investigator → model says X identified the root cause. Routing helps when the FACT prompt forces hedging, but only on chunked/hybrid where the suggestive sentence is broken up.",
  },
  value_confusion: {
    label: "Value confusion",
    parentDiagnosis: "generation_partial",
    short:
      "Multiple numeric values in context — model picks the wrong one. B1's 120 / 850 / 115ms is the canonical example: post-fix chunk leads with 115ms, model then anchors 120ms (the pre-regression baseline) as the 'before fix' value instead of the regressed 850ms.",
  },
  multi_fact_drop: {
    label: "Multi-fact drop",
    parentDiagnosis: "generation_partial",
    short:
      "Summary or list answer missed one specific item. Different from attention dilution because the omitted item is part of a structured enumeration the model otherwise reproduces (e.g. D1 timeline events 10:38 / 11:15, D3 'Bob updated CONTRIBUTING.md').",
  },

  // ─── Boundary / partial retrieval ────────────────────────────────────────
  chunk_boundary_cut: {
    label: "Chunk boundary cut",
    parentDiagnosis: "boundary_split",
    short:
      "Answer-bearing sentence was split across two adjacent chunks — only a partial chunk made top-k, no fully-containing chunk did. H2 chunked@150/50: chunk #2 ends right before 'maximum 500 registered services'.",
  },
  semantic_mismatch: {
    label: "Semantic mismatch (cross-cutting)",
    parentDiagnosis: "boundary_split",
    short:
      "Query concept doesn't align with any single task's embedding. Vector search finds tasks that mention query terms, not tasks that ARE about the concept. G1 'performance improvements' doesn't match 'GitHub Actions CI/CD' or 'Load Testing Report' titles.",
  },
  person_time_filter: {
    label: "Person+time filter invisible to vector",
    parentDiagnosis: "boundary_split",
    short:
      "Query needs to combine a person filter ('what did Bob do') with a time filter ('in February'). Vector search has no notion of either as a discrete filter — it just finds tasks where Bob's name happens to score high, missing tasks where he's a contributor.",
  },

  // ─── Retrieval miss (chunk) ──────────────────────────────────────────────
  bm25_displacement: {
    label: "BM25 displacement",
    parentDiagnosis: "retrieval_miss_chunk",
    short:
      "Vector-strong chunk was pushed out of top-k by BM25 boosting chunks with stronger keyword overlap on terms incidental to the answer. A1 hybrid@150/50: post-mortem chunk #0 displaced by Search Index #0 and Q2 Demo #3 BM25-matching 'outage'/'time'.",
  },

  // ─── Edge / by-design (not real failures) ────────────────────────────────
  open_query_variance: {
    label: "Open-ended variance",
    parentDiagnosis: "open_ended",
    short:
      "Vague query with no atomic gold facts. Quality varies by completeness; mark is a percentage. Not a failure — just an inherently subjective case.",
  },
  metadata_query: {
    label: "Metadata-only query",
    parentDiagnosis: "metadata_only",
    short:
      "Answer comes from project task list / status field, not chunked content. Retrieval grain doesn't apply.",
  },
};

// ─── Per-(case, strategy) mapping for baseline run ───────────────────────────
// Use "*" as strategy to apply to every strategy of the case.
const MAP_BASELINE = {
  "A1|hybrid@150/50": "bm25_displacement",

  "A3|fullcontext": "attention_dilution", // drops 10:00 AM PST time

  "B1|chunked@150/50": "value_confusion",
  "B1|chunked@150/25": "value_confusion",

  "C2|*": "overconfident_attribution", // Bob investigator → identifier

  "D1|single": "multi_fact_drop", // skips 10:38 / 11:15 timeline events

  "D2|hybrid@150/25": "chunk_boundary_cut", // action items chunk not in top-8

  "D3|hybrid@150/25": "multi_fact_drop", // chunks have "Bob updated CONTRIBUTING.md" but answer omits it

  "F3|*": "open_query_variance",

  "F1|*": "metadata_query", // shown for context — F1 is "metadata_only" diagnosis (not a real failure)
  // F2 always succeeds (proper refusal) → no rootCause needed. The success
  // diagnosis itself carries the meaning.

  "G1|*": "semantic_mismatch",
  "G2|*": "person_time_filter",

  "H2|chunked@150/50": "chunk_boundary_cut", // max-500 sentence boundary

  "H4|fullcontext": "attention_dilution", // stops before gRPC section
  "H4|single": "attention_dilution",
  // H4 chunked/hybrid: data shows the gRPC-bearing chunk IS retrieved
  // (sufficiency=100%); model drops gRPC from the answer. Original manual
  // analysis predated correct chunk tagging.
  "H4|chunked@150/50": "attention_dilution",
  "H4|chunked@150/25": "attention_dilution",
  "H4|hybrid@150/50": "attention_dilution",
  "H4|hybrid@150/25": "attention_dilution",
};

// ─── Routed mapping — most causes carry over, but routing shifts some ────────
const MAP_ROUTED = {
  ...MAP_BASELINE,

  // B3: routed chunked@150/50 drops P50/P95/P99 percentile values from the
  // multi-fact summary answer (other strategies kept them). Chunks contain
  // them — pure generation omission.
  "B3|chunked@150/50": "multi_fact_drop",

  // C2: routed FACT prompt forces hedging on chunked/hybrid@150/25 → those
  // become success. Only fullcontext / single / hybrid@150/50 still
  // overconfidently attribute (long-context strategies the FACT prompt
  // can't override).
  "C2|chunked@150/50": null, // success in routed — clear the baseline tag
  "C2|chunked@150/25": null,
  "C2|hybrid@150/25": null,
  // C2 fullcontext / single / hybrid@150/50: still overconfident_attribution
  // (inherited from MAP_BASELINE spread above)

  // H4: routed succeeds across all strategies (FACT prompt surfaces all
  // three rejections reliably) → clear the baseline cause tags.
  "H4|fullcontext": null,
  "H4|single": null,
  "H4|chunked@150/50": null,
  "H4|chunked@150/25": null,
  "H4|hybrid@150/50": null,
  "H4|hybrid@150/25": null,

  // B1: routed succeeds on chunked@150/50 / chunked@150/25 (FACT prompt
  // makes the model think clearly about before/after) → clear.
  "B1|chunked@150/50": null,
  "B1|chunked@150/25": null,
};

function rootCauseFor(caseId, strategy, tag) {
  const map = tag === "routedclass" ? MAP_ROUTED : MAP_BASELINE;
  const exactKey = `${caseId}|${strategy}`;
  if (exactKey in map) {
    const tag = map[exactKey];
    return tag === null ? null : tag; // null = explicitly cleared
  }
  const wildKey = `${caseId}|*`;
  if (wildKey in map) {
    const tag = map[wildKey];
    return tag === null ? null : tag;
  }
  return null;
}

// ─── Case-level notes (per run) ──────────────────────────────────────────────
// Free-form notes attached to a case for a particular run (tag). Use for
// things that affect interpretation but aren't a "root cause" — typically:
//   - server/seed-data drift between runs
//   - test-environment artifacts
//   - known eval-framework caveats
//
// Shown in the drawer for every cell of the matching case+tag, in a neutral
// gray box (not framed as a failure cause). If a note applies to BOTH runs,
// add it under "*" tag (catch-all).
const CASE_NOTES = {
  baselineclass: {},
  routedclass: {
    F1: {
      title: "Server data drift between baseline and routed runs",
      body:
        "Between the baseline and routed eval runs, the test-server data for Project Atlas drifted: 'Sentry Error Monitoring — Configuration & Alerting' changed status from 'completed' to 'inProgress'. The routed-mode prompt picks up the LIVE task list at request time, so routed answers for F1 list seven inProgress tasks (the six in the ground truth + Sentry). This is NOT a model hallucination — the extra task reflects the server state the model was given. The curator marked routed F1 as ✓ across all strategies because every answer correctly enumerated the in-context task list. If you re-run the eval with reseed, this drift will disappear.",
    },
  },
  "*": {},
};

function caseNoteFor(caseId, tag) {
  return CASE_NOTES[tag]?.[caseId] || CASE_NOTES["*"]?.[caseId] || null;
}

// ─── Strategy comparisons for open-ended cases ───────────────────────────────
// Open-ended queries (F3 "Tell me about the project") have no atomic gold
// facts — chunk sufficiency doesn't apply, and a numeric "completeness %"
// is subjective. Comparing strategies qualitatively is more honest.
//
// Each entry: a per-strategy short note describing what that strategy's
// answer covered well, missed, or did differently. Shown in the drawer
// instead of (or alongside) a numeric rating.
const STRATEGY_COMPARISONS = {
  F3: {
    overview:
      "Vague 'Tell me about the project' query — completeness varies by how much context each strategy assembles. No atomic gold facts; comparison is qualitative across: project name + description, team members, task counts, key initiatives (Atlas Core, CI/CD, Stripe, Sentry, security audit), and notable incidents.",
    perStrategy: {
      fullcontext:
        "Most comprehensive of the six. Covers Atlas Core (registry, capacity limits, phased rollout), CI/CD migration metrics, Stripe integration ($9,600 savings, 12 subs day 1), Sentry config, security audit ($18,500 SecureLayer). Cuts off mid-response in the Notable Incidents section (Search Index regression starts but doesn't finish). Length: longest — has every detail in context.",
      single:
        "Strong narrative but task count off by one ('20 tasks' vs actual 21). Sourced mostly from Q2 Stakeholder Demo prep + Frontend Design System + Q1 Security Audit chunks (only 3 tasks retrieved at task grain). Covers main initiatives through cross-references; misses post-mortem detail.",
      "chunked@150/50":
        "Mid-tier. Clear three-part structure (Completed / In Progress / Pending). Strong on infrastructure and integration metrics, lighter on operational specifics. Solid coverage of Atlas Core, GitHub Actions migration, search optimization (P95 850→115ms), Stripe day-one (12 subs).",
      "chunked@150/25":
        "Slightly more complete than 150/50 on Atlas Core technical details (kickoff, owner, capacity limits). Smaller chunks let more distinct facts make top-8. Best non-fullcontext strategy for breadth.",
      "hybrid@150/50":
        "BM25 boost pulls Atlas Core content to the top (registry receives more space than other initiatives). Q1 sprint goals well covered. Cuts off mid-response in Security & Quality section — auth token bug not finished.",
      "hybrid@150/25":
        "Most cropped output. Strong intro covering main initiatives and team, then heavy section headings (1. Atlas Core, 2. Sentry, 3. Frontend Design System...) push detailed content below the visible cut-off. Completed milestones reduced to a date table.",
    },
  },
};

function strategyComparisonFor(caseId) {
  return STRATEGY_COMPARISONS[caseId] || null;
}

module.exports = {
  CAUSES,
  rootCauseFor,
  STRATEGY_COMPARISONS,
  strategyComparisonFor,
  CASE_NOTES,
  caseNoteFor,
};

/**
 * Generates a standalone HTML roadmap of retrieval-side root causes.
 *
 * Purpose: future-reference document for when retrieval optimization
 * begins. Lists each retrieval-side root cause from rag-root-causes.js,
 * shows affected cells (across all available runs), and lays out the
 * fix levers vs. dead-ends so you don't burn time on the wrong remedy.
 *
 * Generation-side causes (attention_dilution, overconfident_attribution,
 * value_confusion, multi_fact_drop) and by-design causes (metadata_query,
 * open_query_variance) are excluded — those need prompt / model work,
 * not retrieval work.
 *
 *   node scripts/rag-retrieval-roadmap-html.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TAGS = ["baselineclass", "routedclass"];

const { CAUSES } = require("./rag-root-causes.js");

// ─── Cause-specific analyses and fix levers ──────────────────────────────────
// Keyed by rootCause name. The lib's `short` description is reused for the
// summary; the fields below add roadmap-grade detail.
const ROADMAP = {
  chunk_boundary_cut: {
    mechanism:
      "The deterministic word-based chunker splits the source into windows of " +
      "150 words with 25–50 word overlap. When the answer-bearing sentence " +
      "happens to straddle the boundary between two chunks, neither chunk fully " +
      "contains it. The chunk that ends mid-sentence gets ranked partly relevant " +
      "(some tokens match), but the chunk holding the rest of the sentence is " +
      "demoted because the leading tokens don't connect to the query. Result: " +
      "the answer-bearing sentence appears in retrieved chunks only as a " +
      "fragment, and the model paraphrases incorrectly or drops the fact.",
    diagnosticSignals: [
      "Cell shows boundary_split diagnosis with sufficiency between 0% and 80% chunk-grain",
      "factCoverage drawer shows partialHit=true for the affected fact (but fullHit=false)",
      "Curator verdict often says 'chunk #N ends right before <key phrase>'",
    ],
    fixLevers: [
      "Smaller chunks + larger overlap (e.g. 100/50 or 75/50) — increases the chance the whole sentence fits in some chunk",
      "Sentence-aware splitter — break only at sentence boundaries (not mid-sentence)",
      "Recursive chunker with semantic structure (e.g. LangChain RecursiveCharacterTextSplitter with separators in priority order: paragraph > sentence > word)",
      "Multi-resolution retrieval — index at both 75-word and 300-word chunks; retrieve the small chunk for ranking, return the parent paragraph for context",
      "Increase k for vector search and re-rank with a cross-encoder model that scores the full sentence",
    ],
    wontHelp: [
      "Better embeddings — the issue isn't semantic mismatch, it's mechanical splitting",
      "BM25 alone — same chunking, same problem",
      "Bigger LLM context window — only helps if you retrieve more chunks, which dilutes ranking",
    ],
    canonicalExample:
      "H2 chunked@150/50: chunk #2 ends right before 'maximum 500 registered services per Atlas project'. The fact 'max 500' lives in chunk #3 but #3 ranks low because it opens with 'per Atlas project' (no query match). Sufficiency = 50% (the Redis TTL fact in chunk #1 is fine).",
  },

  semantic_mismatch: {
    mechanism:
      "The query asks about a CONCEPT (e.g. 'performance improvements this quarter'), " +
      "but no single task in the seed has a title or description that vector-aligns " +
      "with the concept. Instead, the concept is realized as a property of multiple " +
      "tasks: the search index task improved P95 latency; the CI/CD task improved " +
      "pipeline duration; the load testing task surfaced capacity changes. Each " +
      "individual task ranks moderately for the query, but none ranks first because " +
      "their primary semantic content is about something else (search indexes, " +
      "Jenkins migration, load testing methodology). The vector retriever picks the " +
      "tasks that mention query terms most prominently — often the wrong ones.",
    diagnosticSignals: [
      "Multi-task case (expectedTasks.length > 1) with task-grain sufficiency well below 100%",
      "Retrieved chunks come from tasks that contain query keywords incidentally (e.g. Q2 demo prep mentioning everything)",
      "factCoverage shows MISS on facts from tasks that should be central but aren't retrieved",
    ],
    fixLevers: [
      "Query rewriting / expansion — decompose the abstract query into specific sub-queries ('search latency improvements' + 'CI improvements' + 'capacity changes') and union the results",
      "Hierarchical retrieval — first retrieve at the task-summary level, then at the chunk level within selected tasks",
      "HyDE (Hypothetical Document Embeddings) — generate a synthetic answer to the query, embed that, and use it as the retrieval query",
      "Add task-level metadata tags (e.g. {category: 'performance'}) and filter on them at retrieval time",
      "Fine-tune embeddings on domain-specific data so abstract concepts align with task content",
    ],
    wontHelp: [
      "Smaller chunks — the issue is at task selection, not within-task chunk selection",
      "BM25 weight increase — incidental keyword matches will rank even higher (worse)",
      "Larger k — adds more noise without adding more relevant tasks",
    ],
    canonicalExample:
      "G1 'What performance improvements were made this quarter?' — single retrieves Q2 Stakeholder Demo Prep (mentions everything, no specific improvement) and Q1 Sprint Planning (mentions roadmap), missing the actual performance-improvement tasks (Search Index Optimization, CI/CD Pipeline Upgrade, Load Testing Report).",
  },

  person_time_filter: {
    mechanism:
      "The query needs to combine TWO discrete filter dimensions that vector " +
      "search can't express natively: a PERSON filter ('Bob Chen') AND a TIME " +
      "filter ('in February'). Vector search just finds chunks whose overall " +
      "embedding is most similar to the query — it has no mechanism to enforce " +
      "'must contain person X AND date Y'. The 2–3 tasks where Bob is the " +
      "primary subject (Marcus onboarding, Bug Triage) rank high because their " +
      "embeddings are Bob-centric; the 4+ tasks where Bob is one of several " +
      "contributors (CI/CD, Stripe, Atlas Core) rank lower. Time filtering is " +
      "even harder — 'February 5' and 'February 24' are tiny tokens that don't " +
      "shift the embedding much.",
    diagnosticSignals: [
      "Multi-task case where each expected task contains the person's name + a date in scope",
      "Retrieved chunks are heavily biased toward tasks where the person is the sole topic",
      "Curator's mark looks like '~ 2/6' or '~ 3/6' (partial task coverage)",
    ],
    fixLevers: [
      "Add structured filters: extract entities (person, date) from the query, then run a filter on chunk metadata (last_edited_by, date_mentioned) BEFORE vector search",
      "Use BM25 with mandatory keyword match on the person's name across all retrieval candidates, then re-rank with vector",
      "Pre-index entity mentions at chunk-creation time — for each chunk, store {persons_mentioned, dates_mentioned} as filter fields",
      "Multi-stage retrieval: query LLM to decompose 'What did Bob do in February?' into a SQL-like query, then run that against an indexed entity table, finally fetch chunks for the matched tasks",
      "Fine-tune retriever on person+time queries with multi-task supervision",
    ],
    wontHelp: [
      "Smaller chunks — the issue is which tasks get found, not which chunks within them",
      "Better content embeddings — the filter is structural, not semantic",
      "Query rewriting alone — even 'Bob Chen February 2026 work' won't pull all 6 tasks because the embedding still lacks a filter mechanism",
    ],
    canonicalExample:
      "G2 'What did Bob Chen work on in February?' — vector retrieves Marcus Onboarding (Bob's primary task) and 1–2 others; misses API Rate Limiting (Bob led), CI/CD migration (Bob led), Stripe integration (Bob led), Analytics Dashboard (Bob led). Each missed task has 'Bob Chen' AND 'February' in chunks but not in dominant positions.",
  },

  bm25_displacement: {
    mechanism:
      "In hybrid retrieval, BM25 scores chunks by keyword overlap with the query. " +
      "If the query contains a common token (e.g. 'outage', 'time') and a less-" +
      "relevant chunk has lots of those keyword matches, BM25 boosts that chunk " +
      "above the vector-relevant one. The fusion step (RRF or weighted sum) then " +
      "pushes the BM25-favored chunk into top-k, displacing the vector-favored " +
      "chunk that actually contains the answer. The vector retriever 'knew the " +
      "right answer' but the hybrid fusion overruled it.",
    diagnosticSignals: [
      "Cell is hybrid@... only (chunked of same config succeeds)",
      "Sufficiency = 0% but the same chunks at vector-only retrieval would have full coverage",
      "Comparing chunked@150/X retrieved set with hybrid@150/X retrieved set: the gold chunk is present in chunked, missing in hybrid",
    ],
    fixLevers: [
      "Lower BM25 weight in the fusion (e.g. RRF with α=0.7 instead of α=0.5)",
      "Filter BM25 candidates by min-vector-score before fusion (BM25 can only PROMOTE, never PROMOTE-AT-EXPENSE-OF a high-vector chunk)",
      "Use BM25 only as a fallback for low-vector-score queries, not always",
      "Cross-encoder re-rank: take union of vector top-k and BM25 top-k, re-rank with a small cross-encoder model that understands semantics",
      "Stopword/common-term filtering on the BM25 side — remove 'outage', 'time', 'work' etc. that get falsely matched",
    ],
    wontHelp: [
      "Pure vector improvements (the vector side was already correct here)",
      "Smaller chunks (changes ranking equally for both retrievers, no net help)",
      "Larger k alone (the displaced chunk may still rank just below k=8)",
    ],
    canonicalExample:
      "A1 hybrid@150/50: post-mortem chunk #0 (contains '10:12 AM first PagerDuty alert' — the answer) is displaced by Search Index #0 and Q2 Stakeholder Demo #3, which match 'outage' and 'time' more heavily. The chunked@150/50 version of the same query retrieves chunk #0 fine.",
  },
};

// ─── Pull affected cells from each available quality JSON ────────────────────
function loadQuality(tag) {
  const p = path.join(ROOT, "results", `rag-quality-${tag}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const quality = {};
for (const tag of TAGS) {
  const q = loadQuality(tag);
  if (q) quality[tag] = q;
}

// Build cells-by-cause across all runs.
const cellsByCause = {};
for (const [tag, q] of Object.entries(quality)) {
  for (const r of q.rows) {
    if (!r.rootCause) continue;
    if (!CAUSES[r.rootCause]) continue;
    cellsByCause[r.rootCause] = cellsByCause[r.rootCause] || [];
    cellsByCause[r.rootCause].push({
      tag,
      caseId: r.caseId,
      strategy: r.strategy,
      mark: r.answerMark,
      sufficiency: r.retrievalSufficiency,
    });
  }
}

// Retrieval-side root causes only — exclude generation, metadata, open-ended.
const RETRIEVAL_CAUSES = Object.keys(CAUSES).filter((k) => {
  const parent = CAUSES[k].parentDiagnosis;
  return parent === "boundary_split" || parent === "retrieval_miss_chunk" || parent === "retrieval_miss_task";
});

// ─── Render ──────────────────────────────────────────────────────────────────
function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function pct(v) { return v == null ? "—" : (v * 100).toFixed(0) + "%"; }

const DIAG_COLORS = {
  boundary_split: { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c" },
  retrieval_miss_chunk: { bg: "#fecaca", fg: "#7f1d1d", border: "#ef4444" },
  retrieval_miss_task: { bg: "#fca5a5", fg: "#7f1d1d", border: "#dc2626" },
};

function renderCauseSection(causeKey) {
  const cause = CAUSES[causeKey];
  const roadmap = ROADMAP[causeKey] || {};
  const cells = cellsByCause[causeKey] || [];
  const palette = DIAG_COLORS[cause.parentDiagnosis] || { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1" };

  const cellsByTag = {};
  for (const c of cells) (cellsByTag[c.tag] = cellsByTag[c.tag] || []).push(c);

  const cellsHtml = Object.entries(cellsByTag)
    .map(([tag, list]) => `
      <div class="cells-block">
        <div class="cells-tag">${escape(tag)} · ${list.length} cell${list.length === 1 ? "" : "s"}</div>
        <div class="cells-list">
          ${list
            .sort((a, b) => (a.caseId + a.strategy).localeCompare(b.caseId + b.strategy))
            .map((c) => `<span class="cell-chip">
              <b>${escape(c.caseId)}</b>
              <span class="cell-chip-strat">${escape(c.strategy)}</span>
              <span class="cell-chip-meta">${escape(c.mark || "?")} · suf ${pct(c.sufficiency)}</span>
            </span>`)
            .join("")}
        </div>
      </div>
    `)
    .join("");

  const section = (title, items) => {
    if (!items || (Array.isArray(items) && items.length === 0)) return "";
    if (Array.isArray(items)) {
      return `<h4>${escape(title)}</h4><ul>${items.map((x) => `<li>${escape(x)}</li>`).join("")}</ul>`;
    }
    return `<h4>${escape(title)}</h4><p>${escape(items)}</p>`;
  };

  return `
    <article class="cause" style="border-left-color:${palette.border};">
      <header style="background:${palette.bg};color:${palette.fg};">
        <div class="cause-header-row">
          <h2>${escape(cause.label)}</h2>
          <span class="parent-tag">${escape(cause.parentDiagnosis.replace(/_/g, " "))}</span>
        </div>
        <p class="summary">${escape(cause.short)}</p>
      </header>
      <div class="cause-body">
        ${section("Mechanism (what's happening under the hood)", roadmap.mechanism)}
        ${section("Diagnostic signals (how to spot this in the matrix)", roadmap.diagnosticSignals)}
        ${section("Fix levers (in rough priority order)", roadmap.fixLevers)}
        ${section("Won't help (don't try these first)", roadmap.wontHelp)}
        ${roadmap.canonicalExample ? `<h4>Canonical example</h4><p class="example">${escape(roadmap.canonicalExample)}</p>` : ""}
        <h4>Affected cells across runs</h4>
        ${cells.length === 0 ? '<p class="no-cells">No cells currently tagged with this cause.</p>' : cellsHtml}
      </div>
    </article>
  `;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RAG Retrieval Optimization Roadmap</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8fafc; color: #1e293b; padding: 36px 48px 80px;
    font-size: 14px; line-height: 1.55;
    max-width: 1080px; margin: 0 auto;
  }
  h1 { font-size: 22px; margin-bottom: 6px; }
  .subtitle { font-size: 13px; color: #64748b; margin-bottom: 28px; }
  .subtitle code { background: #e2e8f0; padding: 1px 6px; border-radius: 3px; font-size: 12px; }
  .intro {
    background: white; border-radius: 10px; padding: 18px 22px;
    border: 1px solid #e2e8f0; margin-bottom: 28px;
    font-size: 13px; color: #334155; line-height: 1.6;
  }
  .intro b { color: #0f172a; }
  .intro ul { margin: 8px 0 0 22px; }
  .intro li { margin: 3px 0; }

  article.cause {
    background: white; border-radius: 10px; margin-bottom: 22px;
    border: 1px solid #e2e8f0; border-left: 4px solid;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  article.cause header {
    padding: 14px 22px;
  }
  .cause-header-row {
    display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
    margin-bottom: 4px;
  }
  article.cause h2 { font-size: 17px; font-weight: 700; }
  .parent-tag {
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    font-weight: 600; opacity: 0.75;
    background: rgba(255,255,255,0.55); padding: 2px 8px; border-radius: 999px;
  }
  .summary { font-size: 13px; line-height: 1.55; opacity: 0.92; margin: 0; }

  .cause-body { padding: 4px 22px 18px; }
  .cause-body h4 {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
    color: #475569; font-weight: 700;
    margin: 16px 0 6px;
  }
  .cause-body p { font-size: 13px; color: #1e293b; line-height: 1.6; }
  .cause-body ul { margin: 4px 0 0 18px; font-size: 13px; }
  .cause-body li { margin: 4px 0; color: #1e293b; line-height: 1.55; }
  .cause-body .example {
    background: #f8fafc; border-left: 3px solid #94a3b8;
    padding: 8px 12px; border-radius: 0 4px 4px 0;
    font-size: 12.5px; color: #334155; line-height: 1.55;
  }

  .cells-block { margin-top: 10px; }
  .cells-tag {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px;
  }
  .cells-list {
    display: flex; flex-wrap: wrap; gap: 6px;
  }
  .cell-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 6px;
    background: #f1f5f9; font-size: 12px; color: #334155;
    border: 1px solid #e2e8f0;
  }
  .cell-chip b { color: #0f172a; }
  .cell-chip-strat {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px; color: #64748b;
  }
  .cell-chip-meta {
    color: #94a3b8; font-size: 11px;
  }
  .no-cells { color: #94a3b8; font-style: italic; font-size: 12.5px; }

  hr.section-div {
    border: 0; border-top: 1px solid #e2e8f0;
    margin: 36px 0 22px;
  }
  .group-header {
    font-size: 13px; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin: 8px 0 14px;
  }
</style>
</head>
<body>
  <h1>RAG Retrieval Optimization Roadmap</h1>
  <div class="subtitle">
    Future-reference document for when retrieval optimization begins ·
    Generated ${escape(new Date().toISOString())}
  </div>

  <div class="intro">
    <b>What's in here:</b> the retrieval-side root causes surfaced by the eval, with a brief mechanism explanation, diagnostic signals, fix levers, and a "won't help" list per cause.
    <br><br>
    <b>What's NOT in here:</b> generation-side causes (attention dilution, overconfident attribution, value confusion, multi-fact drop) and by-design causes (open-ended variance, metadata-only query). Those need prompt / model work — not retrieval work.
    <br><br>
    <b>How to use this:</b>
    <ul>
      <li>Pick a fix lever from the highest-cell-count cause first — that's where the biggest win lives.</li>
      <li>Compare fix levers against the "won't help" list before committing — saves cycles on the wrong approach.</li>
      <li>After applying a fix, re-run the eval and check whether cells with that root cause moved to <code>success</code>. If they didn't, the mechanism analysis was wrong (or the fix was incomplete).</li>
      <li>If a fix accidentally regresses cells elsewhere (e.g. tightening BM25 fixes A1 but breaks G2), the parent diagnosis will shift — useful signal that retrieval levers have global effects.</li>
    </ul>
  </div>

  <div class="group-header">Boundary / partial retrieval (right task in retrieval, wrong chunks)</div>
  ${RETRIEVAL_CAUSES
    .filter((k) => CAUSES[k].parentDiagnosis === "boundary_split")
    .map(renderCauseSection)
    .join("")}

  <div class="group-header">Retrieval miss — chunk (right task, no fact-bearing chunk retrieved)</div>
  ${RETRIEVAL_CAUSES
    .filter((k) => CAUSES[k].parentDiagnosis === "retrieval_miss_chunk")
    .map(renderCauseSection)
    .join("")}
</body>
</html>
`;

const outPath = path.join(ROOT, "viewers", "rag-retrieval-roadmap.html");
fs.writeFileSync(outPath, html);
console.log(`✅ Wrote ${path.relative(process.cwd(), outPath)}`);

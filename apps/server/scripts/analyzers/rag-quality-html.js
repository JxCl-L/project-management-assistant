/**
 * Renders rag-quality-<tag>.json as a self-contained HTML viewer.
 *
 *   node scripts/rag-quality-html.js [tag]
 *   tag defaults to "baselineclass"
 */

const fs = require("fs");
const path = require("path");

const tag = process.argv[2] || "baselineclass";
const ROOT = path.join(__dirname, "..");
const inputPath = path.join(ROOT, "results", `rag-quality-${tag}.json`);
const outPath = path.join(ROOT, "viewers", `rag-quality-${tag}.html`);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// Join in query / groundTruth (from cases) and answer (from results) so the
// drawer can show the model's actual output — without that, a diagnosis like
// "generation_partial · 100% sufficiency" is opaque (you can't see what the
// model wrote wrong).
const casesPath = path.join(ROOT, "rag-eval-cases.json");
const resultsPath = path.join(ROOT, "results", `rag-eval-results-${tag}.json`);
const cases_ = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const results_ = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const queryById = new Map(cases_.map((c) => [c.id, { query: c.query, groundTruth: c.groundTruth }]));
const answerByKey = new Map(
  results_.cells.map((c) => [c.caseId + "|" + c.variantKey, c.answer || ""]),
);
for (const row of data.rows) {
  const meta = queryById.get(row.caseId) || {};
  row.query = meta.query || "";
  row.groundTruth = meta.groundTruth || "";
  row.answer = answerByKey.get(row.caseId + "|" + row.strategy) ?? "";
}

// ─── Color palette for each diagnosis ────────────────────────────────────────
const DIAG = {
  success:                { bg: "#dcfce7", fg: "#166534", border: "#86efac", label: "Success" },
  generation_partial:     { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d", label: "Generation partial" },
  generation_miss:        { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5", label: "Generation miss" },
  boundary_split:         { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c", label: "Boundary / partial retrieval" },
  retrieval_miss_chunk:   { bg: "#fecaca", fg: "#7f1d1d", border: "#ef4444", label: "Retrieval miss (chunk)" },
  retrieval_miss_task:    { bg: "#fca5a5", fg: "#7f1d1d", border: "#dc2626", label: "Retrieval miss (task)" },
  mixed:                  { bg: "#fde68a", fg: "#78350f", border: "#f59e0b", label: "Mixed" },
  metadata_hallucination: { bg: "#e9d5ff", fg: "#581c87", border: "#c084fc", label: "Metadata hallucination" },
  partial_answer:         { bg: "#fef9c3", fg: "#854d0e", border: "#fde047", label: "Partial answer" },
  metadata_only:          { bg: "#dbeafe", fg: "#1e40af", border: "#93c5fd", label: "Metadata only (F1)" },
  open_ended:             { bg: "#e0e7ff", fg: "#3730a3", border: "#a5b4fc", label: "Open ended (F3)" },
  unanswerable:           { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1", label: "Unanswerable (F2)" },
  // retrieval-only labels (when correctness matrix is missing)
  sufficient:             { bg: "#dcfce7", fg: "#166534", border: "#86efac", label: "Sufficient retrieval" },
  partial_coverage:       { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c", label: "Partial coverage" },
};
const defaultDiag = { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1", label: "—" };

const STRATS = data.strategies;
const cases = [...new Set(data.rows.map((r) => r.caseId))];
const rowsBy = new Map();
for (const r of data.rows) rowsBy.set(`${r.caseId}|${r.strategy}`, r);

function pct(v, digits = 0) {
  if (v == null) return "—";
  return (v * 100).toFixed(digits) + "%";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ─── Tally pills ─────────────────────────────────────────────────────────────
const tallyEntries = Object.entries(data.tally).sort((a, b) => b[1] - a[1]);
const tallyHtml = tallyEntries
  .map(([k, v]) => {
    const d = DIAG[k] || defaultDiag;
    return `<span class="pill" style="background:${d.bg};color:${d.fg};border-color:${d.border}">
        <span class="pill-count">${v}</span>${d.label}
      </span>`;
  })
  .join("");

// Root causes grouped under their parent diagnosis. Each cause inherits the
// parent diagnosis's color so the grouping reads visually.
const causeTally = data.rootCauseTally || {};
const causesByParent = {};
for (const [k, v] of Object.entries(causeTally)) {
  const c = data.rootCauseTaxonomy?.[k];
  if (!c) continue;
  const parent = c.parentDiagnosis || "_other";
  (causesByParent[parent] = causesByParent[parent] || []).push({ key: k, count: v, ...c });
}
// Order parents by total cells, descending
const parentOrder = Object.entries(causesByParent)
  .sort((a, b) => b[1].reduce((s, x) => s + x.count, 0) - a[1].reduce((s, x) => s + x.count, 0))
  .map(([k]) => k);

const causeHtml = parentOrder
  .map((parent) => {
    const d = DIAG[parent] || defaultDiag;
    const total = causesByParent[parent].reduce((s, c) => s + c.count, 0);
    const pills = causesByParent[parent]
      .sort((a, b) => b.count - a.count)
      .map(
        (c) =>
          `<span class="pill cause-pill"
                 style="background:${d.bg};color:${d.fg};border-color:${d.border};"
                 title="${escapeHtml(c.short)}">
            <span class="pill-count">${c.count}</span>${escapeHtml(c.label)}
          </span>`,
      )
      .join("");
    return `
      <div class="cause-group">
        <div class="cause-group-header" style="color:${d.fg};border-color:${d.border};background:${d.bg};">
          <b>${escapeHtml(d.label)}</b>
          <span style="opacity:0.65;font-weight:500;">· ${total} cell${total === 1 ? "" : "s"}</span>
        </div>
        <div class="cause-group-pills">${pills}</div>
      </div>
    `;
  })
  .join("");

// ─── Matrix ──────────────────────────────────────────────────────────────────
function cellHtml(row) {
  if (!row) return `<td class="cell empty">—</td>`;
  const d = DIAG[row.diagnosis] || defaultDiag;
  const suf = row.retrievalSufficiency;
  // Strip the subjective percentage from open-ended marks (e.g. "~ 90%" → "~").
  // Sufficiency stays as "—" (null) — same display as F1 metadata cells.
  // The diagnosis label and the strategy comparison in the drawer carry the
  // meaningful per-strategy difference.
  const rawMark = row.answerMark || "";
  const markStr = escapeHtml(
    row.diagnosis === "open_ended" ? rawMark.trim().charAt(0) : rawMark
  );
  // Sufficiency cell: show percentage with grain label (task vs chunk) so
  // that e.g. G2 single "33% task" and G2 hybrid@150/25 "8% chunk" can't
  // be mis-compared as if they meant the same thing.
  let sufStr;
  if (suf == null) {
    sufStr = "—";
  } else {
    const grain = row.precisionGrain; // "task" | "chunk" | null
    const grainTag = grain
      ? `<span style="font-size:9px;font-weight:500;opacity:0.6;margin-left:3px;">${grain}</span>`
      : "";
    sufStr = pct(suf) + grainTag;
  }
  const rowKey = `${row.caseId}|${row.strategy}`;
  const causeLabel = row.rootCause && data.rootCauseTaxonomy?.[row.rootCause]?.label;
  const causeRow = causeLabel
    ? `<div class="cell-cause" title="${escapeHtml(data.rootCauseTaxonomy[row.rootCause].short)}">${escapeHtml(causeLabel)}</div>`
    : "";
  const noteBadge = row.caseNote
    ? `<span class="note-badge" title="${escapeHtml(row.caseNote.title)}">ⓘ</span>`
    : "";
  return `<td class="cell" data-key="${escapeHtml(rowKey)}"
              style="background:${d.bg};color:${d.fg};border-color:${d.border};">
    <div class="cell-top"><span class="mark">${markStr}${noteBadge}</span><span class="suf">${sufStr}</span></div>
    <div class="cell-diag">${escapeHtml(d.label)}</div>
    ${causeRow}
  </td>`;
}

const matrixRows = cases
  .map((caseId) => {
    const sample = data.rows.find((r) => r.caseId === caseId) || {};
    const cat = escapeHtml(sample.category || "");
    const beh = escapeHtml(sample.expectedBehavior || "");
    const cells = STRATS.map((s) => cellHtml(rowsBy.get(`${caseId}|${s}`))).join("");
    return `<tr data-case="${caseId}">
      <td class="case-id">${caseId}</td>
      <td class="case-meta"><div class="cat">${cat}</div><div class="beh">${beh}</div></td>
      ${cells}
    </tr>`;
  })
  .join("");

const headerCells = STRATS.map((s) => `<th>${escapeHtml(s)}</th>`).join("");

// ─── Detail rows (lazy via JS click) ─────────────────────────────────────────
const dataJson = JSON.stringify(data.rows).replace(/</g, "\\u003c");

// ─── Final HTML ──────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RAG Eval Quality — ${escapeHtml(tag)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8fafc; color: #1e293b; padding: 28px 32px 60px;
    font-size: 13px;
  }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #64748b; margin-bottom: 22px; }
  .subtitle code { background: #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }

  .tally { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px 4px 6px; border-radius: 999px; border: 1px solid;
    font-size: 12px; font-weight: 500;
  }
  .pill-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 22px; height: 18px; padding: 0 5px;
    background: rgba(255,255,255,0.65); border-radius: 9px;
    font-weight: 700; font-size: 11px;
  }

  .cause-group {
    margin-bottom: 10px;
  }
  .cause-group-header {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 10px; border-radius: 999px;
    font-size: 11px; border: 1px solid;
    margin-bottom: 6px;
  }
  .cause-group-pills {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding-left: 14px;
  }
  .cause-pill {
    opacity: 0.92;
    border-style: dashed !important;
    font-size: 11.5px;
  }

  table.matrix {
    border-collapse: separate; border-spacing: 4px;
    width: 100%; background: transparent;
  }
  table.matrix th {
    font-size: 11px; font-weight: 600; color: #475569; text-align: center;
    padding: 6px 4px; text-transform: uppercase; letter-spacing: 0.04em;
  }
  table.matrix th.col-meta { text-align: left; padding-left: 8px; }
  table.matrix td.case-id {
    font-weight: 700; font-size: 13px; color: #0f172a;
    padding: 8px 6px; vertical-align: middle; width: 40px;
  }
  table.matrix td.case-meta {
    padding: 8px 12px 8px 6px; width: 240px; vertical-align: middle;
  }
  table.matrix td.case-meta .cat { font-size: 12px; color: #334155; font-weight: 500; }
  table.matrix td.case-meta .beh { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  td.cell {
    padding: 6px 8px; border-radius: 6px; border: 1px solid;
    cursor: pointer; vertical-align: middle;
    min-width: 96px;
    transition: transform 0.08s ease;
  }
  td.cell:hover { transform: scale(1.03); }
  td.cell.empty { background: #f1f5f9; color: #cbd5e1; border-color: #e2e8f0; cursor: default; }
  td.cell .cell-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  td.cell .mark { font-size: 14px; font-weight: 700; }
  td.cell .suf  { font-size: 12px; font-weight: 600; opacity: 0.85; }
  td.cell .cell-diag { font-size: 10.5px; margin-top: 2px; opacity: 0.85; line-height: 1.25; }
  td.cell .note-badge {
    margin-left: 5px; font-size: 11px; opacity: 0.55;
    cursor: help;
  }
  td.cell .cell-cause {
    font-size: 9.5px; font-weight: 600; margin-top: 4px;
    opacity: 0.7; line-height: 1.2;
    border-top: 1px solid currentColor;
    padding-top: 3px;
    letter-spacing: 0.02em;
  }

  /* Detail drawer */
  #drawer {
    position: fixed; right: 0; top: 0; bottom: 0; width: 440px;
    background: white; border-left: 1px solid #e2e8f0;
    transform: translateX(100%); transition: transform 0.2s ease;
    overflow-y: auto; padding: 24px 22px; box-shadow: -6px 0 24px rgba(15,23,42,0.06);
    z-index: 50;
  }
  #drawer.open { transform: translateX(0); }
  #drawer h2 { font-size: 15px; margin-bottom: 4px; }
  #drawer .meta { font-size: 12px; color: #64748b; margin-bottom: 14px; }
  #drawer h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 14px 0 6px; }
  #drawer .quote {
    background: #f8fafc; border-left: 3px solid #cbd5e1;
    padding: 8px 12px; border-radius: 0 6px 6px 0;
    font-size: 12.5px; color: #334155; line-height: 1.5;
    white-space: pre-wrap; word-wrap: break-word;
  }
  #drawer .verdict-box {
    background: #fefce8; border-left: 3px solid #facc15;
    padding: 10px 12px; border-radius: 0 6px 6px 0;
    font-size: 12.5px; color: #334155; line-height: 1.5;
    margin-bottom: 8px;
  }
  #drawer .verdict-box b { font-weight: 700; }
  #drawer .findings-box {
    background: #fefce8; border-left: 3px solid #fde047;
    padding: 8px 12px; border-radius: 0 6px 6px 0;
    font-size: 11.5px; color: #334155; line-height: 1.5;
    white-space: pre-wrap;
  }
  #drawer .answer-card {
    background: white; border: 1px solid #e2e8f0;
    border-left: 3px solid #2563eb; border-radius: 6px;
    padding: 10px 12px; margin-bottom: 12px;
  }
  #drawer .answer-card .answer-body {
    font-size: 12.5px; color: #1e293b; line-height: 1.55;
    max-height: 360px; overflow-y: auto;
    word-wrap: break-word;
  }
  #drawer .answer-card .answer-body p { margin: 0 0 8px; }
  #drawer .answer-card .answer-body p:last-child { margin-bottom: 0; }
  #drawer .answer-card .answer-body strong { font-weight: 700; color: #0f172a; }
  #drawer .answer-card .answer-body em { font-style: italic; }
  #drawer .answer-card .answer-body code {
    background: #f1f5f9; padding: 1px 4px; border-radius: 3px;
    font-size: 11.5px; font-family: ui-monospace, Menlo, Consolas, monospace;
  }
  #drawer .answer-card .answer-body blockquote {
    border-left: 3px solid #cbd5e1; padding: 2px 10px;
    margin: 6px 0; color: #475569; background: #f8fafc;
    border-radius: 0 4px 4px 0;
  }
  #drawer .answer-card .answer-body ul, #drawer .answer-card .answer-body ol {
    margin: 4px 0 8px 18px; padding: 0;
  }
  #drawer .answer-card .answer-body li { margin: 2px 0; }
  #drawer .answer-card .answer-body a {
    color: #2563eb; text-decoration: none;
    background: #eff6ff; padding: 0 4px; border-radius: 3px; font-size: 11.5px;
  }
  #drawer .answer-card .answer-body h1,
  #drawer .answer-card .answer-body h2,
  #drawer .answer-card .answer-body h3 {
    font-size: 13px; font-weight: 700; margin: 10px 0 4px; color: #0f172a;
    text-transform: none; letter-spacing: 0;
  }
  #drawer .diag-hint {
    background: #f1f5f9; border-radius: 6px; padding: 8px 12px;
    font-size: 11.5px; color: #475569; line-height: 1.5;
    margin-bottom: 14px; border-left: 3px solid #94a3b8;
  }
  #drawer .diag-hint b { color: #1e293b; }
  #drawer .root-cause {
    border-radius: 6px; padding: 10px 12px; margin-bottom: 14px;
    border-left: 3px solid currentColor;
  }
  #drawer .root-cause .rc-label {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; margin-bottom: 4px;
  }
  #drawer .root-cause .rc-name {
    font-size: 14px; font-weight: 700; margin-bottom: 6px;
  }
  #drawer .root-cause .rc-short {
    font-size: 12px; line-height: 1.5; color: #334155;
  }
  #drawer .other-row {
    display: grid; grid-template-columns: 130px 1fr; gap: 10px;
    padding: 6px 0; border-top: 1px solid #f1f5f9;
    font-size: 11.5px; line-height: 1.5;
  }
  #drawer .other-row:first-of-type { border-top: none; }
  #drawer .other-name {
    color: #475569; font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 11px; font-weight: 600;
  }
  #drawer .other-note { color: #334155; }
  #drawer .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-bottom: 16px;
    background: #f8fafc; border-radius: 8px; padding: 10px 12px; font-size: 12px; }
  #drawer .stats .k { color: #64748b; }
  #drawer .stats .v { font-weight: 600; color: #0f172a; text-align: right; }
  #drawer .facts h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 8px; }
  #drawer .fact-row {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 6px 0; border-top: 1px solid #f1f5f9; font-size: 12px;
  }
  #drawer .fact-row:first-child { border-top: none; }
  #drawer .fact-state {
    flex-shrink: 0; width: 46px; padding: 1px 0; border-radius: 4px; text-align: center;
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
  }
  #drawer .fact-state.full { background: #dcfce7; color: #166534; }
  #drawer .fact-state.partial { background: #fed7aa; color: #9a3412; }
  #drawer .fact-state.miss { background: #fee2e2; color: #991b1b; }
  #drawer .fact-label { color: #334155; line-height: 1.4; }
  #drawer .close {
    position: absolute; top: 14px; right: 16px;
    width: 28px; height: 28px; border-radius: 6px;
    background: transparent; border: 1px solid #e2e8f0; color: #475569;
    cursor: pointer; font-size: 16px; line-height: 1;
  }
  #drawer .close:hover { background: #f1f5f9; }
  #scrim {
    position: fixed; inset: 0; background: rgba(15,23,42,0.18);
    opacity: 0; pointer-events: none; transition: opacity 0.2s ease; z-index: 40;
  }
  #scrim.open { opacity: 1; pointer-events: auto; }
</style>
</head>
<body>
  <h1>RAG Eval Quality Matrix</h1>
  <div class="subtitle">
    Source: <code>rag-quality-${escapeHtml(tag)}.json</code> ·
    Generated ${escapeHtml(data.generatedAt)} ·
    ${data.totalRows} rows · ${data.caseCount} cases × ${STRATS.length} strategies
  </div>

  <div class="tally">${tallyHtml}</div>
  ${parentOrder.length ? `
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin:18px 0 8px;">Root causes (non-success cells) — grouped by diagnosis</div>
    ${causeHtml}
  ` : ''}

  <div style="font-size:11.5px;color:#64748b;margin:18px 0 8px;line-height:1.5;">
    <b style="color:#475569;">Cell reading:</b>
    <span style="display:inline-block;margin-left:6px;padding:1px 6px;border-radius:4px;background:#f1f5f9;color:#334155;font-weight:600;">✓/~/✗</span> answer mark (from curator) ·
    <span style="display:inline-block;padding:1px 6px;border-radius:4px;background:#f1f5f9;color:#334155;font-weight:600;">100% <span style="font-size:9px;font-weight:500;opacity:0.6;">chunk</span></span> retrieval sufficiency · grain shown (<span style="font-size:9px;opacity:0.6;">task</span> for single, <span style="font-size:9px;opacity:0.6;">chunk</span> for chunked/hybrid) ·
    <span style="font-style:italic;">diagnosis</span> · <span style="font-style:italic;opacity:0.8;">root cause</span> ·
    <span style="opacity:0.7;">ⓘ run-specific note (hover for title, click for full)</span>
  </div>

  <table class="matrix">
    <thead>
      <tr>
        <th></th>
        <th class="col-meta">Case</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>
      ${matrixRows}
    </tbody>
  </table>

  <div id="scrim"></div>
  <aside id="drawer">
    <button class="close" id="close-drawer" title="Close">×</button>
    <div id="drawer-content"></div>
  </aside>

<script>
  const rows = ${dataJson};
  const CAUSES = ${JSON.stringify(data.rootCauseTaxonomy || {}).replace(/</g, "\\u003c")};
  const DIAG_PALETTE = ${JSON.stringify(DIAG).replace(/</g, "\\u003c")};
  const byKey = new Map();
  for (const r of rows) byKey.set(r.caseId + '|' + r.strategy, r);

  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const content = document.getElementById('drawer-content');

  function fmtPct(v) { return v == null ? '—' : (v * 100).toFixed(0) + '%'; }
  function fmtBool(v) { return v === true ? '✓' : v === false ? '✗' : '—'; }
  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // One-line hint that explains the diagnosis when it's not self-evident
  // from the cell color (e.g. generation_partial with sufficiency=100% is
  // confusing without context).
  const DIAG_HINT = {
    success: 'Retrieval and generation both correct.',
    generation_partial: 'Retrieval was complete — every gold fact made it into the model\\'s context. The model\\'s answer still missed or distorted at least one fact (or the curator marked it partial). Read the verdict + answer to see what.',
    generation_miss: 'Retrieval was complete but the model\\'s answer is wrong. This is purely a generation failure.',
    boundary_split: 'Right task retrieved, but the answer-bearing sentence is split across chunks — only partial chunks made top-k, no fully-containing chunk did.',
    retrieval_miss_chunk: 'Right task retrieved, but no chunk in top-k contains the gold fact at all.',
    retrieval_miss_task: 'The expected task was never retrieved.',
    mixed: 'Some gold facts were retrieved, others were not — and the answer reflects the partial retrieval.',
    metadata_hallucination: 'Curator marked the answer correct, but the gold-fact chunks were never retrieved. The model likely answered from project-list metadata in the system prompt (or got lucky). Worth manual review.',
    partial_answer: 'Retrieval was complete and the model nearly nailed it — partial credit per curator.',
    metadata_only: 'The case is answered from project-list metadata (status / title / etc.), not from chunked content. Retrieval grain doesn\\'t apply.',
    open_ended: 'Vague query with no atomic gold facts (e.g. F3 "Tell me about the project"). Quality varies by completeness; mark is a percentage.',
    unanswerable: 'Source has no answer for this query. The model should refuse.',
    sufficient: 'Retrieval covered every gold fact. (No answer-correctness data was available to refine further.)',
    partial_coverage: 'Retrieval covered only some gold facts. (No answer-correctness data was available to refine further.)',
  };

  // Minimal markdown renderer — bold, italic, code, blockquote, lists, links.
  function renderMarkdown(src) {
    if (!src) return '<p style="color:#94a3b8">(no answer recorded)</p>';
    const stash = [];
    const stashPush = (h) => { const i = stash.length; stash.push(h); return '\\u0000' + i + '\\u0000'; };
    let s = String(src);
    s = s.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, (_, b) => stashPush('<pre>' + escape(b.replace(/^\\n/, '')) + '</pre>'));
    s = s.replace(/\`([^\`\\n]+)\`/g, (_, b) => stashPush('<code>' + escape(b) + '</code>'));
    s = escape(s);
    s = s.replace(/\\[([^\\[\\]]+)\\]\\(([^)\\s]+)\\)/g, (_, t, u) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>');
    s = s.replace(/\\[([^\\[\\]\\n]{2,80})\\](?!\\()/g, '<a>[$1]</a>');
    s = s.replace(/\\*\\*([^*\\n]+)\\*\\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_\\n]+)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\\*([^*\\n][^*\\n]*?)\\*(?!\\*)/g, '$1<em>$2</em>');
    const lines = s.split(/\\n/);
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const h = line.match(/^(#{1,6})\\s+(.*)$/);
      if (h) { out.push('<h' + Math.min(h[1].length, 3) + '>' + h[2] + '</h' + Math.min(h[1].length, 3) + '>'); i++; continue; }
      if (/^&gt;\\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^&gt;\\s?/.test(lines[i])) { buf.push(lines[i].replace(/^&gt;\\s?/, '')); i++; }
        out.push('<blockquote>' + buf.join('<br>') + '</blockquote>');
        continue;
      }
      if (/^[-*]\\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^[-*]\\s+/.test(lines[i])) { buf.push('<li>' + lines[i].replace(/^[-*]\\s+/, '') + '</li>'); i++; }
        out.push('<ul>' + buf.join('') + '</ul>');
        continue;
      }
      if (/^\\d+\\.\\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\\d+\\.\\s+/.test(lines[i])) { buf.push('<li>' + lines[i].replace(/^\\d+\\.\\s+/, '') + '</li>'); i++; }
        out.push('<ol>' + buf.join('') + '</ol>');
        continue;
      }
      if (/^\\s*$/.test(line)) { out.push(''); i++; continue; }
      const buf = [line];
      i++;
      while (i < lines.length && !/^\\s*$/.test(lines[i]) && !/^&gt;\\s?/.test(lines[i]) && !/^[-*]\\s+/.test(lines[i]) && !/^\\d+\\.\\s+/.test(lines[i]) && !/^#{1,6}\\s+/.test(lines[i])) { buf.push(lines[i]); i++; }
      out.push('<p>' + buf.join(' ') + '</p>');
    }
    let html = out.filter(Boolean).join('');
    html = html.replace(/\\u0000(\\d+)\\u0000/g, (_, n) => stash[Number(n)]);
    return html;
  }

  function render(r) {
    const facts = (r.factCoverage || []).map(f => {
      const state = f.fullHit ? 'full' : f.partialHit ? 'partial' : 'miss';
      const label = f.fullHit ? 'FULL' : f.partialHit ? 'PART' : 'MISS';
      return '<div class="fact-row"><div class="fact-state ' + state + '">' + label + '</div>' +
             '<div class="fact-label">' + escape(f.label) + '</div></div>';
    }).join('');
    const taskHits = (r.taskHits || []).map(t =>
      '<div>' + (t.hit ? '✓' : '✗') + ' rank=' + t.rank + ' · ' + escape(t.task) + '</div>'
    ).join('');

    const hintText = DIAG_HINT[r.diagnosis] || '';
    const cause = r.rootCause && CAUSES[r.rootCause];
    content.innerHTML = \`
      <h2>\${escape(r.caseId)} · \${escape(r.strategy)}</h2>
      <div class="meta">\${escape(r.category)} · \${escape(r.expectedBehavior)} · answer mark <b>\${escape(r.answerMark)}</b> · diagnosis <b>\${escape(r.diagnosis)}</b></div>

      \${hintText ? \`<div class="diag-hint"><b>Why \${escape(r.diagnosis)}?</b> \${hintText}</div>\` : ''}

      \${r.caseNote ? \`
        <div style="background:#eff6ff;border-left:3px solid #60a5fa;padding:10px 12px;border-radius:0 6px 6px 0;margin-bottom:14px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#1e40af;margin-bottom:4px;">Run-specific note · \${escape(r.caseNote.title)}</div>
          <div style="font-size:12px;color:#1e293b;line-height:1.55;">\${escape(r.caseNote.body)}</div>
        </div>
      \` : ''}

      \${cause ? (() => {
        const palette = DIAG_PALETTE[cause.parentDiagnosis] || DIAG_PALETTE.success;
        return \`
        <div class="root-cause" style="background:\${palette.bg};color:\${palette.fg};">
          <div class="rc-label">Root cause · \${escape(palette.label)}</div>
          <div class="rc-name">\${escape(cause.label)}</div>
          <div class="rc-short">\${escape(cause.short)}</div>
        </div>
        \`;
      })() : ''}

      \${r.query ? \`
        <h3>Query</h3>
        <div class="quote">\${escape(r.query)}</div>
      \` : ''}

      \${r.groundTruth ? \`
        <h3>Ground truth</h3>
        <div class="quote">\${escape(r.groundTruth)}</div>
      \` : ''}

      \${r.reportVerdict ? \`
        <h3>Curated verdict (from .md report)</h3>
        <div class="verdict-box"><b>\${escape(r.reportVerdict.mark)}</b> · \${escape(r.reportVerdict.text)}</div>
      \` : ''}

      \${r.strategyComparison ? (() => {
        const sc = r.strategyComparison;
        const others = Object.entries(sc.allStrategies)
          .filter(([s]) => s !== r.strategy)
          .map(([s, note]) => \`<div class="other-row"><div class="other-name">\${escape(s)}</div><div class="other-note">\${escape(note)}</div></div>\`)
          .join('');
        return \`
          <h3>Open-ended case — strategy comparison</h3>
          <div class="diag-hint" style="background:#f8fafc;border-left-color:#94a3b8;">\${escape(sc.overview)}</div>
          \${sc.forThisStrategy ? \`
            <div style="background:#fefce8;border-left:3px solid #facc15;padding:10px 12px;border-radius:0 6px 6px 0;font-size:12px;line-height:1.5;color:#334155;margin-bottom:10px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#854d0e;margin-bottom:4px;">This strategy (\${escape(r.strategy)})</div>
              \${escape(sc.forThisStrategy)}
            </div>
          \` : ''}
          \${others ? \`
            <details style="margin-bottom:14px;">
              <summary style="cursor:pointer;font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Other strategies (click to expand)</summary>
              \${others}
            </details>
          \` : ''}
        \`;
      })() : ''}

      <h3>Model answer</h3>
      <div class="answer-card">
        <div class="answer-body">\${renderMarkdown(r.answer)}</div>
      </div>

      \${r.reportFindings ? \`
        <h3>Case-level findings (shared across strategies)</h3>
        <div class="findings-box">\${escape(r.reportFindings)}</div>
      \` : ''}

      <h3>Retrieval signals <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:10.5px;">(based on retrieved chunks)</span></h3>
      <div class="stats">
        <div class="k">k (top-k size)</div>        <div class="v">\${r.k}</div>
        <div class="k">hit@k (task)</div>          <div class="v">\${fmtBool(r.taskHitAtK)}</div>
        <div class="k">hit@k (chunk)</div>         <div class="v">\${fmtBool(r.chunkHitAtK)}</div>
        <div class="k">task rank</div>             <div class="v">\${r.taskRank}</div>
        <div class="k">sufficiency (full)</div>    <div class="v">\${fmtPct(r.retrievalSufficiency)}</div>
        <div class="k">sufficiency (w/ partial)</div><div class="v">\${fmtPct(r.retrievalSufficiencyWithPartial)}</div>
        <div class="k">\${(r.precisionGrain ?? 'chunk')} precision</div><div class="v">\${fmtPct(r.precision ?? r.chunkPrecision)}</div>
        <div class="k">\${(r.noiseGrain ?? 'chunk')} noise</div>        <div class="v">\${fmtPct(r.retrievalNoise)}</div>
        <div class="k">metadata facts</div>        <div class="v">\${r.metadataFactsCount}</div>
      </div>

      <h3>Fact coverage <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:10.5px;">(based on retrieved chunks — does NOT measure the answer)</span></h3>
      <div class="facts">
        \${facts || '<div class="meta">No content facts for this case.</div>'}
      </div>

      <h3>Task hits <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#94a3b8;font-size:10.5px;">(based on retrieved chunks)</span></h3>
      <div style="font-size:12px;color:#334155;">\${taskHits || '<i>none</i>'}</div>
    \`;
    drawer.classList.add('open');
    scrim.classList.add('open');
  }

  document.querySelectorAll('td.cell[data-key]').forEach(td => {
    td.addEventListener('click', () => {
      const r = byKey.get(td.dataset.key);
      if (r) render(r);
    });
  });

  function close() {
    drawer.classList.remove('open');
    scrim.classList.remove('open');
  }
  document.getElementById('close-drawer').addEventListener('click', close);
  scrim.addEventListener('click', close);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
</script>
</body>
</html>
`;

fs.writeFileSync(outPath, html);
console.log(`✅ Wrote ${path.relative(process.cwd(), outPath)}`);

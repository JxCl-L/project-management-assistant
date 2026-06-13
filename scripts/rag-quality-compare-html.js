/**
 * Renders a side-by-side HTML comparison of two rag-quality-*.json runs.
 * Defaults to baselineclass vs routedclass. Shows every (case, strategy)
 * cell where at least one run had a non-success diagnosis.
 *
 *   node scripts/rag-quality-compare-html.js [tagA] [tagB]
 *   tagA defaults to "baselineclass", tagB defaults to "routedclass"
 */

const fs = require("fs");
const path = require("path");

const tagA = process.argv[2] || "baselineclass";
const tagB = process.argv[3] || "routedclass";
const dir = __dirname;

const a = JSON.parse(fs.readFileSync(path.join(dir, `rag-quality-${tagA}.json`), "utf8"));
const b = JSON.parse(fs.readFileSync(path.join(dir, `rag-quality-${tagB}.json`), "utf8"));
const cases = JSON.parse(fs.readFileSync(path.join(dir, "rag-eval-cases.json"), "utf8"));
const resultsA = JSON.parse(fs.readFileSync(path.join(dir, `rag-eval-results-${tagA}.json`), "utf8"));
const resultsB = JSON.parse(fs.readFileSync(path.join(dir, `rag-eval-results-${tagB}.json`), "utf8"));
const outPath = path.join(dir, `rag-quality-compare-${tagA}-vs-${tagB}.html`);

const queryById = new Map(cases.map((c) => [c.id, { query: c.query, groundTruth: c.groundTruth }]));
function cellKey(c) { return c.caseId + "|" + c.variantKey; }
const answerA = new Map(resultsA.cells.map((c) => [cellKey(c), c.answer || ""]));
const answerB = new Map(resultsB.cells.map((c) => [cellKey(c), c.answer || ""]));

const DIAG = {
  success:                { bg: "#dcfce7", fg: "#166534", border: "#86efac", label: "Success" },
  generation_partial:     { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d", label: "Generation partial" },
  generation_miss:        { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5", label: "Generation miss" },
  boundary_split:         { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c", label: "Boundary / partial" },
  retrieval_miss_chunk:   { bg: "#fecaca", fg: "#7f1d1d", border: "#ef4444", label: "Retrieval miss (chunk)" },
  retrieval_miss_task:    { bg: "#fca5a5", fg: "#7f1d1d", border: "#dc2626", label: "Retrieval miss (task)" },
  mixed:                  { bg: "#fde68a", fg: "#78350f", border: "#f59e0b", label: "Mixed" },
  metadata_hallucination: { bg: "#e9d5ff", fg: "#581c87", border: "#c084fc", label: "Metadata hallucination" },
  partial_answer:         { bg: "#fef9c3", fg: "#854d0e", border: "#fde047", label: "Partial answer" },
  metadata_only:          { bg: "#dbeafe", fg: "#1e40af", border: "#93c5fd", label: "Metadata only" },
  open_ended:             { bg: "#e0e7ff", fg: "#3730a3", border: "#a5b4fc", label: "Open ended" },
  unanswerable:           { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1", label: "Unanswerable" },
  sufficient:             { bg: "#dcfce7", fg: "#166534", border: "#86efac", label: "Sufficient" },
  partial_coverage:       { bg: "#fed7aa", fg: "#9a3412", border: "#fb923c", label: "Partial coverage" },
};
const defaultDiag = { bg: "#f1f5f9", fg: "#475569", border: "#cbd5e1", label: "—" };

function key(r) { return r.caseId + "|" + r.strategy; }
const aBy = new Map(a.rows.map((r) => [key(r), r]));
const bBy = new Map(b.rows.map((r) => [key(r), r]));

const allKeys = new Set([...aBy.keys(), ...bBy.keys()]);

// Build comparison rows: include any (case, strategy) where either side is non-success
const comparable = [];
for (const k of allKeys) {
  const ra = aBy.get(k);
  const rb = bBy.get(k);
  const da = ra?.diagnosis;
  const db = rb?.diagnosis;
  const aSuccess = da === "success" || da === "sufficient";
  const bSuccess = db === "success" || db === "sufficient";
  if (aSuccess && bSuccess) continue; // both perfect, not interesting
  // Skip metadata_only / open_ended unless they differ — these are by design
  if ((da === "metadata_only" || da === "open_ended") && da === db) continue;

  let status;
  if (!aSuccess && bSuccess) status = "improved";
  else if (aSuccess && !bSuccess) status = "regressed";
  else if (da === db) status = "same";
  else status = "changed";

  comparable.push({ k, ra, rb, status });
}

// Sort: improved → regressed → changed → same; then by caseId, strategy
const order = { improved: 0, regressed: 1, changed: 2, same: 3 };
comparable.sort((x, y) => {
  if (order[x.status] !== order[y.status]) return order[x.status] - order[y.status];
  const xa = x.ra ?? x.rb, ya = y.ra ?? y.rb;
  if (xa.caseId !== ya.caseId) return xa.caseId < ya.caseId ? -1 : 1;
  return xa.strategy < ya.strategy ? -1 : 1;
});

function pct(v) { return v == null ? "—" : (v * 100).toFixed(0) + "%"; }
function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const STATUS = {
  improved:  { bg: "#dcfce7", fg: "#166534", label: "Improved",  icon: "▲" },
  regressed: { bg: "#fee2e2", fg: "#991b1b", label: "Regressed", icon: "▼" },
  changed:   { bg: "#fef3c7", fg: "#854d0e", label: "Changed",   icon: "↔" },
  same:      { bg: "#f1f5f9", fg: "#475569", label: "Unchanged", icon: "=" },
};

// ─── Summary tally ───────────────────────────────────────────────────────────
const tally = { improved: 0, regressed: 0, changed: 0, same: 0 };
for (const c of comparable) tally[c.status]++;

const tallyHtml = Object.entries(tally)
  .filter(([_, v]) => v > 0)
  .map(([k, v]) => {
    const s = STATUS[k];
    return `<span class="pill" style="background:${s.bg};color:${s.fg};">
        <span class="pill-icon">${s.icon}</span>
        <span class="pill-count">${v}</span>
        ${s.label}
      </span>`;
  })
  .join("");

// ─── Row rendering ───────────────────────────────────────────────────────────
function diagChip(diag) {
  if (!diag) return `<span class="chip chip-empty">—</span>`;
  const d = DIAG[diag] || defaultDiag;
  return `<span class="chip" style="background:${d.bg};color:${d.fg};border-color:${d.border}">${d.label}</span>`;
}

function row({ k, ra, rb, status }) {
  const sample = ra ?? rb;
  const ans = ra?.answerMark ?? "?";
  const ans2 = rb?.answerMark ?? "?";
  const s = STATUS[status];
  return `<tr class="row row-${status}" data-key="${escape(k)}">
    <td class="case">${escape(sample.caseId)}</td>
    <td class="strategy">${escape(sample.strategy)}</td>
    <td class="status" style="background:${s.bg};color:${s.fg};"><span class="status-icon">${s.icon}</span> ${s.label}</td>
    <td class="diag">${diagChip(ra?.diagnosis)}</td>
    <td class="mark">${escape(ans)}</td>
    <td class="suf">${pct(ra?.retrievalSufficiency)}</td>
    <td class="arrow">→</td>
    <td class="diag">${diagChip(rb?.diagnosis)}</td>
    <td class="mark">${escape(ans2)}</td>
    <td class="suf">${pct(rb?.retrievalSufficiency)}</td>
    <td class="cat">${escape(sample.category || "")}</td>
  </tr>`;
}

const rowsHtml = comparable.map(row).join("");

// ─── Drilldown data (per-key, both rows + factCoverage) ──────────────────────
const drillData = {};
for (const c of comparable) {
  const caseId = (c.ra ?? c.rb).caseId;
  const strategy = (c.ra ?? c.rb).strategy;
  const cellK = caseId + "|" + strategy;
  const qt = queryById.get(caseId) || {};
  drillData[c.k] = {
    a: c.ra ? { diagnosis: c.ra.diagnosis, mark: c.ra.answerMark, sufficiency: c.ra.retrievalSufficiency, sufficiencyPartial: c.ra.retrievalSufficiencyWithPartial, precision: c.ra.chunkPrecision, noise: c.ra.retrievalNoise, taskHits: c.ra.taskHits, factCoverage: c.ra.factCoverage, answer: answerA.get(cellK) ?? "" } : null,
    b: c.rb ? { diagnosis: c.rb.diagnosis, mark: c.rb.answerMark, sufficiency: c.rb.retrievalSufficiency, sufficiencyPartial: c.rb.retrievalSufficiencyWithPartial, precision: c.rb.chunkPrecision, noise: c.rb.retrievalNoise, taskHits: c.rb.taskHits, factCoverage: c.rb.factCoverage, answer: answerB.get(cellK) ?? "" } : null,
    meta: { caseId, strategy, category: (c.ra ?? c.rb).category, status: c.status, query: qt.query || "", groundTruth: qt.groundTruth || "" },
  };
}
const drillJson = JSON.stringify(drillData).replace(/</g, "\\u003c");

// ─── HTML ────────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>RAG Quality Compare — ${escape(tagA)} vs ${escape(tagB)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f8fafc; color: #1e293b; padding: 28px 32px 60px; font-size: 13px;
  }
  h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #64748b; margin-bottom: 22px; }
  .subtitle code { background: #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }

  .tally { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px 4px 8px; border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.08);
    font-size: 12px; font-weight: 500;
  }
  .pill-icon { font-weight: 700; opacity: 0.8; }
  .pill-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 22px; height: 18px; padding: 0 5px;
    background: rgba(255,255,255,0.65); border-radius: 9px;
    font-weight: 700; font-size: 11px;
  }

  .filters {
    display: flex; gap: 8px; margin-bottom: 16px;
  }
  .filter-btn {
    padding: 4px 10px; border: 1px solid #cbd5e1; background: white;
    border-radius: 6px; cursor: pointer; font-size: 12px; color: #475569;
  }
  .filter-btn.active { background: #1e293b; color: white; border-color: #1e293b; }
  .filter-btn:hover { background: #f1f5f9; }
  .filter-btn.active:hover { background: #334155; }

  table {
    border-collapse: collapse; width: 100%; background: white;
    border-radius: 10px; overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  thead th {
    font-size: 11px; font-weight: 600; text-align: left;
    padding: 10px 8px; background: #f8fafc; color: #475569;
    text-transform: uppercase; letter-spacing: 0.04em;
    border-bottom: 1px solid #e2e8f0;
  }
  thead th.group-a { background: #eff6ff; color: #1e40af; }
  thead th.group-b { background: #eef2ff; color: #4338ca; }
  thead th.center { text-align: center; }

  tbody td {
    padding: 8px; border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  tbody tr:hover { background: #fafbfc; cursor: pointer; }
  tbody tr.row-improved:hover { background: #f0fdf4; }
  tbody tr.row-regressed:hover { background: #fef2f2; }
  tbody tr.row-changed:hover { background: #fefce8; }

  td.case { font-weight: 700; color: #0f172a; width: 50px; }
  td.strategy { font-size: 12px; color: #334155; width: 130px; }
  td.status { font-size: 11px; font-weight: 600; text-align: center; border-radius: 4px; padding: 6px 8px; white-space: nowrap; width: 110px; }
  td.status .status-icon { font-weight: 700; margin-right: 4px; }
  td.diag { text-align: left; padding: 6px 4px; }
  td.mark { font-size: 13px; font-weight: 700; text-align: center; width: 36px; }
  td.suf { font-size: 11px; font-weight: 600; color: #475569; text-align: center; width: 50px; }
  td.arrow { color: #94a3b8; text-align: center; width: 20px; font-size: 14px; }
  td.cat { font-size: 11px; color: #94a3b8; }

  .chip {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    border: 1px solid; font-size: 11px; font-weight: 500;
    white-space: nowrap;
  }
  .chip-empty { background: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

  /* Drilldown drawer */
  #drawer {
    position: fixed; right: 0; top: 0; bottom: 0; width: 760px;
    background: white; border-left: 1px solid #e2e8f0;
    transform: translateX(100%); transition: transform 0.2s ease;
    overflow-y: auto; padding: 24px 22px; box-shadow: -6px 0 24px rgba(15,23,42,0.06);
    z-index: 50;
  }
  #drawer.open { transform: translateX(0); }
  #drawer h2 { font-size: 15px; margin-bottom: 4px; }
  #drawer .meta { font-size: 12px; color: #64748b; margin-bottom: 14px; }
  #drawer .compare-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-bottom: 16px;
  }
  #drawer .side {
    background: #f8fafc; border-radius: 8px; padding: 10px 12px;
  }
  #drawer .side-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 6px;
  }
  #drawer .side-a .side-label { color: #1e40af; }
  #drawer .side-b .side-label { color: #4338ca; }
  #drawer .side dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 8px; font-size: 12px; }
  #drawer .side dt { color: #64748b; }
  #drawer .side dd { font-weight: 600; color: #0f172a; text-align: right; }
  #drawer .facts h3 {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
    color: #475569; margin: 14px 0 8px;
  }
  #drawer .fact-grid {
    display: grid; grid-template-columns: 1fr 50px 50px; gap: 4px;
    font-size: 11px;
  }
  #drawer .fact-grid .head { font-weight: 700; color: #94a3b8; padding: 4px; }
  #drawer .fact-grid .head.center { text-align: center; }
  #drawer .fact-label { padding: 6px 4px; border-top: 1px solid #f1f5f9; color: #334155; }
  #drawer .fact-state {
    display: inline-block; width: 100%; padding: 2px 0; border-radius: 3px;
    text-align: center; font-weight: 700; font-size: 10px; letter-spacing: 0.03em;
    border-top: 1px solid #f1f5f9; margin-top: 5px;
  }
  #drawer .fact-state.full { background: #dcfce7; color: #166534; }
  #drawer .fact-state.partial { background: #fed7aa; color: #9a3412; }
  #drawer .fact-state.miss { background: #fee2e2; color: #991b1b; }
  #drawer .qa-block { margin-bottom: 14px; }
  #drawer .qa-block h3 {
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
    color: #475569; margin: 14px 0 6px;
  }
  #drawer .quote {
    background: #f8fafc; border-left: 3px solid #cbd5e1;
    padding: 8px 12px; border-radius: 0 6px 6px 0;
    font-size: 12.5px; color: #334155; line-height: 1.5;
    white-space: pre-wrap; word-wrap: break-word;
  }
  #drawer .answer-side {
    background: white; border: 1px solid #e2e8f0;
    border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;
  }
  #drawer .answer-side.side-a { border-left: 3px solid #1e40af; }
  #drawer .answer-side.side-b { border-left: 3px solid #4338ca; }
  #drawer .answer-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  #drawer .answer-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  #drawer .side-a .answer-tag { color: #1e40af; }
  #drawer .side-b .answer-tag { color: #4338ca; }
  #drawer .answer-mark-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600; padding: 2px 8px;
    border-radius: 999px; background: #f1f5f9; color: #334155;
  }
  #drawer .answer-body {
    font-size: 12.5px; color: #1e293b; line-height: 1.55;
    max-height: 380px; overflow-y: auto;
    word-wrap: break-word;
  }
  #drawer .answer-body p { margin: 0 0 8px; }
  #drawer .answer-body p:last-child { margin-bottom: 0; }
  #drawer .answer-body strong { font-weight: 700; color: #0f172a; }
  #drawer .answer-body em { font-style: italic; }
  #drawer .answer-body code {
    background: #f1f5f9; padding: 1px 4px; border-radius: 3px;
    font-size: 11.5px; font-family: ui-monospace, Menlo, Consolas, monospace;
  }
  #drawer .answer-body pre {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
    padding: 8px 10px; font-size: 11.5px; overflow-x: auto;
    margin: 6px 0; font-family: ui-monospace, Menlo, Consolas, monospace;
  }
  #drawer .answer-body blockquote {
    border-left: 3px solid #cbd5e1; padding: 2px 10px;
    margin: 6px 0; color: #475569; background: #f8fafc;
    border-radius: 0 4px 4px 0;
  }
  #drawer .answer-body ul, #drawer .answer-body ol {
    margin: 4px 0 8px 18px; padding: 0;
  }
  #drawer .answer-body li { margin: 2px 0; }
  #drawer .answer-body h1, #drawer .answer-body h2, #drawer .answer-body h3 {
    font-size: 13px; font-weight: 700; margin: 10px 0 4px; color: #0f172a;
  }
  #drawer .answer-body a {
    color: #2563eb; text-decoration: none;
    background: #eff6ff; padding: 0 4px; border-radius: 3px; font-size: 11.5px;
  }
  #drawer .close {
    position: absolute; top: 14px; right: 16px;
    width: 28px; height: 28px; border-radius: 6px;
    background: transparent; border: 1px solid #e2e8f0; color: #475569;
    cursor: pointer; font-size: 16px;
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
  <h1>RAG Quality Comparison: <span style="color:#1e40af">${escape(tagA)}</span> vs <span style="color:#4338ca">${escape(tagB)}</span></h1>
  <div class="subtitle">
    ${comparable.length} cells shown (out of ${a.rows.length}) — any (case, strategy) where at least one side is non-success.
    Generated ${escape(b.generatedAt)}.
  </div>

  <div class="tally">${tallyHtml}</div>

  <div class="filters">
    <button class="filter-btn active" data-filter="all">All (${comparable.length})</button>
    <button class="filter-btn" data-filter="improved">Improved (${tally.improved})</button>
    <button class="filter-btn" data-filter="regressed">Regressed (${tally.regressed})</button>
    <button class="filter-btn" data-filter="changed">Changed (${tally.changed})</button>
    <button class="filter-btn" data-filter="same">Unchanged (${tally.same})</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>Case</th>
        <th>Strategy</th>
        <th class="center">Status</th>
        <th class="group-a">${escape(tagA)} diagnosis</th>
        <th class="group-a center">ans</th>
        <th class="group-a center">SUF</th>
        <th></th>
        <th class="group-b">${escape(tagB)} diagnosis</th>
        <th class="group-b center">ans</th>
        <th class="group-b center">SUF</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody id="tbody">
      ${rowsHtml}
    </tbody>
  </table>

  <div id="scrim"></div>
  <aside id="drawer">
    <button class="close" id="close-drawer" title="Close">×</button>
    <div id="drawer-content"></div>
  </aside>

<script>
  const drill = ${drillJson};
  const TAG_A = ${JSON.stringify(tagA)};
  const TAG_B = ${JSON.stringify(tagB)};

  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const content = document.getElementById('drawer-content');

  function pct(v) { return v == null ? '—' : (v * 100).toFixed(0) + '%'; }
  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Minimal markdown renderer for answer bodies.
  // Handles: code spans, code fences, **bold**, *italic* (non-greedy), > quotes,
  // -/*/numbered lists, [text](url) links, headings, blank-line paragraphs.
  function renderMarkdown(src) {
    if (!src) return '<p style="color:#94a3b8">(no answer recorded)</p>';

    // Stash code blocks/spans first so their contents aren't transformed.
    const stash = [];
    const stashPush = (html) => { const i = stash.length; stash.push(html); return '\\u0000' + i + '\\u0000'; };
    let s = String(src);

    // Fenced code blocks (triple backticks)
    s = s.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, (_, body) =>
      stashPush('<pre>' + escape(body.replace(/^\\n/, '')) + '</pre>')
    );
    // Inline code (single backticks)
    s = s.replace(/\`([^\`\\n]+)\`/g, (_, body) => stashPush('<code>' + escape(body) + '</code>'));

    // Escape everything else
    s = escape(s);

    // Markdown links: [text](url)  — done before bold/italic, but after escape
    // We treat citations like [Task Name] as link-text rendered as inline tag, no href
    s = s.replace(/\\[([^\\[\\]]+)\\]\\(([^)\\s]+)\\)/g, (_, text, url) =>
      '<a href="' + url + '" target="_blank" rel="noopener">' + text + '</a>'
    );
    // [Bare citation] — no URL — just inline tag-style
    s = s.replace(/\\[([^\\[\\]\\n]{2,80})\\](?!\\()/g, '<a>[$1]</a>');

    // Bold **...** / __...__
    s = s.replace(/\\*\\*([^*\\n]+)\\*\\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_\\n]+)__/g, '<strong>$1</strong>');
    // Italic *...*  (avoid lists by requiring non-space after *)
    s = s.replace(/(^|[^*])\\*([^*\\n][^*\\n]*?)\\*(?!\\*)/g, '$1<em>$2</em>');

    // Process line-by-line for block constructs.
    const lines = s.split(/\\n/);
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Heading
      const hMatch = line.match(/^(#{1,6})\\s+(.*)$/);
      if (hMatch) {
        const level = Math.min(hMatch[1].length, 3);
        out.push('<h' + level + '>' + hMatch[2] + '</h' + level + '>');
        i++; continue;
      }

      // Blockquote group
      if (/^&gt;\\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^&gt;\\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^&gt;\\s?/, ''));
          i++;
        }
        out.push('<blockquote>' + buf.join('<br>') + '</blockquote>');
        continue;
      }

      // Unordered list
      if (/^[-*]\\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^[-*]\\s+/.test(lines[i])) {
          buf.push('<li>' + lines[i].replace(/^[-*]\\s+/, '') + '</li>');
          i++;
        }
        out.push('<ul>' + buf.join('') + '</ul>');
        continue;
      }

      // Ordered list
      if (/^\\d+\\.\\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\\d+\\.\\s+/.test(lines[i])) {
          buf.push('<li>' + lines[i].replace(/^\\d+\\.\\s+/, '') + '</li>');
          i++;
        }
        out.push('<ol>' + buf.join('') + '</ol>');
        continue;
      }

      // Blank line separates paragraphs
      if (/^\\s*$/.test(line)) { out.push(''); i++; continue; }

      // Paragraph (join consecutive non-special lines)
      const buf = [line];
      i++;
      while (
        i < lines.length &&
        !/^\\s*$/.test(lines[i]) &&
        !/^&gt;\\s?/.test(lines[i]) &&
        !/^[-*]\\s+/.test(lines[i]) &&
        !/^\\d+\\.\\s+/.test(lines[i]) &&
        !/^#{1,6}\\s+/.test(lines[i])
      ) {
        buf.push(lines[i]);
        i++;
      }
      out.push('<p>' + buf.join(' ') + '</p>');
    }

    let html = out.filter(Boolean).join('');

    // Restore stashed code
    html = html.replace(/\\u0000(\\d+)\\u0000/g, (_, n) => stash[Number(n)]);

    return html;
  }

  function renderSide(r, label, sideClass) {
    if (!r) return \`<div class="side \${sideClass}"><div class="side-label">\${label}</div><div style="color:#94a3b8">no data</div></div>\`;
    return \`
      <div class="side \${sideClass}">
        <div class="side-label">\${label}</div>
        <dl>
          <dt>Diagnosis</dt><dd>\${escape(r.diagnosis)}</dd>
          <dt>Answer mark</dt><dd>\${escape(r.mark)}</dd>
          <dt>Sufficiency (full)</dt><dd>\${pct(r.sufficiency)}</dd>
          <dt>Sufficiency (+partial)</dt><dd>\${pct(r.sufficiencyPartial)}</dd>
          <dt>Chunk precision</dt><dd>\${pct(r.precision)}</dd>
          <dt>Noise</dt><dd>\${pct(r.noise)}</dd>
        </dl>
      </div>
    \`;
  }

  function factRow(f, fa, fb) {
    const stateA = !fa ? 'miss' : fa.fullHit ? 'full' : fa.partialHit ? 'partial' : 'miss';
    const stateB = !fb ? 'miss' : fb.fullHit ? 'full' : fb.partialHit ? 'partial' : 'miss';
    const labelA = !fa ? 'MISS' : fa.fullHit ? 'FULL' : fa.partialHit ? 'PART' : 'MISS';
    const labelB = !fb ? 'MISS' : fb.fullHit ? 'FULL' : fb.partialHit ? 'PART' : 'MISS';
    return \`
      <div class="fact-label">\${escape(f)}</div>
      <div class="fact-state \${stateA}">\${labelA}</div>
      <div class="fact-state \${stateB}">\${labelB}</div>
    \`;
  }

  function render(d) {
    const facts = new Map();
    for (const f of (d.a?.factCoverage ?? [])) facts.set(f.label, { a: f, b: null });
    for (const f of (d.b?.factCoverage ?? [])) {
      if (facts.has(f.label)) facts.get(f.label).b = f;
      else facts.set(f.label, { a: null, b: f });
    }
    const factsHtml = facts.size === 0
      ? '<div class="meta">No content facts for this case.</div>'
      : \`
        <div class="fact-grid">
          <div class="head">Fact</div>
          <div class="head center">\${escape(TAG_A)}</div>
          <div class="head center">\${escape(TAG_B)}</div>
          \${[...facts.entries()].map(([label, {a, b}]) => factRow(label, a, b)).join('')}
        </div>
      \`;

    content.innerHTML = \`
      <h2>\${escape(d.meta.caseId)} · \${escape(d.meta.strategy)}</h2>
      <div class="meta">\${escape(d.meta.category)} · status: <b>\${escape(d.meta.status)}</b></div>

      <div class="qa-block">
        <h3>Query</h3>
        <div class="quote">\${escape(d.meta.query)}</div>
      </div>

      <div class="qa-block">
        <h3>Ground truth</h3>
        <div class="quote">\${escape(d.meta.groundTruth)}</div>
      </div>

      <div class="qa-block">
        <h3>Answers</h3>
        <div class="answer-side side-a">
          <div class="answer-header">
            <span class="answer-tag">\${escape(TAG_A)}</span>
            <span class="answer-mark-badge">mark: <b>\${escape(d.a?.mark ?? '?')}</b></span>
          </div>
          <div class="answer-body">\${renderMarkdown(d.a?.answer)}</div>
        </div>
        <div class="answer-side side-b">
          <div class="answer-header">
            <span class="answer-tag">\${escape(TAG_B)}</span>
            <span class="answer-mark-badge">mark: <b>\${escape(d.b?.mark ?? '?')}</b></span>
          </div>
          <div class="answer-body">\${renderMarkdown(d.b?.answer)}</div>
        </div>
      </div>

      <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#475569;margin:14px 0 8px;">Retrieval signals</h3>
      <div class="compare-grid">
        \${renderSide(d.a, TAG_A, 'side-a')}
        \${renderSide(d.b, TAG_B, 'side-b')}
      </div>

      <div class="facts">
        <h3>Fact coverage</h3>
        \${factsHtml}
      </div>
    \`;
    drawer.classList.add('open');
    scrim.classList.add('open');
  }

  document.querySelectorAll('tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const d = drill[tr.dataset.key];
      if (d) render(d);
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('tbody tr').forEach(tr => {
        if (f === 'all') tr.style.display = '';
        else tr.style.display = tr.classList.contains('row-' + f) ? '' : 'none';
      });
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
console.log(
  `✅ Wrote ${path.relative(process.cwd(), outPath)} — ${comparable.length} non-success cells (${tally.improved} improved, ${tally.regressed} regressed, ${tally.changed} changed, ${tally.same} unchanged)`,
);

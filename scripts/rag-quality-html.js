/**
 * Renders rag-quality-<tag>.json as a self-contained HTML viewer.
 *
 *   node scripts/rag-quality-html.js [tag]
 *   tag defaults to "baselineclass"
 */

const fs = require("fs");
const path = require("path");

const tag = process.argv[2] || "baselineclass";
const dir = __dirname;
const inputPath = path.join(dir, `rag-quality-${tag}.json`);
const outPath = path.join(dir, `rag-quality-${tag}.html`);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

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

// ─── Matrix ──────────────────────────────────────────────────────────────────
function cellHtml(row) {
  if (!row) return `<td class="cell empty">—</td>`;
  const d = DIAG[row.diagnosis] || defaultDiag;
  const suf = row.retrievalSufficiency;
  const sufStr = suf == null ? "—" : pct(suf);
  const mark = escapeHtml(row.answerMark);
  const rowKey = `${row.caseId}|${row.strategy}`;
  return `<td class="cell" data-key="${escapeHtml(rowKey)}"
              style="background:${d.bg};color:${d.fg};border-color:${d.border};">
    <div class="cell-top"><span class="mark">${mark}</span><span class="suf">${sufStr}</span></div>
    <div class="cell-diag">${escapeHtml(d.label)}</div>
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

    content.innerHTML = \`
      <h2>\${escape(r.caseId)} · \${escape(r.strategy)}</h2>
      <div class="meta">\${escape(r.category)} · \${escape(r.expectedBehavior)} · answer mark <b>\${escape(r.answerMark)}</b></div>
      <div class="stats">
        <div class="k">Diagnosis</div>             <div class="v">\${escape(r.diagnosis)}</div>
        <div class="k">k (top-k size)</div>        <div class="v">\${r.k}</div>
        <div class="k">hit@k (task)</div>          <div class="v">\${fmtBool(r.taskHitAtK)}</div>
        <div class="k">hit@k (chunk)</div>         <div class="v">\${fmtBool(r.chunkHitAtK)}</div>
        <div class="k">task rank</div>             <div class="v">\${r.taskRank}</div>
        <div class="k">sufficiency (full)</div>    <div class="v">\${fmtPct(r.retrievalSufficiency)}</div>
        <div class="k">sufficiency (w/ partial)</div><div class="v">\${fmtPct(r.retrievalSufficiencyWithPartial)}</div>
        <div class="k">chunk precision</div>       <div class="v">\${fmtPct(r.chunkPrecision)}</div>
        <div class="k">noise</div>                 <div class="v">\${fmtPct(r.retrievalNoise)}</div>
        <div class="k">metadata facts</div>        <div class="v">\${r.metadataFactsCount}</div>
      </div>
      <div class="facts">
        <h3>Fact coverage</h3>
        \${facts || '<div class="meta">No content facts for this case.</div>'}
      </div>
      <div class="facts" style="margin-top:14px;">
        <h3>Task hits</h3>
        <div style="font-size:12px;color:#334155;">\${taskHits || '<i>none</i>'}</div>
      </div>
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

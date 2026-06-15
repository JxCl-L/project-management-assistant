/**
 * Writes per-(case, strategy) retrieval-quality signals to disk.
 *
 * Inputs:
 *   - scripts/rag-eval-cases.json              (goldFacts + chunk indices)
 *   - scripts/rag-eval-results-<tag>.json      (retrieved chunks per cell)
 *   - scripts/rag-eval-report-<tag>.md         (curated answer correctness ✓/~/✗)
 *
 * Output:
 *   - scripts/rag-quality-<tag>.json      (machine-readable signals + diagnosis)
 *
 * Usage:
 *   node scripts/rag-quality-build.js [tag]
 *   tag defaults to "baselineclass"
 */

const fs = require("fs");
const path = require("path");
const { retrievalSignals, classifyMiss } = require("./rag-quality-lib.js");
const { CAUSES, rootCauseFor, strategyComparisonFor, caseNoteFor } = require("./rag-root-causes.js");

const tag = process.argv[2] || "baselineclass";
// scripts/
//  ├── analyzers/  (this file)
//  ├── rag-eval-cases.json   ← input
//  ├── results/              ← raw eval outputs + quality JSON
//  └── reports/              ← curated MD reports
const ROOT = path.join(__dirname, "..");
const casesPath = path.join(ROOT, "rag-eval-cases.json");
const resultsPath = path.join(ROOT, "results", `rag-eval-results-${tag}.json`);
const reportPath = path.join(ROOT, "reports", `rag-eval-report-${tag}.md`);
const outPath = path.join(ROOT, "results", `rag-quality-${tag}.json`);

const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const reportMd = fs.readFileSync(reportPath, "utf8");

// ─── Parse curated correctness matrix from the .md ───────────────────────────
const STRATS = [
  "fullcontext",
  "single",
  "chunked@150/50",
  "chunked@150/25",
  "hybrid@150/50",
  "hybrid@150/25",
];

const matrixStart = reportMd.indexOf("## Answer correctness matrix");
const matrixEnd = matrixStart >= 0
  ? reportMd.indexOf("\n## ", matrixStart + 1)
  : -1;

const correctness = {};
let correctnessFound = false;
if (matrixStart >= 0 && matrixEnd > matrixStart) {
  correctnessFound = true;
  const matrixSection = reportMd.slice(matrixStart, matrixEnd);
  for (const line of matrixSection.split("\n")) {
    const m = line.match(/^\|\s*([A-Z]\d+)\s*\|(.+)\|\s*$/);
    if (!m) continue;
    const id = m[1];
    const cells = m[2].split("|").map((s) => s.trim());
    if (cells.length < STRATS.length) continue;
    correctness[id] = {};
    STRATS.forEach((s, i) => {
      correctness[id][s] = cells[i];
    });
  }
} else {
  console.warn(
    `⚠️  No "## Answer correctness matrix" section in ${path.basename(reportPath)}. ` +
      `Producing retrieval-only signals (answerMark="?" everywhere; diagnosis uses retrieval grain only).`,
  );
}

// ─── Parse per-(case, strategy) verdicts + case-level findings ───────────────
// Format in the report:
//   ### A1 — ...
//   **Findings:**
//   ...multi-line analysis...
//   **fullcontext** | **single** | **chunked@150/...** | **hybrid@150/...**
//   ...retrieved table + answer...
//   **Verdict:** ✓/~/✗ · explanation text
// Verdicts can span multiple lines in the report; we capture until the next
// horizontal rule (`---`) or strategy marker.
const STRAT_LINE_RE = new RegExp(
  `^\\*\\*(?:·|•)?\\s*(${STRATS.map((s) => s.replace(/[+]/g, "\\$&").replace(/\\\//g, "\\/")).join("|")})\\*\\*$`,
);
const verdictsByCase = {}; // caseId -> { strategy: { mark, text } }
const findingsByCase = {}; // caseId -> string

{
  const lines = reportMd.split("\n");
  let currentCase = null;
  let currentStrategy = null;
  let inFindings = false;
  let findingsBuf = [];
  let collectingVerdict = null; // { mark, lines: [] }

  function flushVerdict() {
    if (!collectingVerdict || !currentCase || !currentStrategy) return;
    const text = collectingVerdict.lines.join(" ").trim();
    verdictsByCase[currentCase] = verdictsByCase[currentCase] || {};
    verdictsByCase[currentCase][currentStrategy] = {
      mark: collectingVerdict.mark,
      text,
    };
    collectingVerdict = null;
  }
  function flushFindings() {
    if (currentCase && findingsBuf.length) {
      findingsByCase[currentCase] = findingsBuf.join("\n").trim();
    }
    findingsBuf = [];
    inFindings = false;
  }

  for (const rawLine of lines) {
    const line = rawLine;

    const caseHeader = line.match(/^### ([A-Z]\d+)\s+—/);
    if (caseHeader) {
      flushVerdict();
      flushFindings();
      currentCase = caseHeader[1];
      currentStrategy = null;
      continue;
    }
    if (!currentCase) continue;

    if (/^\*\*Findings:\*\*/.test(line)) {
      flushVerdict();
      inFindings = true;
      continue;
    }

    const stratMatch = line.match(STRAT_LINE_RE);
    if (stratMatch) {
      flushVerdict();
      flushFindings();
      currentStrategy = stratMatch[1];
      continue;
    }

    const verdictMatch = line.match(/^\*\*Verdict:\*\*\s*(.*)$/);
    if (verdictMatch && currentStrategy) {
      // Start collecting; mark is leading symbol
      const after = verdictMatch[1].trim();
      const m = after.match(/^(✓|~|✗)\s*(?:·|•|—|-)?\s*(.*)$/);
      collectingVerdict = {
        mark: m ? m[1] : "",
        lines: [m ? m[2] : after],
      };
      continue;
    }

    if (collectingVerdict) {
      if (/^---\s*$/.test(line) || /^### /.test(line)) {
        flushVerdict();
      } else if (line.trim() === "") {
        // blank line ends the verdict
        flushVerdict();
      } else {
        collectingVerdict.lines.push(line.trim());
      }
      continue;
    }

    if (inFindings) {
      // Findings ends at first strategy marker or horizontal rule
      if (/^---\s*$/.test(line)) {
        flushFindings();
        continue;
      }
      findingsBuf.push(line);
    }
  }
  flushVerdict();
  flushFindings();
}

// ─── Parse per-(case, strategy) retrieved chunks from the report ────────────
// The report is the curated source of truth — for non-deterministic cases
// the user reran multiple times and finalised the chunks shown here.
// rag-eval-results-<tag>.json is only a single-run snapshot and is no
// longer consulted for retrieval signals.
//
// Table format under each strategy section:
//   **Retrieved chunks:**
//
//   | # | Task | Chunk | Score |
//   |---|---|---|---|
//   | 1 | Task Name — possibly with em-dashes | #2 | 0.8364 |
//   ...
//
// For `single` strategy, the Chunk column is `—` (no chunk index).
const retrievedByCase = {};
{
  const lines = reportMd.split("\n");
  let currentCase = null;
  let currentStrategy = null;
  let inRetrievedTable = false;
  let tableHeaderSeen = false;
  let buf = [];

  function flushTable() {
    if (currentCase && currentStrategy && buf.length) {
      retrievedByCase[currentCase] = retrievedByCase[currentCase] || {};
      retrievedByCase[currentCase][currentStrategy] = buf.slice();
    }
    buf = [];
    inRetrievedTable = false;
    tableHeaderSeen = false;
  }

  for (const rawLine of lines) {
    const line = rawLine;

    const caseHeader = line.match(/^### ([A-Z]\d+)\s+—/);
    if (caseHeader) {
      flushTable();
      currentCase = caseHeader[1];
      currentStrategy = null;
      continue;
    }
    if (!currentCase) continue;

    const stratMatch = line.match(STRAT_LINE_RE);
    if (stratMatch) {
      flushTable();
      currentStrategy = stratMatch[1];
      continue;
    }

    if (/^\*\*Retrieved chunks:\*\*/.test(line)) {
      inRetrievedTable = true;
      tableHeaderSeen = false;
      continue;
    }

    if (inRetrievedTable) {
      // Skip blank rows
      if (line.trim() === "") continue;
      // Table header / separator
      if (/^\|\s*#\s*\|/.test(line)) { tableHeaderSeen = true; continue; }
      if (/^\|\s*[-:]+/.test(line)) continue;
      // Data row: | n | task | #N or — | score |
      const m = line.match(/^\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(#\d+|—|-)\s*\|\s*([\d.]+)\s*\|/);
      if (m && tableHeaderSeen) {
        const task = m[1].trim();
        const chunkRaw = m[2].trim();
        const chunkIndex = chunkRaw.startsWith("#") ? parseInt(chunkRaw.slice(1), 10) : null;
        const score = parseFloat(m[3]);
        buf.push({ task, chunkIndex, score });
        continue;
      }
      // Anything else ends the table
      flushTable();
    }
  }
  flushTable();
}

// Sanity report — how many (case, strategy) cells got chunks from the .md
const cellsWithChunks = Object.values(retrievedByCase).reduce(
  (acc, byStrat) => acc + Object.keys(byStrat).length,
  0,
);
console.log(`📋 Parsed ${cellsWithChunks} retrieved-chunk tables from ${path.basename(reportPath)}`);

// ─── Strategies emitted in the quality JSON — now includes fullcontext ───────
// (fullcontext has no retrieval, but it does have an answer mark, so it
// gets a synthesized signals object: sufficiency=1, precision/noise=null.
// This keeps the matrix viewer's columns complete and lets you compare
// fullcontext's generation behavior against the retrieval strategies.)
const RSTRATS = STRATS;

// ─── Build signals per (case, strategy) ──────────────────────────────────────
const rows = [];
const tally = {};

let usedReportCells = 0;
let usedJsonFallbackCells = 0;
let usedSynthesisCells = 0;
for (const c of cases) {
  for (const strat of RSTRATS) {
    let retrievedChunks = [];
    if (strat === "fullcontext") {
      // No retrieval — the lib synthesizes signals without consulting chunks.
      usedSynthesisCells++;
    } else {
      // Prefer chunks parsed from the .md report (the curated multi-run truth).
      // Fall back to JSON only if no table was found for this (case, strategy).
      const reportChunks = retrievedByCase[c.id]?.[strat];
      if (reportChunks && reportChunks.length > 0) {
        retrievedChunks = reportChunks;
        usedReportCells++;
      } else {
        const cell = results.cells.find((x) => x.caseId === c.id && x.variantKey === strat);
        if (!cell) continue;
        retrievedChunks = cell.retrieved;
        usedJsonFallbackCells++;
      }
    }

    const sig = retrievalSignals(c, retrievedChunks, strat);
    if (sig === null) continue; // defensive — shouldn't happen anymore

    const mark = correctness[c.id]?.[strat] ?? "?";
    let diagnosis;
    if (correctnessFound) {
      const isCorrect = mark === "✓";
      diagnosis = classifyMiss(sig, c, isCorrect);
      if (mark.startsWith("~") && diagnosis === "success") diagnosis = "partial_answer";
      if (mark.startsWith("~") && diagnosis === "generation_miss") diagnosis = "generation_partial";
    } else {
      // No correctness data — classify on retrieval-only signals.
      const contentFacts = (c.goldFacts || []).filter((f) => f.anchor === "content");
      if ((c.goldFacts || []).length === 0) {
        diagnosis = "open_ended";
      } else if (contentFacts.length === 0) {
        diagnosis = "metadata_only";
      } else if (!sig._flags.anyTaskHit) {
        diagnosis = "retrieval_miss_task";
      } else if (sig.sufficiency === 0 && (sig.sufficiencyPartial ?? 0) === 0) {
        diagnosis = "retrieval_miss_chunk";
      } else if (sig.sufficiency < 1 && (sig.sufficiencyPartial ?? 0) > sig.sufficiency) {
        diagnosis = "boundary_split";
      } else if (sig.sufficiency < 1) {
        diagnosis = "partial_coverage";
      } else {
        diagnosis = "sufficient";
      }
    }

    // Compact per-fact coverage with rank
    const factCoverage = (sig.factCoverage || []).map((f) => ({
      label: f.label,
      taskTitle: f.taskTitle,
      fullHit: f.fullHit,
      partialHit: f.partialHit,
    }));

    rows.push({
      caseId: c.id,
      category: c.category,
      expectedBehavior: c.expectedBehavior,
      strategy: strat,
      k: sig.k,
      // hit@k
      taskHitAtK: sig._flags.anyTaskHit,
      taskHits: sig.taskHits, // per-task with rank (-1 if missing)
      chunkHitAtK:
        sig.factCoverage && sig.factCoverage.length > 0
          ? sig.factCoverage.some((f) => f.fullHit)
          : null,
      // rank (first hit position in top-k, -1 = not present)
      taskRank: sig.taskHits.length
        ? Math.min(...sig.taskHits.filter((t) => t.rank >= 0).map((t) => t.rank).concat(Infinity))
        : null,
      // sufficiency / precision / noise
      retrievalSufficiency: sig.sufficiency, // facts fully covered / total content facts
      retrievalSufficiencyWithPartial: sig.sufficiencyPartial,
      precision: sig.precision,
      precisionGrain: sig.precisionGrain ?? null, // "chunk" | "task" | null
      retrievalNoise: sig.noise,
      noiseGrain: sig.noiseGrain ?? null,
      // Back-compat — old viewers still reading chunkPrecision
      chunkPrecision: sig.chunkPrecision,
      // per-fact drilldown
      factCoverage,
      metadataFactsCount: sig.metadataFactsCount,
      // correctness + diagnosis
      answerMark: mark,
      diagnosis,
      // Manually curated verdict from the report (may include rerun notes
      // like "non-deterministic — run 1 correct, run 2 wrong"). Parsed
      // from `**Verdict:**` lines under each strategy section.
      reportVerdict: verdictsByCase[c.id]?.[strat] ?? null,
      // Case-level Findings block (shared across all strategies for the case)
      reportFindings: findingsByCase[c.id] ?? null,
      // Hand-curated root-cause tag (see rag-root-causes.js). Diagnosis
      // says WHAT happened; rootCause says WHY. Two cells with the same
      // diagnosis (e.g. generation_partial) can have very different root
      // causes (attention_dilution vs overconfident_attribution vs
      // value_confusion) — and their fixes are different.
      // Only set for non-success rows — a successful cell has no "cause
      // of failure" to attribute.
      rootCause:
        diagnosis === "success" || diagnosis === "sufficient"
          ? null
          : rootCauseFor(c.id, strat, tag),
      // Open-ended cases: per-strategy qualitative comparison instead of
      // a meaningless numeric percentage. Pulled from rag-root-causes.js.
      strategyComparison: (() => {
        const sc = strategyComparisonFor(c.id);
        if (!sc) return null;
        return {
          overview: sc.overview,
          forThisStrategy: sc.perStrategy?.[strat] ?? null,
          allStrategies: sc.perStrategy ?? {},
        };
      })(),
      // Run-specific case note — typically server/data drift between runs.
      // Shown in the drawer as neutral context (not a failure cause).
      caseNote: caseNoteFor(c.id, tag),
    });

    tally[diagnosis] = (tally[diagnosis] || 0) + 1;
  }
}

// Replace Infinity with -1 in taskRank for JSON serialisation
for (const r of rows) {
  if (r.taskRank === Infinity) r.taskRank = -1;
}

// Tally per root cause for non-success rows (so the viewer can show a summary)
const rootCauseTally = {};
for (const r of rows) {
  if (!r.rootCause) continue;
  rootCauseTally[r.rootCause] = (rootCauseTally[r.rootCause] || 0) + 1;
}

const out = {
  generatedAt: new Date().toISOString(),
  sourceTag: tag,
  caseCount: cases.length,
  strategies: RSTRATS,
  totalRows: rows.length,
  tally,
  rootCauseTally,
  rootCauseTaxonomy: CAUSES,
  rows,
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(
  `✅ Wrote ${rows.length} rows to ${path.relative(process.cwd(), outPath)}`,
);
console.log(
  `   Source of retrieved chunks: ${usedReportCells} cells from .md report, ${usedJsonFallbackCells} fell back to .json, ${usedSynthesisCells} synthesized (fullcontext)`,
);
console.log("Tally:", tally);

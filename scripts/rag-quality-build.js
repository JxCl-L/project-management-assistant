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

const tag = process.argv[2] || "baselineclass";
const dir = path.join(__dirname);
const casesPath = path.join(dir, "rag-eval-cases.json");
const resultsPath = path.join(dir, `rag-eval-results-${tag}.json`);
const reportPath = path.join(dir, `rag-eval-report-${tag}.md`);
const outPath = path.join(dir, `rag-quality-${tag}.json`);

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

// ─── Strategies that have a retrieval step (skip fullcontext) ────────────────
const RSTRATS = STRATS.filter((s) => s !== "fullcontext");

// ─── Build signals per (case, strategy) ──────────────────────────────────────
const rows = [];
const tally = {};

for (const c of cases) {
  for (const strat of RSTRATS) {
    const cell = results.cells.find((x) => x.caseId === c.id && x.variantKey === strat);
    if (!cell) continue;
    const sig = retrievalSignals(c, cell.retrieved, strat);
    if (sig === null) continue; // fullcontext (skipped anyway)

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
      chunkPrecision: sig.chunkPrecision,
      retrievalNoise: sig.noise,
      // per-fact drilldown
      factCoverage,
      metadataFactsCount: sig.metadataFactsCount,
      // correctness + diagnosis
      answerMark: mark,
      diagnosis,
    });

    tally[diagnosis] = (tally[diagnosis] || 0) + 1;
  }
}

// Replace Infinity with -1 in taskRank for JSON serialisation
for (const r of rows) {
  if (r.taskRank === Infinity) r.taskRank = -1;
}

const out = {
  generatedAt: new Date().toISOString(),
  sourceTag: tag,
  caseCount: cases.length,
  strategies: RSTRATS,
  totalRows: rows.length,
  tally,
  rows,
};

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(
  `✅ Wrote ${rows.length} rows to ${path.relative(process.cwd(), outPath)}`,
);
console.log("Tally:", tally);

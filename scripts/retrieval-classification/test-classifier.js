/**
 * Standalone test for the retrieval-mode classifier.
 *
 * Loads ../rag-eval-cases.json, runs classifyRetrievalClass on each query,
 * and compares the predicted class against the hand-labeled
 * expectedRetrievalClass.
 *
 * Hits the AI API directly (no server needed). Cost ~$0.001 for all 26 cases.
 *
 * Usage:
 *   node scripts/retrieval-classification/test-classifier.js
 *   NODE_ENV=development node scripts/retrieval-classification/test-classifier.js
 *
 * Pass bar: >= 22/26 (~85%) agreement with hand labels.
 * Results are written to ./classifier-test-results.json next to this script.
 */

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env.development";
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

const { classifyRetrievalClass } = require("../../src/ai/classifyRetrieval.js");

const CASES_PATH = path.join(__dirname, "..", "rag-eval-cases.json");
const RESULTS_PATH = path.join(__dirname, "classifier-test-results.json");

const CLASSES = ["FACT", "LIST", "OPEN"];

async function main() {
  const cases = JSON.parse(fs.readFileSync(CASES_PATH, "utf8"));
  console.log(`Classifier test — ${cases.length} cases\n`);

  const results = [];
  for (const c of cases) {
    process.stdout.write(`  ${c.id.padEnd(4)} `);
    const start = Date.now();
    let predicted = null;
    let error = null;
    try {
      predicted = await classifyRetrievalClass(c.query);
    } catch (e) {
      error = e.message;
    }
    const elapsed = Date.now() - start;
    const expected = c.expectedRetrievalClass;
    const correct = predicted === expected;
    results.push({
      id: c.id,
      query: c.query,
      expected,
      predicted,
      correct,
      elapsedMs: elapsed,
      error,
    });
    const mark = error ? "ERR" : correct ? " ✓ " : " ✗ ";
    console.log(`${mark}  expected=${(expected || "-").padEnd(6)} predicted=${(predicted || "-").padEnd(6)} (${elapsed}ms)`);
  }

  const total = results.length;
  const errors = results.filter((r) => r.error).length;
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = ((correctCount / total) * 100).toFixed(1);

  console.log(`\nAccuracy: ${correctCount}/${total} (${accuracy}%)${errors ? ` — ${errors} errors` : ""}`);

  // Confusion matrix
  console.log("\nConfusion matrix (rows = expected, cols = predicted):");
  console.log(`                  ${CLASSES.map((c) => c.padStart(7)).join(" ")}`);
  for (const expected of CLASSES) {
    const row = CLASSES.map((predicted) => {
      const n = results.filter((r) => r.expected === expected && r.predicted === predicted).length;
      return String(n).padStart(7);
    }).join(" ");
    console.log(`  ${expected.padEnd(16)}${row}`);
  }

  // Per-class accuracy
  console.log("\nPer-class:");
  for (const cls of CLASSES) {
    const inClass = results.filter((r) => r.expected === cls);
    if (!inClass.length) continue;
    const hits = inClass.filter((r) => r.correct).length;
    console.log(`  ${cls.padEnd(8)} ${hits}/${inClass.length} (${((hits / inClass.length) * 100).toFixed(0)}%)`);
  }

  // Misroutes
  const misses = results.filter((r) => !r.correct && !r.error);
  if (misses.length) {
    console.log("\nMisroutes:");
    for (const m of misses) {
      console.log(`  ${m.id}: expected=${m.expected} got=${m.predicted}`);
      console.log(`        "${m.query}"`);
    }
  }

  // Latency
  const latencies = results.filter((r) => !r.error).map((r) => r.elapsedMs);
  if (latencies.length) {
    const sum = latencies.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / latencies.length);
    const max = Math.max(...latencies);
    const min = Math.min(...latencies);
    console.log(`\nLatency: avg=${avg}ms  min=${min}ms  max=${max}ms`);
  }

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  console.log(`\nFull results: ${path.relative(process.cwd(), RESULTS_PATH)}`);

  // Exit nonzero if accuracy below the pass bar — useful for CI later
  const PASS_BAR = 22;
  if (correctCount < PASS_BAR) {
    console.log(`\n⚠ Below pass bar (${correctCount} < ${PASS_BAR}). Consider tuning the classifier prompt.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});

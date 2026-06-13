/**
 * RAG strategy comparison runner — collect & record, no auto-scoring.
 *
 * Runs every case in rag-eval-cases-clean.json against all strategy variants.
 * For chunked / single / hybrid: records answer + retrieved chunks.
 * For fullcontext: records answer only (no chunked retrieval to show).
 * Outputs a thorough Markdown report for manual review.
 *
 * ── One-time setup ────────────────────────────────────────────────────────────
 * 1. Embed BOTH chunk configs into the rag_test DB:
 *
 *      CHUNK_CONFIGS='[{"size":150,"overlap":50},{"size":150,"overlap":25}]' \
 *        node scripts/rag-embed.js --force
 *
 * 2. Atlas indexes required:
 *
 *    Vector index  "taskChunkEmbedding_vector_index"  on  taskchunkembeddings:
 *      { "fields": [
 *          { "type": "vector",  "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
 *          { "type": "filter",  "path": "project" },
 *          { "type": "filter",  "path": "chunkSize" },
 *          { "type": "filter",  "path": "chunkOverlap" } ] }
 *
 *    Search index  "taskChunkEmbedding_text_index"  on  taskchunkembeddings  (hybrid BM25):
 *      { "mappings": { "dynamic": false, "fields": {
 *          "chunkText":    { "type": "string" },
 *          "project":      { "type": "objectId" },
 *          "chunkSize":    { "type": "number" },
 *          "chunkOverlap": { "type": "number" } } } }
 *
 *    Vector index  "taskContent_vector_index"  on  taskcontents  (single strategy):
 *      { "fields": [
 *          { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
 *          { "type": "filter", "path": "task" } ] }
 *
 * 3. Start the server:   npm run dev:rag-test
 *
 * ── Run ───────────────────────────────────────────────────────────────────────
 *   node scripts/rag-eval.js                           # full matrix
 *   node scripts/rag-eval.js --only A1,B2,H4           # subset of cases
 *   node scripts/rag-eval.js --variants hybrid@150/50,single
 *   node scripts/rag-eval.js --skip-preflight
 *
 * Env overrides: BASE_URL, EVAL_EMAIL, EVAL_PASSWORD, EVAL_PROJECT, EVAL_CONCURRENCY
 *
 * Outputs (written next to this script):
 *   rag-eval-results.json   raw collected results
 *   rag-eval-report.md      manual-review report (answers + retrieval per case)
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = (process.env.BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const EMAIL = process.env.EVAL_EMAIL || "alice@example.com";
const PASSWORD = process.env.EVAL_PASSWORD || "Password123#";
const PROJECT_NAME = process.env.EVAL_PROJECT || "Project Atlas";
const CONCURRENCY = Number(process.env.EVAL_CONCURRENCY || 3);
const REQUEST_TIMEOUT_MS = 90_000;

const CASES_PATH = path.resolve(__dirname, "rag-eval-cases.json");
const RESULTS_PATH = path.resolve(__dirname, "rag-eval-results.json");
const REPORT_PATH = path.resolve(__dirname, "rag-eval-report.md");

const VARIANTS = [
  { key: "fullcontext", strategy: "fullcontext" },
  { key: "single",      strategy: "single" },
  { key: "chunked@150/50", strategy: "chunked", chunkConfig: "150:50" },
  { key: "chunked@150/25", strategy: "chunked", chunkConfig: "150:25" },
  { key: "hybrid@150/50",  strategy: "hybrid",  chunkConfig: "150:50" },
  { key: "hybrid@150/25",  strategy: "hybrid",  chunkConfig: "150:25" },
];

const BEHAVIOR_EMOJI = {
  answerable:           "🎯",
  unanswerable:         "🚫",
  summary:              "📋",
  multi_task_synthesis: "🔀",
};

// ── helpers ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { only: null, variants: null, skipPreflight: false, reportOnly: false, out: null, promptMode: "baseline" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--only")           args.only          = new Set(argv[++i].split(",").map((s) => s.trim()));
    if (a === "--variants")       args.variants      = new Set(argv[++i].split(",").map((s) => s.trim()));
    if (a === "--skip-preflight") args.skipPreflight = true;
    if (a === "--report-only")    args.reportOnly    = true;
    if (a === "--out")            args.out           = argv[++i].trim();
    // --prompt-mode routed sends ?promptMode=routed to the chat endpoint,
    // which picks FACT/LIST/OPEN answer-style instructions based on the
    // classifier. Default "baseline" reproduces the legacy behavior.
    if (a === "--prompt-mode")    args.promptMode    = argv[++i].trim();
  }
  return args;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function httpJson(method, url, { token, body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch { json = { _raw: text }; }
    return { status: res.status, json };
  } finally {
    clearTimeout(timer);
  }
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function login() {
  const { status, json } = await httpJson("POST", `${BASE_URL}/auth/login`, {
    body: { email: EMAIL, password: PASSWORD },
  });
  const token = json?.data?.accessToken;
  if (status !== 200 || !token)
    throw new Error(`Login failed (${status}): ${json?.error?.message || json?.message || JSON.stringify(json)}`);
  return token;
}

async function findProjectId(token) {
  const { status, json } = await httpJson("GET", `${BASE_URL}/projects`, { token });
  if (status !== 200) throw new Error(`GET /projects failed (${status}): ${JSON.stringify(json)}`);
  const list = json?.data?.data || [];
  const proj = list.find((p) => p.name === PROJECT_NAME);
  if (!proj)
    throw new Error(`Project "${PROJECT_NAME}" not found. Available: ${list.map((p) => p.name).join(", ") || "(none)"}`);
  return proj._id;
}

async function runChat(token, projectId, query, variant, promptMode = "baseline") {
  const params = new URLSearchParams({ strategy: variant.strategy, debug: "true" });
  if (variant.chunkConfig) params.set("_chunkConfig", variant.chunkConfig);
  if (promptMode === "routed") params.set("promptMode", "routed");
  const url = `${BASE_URL}/projects/${projectId}/chat?${params.toString()}`;
  const started = Date.now();
  try {
    const { status, json } = await httpJson("POST", url, {
      token,
      body: { messages: [{ role: "user", content: query }] },
    });
    const ms = Date.now() - started;
    if (status !== 200) {
      const msg = json?.error?.message || json?.message || JSON.stringify(json);
      return { ms, error: `HTTP ${status}: ${msg}`, answer: "", retrieved: [], hybrid: null, retrievalClass: null, classifyMs: null, promptClass: null };
    }
    const payload = json?.data || {};
    return {
      ms,
      error: null,
      answer: payload.message || "",
      retrieved: payload._debug?.retrieved || [],
      hybrid: payload._debug?.hybrid || null,
      retrievalClass: payload._debug?.retrievalClass ?? null,
      classifyMs:     payload._debug?.classifyMs ?? null,
      promptClass:    payload._debug?.promptClass ?? null,
    };
  } catch (err) {
    return { ms: Date.now() - started, error: err.message, answer: "", retrieved: [], hybrid: null, retrievalClass: null, classifyMs: null, promptClass: null };
  }
}

// ── preflight ─────────────────────────────────────────────────────────────────

async function preflight(token, projectId) {
  console.log("\n🔎 Preflight (verifying retrieval actually discriminates by config)...");
  const probe = "What was the root cause of the auth token expiry bug?";
  const problems = [];

  const c50    = await runChat(token, projectId, probe, { strategy: "chunked", chunkConfig: "150:50" });
  const c25    = await runChat(token, projectId, probe, { strategy: "chunked", chunkConfig: "150:25" });
  const single = await runChat(token, projectId, probe, { strategy: "single" });
  const hybrid = await runChat(token, projectId, probe, { strategy: "hybrid", chunkConfig: "150:50" });

  const sig = (r) => r.retrieved.map((x) => `${x.task}#${x.chunkIndex}`).join("|");

  if (c50.error || c50.retrieved.length === 0)
    problems.push(`chunked@150/50 returned no chunks (${c50.error || "empty"}). Vector index likely missing chunkSize/chunkOverlap filter fields, or 150/50 not embedded.`);
  if (c25.error || c25.retrieved.length === 0)
    problems.push(`chunked@150/25 returned no chunks (${c25.error || "empty"}). Check filter fields or backfill.`);
  if (!c50.error && !c25.error && c50.retrieved.length && sig(c50) === sig(c25))
    problems.push(`chunked@150/50 and @150/25 returned IDENTICAL chunks — _chunkConfig filter not discriminating.`);
  if (single.error || single.retrieved.length === 0)
    problems.push(`single returned no results (${single.error || "empty"}). Check taskContent_vector_index.`);
  const hb = hybrid.hybrid;
  if (hybrid.error || hybrid.retrieved.length === 0)
    problems.push(`hybrid returned no results (${hybrid.error || "empty"}).`);
  else if (hb?.bm25Errored)
    problems.push(`hybrid BM25 fell back to vector-only — taskChunkEmbedding_text_index missing/unavailable.`);
  else if (hb && hb.bm25Count === 0)
    problems.push(`hybrid BM25 matched 0 chunks — text index likely misconfigured (chunkText mapped as "string"?).`);

  console.log([
    `  chunked@150/50: ${c50.retrieved.length} chunks — top: ${c50.retrieved[0]?.task ?? "none"}`,
    `  chunked@150/25: ${c25.retrieved.length} chunks — distinct from 150/50: ${sig(c50) !== sig(c25)}`,
    `  single:         ${single.retrieved.length} results`,
    `  hybrid@150/50:  ${hybrid.retrieved.length} merged — bm25=${hb?.bm25Count ?? "?"} vec=${hb?.vectorCount ?? "?"} errored=${hb?.bm25Errored ?? "?"}`,
  ].join("\n"));

  if (problems.length) {
    console.error("\n❌ Preflight problems:");
    problems.forEach((p) => console.error(`   - ${p}`));
    console.error("   Re-run with --skip-preflight to force.");
  } else {
    console.log("✅ Preflight passed.\n");
  }
  return { ok: problems.length === 0, problems };
}

// ── retrieval scoring ─────────────────────────────────────────────────────────

function scoreRetrieval(retrieved, expectedTasks) {
  if (!expectedTasks || expectedTasks.length === 0) return null;
  const got = new Set(retrieved.map((r) => r.task));
  const matched = expectedTasks.filter((t) => got.has(t));
  const missing = expectedTasks.filter((t) => !got.has(t));
  return { matched: matched.length, total: expectedTasks.length, missing };
}

function hitLabel(hit) {
  if (hit === null) return "—";
  if (hit.matched === hit.total) return `✓ ${hit.total}/${hit.total}`;
  return `✗ ${hit.matched}/${hit.total}`;
}

// ── report ────────────────────────────────────────────────────────────────────

function renderReport({ projectId, cases, variants, cells, preflightInfo, generatedAt }) {
  // index cells by [caseId][variantKey]
  const byCase = new Map();
  for (const cell of cells) {
    if (!byCase.has(cell.caseId)) byCase.set(cell.caseId, {});
    byCase.get(cell.caseId)[cell.variantKey] = cell;
  }

  const L = [];

  // ── header ──
  L.push(`# RAG Eval — Manual Review Report`);
  L.push(``);
  L.push(`| | |`);
  L.push(`|---|---|`);
  L.push(`| Generated | ${generatedAt} |`);
  L.push(`| Project | ${PROJECT_NAME} (${projectId}) |`);
  L.push(`| Server | ${BASE_URL} |`);
  L.push(`| Cases | ${cases.length} |`);
  L.push(`| Variants | ${variants.map((v) => v.key).join(", ")} |`);
  L.push(`| Total calls | ${cells.length} |`);
  L.push(``);

  if (preflightInfo) {
    const icon = preflightInfo.ok ? "✅" : "⚠️";
    L.push(`> **Preflight:** ${icon} ${preflightInfo.ok ? "passed" : preflightInfo.problems.join("; ")}`);
    L.push(``);
  }

  // ── legend ──
  L.push(`## Expected behavior legend`);
  L.push(``);
  L.push(`| Symbol | Behavior | What to check |`);
  L.push(`|---|---|---|`);
  L.push(`| 🎯 answerable | Specific fact exists in seed | Answer must be precise and correct |`);
  L.push(`| 🚫 unanswerable | Info not in seed | Answer should say it doesn't know — flag if it confidently invents an answer |`);
  L.push(`| 📋 summary | Synthesize one long task | Check completeness — does it capture all key points? |`);
  L.push(`| 🔀 multi_task_synthesis | Requires multiple tasks | Check breadth — does it pull from all relevant tasks? |`);
  L.push(``);

  // ── latency overview table ──
  L.push(`## Latency overview`);
  L.push(``);
  L.push(`| Variant | Avg (ms) | Min (ms) | Max (ms) | Errors |`);
  L.push(`|---|---|---|---|---|`);
  for (const v of variants) {
    const vCells = cells.filter((c) => c.variantKey === v.key);
    const ok = vCells.filter((c) => !c.error);
    const errs = vCells.length - ok.length;
    if (!ok.length) {
      L.push(`| ${v.key} | — | — | — | ${errs} |`);
      continue;
    }
    const ms = ok.map((c) => c.ms);
    const avg = Math.round(ms.reduce((a, b) => a + b, 0) / ms.length);
    const min = Math.min(...ms);
    const max = Math.max(...ms);
    L.push(`| ${v.key} | ${avg} | ${min} | ${max} | ${errs} |`);
  }
  L.push(``);

  // ── retrieval-hit matrix (retrieval-based variants only) ──
  const retrievalVariantKeys = variants.filter((v) => v.strategy !== "fullcontext").map((v) => v.key);
  L.push(`## Retrieval-hit matrix`);
  L.push(``);
  L.push(`\`✓ n/n\` all expected tasks retrieved · \`✗ m/n\` partial · \`—\` no expectedTasks (edge/synthesis cases) · \`ERR\` request failed`);
  L.push(``);
  {
    const hdr = ["Case", "Expected tasks", ...retrievalVariantKeys];
    L.push(`| ${hdr.join(" | ")} |`);
    L.push(`| ${hdr.map(() => "---").join(" | ")} |`);
    for (const c of cases) {
      const row = byCase.get(c.id) || {};
      const taskSummary = c.expectedTasks?.length
        ? c.expectedTasks.map((t) => t.replace(/—/g, "–")).join(", ")
        : "_(none)_";
      const cells_ = retrievalVariantKeys.map((key) => {
        const cell = row[key];
        if (!cell) return "?";
        if (cell.error) return "ERR";
        const hit = scoreRetrieval(cell.retrieved, c.expectedTasks);
        if (hit === null) return "—";
        return hitLabel(hit) + (hit.missing.length ? ` ⚠` : "");
      });
      L.push(`| ${c.id} | ${taskSummary} | ${cells_.join(" | ")} |`);
    }
  }
  L.push(``);

  // ── quick-scan matrix ──
  L.push(`## Quick-scan matrix`);
  L.push(``);
  L.push(`\`✓\` got a response · \`ERR\` request failed · latency in ms`);
  L.push(``);
  const hdr = ["Case", "Behavior", ...variants.map((v) => v.key)];
  L.push(`| ${hdr.join(" | ")} |`);
  L.push(`| ${hdr.map(() => "---").join(" | ")} |`);
  for (const c of cases) {
    const row = byCase.get(c.id) || {};
    const icon = BEHAVIOR_EMOJI[c.expectedBehavior] || "?";
    const cells_ = variants.map((v) => {
      const cell = row[v.key];
      if (!cell) return "?";
      if (cell.error) return "ERR";
      return `✓ ${cell.ms}ms`;
    });
    L.push(`| ${c.id} | ${icon} ${c.expectedBehavior} | ${cells_.join(" | ")} |`);
  }
  L.push(``);

  // ── per-case detailed answers ──
  L.push(`## Per-case answers`);
  L.push(``);
  L.push(`_Read fullcontext first as the reference ceiling, then compare other strategies._`);
  L.push(``);

  for (const c of cases) {
    const row = byCase.get(c.id) || {};
    const icon = BEHAVIOR_EMOJI[c.expectedBehavior] || "?";

    L.push(`---`);
    L.push(``);
    L.push(`### ${c.id} — ${c.category} ${icon}`);
    L.push(``);
    L.push(`**Expected behavior:** \`${c.expectedBehavior}\``);
    L.push(``);
    L.push(`**Query:**`);
    L.push(`> ${c.query}`);
    L.push(``);
    L.push(`**Ground truth:**`);
    L.push(`> ${c.groundTruth}`);
    L.push(``);
    if (c.expectedTasks?.length) {
      L.push(`**Expected tasks:** ${c.expectedTasks.join(" · ")}`);
      L.push(``);
    }

    // fullcontext first — answer only
    const fcCell = row["fullcontext"];
    L.push(`**· fullcontext**`);
    if (!fcCell) {
      L.push(`_not run_`);
    } else if (fcCell.error) {
      L.push(`**ERROR:** ${fcCell.error}`);
    } else {
      L.push(`_${fcCell.ms}ms_`);
      L.push(``);
      L.push(fcCell.answer || "_(empty)_");
    }
    L.push(``);

    // retrieval-based strategies — answer + chunks
    const retrievalVariants = variants.filter((v) => v.strategy !== "fullcontext");
    for (const v of retrievalVariants) {
      const cell = row[v.key];
      L.push(`**· ${v.key}**`);
      if (!cell) {
        L.push(`_not run_`);
        L.push(``);
        continue;
      }
      if (cell.error) {
        L.push(`**ERROR:** ${cell.error}`);
        L.push(``);
        continue;
      }

      // retrieval summary line
      const hit = scoreRetrieval(cell.retrieved, c.expectedTasks);
      const hitNote = hit ? ` · retrieval ${hitLabel(hit)}${hit.missing.length ? ` (missing: ${hit.missing.join(", ")})` : ""}` : "";
      const hybridNote = cell.hybrid
        ? ` · bm25=${cell.hybrid.bm25Count} vec=${cell.hybrid.vectorCount}${cell.hybrid.bm25Errored ? " ⚠ BM25-FELLBACK" : ""}`
        : "";
      L.push(`_${cell.ms}ms · ${cell.retrieved.length} chunk(s) retrieved${hitNote}${hybridNote}_`);
      L.push(``);

      if (cell.retrieved.length > 0) {
        L.push(`**Retrieved chunks:**`);
        L.push(``);
        L.push(`| # | Task | Chunk | Score |`);
        L.push(`|---|---|---|---|`);
        for (let i = 0; i < cell.retrieved.length; i++) {
          const r = cell.retrieved[i];
          const score = r.score != null ? r.score.toFixed(4) : r.rrfScore != null ? r.rrfScore.toFixed(4) : "—";
          const chunkIdx = r.chunkIndex != null ? `#${r.chunkIndex}` : "—";
          L.push(`| ${i + 1} | ${r.task ?? "—"} | ${chunkIdx} | ${score} |`);
        }
        L.push(``);
      }

      L.push(`**Answer:**`);
      L.push(``);
      L.push(cell.answer || "_(empty)_");
      L.push(``);
    }
  }

  L.push(`---`);
  L.push(``);
  L.push(`_End of report — ${cases.length} cases · ${variants.length} variants · generated ${generatedAt}_`);

  return L.join("\n");
}

// ── console summary ───────────────────────────────────────────────────────────

function printConsoleSummary(cases, variants, cells) {
  console.log("\n── Latency by variant ──");
  for (const v of variants) {
    const ok = cells.filter((c) => c.variantKey === v.key && !c.error);
    const errs = cells.filter((c) => c.variantKey === v.key && c.error).length;
    if (!ok.length) { console.log(`  ${v.key.padEnd(18)} no successful calls`); continue; }
    const avg = Math.round(ok.reduce((s, c) => s + c.ms, 0) / ok.length);
    console.log(`  ${v.key.padEnd(18)} avg ${String(avg).padStart(5)}ms  errors: ${errs}`);
  }

  const errCells = cells.filter((c) => c.error);
  if (errCells.length) {
    console.log(`\n⚠  ${errCells.length} failed cell(s):`);
    for (const c of errCells) console.log(`   ${c.caseId} / ${c.variantKey}: ${c.error}`);
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const promptMode = args.promptMode === "routed" ? "routed" : "baseline";

  // ── resolve output paths ───────────────────────────────────────────────
  //   default (baseline)  → scripts/rag-eval-results.json
  //   --prompt-mode routed → scripts/rag-eval-results-routedclass.json
  //   --out X              → scripts/reruns/rag-eval-results-X.json
  // If both --prompt-mode routed and --out are given, --out wins (explicit).
  const outDir      = args.out
    ? path.resolve(__dirname, "reruns")
    : __dirname;
  const suffix      = args.out
    ? `-${args.out}`
    : (promptMode === "routed" ? "-routedclass" : "");
  fs.mkdirSync(outDir, { recursive: true });
  const resultsPath = path.resolve(outDir, `rag-eval-results${suffix}.json`);
  const reportPath  = path.resolve(outDir, `rag-eval-report${suffix}.md`);

  let cases = JSON.parse(fs.readFileSync(CASES_PATH, "utf8"));
  if (args.only) cases = cases.filter((c) => args.only.has(c.id));
  let variants = VARIANTS;
  if (args.variants) variants = VARIANTS.filter((v) => args.variants.has(v.key));

  if (!cases.length) throw new Error("No cases selected (check --only).");
  if (!variants.length) throw new Error("No variants selected (check --variants).");

  // ── report-only mode: read saved results, skip all API calls ──────────────
  if (args.reportOnly) {
    const saved = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
    const { projectId, cells, generatedAt } = saved;
    const filteredCells = cells.filter((c) =>
      (!args.only || args.only.has(c.caseId)) &&
      (!args.variants || args.variants.has(c.variantKey))
    );
    fs.writeFileSync(reportPath, renderReport({ projectId, cases, variants, cells: filteredCells, preflightInfo: null, generatedAt }));
    printConsoleSummary(cases, variants, filteredCells);
    console.log(`\n📄 ${path.relative(process.cwd(), reportPath)}`);
    return;
  }

  console.log(`RAG eval → ${BASE_URL}`);
  console.log(`Cases: ${cases.length} | Variants: ${variants.map((v) => v.key).join(", ")} | Prompt mode: ${promptMode}`);

  const token = await login();
  const projectId = await findProjectId(token);
  console.log(`✅ Authenticated; project "${PROJECT_NAME}" = ${projectId}`);

  let preflightInfo = null;
  if (!args.skipPreflight) {
    preflightInfo = await preflight(token, projectId);
    if (!preflightInfo.ok) {
      process.exitCode = 1;
      console.error("Aborting (use --skip-preflight to run anyway).");
      return;
    }
  }

  const work = [];
  for (const c of cases) for (const v of variants) work.push({ c, v });

  let done = 0;
  const cells = await mapLimit(work, CONCURRENCY, async ({ c, v }) => {
    const r = await runChat(token, projectId, c.query, v, promptMode);
    done++;
    process.stdout.write(`\r  ${done}/${work.length} calls complete`);
    return {
      caseId:      c.id,
      category:    c.category,
      behavior:    c.expectedBehavior,
      query:       c.query,
      variantKey:  v.key,
      strategy:    v.strategy,
      chunkConfig: v.chunkConfig || null,
      promptMode,
      ms:          r.ms,
      error:       r.error,
      answer:      r.answer,
      retrieved:   r.retrieved,
      hybrid:      r.hybrid,
      // Class-routing telemetry (only meaningful when promptMode === "routed"
      // but always recorded so downstream tooling has a uniform schema):
      retrievalClass: r.retrievalClass,
      classifyMs:     r.classifyMs,
      promptClass:    r.promptClass,
    };
  });
  process.stdout.write("\n");

  const generatedAt = new Date().toISOString();

  fs.writeFileSync(resultsPath, JSON.stringify({ generatedAt, projectId, cells }, null, 2));
  fs.writeFileSync(reportPath, renderReport({ projectId, cases, variants, cells, preflightInfo, generatedAt }));

  printConsoleSummary(cases, variants, cells);
  console.log(`\n📄 ${path.relative(process.cwd(), reportPath)}`);
  console.log(`📄 ${path.relative(process.cwd(), resultsPath)}`);
}

main().catch((err) => {
  console.error("\n❌ rag-eval failed:", err.message);
  process.exit(1);
});

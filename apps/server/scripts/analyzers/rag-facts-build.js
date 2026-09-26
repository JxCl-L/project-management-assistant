/**
 * Builds goldFacts arrays for each case in rag-eval-cases.json.
 *
 * For every must-have fact we know:
 *   - taskTitle: which task the fact lives in
 *   - anchor: "content" (in paragraphs) or "title|description|status|dueDate" (metadata)
 *   - for "content": startText / endText anchors. We compute char offsets into
 *     `paragraphs.join("\n\n")` (the same plainText stored in TaskContent).
 *
 * If an anchor is missing or ambiguous (>1 occurrence), the script throws so
 * the fact table can be fixed before drift goes unnoticed.
 *
 * Run: node scripts/rag-facts-build.js
 */

const fs = require("fs");
const path = require("path");

// scripts/analyzers/<this file> reads from scripts/ root.
const ROOT = path.join(__dirname, "..");
const SEED = path.join(ROOT, "seed.js");
const CASES = path.join(ROOT, "rag-eval-cases.json");

// ─── Load taskDefs from seed.js ─────────────────────────────────────
const seedText = fs.readFileSync(SEED, "utf8");
const startIdx = seedText.indexOf("const taskDefs = [");
const endMarker = "];\n\n// ─── 10 extra projects";
const endIdx = seedText.indexOf(endMarker, startIdx);
if (startIdx < 0 || endIdx < 0) throw new Error("taskDefs block not found");
const taskDefsCode = seedText.slice(startIdx, endIdx + 2); // include `];`
const taskDefs = eval(`(() => { ${taskDefsCode}; return taskDefs; })()`);

const tasksByTitle = new Map(taskDefs.map((t) => [t.title, t]));

// ─── Chunking (mirrors src/ai/chunker.js, but tracks char offsets) ───────────
// Chunker is word-based: words = text.split(/\s+/), windows of `size` words
// with step = size - overlap. We mirror that, but also record the source-text
// char span each chunk covers so we can compare against fact char offsets.

const CHUNK_CONFIGS = [
  { key: "150/50", size: 150, overlap: 50 },
  { key: "150/25", size: 150, overlap: 25 },
];

function mapWordsToChars(text) {
  const words = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    words.push({ start: m.index, end: m.index + m[0].length });
  }
  return words;
}

function buildChunks(words, size, overlap) {
  if (words.length === 0) return [];
  if (words.length <= size) {
    return [
      {
        charStart: words[0].start,
        charEnd: words[words.length - 1].end,
      },
    ];
  }
  const chunks = [];
  const step = size - overlap;
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + size, words.length);
    chunks.push({
      charStart: words[start].start,
      charEnd: words[end - 1].end,
    });
    if (end === words.length) break;
    start += step;
  }
  return chunks;
}

// Precompute chunks per task per config.
const chunksByTaskAndConfig = new Map(); // taskTitle -> { "150/50": [...], "150/25": [...] }
for (const t of taskDefs) {
  const text = t.paragraphs.join("\n\n");
  const words = mapWordsToChars(text);
  const entry = {};
  for (const cfg of CHUNK_CONFIGS) {
    entry[cfg.key] = buildChunks(words, cfg.size, cfg.overlap);
  }
  chunksByTaskAndConfig.set(t.title, entry);
}

function classifyChunks(chunks, fStart, fEnd) {
  const full = [];
  const partial = [];
  chunks.forEach((c, i) => {
    if (c.charStart <= fStart && c.charEnd >= fEnd) {
      full.push(i);
    } else if (c.charStart < fEnd && c.charEnd > fStart) {
      partial.push(i);
    }
  });
  return { full, partial };
}

// ─── Fact table ──────────────────────────────────────────────────────────────
// Each entry: { caseId, facts: [...] }
// Content fact:   { taskTitle, label, anchor: "content", startText, endText }
// Metadata fact:  { taskTitle, label, anchor: "title"|"description"|"status"|"dueDate" }

const FACTS = {
  A1: [
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "outage start 10:12 AM (first PagerDuty alert)",
      anchor: "content",
      startText: "10:12 AM — first PagerDuty",
      endText: "first PagerDuty alert fired",
      // The 10:12 AM start time is also restated in the recovery
      // section (para 5: "10:12 AM – 12:52 PM") — a later chunk
      // that BM25 sometimes retrieves instead of chunk #0.
      alsoIn: [
        { startText: "Total user-visible downtime: 2 hours 40 minutes (10:12 AM", endText: "12:52 PM)" },
      ],
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "duration 2 hours 40 minutes",
      anchor: "content",
      startText: "unavailable for 2 hours and 40 minutes",
      endText: "2 hours and 40 minutes",
      // Para 5 restates the duration in the recovery summary.
      alsoIn: [
        { startText: "Total user-visible downtime: 2 hours 40 minutes", endText: "2 hours 40 minutes" },
      ],
    },
  ],

  A2: [
    {
      taskTitle: "API Rate Limiting — Design & Implementation",
      label: "design review Feb 3, 2026 at 11:00 AM PST",
      anchor: "content",
      startText: "was held on February 3, 2026",
      endText: "at 11:00 AM PST",
    },
  ],

  A3: [
    {
      taskTitle: "Stripe Payment Integration — Developer Portal",
      label: "Stripe go-live March 15, 2026 at 10:00 AM PST",
      anchor: "content",
      startText: "Production go-live was March 15",
      endText: "at 10:00 AM PST",
    },
  ],

  A4: [
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "Marcus first PR #207 merged Feb 6, 2026",
      anchor: "content",
      startText: "PR #207 merged February 6",
      endText: "reviewed by Charlie",
    },
  ],

  B1: [
    {
      taskTitle: "Search Index Performance Optimization",
      label: "before-fix P95 regressed to 850ms",
      anchor: "content",
      startText: "baseline of 120ms to 850ms",
      endText: "to 850ms",
    },
    {
      taskTitle: "Search Index Performance Optimization",
      label: "after-fix P95 = 115ms (Jan 24 benchmark)",
      anchor: "content",
      startText: "P50 = 52ms, P75 = 88ms, P95 = 115ms",
      endText: "P95 = 115ms",
    },
  ],

  B2: [
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "annual savings approximately $9,600",
      anchor: "content",
      startText: "Annual savings: approximately $9,600",
      endText: "$9,600 in EC2 costs",
    },
  ],

  B3: [
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users P50 = 88ms",
      anchor: "content",
      startText: "P50 = 88ms",
      endText: "P50 = 88ms",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users P95 = 410ms",
      anchor: "content",
      startText: "P95 = 410ms",
      endText: "P95 = 410ms",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users P99 = 780ms",
      anchor: "content",
      startText: "P99 = 780ms",
      endText: "P99 = 780ms",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users throughput 2,890 req/s",
      anchor: "content",
      startText: "Throughput: 2,890 requests/second",
      endText: "2,890 requests/second",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users error rate 0.08%",
      anchor: "content",
      startText: "Error rate: 0.08%",
      endText: "Error rate: 0.08%",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users app-server CPU peaked at 78%",
      anchor: "content",
      startText: "App server CPU peaked at 78%",
      endText: "peaked at 78%",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "500 users RDS CPU peaked at 52%",
      anchor: "content",
      startText: "RDS CPU peaked at 52%",
      endText: "peaked at 52%",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "/api/search degraded first, P95 1,100ms at peak load",
      anchor: "content",
      startText: "`/api/search` endpoint degraded first",
      endText: "1,100ms at peak load",
    },
  ],

  B4: [
    {
      taskTitle: "Stripe Payment Integration — Developer Portal",
      label: "12 subscriptions on day one",
      anchor: "content",
      startText: "12 subscriptions had been created",
      endText: "12 subscriptions had been created",
    },
  ],

  C1: [
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "Charlie Li ran load test using k6 v0.50",
      anchor: "content",
      startText: "test was run by Charlie Li",
      endText: "using k6 v0.50",
    },
  ],

  // C2 is unanswerable for "who"; only the date is in the seed.
  C2: [
    {
      taskTitle: "Auth Token Expiry Bug — Investigation & Fix",
      label: "root cause identified January 19, 2026",
      anchor: "content",
      startText: "Root cause identified on January 19, 2026",
      endText: "January 19, 2026",
    },
  ],

  C3: [
    {
      taskTitle: "Auth Token Expiry Bug — Investigation & Fix",
      label: "env var renamed JWT_ACCESS_TTL_SECONDS → JWT_ACCESS_EXPIRATION_TTL",
      anchor: "content",
      startText: "`JWT_ACCESS_TTL_SECONDS` was renamed",
      endText: "`JWT_ACCESS_EXPIRATION_TTL`",
    },
    {
      taskTitle: "Auth Token Expiry Bug — Investigation & Fix",
      label: "production environment not updated",
      anchor: "content",
      startText: "production environment was not updated",
      endText: "was not updated",
    },
    {
      taskTitle: "Auth Token Expiry Bug — Investigation & Fix",
      label: "fallback hardcoded 300 seconds default",
      anchor: "content",
      startText: "hardcoded default of 300 seconds",
      endText: "(5 minutes)",
    },
  ],

  D1: [
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:05 AM triggering deploy released",
      anchor: "content",
      startText: "January 15 deploy (released at 10:05 AM",
      endText: "10:05 AM)",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:12 AM first PagerDuty alert",
      anchor: "content",
      startText: "10:12 AM — first PagerDuty",
      endText: "first PagerDuty alert fired",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:15 AM Alice acknowledged",
      anchor: "content",
      startText: "10:15 AM — Alice Wang acknowledged",
      endText: "began investigation",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:20 AM crashloop confirmed",
      anchor: "content",
      startText: "10:20 AM — Alice confirmed",
      endText: "crashlooping in Kubernetes",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:25 AM root cause identified (file rename)",
      anchor: "content",
      startText: "10:25 AM — Alice identified",
      endText: "import path",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:30 AM rollback triggered",
      anchor: "content",
      startText: "reverted the deploy at 10:30 AM",
      endText: "10:30 AM",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:38 AM rollback completed",
      anchor: "content",
      startText: "rollback completed at 10:38 AM",
      endText: "10:38 AM",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "10:40 AM Bob joined",
      anchor: "content",
      startText: "Bob joined at 10:40 AM",
      endText: "10:40 AM",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "11:15 AM manual pod restart",
      anchor: "content",
      startText: "Manual pod restart was performed at 11:15 AM",
      endText: "11:15 AM",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "11:22 AM API recovered (degraded)",
      anchor: "content",
      startText: "API recovered at 11:22 AM",
      endText: "11:22 AM",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "12:52 PM full recovery (P95 back to baseline)",
      anchor: "content",
      startText: "at 12:52 PM PST, P95 latency",
      endText: "returned to baseline",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "2:30 PM metrics-collector fix deployed (PR #181)",
      anchor: "content",
      startText: "PR #181) was merged and deployed at 2:30 PM",
      endText: "2:30 PM PST with no incident",
    },
  ],

  D2: [
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "AI 1: Alice — node --check in CI (PR #182)",
      anchor: "content",
      startText: "Alice — add `node --check` to CI",
      endText: "PR #182",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "AI 2: Bob — metrics collector in integration tests (PR #184)",
      anchor: "content",
      startText: "Bob — add the metrics collector",
      endText: "PR #184",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "AI 3: Alice — update rollback runbook",
      anchor: "content",
      startText: "Alice — update the rollback runbook",
      endText: "explicit pod restart steps",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "AI 4: Charlie — Grafana alert for crashlooping pods",
      anchor: "content",
      startText: "Charlie — add a Grafana alert",
      endText: "crashlooping pods",
    },
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "AI 5: retrospective meeting held Jan 20 2:00 PM PST",
      anchor: "content",
      startText: "all — retrospective meeting held",
      endText: "January 20 at 2:00 PM PST",
    },
  ],

  D3: [
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "9:00 AM welcome call with Alice and Bob",
      anchor: "content",
      startText: "9:00 AM — welcome call",
      endText: "with Alice and Bob",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "10:00 AM HR orientation",
      anchor: "content",
      startText: "10:00 AM — HR orientation",
      endText: "(30 min)",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "11:00 AM dev environment setup with Bob",
      anchor: "content",
      startText: "11:00 AM — dev environment setup",
      endText: "session with Bob",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "2:00 PM codebase walkthrough with Charlie",
      anchor: "content",
      startText: "2:00 PM — codebase walkthrough",
      endText: "with Charlie",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "4:00 PM end-of-day check-in with Alice",
      anchor: "content",
      startText: "4:00 PM — end-of-day check-in",
      endText: "with Alice",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "Docker Desktop 4.28+ required, laptop had 4.26",
      anchor: "content",
      startText: "required Docker Desktop 4.28+",
      endText: "shipped with 4.26",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "Bob updated CONTRIBUTING.md with min Docker version",
      anchor: "content",
      startText: "Bob updated the `CONTRIBUTING.md`",
      endText: "version requirement",
    },
  ],

  D4: [
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "Steady load (200 users) metrics",
      anchor: "content",
      startText: "Steady load results (200 users)",
      endText: "Error rate: 0.02%",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "Ramp-up (500 users) metrics + /api/search degradation",
      anchor: "content",
      startText: "Ramp-up results (500 users)",
      endText: "1,100ms at peak load",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "Spike (800 users) metrics + recovery",
      anchor: "content",
      startText: "Spike test results (800 users)",
      endText: "at steady state",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "bottleneck 1: search endpoint degrades first",
      anchor: "content",
      startText: "search endpoint is the first to degrade",
      endText: "Redis query cache",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "bottleneck 2: auto-scaling 45s response, min raised 2→3",
      anchor: "content",
      startText: "auto-scaling group took 45 seconds",
      endText: "from 2 to 3 effective March 1",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "bottleneck 3: RDS pool exhausted, raised 100→150",
      anchor: "content",
      startText: "RDS connection pool was exhausted",
      endText: "pool size will be increased to 150",
    },
  ],

  // F1 — answered from metadata (task status), not chunk content.
  F1: [
    {
      taskTitle: "API Rate Limiting — Design & Implementation",
      label: "status: inProgress",
      anchor: "status",
    },
    {
      taskTitle: "Frontend Design System — Initial Setup",
      label: "status: inProgress",
      anchor: "status",
    },
    {
      taskTitle: "OpenAPI Documentation Rewrite",
      label: "status: inProgress",
      anchor: "status",
    },
    {
      taskTitle: "Mobile Responsive Redesign — Dashboard",
      label: "status: inProgress",
      anchor: "status",
    },
    {
      taskTitle: "Analytics Dashboard v2 — Design & Build",
      label: "status: inProgress",
      anchor: "status",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "status: inProgress",
      anchor: "status",
    },
  ],

  // F2 — unanswerable, no facts.
  F2: [],

  // F3 — open-ended summary, no atomic facts.
  F3: [],

  F4: [
    {
      taskTitle: "Post-mortem: January 15, 2026 Production Outage",
      label: "duration 2 hours 40 minutes",
      anchor: "content",
      startText: "unavailable for 2 hours and 40 minutes",
      endText: "2 hours and 40 minutes",
      alsoIn: [
        { startText: "Total user-visible downtime: 2 hours 40 minutes", endText: "2 hours 40 minutes" },
      ],
    },
  ],

  G1: [
    {
      taskTitle: "Search Index Performance Optimization",
      label: "search P95 850→115ms after GIN index recreate",
      anchor: "content",
      startText: "P50 = 52ms, P75 = 88ms, P95 = 115ms",
      endText: "P95 = 115ms",
    },
    {
      taskTitle: "Search Index Performance Optimization",
      label: "Redis query cache cut P50 to 12ms (Feb 3)",
      anchor: "content",
      startText: "reduced P50 to 12ms",
      endText: "for cached queries",
    },
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "pipeline startup 4 min → 45 seconds",
      anchor: "content",
      startText: "Pipeline startup time reduced to 45 seconds",
      endText: "45 seconds",
    },
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "CI duration 11 min → 4 m 10 s, failure 7.8% → 3.2%",
      anchor: "content",
      startText: "average CI pipeline duration 4 minutes 10 seconds",
      endText: "down from 7.8%",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "min app server count raised 2 → 3 (Feb 25)",
      anchor: "content",
      startText: "raise minimum app server count to 3",
      endText: "done February 25",
    },
    {
      taskTitle: "Load Testing Report — February 2026",
      label: "RDS connection pool raised 100 → 150 (Feb 22)",
      anchor: "content",
      startText: "increase RDS connection pool to 150",
      endText: "done February 22",
    },
  ],

  G2: [
    {
      taskTitle: "API Rate Limiting — Design & Implementation",
      label: "Bob led Feb 3 rate-limiting design review",
      anchor: "content",
      startText: "Attendees: Bob Chen (lead)",
      endText: "Bob Chen (lead)",
    },
    {
      taskTitle: "API Rate Limiting — Design & Implementation",
      label: "Bob opened draft PR #214 on Feb 5",
      anchor: "content",
      startText: "Bob opened a draft PR (#214) on February 5",
      endText: "February 5, 2026",
    },
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "CI/CD Phase 2 staging deploy completed Feb 5",
      anchor: "content",
      startText: "Phase 2 (staging deploy pipeline) was completed February 5",
      endText: "February 5, 2026",
    },
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "CI/CD Phase 3 production deploy completed Feb 24",
      anchor: "content",
      startText: "Phase 3 (production deploy pipeline) was completed February 24",
      endText: "February 24, 2026",
    },
    {
      taskTitle: "GitHub Actions CI/CD Pipeline Upgrade",
      label: "Jenkins decommissioned Feb 28",
      anchor: "content",
      startText: "Jenkins instance was decommissioned on February 28",
      endText: "February 28, 2026",
    },
    {
      taskTitle: "Stripe Payment Integration — Developer Portal",
      label: "Stripe integration started Feb 3, Bob as lead",
      anchor: "content",
      startText: "Integration work started February 3, 2026 with Bob Chen as the lead",
      endText: "Bob Chen as the lead",
    },
    {
      taskTitle: "Stripe Payment Integration — Developer Portal",
      label: "Stripe testing Feb 24–28",
      anchor: "content",
      startText: "Testing was completed February 24–28, 2026",
      endText: "February 24–28, 2026",
    },
    {
      taskTitle: "Analytics Dashboard v2 — Design & Build",
      label: "Bob completed analytics API backend Feb 28",
      anchor: "content",
      startText: "Bob completed the API backend for the dashboard on February 28",
      endText: "February 28, 2026",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "Bob ran Marcus dev env setup Feb 1",
      anchor: "content",
      startText: "11:00 AM — dev environment setup session with Bob",
      endText: "session with Bob",
    },
    {
      taskTitle: "New Engineer Onboarding — Marcus Chen",
      label: "Bob updated CONTRIBUTING.md for min Docker version",
      anchor: "content",
      startText: "Bob updated the `CONTRIBUTING.md`",
      endText: "version requirement",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Bob attended Feb 10 Atlas Core kickoff (infrastructure)",
      anchor: "content",
      startText: "Bob Chen (infrastructure)",
      endText: "Bob Chen (infrastructure)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Bob prepared Atlas Core cost analysis Feb 12",
      anchor: "content",
      startText: "Cost analysis (prepared by Bob Chen on February 12",
      endText: "February 12, 2026",
    },
  ],

  H1: [
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "kickoff Feb 10, 2026 at 2:00 PM PST",
      anchor: "content",
      startText: "design kickoff meeting was held on February 10, 2026 at 2:00 PM PST",
      endText: "at 2:00 PM PST",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "attendee Alice Wang (architect)",
      anchor: "content",
      startText: "Alice Wang (architect)",
      endText: "Alice Wang (architect)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "attendee Charlie Li (tech lead)",
      anchor: "content",
      startText: "Charlie Li (tech lead)",
      endText: "Charlie Li (tech lead)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "attendee Bob Chen (infrastructure)",
      anchor: "content",
      startText: "Bob Chen (infrastructure)",
      endText: "Bob Chen (infrastructure)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "attendee Priya Sharma (product)",
      anchor: "content",
      startText: "Priya Sharma (product)",
      endText: "Priya Sharma (product)",
    },
  ],

  H2: [
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Redis cache TTL 60 seconds (discovery cache)",
      anchor: "content",
      startText: "Redis cache layer (TTL: 60 seconds)",
      endText: "TTL: 60 seconds",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "max 500 registered services per project",
      anchor: "content",
      startText: "maximum 500 registered services per Atlas project",
      endText: "per Atlas project",
    },
  ],

  H3: [
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "estimated monthly cost under $20",
      anchor: "content",
      startText: "Total estimated incremental monthly cost: under $20",
      endText: "under $20",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "approved by Alice Wang Feb 13, 2026",
      anchor: "content",
      startText: "Approved by Alice Wang on February 13, 2026",
      endText: "February 13, 2026",
    },
  ],

  H4: [
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "etcd rejected: operational complexity",
      anchor: "content",
      startText: "etcd (rejected: operational complexity)",
      endText: "operational complexity)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Consul rejected: licensing cost at scale",
      anchor: "content",
      startText: "Consul (rejected: licensing cost at scale)",
      endText: "licensing cost at scale)",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "gRPC rejected: Node.js native bindings complicate Docker builds",
      anchor: "content",
      startText: "gRPC was evaluated and rejected",
      endText: "complicate Docker builds",
    },
  ],

  H5: [
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Wave 1 April 1–14, 2026 — 5 pilot teams, 18 services",
      anchor: "content",
      startText: "Wave 1 (April 1–14, 2026)",
      endText: "18 services total",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Wave 2 April 15–30, 2026 — next 19 highest-traffic services",
      anchor: "content",
      startText: "Wave 2 (April 15–30, 2026)",
      endText: "highest-traffic services",
    },
    {
      taskTitle: "Atlas Core Service Registry — Technical Design",
      label: "Wave 3 May 1–15, 2026 — remaining 10 services incl. legacy",
      anchor: "content",
      startText: "Wave 3 (May 1–15, 2026)",
      endText: "legacy systems",
    },
  ],
};

// ─── Resolve offsets ─────────────────────────────────────────────────────────
function resolveFact(caseId, fact) {
  const task = tasksByTitle.get(fact.taskTitle);
  if (!task) {
    throw new Error(`[${caseId}] task not found: ${fact.taskTitle}`);
  }

  if (fact.anchor !== "content") {
    // Metadata fact — no offsets needed. Sanity check the field exists.
    if (!(fact.anchor in task)) {
      throw new Error(
        `[${caseId}] metadata anchor "${fact.anchor}" not on task "${fact.taskTitle}"`,
      );
    }
    return {
      taskTitle: fact.taskTitle,
      label: fact.label,
      anchor: fact.anchor,
    };
  }

  // Content fact
  const text = task.paragraphs.join("\n\n");

  // Resolve a (startText, endText) pair to a [start, end] char-span.
  // Throws if startText is ambiguous (≥2 occurrences) — this guards the
  // primary span. Restatements in `alsoIn` use the same logic and must
  // also be unambiguous; the whole point of declaring them is to pin a
  // *different* occurrence than the primary.
  function resolveSpan(startText, endText, hint) {
    const firstStart = text.indexOf(startText);
    if (firstStart < 0) {
      throw new Error(
        `[${caseId}] ${hint} startText not found in "${fact.taskTitle}":\n  ${JSON.stringify(startText)}`,
      );
    }
    const secondStart = text.indexOf(startText, firstStart + 1);
    if (secondStart >= 0) {
      throw new Error(
        `[${caseId}] ${hint} startText is ambiguous (>=2 occurrences) in "${fact.taskTitle}":\n  ${JSON.stringify(startText)}`,
      );
    }
    const endIdx = text.indexOf(endText, firstStart);
    if (endIdx < 0) {
      throw new Error(
        `[${caseId}] ${hint} endText not found after startText in "${fact.taskTitle}":\n  start=${JSON.stringify(startText)}\n  end=${JSON.stringify(endText)}`,
      );
    }
    return [firstStart, endIdx + endText.length];
  }

  const [primaryStart, primaryEnd] = resolveSpan(fact.startText, fact.endText, "primary");

  // Restatements: same fact, different location in the source. Each adds
  // its own [start, end] span that contributes to the chunks union.
  // Common cause: a post-mortem or summary section restates an early fact.
  const restatementSpans = (fact.alsoIn || []).map((alt, i) =>
    resolveSpan(alt.startText, alt.endText, `alsoIn[${i}]`),
  );

  const allSpans = [[primaryStart, primaryEnd], ...restatementSpans];

  // Union chunks across all spans per config. A chunk is "full" if any
  // span is fully inside it; "partial" if any span partially overlaps and
  // no span gives it a full hit.
  const chunks = {};
  const taskChunks = chunksByTaskAndConfig.get(fact.taskTitle);
  for (const cfg of CHUNK_CONFIGS) {
    const fullSet = new Set();
    const partialSet = new Set();
    for (const [s, e] of allSpans) {
      const cls = classifyChunks(taskChunks[cfg.key], s, e);
      cls.full.forEach((i) => fullSet.add(i));
      cls.partial.forEach((i) => partialSet.add(i));
    }
    // If a chunk is in `full` for any span, drop it from `partial`.
    for (const i of fullSet) partialSet.delete(i);
    chunks[cfg.key] = {
      full: [...fullSet].sort((a, b) => a - b),
      partial: [...partialSet].sort((a, b) => a - b),
    };
  }

  return {
    taskTitle: fact.taskTitle,
    label: fact.label,
    anchor: "content",
    start: primaryStart,
    end: primaryEnd,
    startText: fact.startText,
    endText: fact.endText,
    ...(restatementSpans.length > 0
      ? { alsoIn: fact.alsoIn.map((alt, i) => ({ startText: alt.startText, endText: alt.endText, start: restatementSpans[i][0], end: restatementSpans[i][1] })) }
      : {}),
    chunks,
  };
}

// ─── Merge into cases.json ───────────────────────────────────────────────────
const cases = JSON.parse(fs.readFileSync(CASES, "utf8"));

let resolvedCount = 0;
for (const c of cases) {
  const facts = FACTS[c.id];
  if (facts === undefined) {
    throw new Error(`No FACTS entry for case ${c.id}`);
  }
  c.goldFacts = facts.map((f) => resolveFact(c.id, f));
  resolvedCount += c.goldFacts.length;
}

fs.writeFileSync(CASES, JSON.stringify(cases, null, 2) + "\n");
console.log(
  `✅ Resolved ${resolvedCount} gold facts across ${cases.length} cases → ${path.relative(process.cwd(), CASES)}`,
);

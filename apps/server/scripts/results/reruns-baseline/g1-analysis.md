# G1 Deep-Dive — Cross-task Synthesis: Performance Improvements

**Query:** What performance improvements were made this quarter?

**Ground truth (required):** (1) Search index optimization — GIN index recreated Jan 24, P95 from ~850ms to 115ms; Redis query cache Feb 3, P50 to 12ms, database load -31%. (2) CI/CD migration — startup time 4min → 45s, duration 11min → 4min 10s, failure rate 7.8% → 3.2%. (3) Load-test-driven capacity changes — min app servers 2→3 (Feb 25), RDS connection pool 100→150 (Feb 22).

**Expected tasks:** Search Index Performance Optimization · GitHub Actions CI/CD Pipeline Upgrade · Load Testing Report — February 2026

---

## Core retrieval problem

The query "performance improvements this quarter" is a vague cross-cutting concept. It does not semantically match the task titles "GitHub Actions CI/CD Pipeline Upgrade" or "Load Testing Report — February 2026" strongly enough — the CI/CD task is framed around migration, the load test task around capacity planning. Neither signals "performance improvement" to a vector index the way "Search Index Performance Optimization" does explicitly in its title.

As a result all non-fullcontext strategies consistently miss the CI/CD task from direct retrieval and rely on indirect signal from Q2 Stakeholder Demo Preparation and Q1 Sprint Planning chunks that happen to mention CI metrics in passing.

---

## 2-run stability results

Retrieval is **identical across both runs** for all strategies — every difference in answer quality is pure inference non-determinism.

| Strategy | Retrieval | Search | CI/CD | Load Test | Run 1 | Run 2 | Verdict |
|---|---|---|---|---|---|---|---|
| fullcontext | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ stable |
| single | ✗ 1/3 | ✓ | ~ partial from demo prep | ✗ | ~ 1/3 | ~ 1/3 | ~ 1/3 stable |
| chunked@150/50 | ✗ 2/3 | ✓ | ~ partial → ✓ full | ✓ | ~ 2/3 | ✓ | ~ non-deterministic |
| chunked@150/25 | ✗ 1/3 | ✓ | ~ partial from demo prep | ✗ | ~ 1/3 | ~ 1/3 | ~ 1/3 stable |
| hybrid@150/50 | ✗ 2/3 | ✓ | ~ partial → ✗ | ✓ | ~ 2/3 | ~ 2/3 | ~ 2/3 · CI inference unstable |
| hybrid@150/25 | ✗ 2/3 | ✓ | ✗ | ~ partial → ✗ | ~ 1/3 | ~ 1/3 (search only) | ~ 1/3 · load test inference unstable |

---

## Why retrieval fails for CI/CD

- **single:** retrieves Q1 Sprint Planning + Search Index + Q2 Demo Prep. CI/CD task never surfaces because the whole-task embedding of "GitHub Actions CI/CD Pipeline Upgrade" is semantically closer to "CI/CD migration" and "Jenkins" than to "performance improvement".
- **chunked/hybrid:** slots are consumed by Q1 Sprint Planning and Q2 Demo Prep chunks (which happen to mention CI metrics) and multiple Search Index chunks, leaving no room for the actual GitHub Actions task. BM25 does not help here because the query contains no keywords that uniquely match the CI/CD task content (`Jenkins`, `GitHub Actions`, `pipeline`).

---

## Inference non-determinism on indirect sources

Even when the CI/CD metric ("startup time 4min → 45s") appears in a Q2 Demo Prep chunk, the model inconsistently decides whether to include it in the answer. Same retrieved chunk, different runs, different extraction depth. This is the same attention dilution pattern seen in B1 and H4 — when relevant signal arrives via an indirect source rather than a dedicated task, the model treats it as lower-confidence and sometimes omits it.

---

## Approaches to improve retrieval for this situation

### 1. Query expansion (low effort, high impact)

Before embedding the query, decompose it into multiple specific sub-queries and retrieve for each, then merge results:

```
"performance improvements this quarter"
  → "search latency optimization"
  → "CI/CD pipeline speed improvement"
  → "load testing capacity changes"
```

Each sub-query retrieves its own top-k; results are merged and deduplicated before passing to the LLM. The LLM is already available, so it can decompose the query before retrieval with a simple system instruction — no schema or index changes required. This directly solves the G1 case by giving each expected task a query that matches it naturally.

### 2. Task-level metadata tagging (medium effort)

Tag each task at embed time with a `themes` or `category` field (e.g. `performance`, `infrastructure`, `security`, `onboarding`). At retrieval time, detect keywords in the query (`performance`, `improvement`, `optimization`) and pre-filter or boost tasks tagged with matching themes. This turns pure semantic search into a hybrid semantic + metadata filter, making cross-cutting concept queries much more reliable.

### 3. Dedicated outcome-summary embeddings (medium effort)

Currently tasks are chunked from raw content which is process-focused. Additionally embed a **one-sentence outcome summary** per task at ingest time:

```
"GitHub Actions migration reduced CI startup from 4min to 45sec,
 average duration from 11min to 4min 10sec, failure rate from 7.8% to 3.2%."
```

Outcome summaries are result-focused, so they score much higher against "performance improvements" than raw task content. This does not replace chunk retrieval — it adds a parallel retrieval path that is better suited to synthesis queries.

### 4. Increase top-k retrieval (low effort, diminishing returns)

Currently retrieving top 8. Raising to 12–16 would naturally pull in more tasks for synthesis queries. Downside: longer context = more LLM attention dilution, and G1 already shows the model inconsistently synthesises even what it retrieves. Better used in combination with other approaches than alone.

### 5. Two-stage retrieval (high effort, most robust)

Stage 1: retrieve broadly at task level (top 20, coarse vector match).
Stage 2: re-rank using a cross-encoder or LLM scoring each retrieved document against the specific query.
Stage 3: pass top 8 re-ranked results to inference.

Cross-encoders evaluate query and document together (unlike bi-encoders used in vector search which embed them separately), making them significantly better at semantic relevance for abstract queries. Most robust solution but requires adding a re-ranking model or an additional LLM call per retrieval.

---

## Most practical next step

**Query expansion** is the lowest lift — the LLM is already available, so decomposing the query into sub-queries before retrieval requires no schema or index changes. It would directly solve the G1 case and generalise to other synthesis queries (G2, any "what did X do" or "what happened in area Y" queries).

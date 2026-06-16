# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-03T15:39:30.007Z |
| Project | Project Atlas (6a1eb986af94cb7d85867caa) |
| Server | http://localhost:3001 |
| Cases | 1 |
| Variants | fullcontext, single, chunked@150/50, chunked@150/25, hybrid@150/50, hybrid@150/25 |
| Total calls | 6 |

## Expected behavior legend

| Symbol | Behavior | What to check |
|---|---|---|
| 🎯 answerable | Specific fact exists in seed | Answer must be precise and correct |
| 🚫 unanswerable | Info not in seed | Answer should say it doesn't know — flag if it confidently invents an answer |
| 📋 summary | Synthesize one long task | Check completeness — does it capture all key points? |
| 🔀 multi_task_synthesis | Requires multiple tasks | Check breadth — does it pull from all relevant tasks? |

## Latency overview

| Variant | Avg (ms) | Min (ms) | Max (ms) | Errors |
|---|---|---|---|---|
| fullcontext | 4696 | 4696 | 4696 | 0 |
| single | 5339 | 5339 | 5339 | 0 |
| chunked@150/50 | 5970 | 5970 | 5970 | 0 |
| chunked@150/25 | 3153 | 3153 | 3153 | 0 |
| hybrid@150/50 | 2974 | 2974 | 2974 | 0 |
| hybrid@150/25 | 2283 | 2283 | 2283 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Search Index Performance Optimization, GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report – February 2026 | ✗ 1/3 ⚠ | ✗ 2/3 ⚠ | ✗ 1/3 ⚠ | ✗ 2/3 ⚠ | ✗ 2/3 ⚠ |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| G1 | 🔀 multi_task_synthesis | ✓ 4696ms | ✓ 5339ms | ✓ 5970ms | ✓ 3153ms | ✓ 2974ms | ✓ 2283ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### G1 — Cross-task synthesis 🔀

**Expected behavior:** `multi_task_synthesis`

**Query:**
> What performance improvements were made this quarter?

**Ground truth:**
> Performance improvements made this quarter: (1) Search index optimization — the invalid GIN index on content_tsv was dropped and recreated on January 24, bringing search P95 from ~850ms back to 115ms; a Redis query-result cache (60-second TTL) added on February 3 further cut P50 to 12ms for cached queries and reduced average database load by 31%. (2) CI/CD migration (Jenkins to GitHub Actions) — pipeline startup time dropped from about 4 minutes to 45 seconds, average CI duration from 11 minutes to 4 minutes 10 seconds, and failure rate from 7.8% to 3.2%. (3) Load-test-driven capacity changes — minimum app-server count was raised from 2 to 3 on February 25, and the RDS connection pool was increased from 100 to 150 on February 22. Enabling ElastiCache for session storage was planned for March 5, not yet completed in the seed.

**Expected tasks:** Search Index Performance Optimization · GitHub Actions CI/CD Pipeline Upgrade · Load Testing Report — February 2026

**· fullcontext**
_4696ms_

Based on the provided context, the following performance improvements were made this quarter:

1. **Search Index Performance Optimization** — The P95 search latency was reduced from **850ms to 115ms** by recreating a failed GIN index and later adding a Redis query cache for frequent search terms.
2. **GitHub Actions CI/CD Pipeline Upgrade** — Pipeline startup time was reduced from **4 minutes to 45 seconds**, and average CI pipeline duration went from **11 minutes to 4 minutes 10 seconds** (down from Jenkins).
3. **PostgreSQL Schema Migration (v2.3)** — The migration itself ran efficiently (8 min 42 sec), and a timezone bug in session expiration was fixed as part of the improvement.
4. **Load Testing-based Optimizations** — Following the February 2026 load tests, the team raised minimum app server count from 2 to 3 (to handle spikes faster), increased the RDS connection pool from 100 to 150, and enabled ElastiCache for session storage to reduce database reads.
5. **Cache warming** — Although not a deliberate improvement, the January 15 outage post-mortem led to clearer rollback procedures that reduce future recovery time.

The most impactful single improvement was the search latency fix (850ms → 115ms P95).

**· single**
_5339ms · 3 chunk(s) retrieved · retrieval ✗ 1/3 (missing: GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report — February 2026)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | — | 0.7164 |
| 2 | Search Index Performance Optimization | — | 0.7161 |
| 3 | Q2 Stakeholder Demo Preparation | — | 0.6988 |

**Answer:**

Based on the project context, here are the key performance improvements made this quarter:

1. **Search Index Performance Optimization** (Charlie Li)
   - Fixed a GIN index on `content_tsv` that was invalid after a failed concurrent creation during the January 15 migration. Recreated the index on January 24, reducing P95 search latency from **870ms → 115ms**.
   - Added a Redis query result cache (60-second TTL) for the top-20 frequent search terms on February 3, reducing P50 to **12ms** for cached queries and lowering average database load by **31%**.

2. **CI/CD Pipeline Upgrade** (completed February 28)
   - Migrated from Jenkins to GitHub Actions, reducing **CI pipeline startup time from 4 minutes to 45 seconds**.

3. **Post-deploy Automation**
   - Added automated index validity checks to the post-deploy smoke test suite to prevent future index regressions.
   - Added a Grafana alert for P95 search latency > 300ms.

These are the documented performance improvements; no other tasks in the context mention specific performance metrics changes.

**· chunked@150/50**
_5970ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | #2 | 0.7201 |
| 2 | Q2 Stakeholder Demo Preparation | #2 | 0.7186 |
| 3 | Search Index Performance Optimization | #2 | 0.7172 |
| 4 | Search Index Performance Optimization | #0 | 0.7078 |
| 5 | Search Index Performance Optimization | #1 | 0.7060 |
| 6 | Q1 Sprint Planning & Roadmap Review | #0 | 0.7056 |
| 7 | Load Testing Report — February 2026 | #2 | 0.7037 |
| 8 | Load Testing Report — February 2026 | #1 | 0.7034 |

**Answer:**

Based on the project data, the following performance improvements were made this quarter:

1. **Search Index Performance Optimization** (completed, high priority)
   - Fixed an invalid GIN index on the `documents` table (recreated it, reducing search P95 from 850ms to 115ms)
   - Added a Redis query result cache (60-second TTL) for the top-20 most frequent search terms, reducing P50 to 12ms for cached queries and cutting database load by 31%
   - Added automated index validity checks to post-deploy smoke tests and a Grafana alert for P95 > 300ms

2. **Load Testing & Infrastructure Scaling** (February 2026 load test recommendations implemented)
   - Raised minimum app server count from 2 to 3 (done February 25)
   - Increased RDS connection pool from 100 to 150 (done February 22)
   - Scheduled ElastiCache for session storage (March 5) to reduce database reads
   - Auto-scaling group response time improved (from 45s to faster scaling)

3. **CI/CD Pipeline Upgrade** (GitHub Actions migration completed February 28)
   - CI pipeline startup time reduced from 4 minutes to 45 seconds (highlighted in Q2 demo metrics)

Key metric results: Search P95 latency reduced from 850ms → 115ms, CI startup time reduced from 4 min → 45 seconds, and 99.97% API uptime achieved in Q1.

**· chunked@150/25**
_3153ms · 8 chunk(s) retrieved · retrieval ✗ 1/3 (missing: GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report — February 2026)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.7287 |
| 2 | Q2 Stakeholder Demo Preparation | #2 | 0.7239 |
| 3 | Q1 Sprint Planning & Roadmap Review | #2 | 0.7178 |
| 4 | Q1 Sprint Planning & Roadmap Review | #1 | 0.7125 |
| 5 | Q2 Stakeholder Demo Preparation | #1 | 0.7102 |
| 6 | Search Index Performance Optimization | #0 | 0.7079 |
| 7 | Q1 Sprint Planning & Roadmap Review | #0 | 0.7056 |
| 8 | Search Index Performance Optimization | #1 | 0.7025 |

**Answer:**

Based on the provided context, two key performance improvements were made this quarter:

1. **Search Index Performance (Search Index Performance Optimization)**: P95 search response time was reduced from 850ms back to 115ms by fixing an invalid index and adding a Redis query cache. This brought the P50 down to 12ms for cached queries and reduced average database load by 31%.

2. **CI Pipeline Startup Time (Q2 Stakeholder Demo Preparation)**: CI pipeline startup time was reduced from 4 minutes to 45 seconds (this is listed as a key metric to highlight in the Q2 demo).

**· hybrid@150/50**
_2974ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade) · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | #2 | 0.0325 |
| 2 | Search Index Performance Optimization | #2 | 0.0289 |
| 3 | Load Testing Report — February 2026 | #2 | 0.0277 |
| 4 | Bug Triage Session — March 3, 2026 | #0 | 0.0267 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0265 |
| 6 | Bug Triage Session — March 3, 2026 | #2 | 0.0252 |
| 7 | Atlas Core Service Registry — Technical Design | #0 | 0.0164 |
| 8 | Q2 Stakeholder Demo Preparation | #2 | 0.0161 |

**Answer:**

Based on the provided documents, here are the performance improvements made this quarter (Q1 2026):

1. **Search Index Performance** (Completed Feb 10, 2026)
   - Fixed a search latency regression caused by a missing index after a schema migration.
   - P95 search response time restored from 850ms back to 115ms (baseline).
   - Added a Redis query result cache (60-second TTL) for the top-20 frequent search terms, reducing P50 to 12ms for cached queries and overall database load by 31%.

2. **Load Testing & Infrastructure** (February 2026)
   - Raised the minimum app server count from 2 to 3 to reduce auto-scaling response time.
   - Increased RDS connection pool from 100 to 150 to prevent exhaustion during spikes.
   - ElastiCache for session storage scheduled for March 5 to reduce database reads.
   - Next load test planned for April 15, 2026.

**· hybrid@150/25**
_2283ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade) · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | #2 | 0.0323 |
| 2 | Q1 Sprint Planning & Roadmap Review | #1 | 0.0315 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0284 |
| 4 | Bug Triage Session — March 3, 2026 | #1 | 0.0276 |
| 5 | Search Index Performance Optimization | #1 | 0.0275 |
| 6 | Load Testing Report — February 2026 | #1 | 0.0272 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.0270 |
| 8 | Search Index Performance Optimization | #2 | 0.0164 |

**Answer:**

Based on the provided context, the key performance improvements made this quarter were for the **Search Index**:

1. **GIN Index Fix:** A broken GIN index on `content_tsv` was identified as the root cause of search latency regression. It was dropped and recreated using `CREATE INDEX CONCURRENTLY` on January 24, 2026, bringing P95 back to baseline (<200ms).
2. **Redis Query Cache:** On February 3, 2026, a Redis query result cache (60-second TTL) was added for the top 20 most frequent search terms. This reduced P50 latency to 12ms for cached queries and decreased average database load by 31%.

---

_End of report — 1 cases · 6 variants · generated 2026-06-03T15:39:30.007Z_
# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-03T13:52:00.736Z |
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
| fullcontext | 2117 | 2117 | 2117 | 0 |
| single | 5476 | 5476 | 5476 | 0 |
| chunked@150/50 | 5498 | 5498 | 5498 | 0 |
| chunked@150/25 | 3922 | 3922 | 3922 | 0 |
| hybrid@150/50 | 1924 | 1924 | 1924 | 0 |
| hybrid@150/25 | 2203 | 2203 | 2203 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Search Index Performance Optimization | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 🎯 answerable | ✓ 2117ms | ✓ 5476ms | ✓ 5498ms | ✓ 3922ms | ✓ 1924ms | ✓ 2203ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### B1 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> What was the P95 search latency before and after the fix in January?

**Ground truth:**
> Before the fix, the search P95 had regressed to roughly 850ms (the January 22 benchmark measured P95 = 870ms; the pre-regression baseline was 120ms). After the fix, the post-fix benchmark on January 24 showed P95 = 115ms, back within the baseline range.

**Expected tasks:** Search Index Performance Optimization

**· fullcontext**
_2117ms_

Before the fix, the P95 search latency was **850ms**. After the fix (recreating the GIN index on January 24), the P95 dropped to **115ms**, which was back within the baseline range.

**· single**
_5476ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | — | 0.8213 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.6921 |
| 3 | Load Testing Report — February 2026 | — | 0.6790 |

**Answer:**

Based on the "Search Index Performance Optimization" task details:

- **Before fix (January 22 benchmark):** P95 = **870ms** (regressed from a baseline of 120ms)
- **After fix (January 24 benchmark):** P95 = **115ms** (back within the baseline range of 120ms)

**· chunked@150/50**
_5498ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.8364 |
| 2 | Search Index Performance Optimization | #0 | 0.8263 |
| 3 | Search Index Performance Optimization | #1 | 0.8029 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7133 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.6950 |
| 6 | Load Testing Report — February 2026 | #1 | 0.6815 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6760 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.6736 |

**Answer:**

Before the fix: **120ms** (baseline).  
After the fix (January 24): **115ms** (P95 returned to baseline).

**· chunked@150/25**
_3922ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.8476 |
| 2 | Search Index Performance Optimization | #0 | 0.8263 |
| 3 | Search Index Performance Optimization | #1 | 0.8117 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7335 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7086 |
| 6 | Load Testing Report — February 2026 | #1 | 0.6933 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6856 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.6736 |

**Answer:**

Based on the context, the P95 search latency **before the fix** (baseline) was **120ms**. After the fix on January 24, it returned to **115ms**, and with the additional Redis cache optimization on February 3, it was further reduced for cached queries.

**· hybrid@150/50**
_1924ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.0325 |
| 2 | Search Index Performance Optimization | #0 | 0.0325 |
| 3 | Search Index Performance Optimization | #1 | 0.0315 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0306 |
| 5 | Load Testing Report — February 2026 | #1 | 0.0296 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.0295 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0293 |
| 8 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0277 |

**Answer:**

Based on the task details, the P95 search latency before the fix was **870ms** (measured January 22, 2026). After the fix (post-index recreation on January 24, 2026), the P95 returned to **115ms**, which was back within the baseline range.

**· hybrid@150/25**
_2203ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.0325 |
| 2 | Search Index Performance Optimization | #0 | 0.0325 |
| 3 | Search Index Performance Optimization | #1 | 0.0313 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0310 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0308 |
| 6 | Load Testing Report — February 2026 | #1 | 0.0299 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.0294 |
| 8 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0284 |

**Answer:**

Based on the context, here are the P95 search latency figures for the Search Index Performance Optimization fix:

**Before the fix (January 17, 2026):**
- Baseline: **120ms**
- At peak regression: **850ms** (from Grafana dashboard)  
- Benchmark on January 22 (50 concurrent users): **870ms**

**After the fix (January 24, 2026):**
- Post-fix benchmark (7:00 AM PST): **115ms** (back within baseline range)
- The Grafana alert was cleared at 7:15 AM PST

---

_End of report — 1 cases · 6 variants · generated 2026-06-03T13:52:00.736Z_
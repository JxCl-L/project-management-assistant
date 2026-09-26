# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-03T14:26:33.112Z |
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
| fullcontext | 2694 | 2694 | 2694 | 0 |
| single | 4434 | 4434 | 4434 | 0 |
| chunked@150/50 | 4430 | 4430 | 4430 | 0 |
| chunked@150/25 | 2268 | 2268 | 2268 | 0 |
| hybrid@150/50 | 2320 | 2320 | 2320 | 0 |
| hybrid@150/25 | 2381 | 2381 | 2381 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | Search Index Performance Optimization | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B1 | 🎯 answerable | ✓ 2694ms | ✓ 4434ms | ✓ 4430ms | ✓ 2268ms | ✓ 2320ms | ✓ 2381ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### B1 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> What was the P95 search latency before and after the fix in January?

**Ground truth:**
> Required: before the fix the P95 had regressed to roughly 850ms (January 22 benchmark measured 870ms); after the fix the January 24 benchmark showed P95 = 115ms. Good-to-have: the pre-regression baseline was 120ms.

**Expected tasks:** Search Index Performance Optimization

**· fullcontext**
_2694ms_

Based on the context, the P95 search latency **before the fix** was **850ms**, and **after the fix** (post-index recreation on January 24) it was **115ms**.

**· single**
_4434ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | — | 0.8213 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.6921 |
| 3 | Load Testing Report — February 2026 | — | 0.6790 |

**Answer:**

Based on the "Search Index Performance Optimization" task details:

- **Before fix (January)**: P95 search response time was **870ms** (measured January 22, 2026 during benchmark).
- **After fix (January)**: P95 dropped to **115ms** (measured January 24, 2026 at 7:00 AM PST).

**· chunked@150/50**
_4430ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | #2 | 0.8361 |
| 2 | Search Index Performance Optimization | #0 | 0.8261 |
| 3 | Search Index Performance Optimization | #1 | 0.8026 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7133 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.6951 |
| 6 | Load Testing Report — February 2026 | #1 | 0.6815 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6760 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.6736 |

**Answer:**

Before the fix, the P95 search latency was **870ms** (measured on January 22, 2026). After the fix (recreating the GIN index on January 24), the P95 dropped to **115ms** — back within the baseline range.

**· chunked@150/25**
_2268ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

Before the fix, the P95 search latency was **850ms** (detected on January 17, 2026). After the fix (dropping and recreating the invalid GIN index on January 24, 2026), it dropped to **115ms** (measured at 7:00 AM PST).

**· hybrid@150/50**
_2320ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Based on the context provided:

- **Before the fix (during the regression):** P95 = 850ms (detected after the January 15 deploy) and P95 = 870ms (measured during benchmark on January 22).
- **After the fix (January 24, 7:00 AM PST):** P95 = 115ms, which was back within the baseline range.

**· hybrid@150/25**
_2381ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Before the fix (regression period): **850ms** (P95).  
After the fix (January 24, post-index recreation): **115ms** (P95).  

Baseline before the regression was **120ms**, and the fix fully restored performance to that range.

---

_End of report — 1 cases · 6 variants · generated 2026-06-03T14:26:33.112Z_
# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-03T16:16:33.033Z |
| Project | Project Atlas (6a1eb986af94cb7d85867caa) |
| Server | http://localhost:3001 |
| Cases | 1 |
| Variants | chunked@150/50 |
| Total calls | 1 |

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
| chunked@150/50 | 3776 | 3776 | 3776 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | chunked@150/50 |
| --- | --- | --- |
| H2 | Atlas Core Service Registry – Technical Design | ✓ 1/1 |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | chunked@150/50 |
| --- | --- | --- |
| H2 | 🎯 answerable | ✓ 3776ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### H2 — Long task — middle facts 🎯

**Expected behavior:** `answerable`

**Query:**
> What is the Redis cache TTL and what is the maximum number of services that can be registered?

**Ground truth:**
> For the main service-registry discovery cache, the Redis TTL is 60 seconds. The maximum capacity is 500 registered services per Atlas project. Note: the separate health-check endpoint response cache is 15 seconds.

**Expected tasks:** Atlas Core Service Registry — Technical Design

**· fullcontext**
_not run_

**· chunked@150/50**
_3776ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #12 | 0.7308 |
| 2 | API Rate Limiting — Design & Implementation | #1 | 0.7201 |
| 3 | Atlas Core Service Registry — Technical Design | #13 | 0.7120 |
| 4 | Atlas Core Service Registry — Technical Design | #11 | 0.6998 |
| 5 | Atlas Core Service Registry — Technical Design | #1 | 0.6993 |
| 6 | Atlas Core Service Registry — Technical Design | #4 | 0.6984 |
| 7 | Atlas Core Service Registry — Technical Design | #5 | 0.6950 |
| 8 | Atlas Core Service Registry — Technical Design | #6 | 0.6938 |

**Answer:**

Based on the context, the Redis cache TTL is **60 seconds**. The maximum number of services mentioned is 500, as the cost analysis assumed "500 service documents at approximately 5KB each." However, the technical design does not explicitly state a hard maximum limit for registered services.

---

_End of report — 1 cases · 1 variants · generated 2026-06-03T16:16:33.033Z_
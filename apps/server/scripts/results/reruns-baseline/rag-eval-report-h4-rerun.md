# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-03T13:06:32.457Z |
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
| fullcontext | 2980 | 2980 | 2980 | 0 |
| single | 4602 | 4602 | 4602 | 0 |
| chunked@150/50 | 4135 | 4135 | 4135 | 0 |
| chunked@150/25 | 2150 | 2150 | 2150 | 0 |
| hybrid@150/50 | 2283 | 2283 | 2283 | 0 |
| hybrid@150/25 | 2512 | 2512 | 2512 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- |
| H4 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| H4 | 🎯 answerable | ✓ 2980ms | ✓ 4602ms | ✓ 4135ms | ✓ 2150ms | ✓ 2283ms | ✓ 2512ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### H4 — Long task — deep retrieval 🎯

**Expected behavior:** `answerable`

**Query:**
> What technologies were evaluated and rejected for the service registry, and why?

**Ground truth:**
> For storage, etcd was rejected (operational complexity) and Consul was rejected (licensing cost at scale) — MongoDB was chosen. For the communication protocol, gRPC was evaluated and rejected (on February 10, 2026) because most Atlas services are Node.js-based and the Node.js gRPC ecosystem requires native bindings that complicate Docker builds — REST over HTTPS was chosen.

**Expected tasks:** Atlas Core Service Registry — Technical Design

**· fullcontext**
_2980ms_

For the Atlas Core service registry, two technologies were evaluated and rejected:

1. **etcd** – rejected due to **operational complexity**.
2. **Consul** – rejected due to **licensing cost at scale**.

The final decision was to use **MongoDB** as the primary datastore (with a Redis cache layer), which is consistent with the existing Atlas stack.

**· single**
_4602ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | — | 0.7354 |
| 2 | API Rate Limiting — Design & Implementation | — | 0.6559 |
| 3 | Mobile Responsive Redesign — Dashboard | — | 0.6406 |

**Answer:**

Based on the provided context, two technologies were evaluated and rejected for the Atlas Core service registry:

1.  **etcd**: Rejected due to **operational complexity**.
2.  **Consul**: Rejected due to **licensing cost at scale**.

These evaluations were finalized during the design kickoff meeting on February 10, 2026.

**· chunked@150/50**
_4135ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #2 | 0.7695 |
| 2 | Atlas Core Service Registry — Technical Design | #1 | 0.7690 |
| 3 | Atlas Core Service Registry — Technical Design | #8 | 0.7675 |
| 4 | Atlas Core Service Registry — Technical Design | #10 | 0.7502 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.7479 |
| 6 | Atlas Core Service Registry — Technical Design | #7 | 0.7479 |
| 7 | Atlas Core Service Registry — Technical Design | #12 | 0.7466 |
| 8 | Atlas Core Service Registry — Technical Design | #11 | 0.7448 |

**Answer:**

Based on the provided context, two technologies were evaluated and rejected for the service registry:

1. **etcd** — Rejected due to **operational complexity**.
2. **Consul** — Rejected due to **licensing cost at scale**.

Additionally, **gRPC** was evaluated for the communication protocol and rejected because the majority of Atlas services are Node.js-based, and the Node.js gRPC ecosystem requires native bindings that complicate Docker builds. REST over HTTPS was chosen instead.

**· chunked@150/25**
_2150ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #1 | 0.7685 |
| 2 | Atlas Core Service Registry — Technical Design | #6 | 0.7601 |
| 3 | Atlas Core Service Registry — Technical Design | #7 | 0.7565 |
| 4 | Atlas Core Service Registry — Technical Design | #8 | 0.7502 |
| 5 | Atlas Core Service Registry — Technical Design | #3 | 0.7444 |
| 6 | Atlas Core Service Registry — Technical Design | #0 | 0.7443 |
| 7 | Atlas Core Service Registry — Technical Design | #9 | 0.7419 |
| 8 | Atlas Core Service Registry — Technical Design | #10 | 0.7354 |

**Answer:**

Two technologies were evaluated and rejected for the Atlas Core service registry:

1. **etcd** — rejected due to operational complexity.
2. **Consul** — rejected due to licensing cost at scale.

These decisions were finalised on February 10, 2026.

**· hybrid@150/50**
_2283ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #2 | 0.0325 |
| 2 | Atlas Core Service Registry — Technical Design | #1 | 0.0325 |
| 3 | Atlas Core Service Registry — Technical Design | #8 | 0.0304 |
| 4 | Atlas Core Service Registry — Technical Design | #0 | 0.0304 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.0301 |
| 6 | Atlas Core Service Registry — Technical Design | #12 | 0.0301 |
| 7 | Atlas Core Service Registry — Technical Design | #11 | 0.0286 |
| 8 | Atlas Core Service Registry — Technical Design | #13 | 0.0286 |

**Answer:**

Based on the context, two technologies were evaluated and rejected:

1. **etcd** — Rejected due to **operational complexity**.
2. **Consul** — Rejected due to **licensing cost at scale**.

Both decisions were finalized on February 10, 2026. The final choices were MongoDB (with Redis cache) for storage and REST over HTTPS for the communication protocol.

**· hybrid@150/25**
_2512ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #1 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #0 | 0.0313 |
| 3 | Atlas Core Service Registry — Technical Design | #7 | 0.0308 |
| 4 | Atlas Core Service Registry — Technical Design | #10 | 0.0301 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.0296 |
| 6 | Atlas Core Service Registry — Technical Design | #6 | 0.0293 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0291 |
| 8 | Atlas Core Service Registry — Technical Design | #4 | 0.0282 |

**Answer:**

Two technologies were evaluated and rejected for the service registry:

1. **etcd** — Rejected due to operational complexity.
2. **Consul** — Rejected due to licensing cost at scale.

These decisions were finalized on February 10, 2026. (REST over HTTPS was ultimately chosen as the communication protocol; gRPC was also evaluated and rejected because the Node.js gRPC ecosystem requires native bindings that complicate Docker builds.)

---

_End of report — 1 cases · 6 variants · generated 2026-06-03T13:06:32.457Z_
# RAG Eval — Manual Review Report

| | |
|---|---|
| Generated | 2026-06-02T16:30:09.045Z |
| Project | Project Atlas (6a1eb986af94cb7d85867caa) |
| Server | http://localhost:3001 |
| Cases | 26 |
| Variants | fullcontext, single, chunked@150/50, chunked@150/25, hybrid@150/50, hybrid@150/25 |
| Total calls | 156 |

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
| fullcontext | 2325 | 1430 | 4435 | 0 |
| single | 2110 | 1269 | 3619 | 0 |
| chunked@150/50 | 2174 | 1305 | 3882 | 0 |
| chunked@150/25 | 2075 | 1484 | 3683 | 0 |
| hybrid@150/50 | 2365 | 1510 | 3829 | 0 |
| hybrid@150/25 | 2312 | 1576 | 3842 | 0 |

## Retrieval-hit matrix

`✓ n/n` all expected tasks retrieved · `✗ m/n` partial · `—` no expectedTasks (edge/synthesis cases) · `ERR` request failed

| Case | Expected tasks | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Post-mortem: January 15, 2026 Production Outage | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| A2 | API Rate Limiting – Design & Implementation | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| A3 | Stripe Payment Integration – Developer Portal | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| A4 | New Engineer Onboarding – Marcus Chen | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| B1 | Search Index Performance Optimization | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| B2 | GitHub Actions CI/CD Pipeline Upgrade | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| B3 | Load Testing Report – February 2026 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| B4 | Stripe Payment Integration – Developer Portal | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| C1 | Load Testing Report – February 2026 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| C2 | Auth Token Expiry Bug – Investigation & Fix | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| C3 | Auth Token Expiry Bug – Investigation & Fix | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| D1 | Post-mortem: January 15, 2026 Production Outage | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| D2 | Post-mortem: January 15, 2026 Production Outage | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| D3 | New Engineer Onboarding – Marcus Chen | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| D4 | Load Testing Report – February 2026 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| F1 | _(none)_ | — | — | — | — | — |
| F2 | _(none)_ | — | — | — | — | — |
| F3 | _(none)_ | — | — | — | — | — |
| F4 | Post-mortem: January 15, 2026 Production Outage | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| G1 | Search Index Performance Optimization, GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report – February 2026 | ✗ 1/3 ⚠ | ✗ 2/3 ⚠ | ✗ 1/3 ⚠ | ✗ 2/3 ⚠ | ✗ 2/3 ⚠ |
| G2 | API Rate Limiting – Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration – Developer Portal, Analytics Dashboard v2 – Design & Build, New Engineer Onboarding – Marcus Chen, Atlas Core Service Registry – Technical Design | ✗ 2/6 ⚠ | ✗ 2/6 ⚠ | ✗ 2/6 ⚠ | ✗ 2/6 ⚠ | ✗ 2/6 ⚠ |
| H1 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| H2 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| H3 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| H4 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |
| H5 | Atlas Core Service Registry – Technical Design | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 | ✓ 1/1 |

## Answer correctness matrix

`✓` correct · `~` partial (wrong/missing detail; for summary/synthesis use `~ n/m` or `~ p%`) · `✗` wrong or hallucinated · `⚠` modifier for notable issues · `—` not yet evaluated

| Case | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
|---|---|---|---|---|---|---|
| A1 | ✓ | ✓ | ✓ | ✓ | ~ | ✓ |
| A2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A3 | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| A4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| B1 | ✓ | ✓ | ~ | ~ | ✓ | ✓ |
| B2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| B3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| B4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C2 | ~ | ~ | ~ | ~ | ~ | ~ |
| C3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| D1 | ✓ | ~ | ✓ | ✓ | ✓ | ✓ |
| D2 | ✓ | ✓ | ✓ | ✓ | ✓ | ~ |
| D3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| D4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| F1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| F2 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| F3 | ~ 90% | ~ 82% | ~ 83% | ~ 85% | ~ 78% | ~ 72% |
| F4 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| G1 | ✓ | ~ 1/3 | ~ | ~ 1/3 | ~ 2/3 | ~ 1/3 |
| G2 | ✓ | ~ 2/6 | ~ 2/6 | ~ 1/6 | ✗ | ~ 2/6 |
| H1 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| H2 | ✓ | ✓ | ~ | ✓ | ✓ | ✓ |
| H3 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| H4 | ✓ | ~ | ~ | ~ | ~ | ~ |
| H5 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Quick-scan matrix

`✓` got a response · `ERR` request failed · latency in ms

| Case | Behavior | fullcontext | single | chunked@150/50 | chunked@150/25 | hybrid@150/50 | hybrid@150/25 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A1 | 🎯 answerable | ✓ 2374ms | ✓ 1738ms | ✓ 1726ms | ✓ 1715ms | ✓ 3292ms | ✓ 1852ms |
| A2 | 🎯 answerable | ✓ 1658ms | ✓ 1395ms | ✓ 1556ms | ✓ 1484ms | ✓ 1727ms | ✓ 1965ms |
| A3 | 🎯 answerable | ✓ 1650ms | ✓ 1677ms | ✓ 1505ms | ✓ 1610ms | ✓ 2581ms | ✓ 2330ms |
| A4 | 🎯 answerable | ✓ 1501ms | ✓ 1350ms | ✓ 1582ms | ✓ 1578ms | ✓ 2173ms | ✓ 1840ms |
| B1 | 🎯 answerable | ✓ 1969ms | ✓ 1539ms | ✓ 1736ms | ✓ 1839ms | ✓ 2039ms | ✓ 2231ms |
| B2 | 🎯 answerable | ✓ 2081ms | ✓ 1269ms | ✓ 1466ms | ✓ 1544ms | ✓ 1588ms | ✓ 2026ms |
| B3 | 🎯 answerable | ✓ 2697ms | ✓ 2086ms | ✓ 2098ms | ✓ 1886ms | ✓ 2365ms | ✓ 2488ms |
| B4 | 🎯 answerable | ✓ 1852ms | ✓ 2030ms | ✓ 1667ms | ✓ 2494ms | ✓ 1664ms | ✓ 1834ms |
| C1 | 🎯 answerable | ✓ 1435ms | ✓ 1562ms | ✓ 1305ms | ✓ 1790ms | ✓ 1651ms | ✓ 1576ms |
| C2 | 🚫 unanswerable | ✓ 2677ms | ✓ 3345ms | ✓ 3673ms | ✓ 1489ms | ✓ 1999ms | ✓ 2204ms |
| C3 | 🎯 answerable | ✓ 2100ms | ✓ 2309ms | ✓ 2037ms | ✓ 1712ms | ✓ 1966ms | ✓ 2059ms |
| D1 | 📋 summary | ✓ 3509ms | ✓ 3118ms | ✓ 3319ms | ✓ 3423ms | ✓ 3670ms | ✓ 3203ms |
| D2 | 📋 summary | ✓ 2517ms | ✓ 2319ms | ✓ 2159ms | ✓ 2314ms | ✓ 2460ms | ✓ 2154ms |
| D3 | 📋 summary | ✓ 2101ms | ✓ 2464ms | ✓ 2208ms | ✓ 2183ms | ✓ 2570ms | ✓ 2316ms |
| D4 | 📋 summary | ✓ 3733ms | ✓ 2912ms | ✓ 3882ms | ✓ 3631ms | ✓ 3301ms | ✓ 3329ms |
| F1 | 🎯 answerable | ✓ 2315ms | ✓ 2226ms | ✓ 2648ms | ✓ 1759ms | ✓ 2369ms | ✓ 2225ms |
| F2 | 🚫 unanswerable | ✓ 1808ms | ✓ 1549ms | ✓ 1733ms | ✓ 1653ms | ✓ 2195ms | ✓ 2458ms |
| F3 | 📋 summary | ✓ 4435ms | ✓ 3619ms | ✓ 3439ms | ✓ 3683ms | ✓ 3829ms | ✓ 3842ms |
| F4 | 🎯 answerable | ✓ 2136ms | ✓ 1907ms | ✓ 2409ms | ✓ 1950ms | ✓ 2021ms | ✓ 2393ms |
| G1 | 🔀 multi_task_synthesis | ✓ 3297ms | ✓ 3155ms | ✓ 2866ms | ✓ 2774ms | ✓ 3342ms | ✓ 2945ms |
| G2 | 🔀 multi_task_synthesis | ✓ 3593ms | ✓ 2112ms | ✓ 2485ms | ✓ 2091ms | ✓ 2294ms | ✓ 2696ms |
| H1 | 🎯 answerable | ✓ 1875ms | ✓ 1745ms | ✓ 1600ms | ✓ 1616ms | ✓ 1841ms | ✓ 1895ms |
| H2 | 🎯 answerable | ✓ 1723ms | ✓ 1736ms | ✓ 2043ms | ✓ 1729ms | ✓ 1833ms | ✓ 1831ms |
| H3 | 🎯 answerable | ✓ 1430ms | ✓ 1535ms | ✓ 1865ms | ✓ 1620ms | ✓ 1510ms | ✓ 2061ms |
| H4 | 🎯 answerable | ✓ 1885ms | ✓ 2010ms | ✓ 1433ms | ✓ 2299ms | ✓ 2263ms | ✓ 2296ms |
| H5 | 🎯 answerable | ✓ 2094ms | ✓ 2144ms | ✓ 2082ms | ✓ 2088ms | ✓ 2941ms | ✓ 2051ms |

## Per-case answers

_Read fullcontext first as the reference ceiling, then compare other strategies._

---

### A1 — Specific time and duration facts 🎯

**Expected behavior:** `answerable`

**Query:**
> What time did the January 15 outage start and how long did it last?

**Ground truth:**
> The outage started at 10:12 AM PST on January 15, 2026 (when the first PagerDuty alert fired) and lasted 2 hours and 40 minutes, ending at 12:52 PM PST.

**Expected tasks:** Post-mortem: January 15, 2026 Production Outage

---

**fullcontext**
_2374ms_

The January 15, 2026 production outage started at **10:12 AM PST** and lasted **2 hours 40 minutes** (ending at 12:52 PM PST).

**Verdict:** ✓

---

**single**
_1738ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | — | 0.7361 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | — | 0.6823 |
| 3 | Search Index Performance Optimization | — | 0.6604 |

**Answer:**

The January 15 outage started at **10:12 AM PST** and lasted **2 hours and 40 minutes** (until 12:52 PM PST).

**Verdict:** ✓

---

**chunked@150/50**
_1726ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7701 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7689 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7501 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7318 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6827 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6733 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.6723 |
| 8 | Search Index Performance Optimization | #0 | 0.6644 |

**Answer:**

The January 15 outage started at **10:12 AM PST** and lasted **2 hours 40 minutes**, ending at **12:52 PM PST**.

**Verdict:** ✓

---

**chunked@150/25**
_1715ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7689 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7618 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7578 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7465 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6827 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.6717 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6678 |
| 8 | Search Index Performance Optimization | #0 | 0.6644 |

**Answer:**

The January 15 outage started at **10:12 AM PST** and lasted **2 hours 40 minutes** (until 12:52 PM PST), with an additional 90 minutes of degraded performance due to cache warming.

**Verdict:** ✓

---

**hybrid@150/50**
_3292ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0325 |
| 2 | Search Index Performance Optimization | #0 | 0.0294 |
| 3 | Q2 Stakeholder Demo Preparation | #3 | 0.0289 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.0286 |
| 5 | Search Index Performance Optimization | #1 | 0.0286 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.0280 |
| 7 | PostgreSQL Schema Migration — v2.3 | #0 | 0.0258 |
| 8 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.0164 |

**Answer:**

Based on the project context, the January 15, 2026 production outage **started at 10:30 AM**️ (when Alice triggered the rollback) and lasted **2 hours 40 minutes** of API unavailability. However, API recovery was gradual — the API **recovered at 11:22 AM** with degraded performance (P95 = 1,200ms), and **full recovery** is stated as the final milestone.

So to summarize:
- **Total impact duration:** 2 hours 40 minutes
- **Exact start:** 10:30 AM (rollback triggered) — the outage began after the earlier deploy at 10:05 AM caused the issue
- **API recovery:** 11:22 AM (degraded)
- **Full recovery:** not specified down to the minute, but occurred after cache warming following 11:22 AM

**Verdict:** ~ · retrieval miss, not inference error — chunk#0 (containing 10:12 AM first PagerDuty alert) displaced from top-8 by BM25 boosting unrelated chunks (Search Index #0, Q2 Demo #3); earliest Post-mortem chunk in context was chunk#1 (mid-timeline, starting at 10:30 AM rollback); model correctly read chunk#1 and gave 10:30 AM as start — good inference from incomplete retrieval; 12:52 PM end time also missing as chunk#3 (recovery section) was present but model anchored on chunk#1 timeline only

---

**hybrid@150/25**
_1852ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0320 |
| 2 | Search Index Performance Optimization | #0 | 0.0299 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0293 |
| 4 | Search Index Performance Optimization | #1 | 0.0288 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0285 |
| 6 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.0274 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.0271 |
| 8 | PostgreSQL Schema Migration — v2.3 | #0 | 0.0263 |

**Answer:**

The January 15 outage started at **10:12 AM PST**. The total user-visible downtime was **2 hours 40 minutes**, ending at **12:52 PM PST** when full recovery was achieved.

**Verdict:** ✓ — also notes cache degradation period, bonus detail

---


### A2 — Specific date facts 🎯

**Expected behavior:** `answerable`

**Query:**
> When was the API rate limiting design review meeting held?

**Ground truth:**
> The API rate limiting design review was held on February 3, 2026 at 11:00 AM PST. It lasted 90 minutes; attendees were Bob Chen (lead), Alice Wang (architecture review), and Marcus Chen (implementation).

**Expected tasks:** API Rate Limiting — Design & Implementation

---

**fullcontext**
_1658ms_

The API rate limiting design review meeting was held on **February 3, 2026 at 11:00 AM PST**.

**Verdict:** ✓

---

**single**
_1395ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | — | 0.8661 |
| 2 | Code Review Standards & Team Guidelines | — | 0.7541 |
| 3 | Bug Triage Session — March 3, 2026 | — | 0.7254 |

**Answer:**

The API rate limiting design review meeting was held on **February 3, 2026** at 11:00 AM PST.

**Verdict:** ✓

---

**chunked@150/50**
_1556ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #0 | 0.8721 |
| 2 | API Rate Limiting — Design & Implementation | #2 | 0.8341 |
| 3 | API Rate Limiting — Design & Implementation | #1 | 0.8060 |
| 4 | Code Review Standards & Team Guidelines | #0 | 0.7524 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.7315 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.7309 |
| 7 | Code Review Standards & Team Guidelines | #1 | 0.7287 |
| 8 | Code Review Standards & Team Guidelines | #2 | 0.7227 |

**Answer:**

The API rate limiting design review meeting was held on February 3, 2026 at 11:00 AM PST.

**Verdict:** ✓

---

**chunked@150/25**
_1484ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #0 | 0.8721 |
| 2 | API Rate Limiting — Design & Implementation | #2 | 0.8348 |
| 3 | API Rate Limiting — Design & Implementation | #1 | 0.7986 |
| 4 | Code Review Standards & Team Guidelines | #0 | 0.7523 |
| 5 | Code Review Standards & Team Guidelines | #1 | 0.7423 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.7309 |
| 7 | Bug Triage Session — March 3, 2026 | #1 | 0.7283 |
| 8 | Code Review Standards & Team Guidelines | #2 | 0.7256 |

**Answer:**

The API rate limiting design review meeting was held on **February 3, 2026 at 11:00 AM PST**.

**Verdict:** ✓

---

**hybrid@150/50**
_1727ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #0 | 0.0328 |
| 2 | API Rate Limiting — Design & Implementation | #2 | 0.0323 |
| 3 | Code Review Standards & Team Guidelines | #0 | 0.0315 |
| 4 | API Rate Limiting — Design & Implementation | #1 | 0.0306 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0295 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.0294 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0274 |
| 8 | OpenAPI Documentation Rewrite | #2 | 0.0271 |

**Answer:**

Based on the retrieved context, the API rate limiting design review meeting was held on **February 3, 2026 at 11:00 AM PST**.

**Verdict:** ✓

---

**hybrid@150/25**
_1965ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #0 | 0.0328 |
| 2 | Code Review Standards & Team Guidelines | #0 | 0.0318 |
| 3 | API Rate Limiting — Design & Implementation | #2 | 0.0313 |
| 4 | API Rate Limiting — Design & Implementation | #1 | 0.0298 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.0296 |
| 6 | Atlas Core Service Registry — Technical Design | #6 | 0.0284 |
| 7 | Code Review Standards & Team Guidelines | #1 | 0.0280 |
| 8 | OpenAPI Documentation Rewrite | #0 | 0.0279 |

**Answer:**

The API rate limiting design review meeting was held on **February 3, 2026** at 11:00 AM PST.

**Verdict:** ✓

---


### A3 — Specific date facts 🎯

**Expected behavior:** `answerable`

**Query:**
> What date did the Stripe integration go live in production?

**Ground truth:**
> The Stripe integration went live in production on March 15, 2026 at 10:00 AM PST.

**Expected tasks:** Stripe Payment Integration — Developer Portal

---

**fullcontext**
_1650ms_

The Stripe integration went live in production on **March 15, 2026** at 10:00 AM PST. The first real transaction was processed at 10:47 AM PST.

**Verdict:** ~ · answer complete in this run (date + 10:00 AM PST), but fine-grained time detail may be dropped non-deterministically across runs — fullcontext passes the entire document as context, and with longer input the LLM is more likely to lose specific details through attention dilution

---

**single**
_1677ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | — | 0.8041 |
| 2 | Production Deployment Runbook — Update | — | 0.7222 |
| 3 | Sentry Error Monitoring — Configuration & Alerting | — | 0.6948 |

**Answer:**

Based on the context provided, the Stripe Payment Integration went live in production on **March 15, 2026** at 10:00 AM PST.

**Verdict:** ✓

---

**chunked@150/50**
_1505ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.7852 |
| 2 | Stripe Payment Integration — Developer Portal | #0 | 0.7827 |
| 3 | Stripe Payment Integration — Developer Portal | #2 | 0.7771 |
| 4 | Production Deployment Runbook — Update | #0 | 0.7487 |
| 5 | Production Deployment Runbook — Update | #2 | 0.7229 |
| 6 | Bug Triage Session — March 3, 2026 | #1 | 0.7151 |
| 7 | Production Deployment Runbook — Update | #3 | 0.7131 |
| 8 | Production Deployment Runbook — Update | #1 | 0.7099 |

**Answer:**

The Stripe integration went live in production on **March 15, 2026** at 10:00 AM PST.

**Verdict:** ✓

---

**chunked@150/25**
_1610ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.7977 |
| 2 | Stripe Payment Integration — Developer Portal | #0 | 0.7827 |
| 3 | Stripe Payment Integration — Developer Portal | #2 | 0.7609 |
| 4 | Production Deployment Runbook — Update | #0 | 0.7487 |
| 5 | Production Deployment Runbook — Update | #1 | 0.7267 |
| 6 | Production Deployment Runbook — Update | #2 | 0.7194 |
| 7 | Q2 Stakeholder Demo Preparation | #2 | 0.6938 |
| 8 | Bug Triage Session — March 3, 2026 | #0 | 0.6923 |

**Answer:**

The Stripe payment integration went live in production on **March 15, 2026** at 10:00 AM PST.

**Verdict:** ✓

---

**hybrid@150/50**
_2581ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.0328 |
| 2 | Stripe Payment Integration — Developer Portal | #0 | 0.0323 |
| 3 | Production Deployment Runbook — Update | #0 | 0.0310 |
| 4 | Bug Triage Session — March 3, 2026 | #0 | 0.0299 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0292 |
| 6 | Production Deployment Runbook — Update | #2 | 0.0289 |
| 7 | Analytics Dashboard v2 — Design & Build | #1 | 0.0280 |
| 8 | Analytics Dashboard v2 — Design & Build | #2 | 0.0272 |

**Answer:**

The Stripe Payment Integration for the Developer Portal went live in production on **March 15, 2026**. The first real transaction was processed at 10:47 AM PST.

**Verdict:** ✓

---

**hybrid@150/25**
_2330ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.0328 |
| 2 | Stripe Payment Integration — Developer Portal | #0 | 0.0323 |
| 3 | Production Deployment Runbook — Update | #0 | 0.0308 |
| 4 | Analytics Dashboard v2 — Design & Build | #1 | 0.0301 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.0301 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0290 |
| 7 | Production Deployment Runbook — Update | #2 | 0.0289 |
| 8 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.0288 |

**Answer:**

The Stripe integration went live in production on March 15, 2026 at 10:00 AM PST.

**Verdict:** ✓

---


### A4 — Specific date facts 🎯

**Expected behavior:** `answerable`

**Query:**
> When did Marcus Chen's first PR get merged?

**Ground truth:**
> Marcus Chen's first PR (PR #207) was merged on February 6, 2026 and was reviewed by Charlie.

**Expected tasks:** New Engineer Onboarding — Marcus Chen

---

**fullcontext**
_1501ms_

Marcus Chen's first PR (PR #207) was merged on February 6, 2026.

**Verdict:** ✓

---

**single**
_1350ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | — | 0.7200 |
| 2 | Code Review Standards & Team Guidelines | — | 0.6729 |
| 3 | Frontend Design System — Initial Setup | — | 0.6440 |

**Answer:**

Marcus Chen's first PR (PR #207) was merged on **February 6, 2026**.

**Verdict:** ✓ — reviewer not mentioned (not asked)

---

**chunked@150/50**
_1582ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #2 | 0.7499 |
| 2 | New Engineer Onboarding — Marcus Chen | #1 | 0.7239 |
| 3 | New Engineer Onboarding — Marcus Chen | #0 | 0.7193 |
| 4 | Code Review Standards & Team Guidelines | #0 | 0.6881 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.6685 |
| 6 | Code Review Standards & Team Guidelines | #1 | 0.6528 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.6480 |
| 8 | Atlas Core Service Registry — Technical Design | #6 | 0.6361 |

**Answer:**

Based on the provided context, Marcus Chen's first PR (PR #207) was merged on February 6, 2026.

**Verdict:** ✓

---

**chunked@150/25**
_1578ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #2 | 0.7435 |
| 2 | New Engineer Onboarding — Marcus Chen | #1 | 0.7274 |
| 3 | New Engineer Onboarding — Marcus Chen | #0 | 0.7193 |
| 4 | Code Review Standards & Team Guidelines | #0 | 0.6881 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.6480 |
| 6 | Bug Triage Session — March 3, 2026 | #1 | 0.6423 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.6400 |
| 8 | Code Review Standards & Team Guidelines | #1 | 0.6394 |

**Answer:**

Based on the provided context, Marcus Chen's first PR (PR #207) was merged on **February 6, 2026**. It was reviewed by Charlie.

**Verdict:** ✓ — reviewer not mentioned (not asked)

---

**hybrid@150/50**
_2173ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #2 | 0.0328 |
| 2 | New Engineer Onboarding — Marcus Chen | #1 | 0.0323 |
| 3 | Code Review Standards & Team Guidelines | #0 | 0.0303 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0300 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0293 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.0292 |
| 7 | Frontend Design System — Initial Setup | #2 | 0.0292 |
| 8 | New Engineer Onboarding — Marcus Chen | #0 | 0.0284 |

**Answer:**

Marcus Chen's first PR (#207) was merged on February 6, 2026.

**Verdict:** ✓

---

**hybrid@150/25**
_1840ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #1 | 0.0323 |
| 2 | New Engineer Onboarding — Marcus Chen | #2 | 0.0318 |
| 3 | Code Review Standards & Team Guidelines | #0 | 0.0313 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0309 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.0301 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0292 |
| 7 | Frontend Design System — Initial Setup | #1 | 0.0290 |
| 8 | New Engineer Onboarding — Marcus Chen | #0 | 0.0289 |

**Answer:**

Marcus Chen's first PR was merged on February 6, 2026. It was PR #207, reviewed by Charlie Li.

**Verdict:** ✓

---


### B1 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> What was the P95 search latency before and after the fix in January?

**Ground truth:**
> Required: before the fix the P95 had regressed to roughly 850ms (January 22 benchmark measured 870ms); after the fix the January 24 benchmark showed P95 = 115ms. Good-to-have: the pre-regression baseline was 120ms.

**Expected tasks:** Search Index Performance Optimization

**Analysis — non-determinism & chunk boundary effect (3 runs)**

| Strategy | Run 1 | Run 2 | Run 3 | Stable? |
|---|---|---|---|---|
| fullcontext | ✓ 850ms/115ms | ✗ 120ms as before | ✓ 850ms/115ms | non-deterministic |
| single | ✓ 870ms/115ms | ✓ 870ms/115ms | ✓ 870ms/115ms | stable ✓ |
| chunked@150/50 | ✓ 870ms/115ms | ✗ 120ms as before | ✓ 870ms/115ms | non-deterministic |
| chunked@150/25 | ✗ 120ms as before | ✓ 850ms/115ms | ✓ 850ms/115ms | non-deterministic |
| hybrid@150/50 | ✓ 870ms/115ms | ✓ 870ms/115ms | ✓ 850+870ms/115ms | stable ✓ |
| hybrid@150/25 | ✓ 850ms/115ms | ✓ 850ms/115ms | ✓ 850ms/115ms | stable ✓ |

**Findings:**

- **120ms confusion** — when the model answers 120ms as the "before" value it is confusing the pre-regression baseline with the regressed value. Both numbers appear in the retrieved context; which one the model latches on to as the "before fix" figure varies by run.
- **Chunk boundary effect (chunked@150/50 vs chunked@150/25)** — the two overlap settings produce a different top chunk for Search Index. @150/50 chunk#2 is the post-fix benchmark section ("P95 = 115ms... back within baseline range"), while @150/25 chunk#2 is the Redis cache optimization section ("to 12ms for cached queries..."). Different top chunks put different numbers at the front of the context, creating different confusion risks between the two overlap configs.
- **Same chunks, different stability (chunked vs hybrid, same overlap)** — for both @150/50 and @150/25, the chunked and hybrid strategies retrieve **identical chunks**. Yet hybrid is consistently stable while chunked occasionally produces the 120ms error. The BM25 component in hybrid re-ranks chunks by keyword match — terms like `regression`, `fix`, `benchmark`, `870ms` score high, pushing the regression-specific chunk to a higher position in the context. This subtly primes the model to weight that chunk more heavily when generating the answer, reducing the chance of latching onto the baseline 120ms value. **In short, hybrid's stability advantage comes entirely from chunk ordering**, not from passing any different information. The model reads context top-to-bottom, so whichever chunk appears first has a stronger anchoring effect on the answer. BM25 pushing the regression chunk higher = model sees "850ms" before "120ms" = correct answer. Chunked letting the post-fix chunk win top slot = model sees "115ms" first, then finds "120ms" before "850ms" = wrong answer.
- **Fullcontext non-determinism** — retrieval is not involved; the full document is always passed. The instability is pure LLM attention dilution over a long context — with more text to process the model inconsistently picks which latency figure maps to "before the fix".
- **single is the most stable** — it retrieves the whole task as one unit (not split into competing chunks), so the model sees a coherent narrative and consistently identifies the correct regressed value.

---

**fullcontext**
_1969ms_

Based on the context:

- **Before fix (January 17, 2026)**: P95 was **850ms** — an increase from the baseline of 120ms.
- **After fix (post-January 24, 2026)**: P95 improved to **115ms** — back within the baseline range.

**Verdict:** ✓ · both runs return correct before (850ms) + after (115ms); baseline 120ms is supporting context not required by the query — style difference only

---

**single**
_1539ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Search Index Performance Optimization | — | 0.8213 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.6921 |
| 3 | Load Testing Report — February 2026 | — | 0.6790 |

**Answer:**

Before the fix (January 22 benchmark): **870ms** P95.  
After the fix (January 24 post-fix benchmark): **115ms** P95.

**Verdict:** ✓ · both runs return correct before (870ms) + after (115ms); omitting baseline 120ms is a style choice, not a factual error

---

**chunked@150/50**
_1736ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

The P95 search latency before the fix (during the regression) was **870ms** (measured on January 22). After the fix (recreating the GIN index on January 24), the P95 returned to **115ms**, back within the baseline range.

**Verdict:** ~ · non-deterministic — run 1: correct (870ms/115ms); run 2: reports 120ms as the "before" value, confusing baseline with the regressed value — factual error; missing baseline is a style difference but wrong before value is not

---

**chunked@150/25**
_1839ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

**Before fix (January 17, detected):** P95 = 850ms  
**After fix (January 24, post-index recreate):** P95 = 115ms

**Verdict:** ~ · non-deterministic — run 1: reports 120ms as "before" value (confusing baseline with regressed value — factual error); run 2: correct 850ms/115ms; missing baseline across both runs is style, but swapping baseline for the regressed value is a factual error

---

**hybrid@150/50**
_2039ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Based on the context, the P95 search latency:

- **Before the fix (after regression):** 870ms (from the January 22 benchmark)
- **After the fix (January 24 benchmark):** 115ms

The baseline before the regression was 120ms.

**Verdict:** ✓ · both runs return correct before (870ms) + after (115ms); baseline 120ms volunteered in run 1 but not required

---

**hybrid@150/25**
_2231ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Based on the context, the P95 search latency:

- **Before the fix** (after the regression): 850ms (detected on January 17, 2026)
- **After the fix** (post-fix benchmark on January 24, 2026): 115ms

The baseline before the regression was 120ms, and the fix returned performance back within that baseline range.

**Verdict:** ✓ · both runs return correct before (850ms) + after (115ms); baseline 120ms volunteered in run 1 but not required

---


### B2 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> How much did the Jenkins to GitHub Actions migration save per year?

**Ground truth:**
> Approximately $9,600 per year in EC2 costs (the decommissioned Jenkins EC2 instance had cost about $800/month).

**Expected tasks:** GitHub Actions CI/CD Pipeline Upgrade

---

**fullcontext**
_2081ms_

Based on the context, the Jenkins to GitHub Actions migration saved approximately **$9,600 per year** in EC2 costs.

> *(Source: The Jenkins instance EC2 (t3.medium, us-west-2) was decommissioned on February 28, 2026. Annual savings: approximately $9,600 in EC2 costs.)*

**Verdict:** ✓ — also provides $800/month breakdown and instance type

---

**single**
_1269ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | GitHub Actions CI/CD Pipeline Upgrade | — | 0.8541 |
| 2 | Q1 Sprint Planning & Roadmap Review | — | 0.6954 |
| 3 | Production Deployment Runbook — Update | — | 0.6921 |

**Answer:**

The Jenkins to GitHub Actions migration saved approximately **$9,600 per year** in EC2 costs.

**Verdict:** ✓

---

**chunked@150/50**
_1466ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | GitHub Actions CI/CD Pipeline Upgrade | #2 | 0.8570 |
| 2 | GitHub Actions CI/CD Pipeline Upgrade | #0 | 0.8467 |
| 3 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.8235 |
| 4 | Production Deployment Runbook — Update | #1 | 0.7136 |
| 5 | Production Deployment Runbook — Update | #0 | 0.6995 |
| 6 | Production Deployment Runbook — Update | #2 | 0.6923 |
| 7 | Production Deployment Runbook — Update | #3 | 0.6820 |
| 8 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6780 |

**Answer:**

Based on the context, the annual savings from the Jenkins to GitHub Actions migration is approximately **$9,600 in EC2 costs**.

**Verdict:** ✓

---

**chunked@150/25**
_1544ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | GitHub Actions CI/CD Pipeline Upgrade | #2 | 0.8723 |
| 2 | GitHub Actions CI/CD Pipeline Upgrade | #0 | 0.8467 |
| 3 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.8320 |
| 4 | Production Deployment Runbook — Update | #1 | 0.7095 |
| 5 | Production Deployment Runbook — Update | #0 | 0.6995 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.6861 |
| 7 | Production Deployment Runbook — Update | #2 | 0.6819 |
| 8 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6780 |

**Answer:**

The migration from Jenkins to GitHub Actions saved approximately $9,600 per year in EC2 costs.

**Verdict:** ✓

---

**hybrid@150/50**
_1588ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | GitHub Actions CI/CD Pipeline Upgrade | #0 | 0.0325 |
| 2 | GitHub Actions CI/CD Pipeline Upgrade | #2 | 0.0320 |
| 3 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.0317 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0308 |
| 5 | Production Deployment Runbook — Update | #0 | 0.0305 |
| 6 | Production Deployment Runbook — Update | #1 | 0.0301 |
| 7 | Production Deployment Runbook — Update | #2 | 0.0292 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0286 |

**Answer:**

Based on the context, the migration saved approximately **$9,600 annually** in EC2 costs.

**Verdict:** ✓

---

**hybrid@150/25**
_2026ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | GitHub Actions CI/CD Pipeline Upgrade | #0 | 0.0325 |
| 2 | GitHub Actions CI/CD Pipeline Upgrade | #2 | 0.0320 |
| 3 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.0317 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0308 |
| 5 | Production Deployment Runbook — Update | #0 | 0.0305 |
| 6 | Production Deployment Runbook — Update | #1 | 0.0303 |
| 7 | Production Deployment Runbook — Update | #2 | 0.0292 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0286 |

**Answer:**

Based on the provided context, the migration saved approximately **$9,600 per year** in EC2 costs.

**Verdict:** ✓

---


### B3 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> What were the load test results at 500 concurrent users?

**Ground truth:**
> At 500 concurrent users (the ramp-up scenario): P50 = 88ms, P95 = 410ms, P99 = 780ms; throughput 2,890 requests/second; error rate 0.08%; app-server CPU peaked at 78% and RDS CPU peaked at 52%. The /api/search endpoint degraded first, with P95 reaching 1,100ms at peak load.

**Expected tasks:** Load Testing Report — February 2026

---

**fullcontext**
_2697ms_

Based on the load testing report from February 2026, at 500 concurrent users (ramp-up scenario), the results were:

- **P50**: 88ms
- **P95**: 410ms  
- **P99**: 780ms
- **Throughput**: 2,890 requests/second
- **Error rate**: 0.08%
- **App server CPU**: peaked at 78% during the hold phase
- **RDS CPU**: peaked at 52%
- **Bottleneck noted**: The `/api/search` endpoint degraded first, with P95 reaching 1,100ms at peak load.

**Verdict:** ✓

---

**single**
_2086ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | — | 0.7846 |
| 2 | Search Index Performance Optimization | — | 0.7119 |
| 3 | Post-mortem: January 15, 2026 Production Outage | — | 0.6655 |

**Answer:**

Based on the load test report from February 2026, the results at 500 concurrent users (ramp-up scenario) were:

- **P50**: 88ms
- **P95**: 410ms
- **P99**: 780ms
- **Throughput**: 2,890 requests/second
- **Error rate**: 0.08%
- **App server CPU**: peaked at 78% during the hold phase
- **RDS CPU**: peaked at 52%
- **Notable**: The `/api/search` endpoint degraded first, with P95 reaching 1,100ms at peak load.

**Verdict:** ✓

---

**chunked@150/50**
_2098ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.8005 |
| 2 | Load Testing Report — February 2026 | #1 | 0.7942 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7735 |
| 4 | Search Index Performance Optimization | #0 | 0.7135 |
| 5 | Search Index Performance Optimization | #1 | 0.6994 |
| 6 | Search Index Performance Optimization | #2 | 0.6975 |
| 7 | API Rate Limiting — Design & Implementation | #0 | 0.6735 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.6735 |

**Answer:**

At 500 concurrent users (ramp-up test), the results were:

- **P50**: 88ms
- **P95**: 410ms
- **P99**: 780ms
- **Throughput**: 2,890 requests/second
- **Error rate**: 0.08%
- **App server CPU**: peaked at 78%
- **RDS CPU**: peaked at 52%

The `/api/search` endpoint degraded first, reaching a P95 of 1,100ms at peak load.

**Verdict:** ✓

---

**chunked@150/25**
_1886ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.8005 |
| 2 | Load Testing Report — February 2026 | #1 | 0.7901 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7647 |
| 4 | Search Index Performance Optimization | #0 | 0.7135 |
| 5 | Search Index Performance Optimization | #2 | 0.7107 |
| 6 | Search Index Performance Optimization | #1 | 0.7040 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.6775 |
| 8 | API Rate Limiting — Design & Implementation | #0 | 0.6735 |

**Answer:**

At 500 concurrent users, the load test results were:
- **P50:** 88ms  
- **P95:** 410ms  
- **P99:** 780ms  
- **Throughput:** 2,890 requests/second  
- **Error rate:** 0.08%  
- **App server CPU:** peaked at 78%  
- **RDS CPU:** peaked at 52%  
- **Degradation:** The `/api/search` endpoint degraded first, with P95 reaching 1,100ms at peak load.

**Verdict:** ✓

---

**hybrid@150/50**
_2365ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.0328 |
| 2 | Load Testing Report — February 2026 | #1 | 0.0323 |
| 3 | Search Index Performance Optimization | #0 | 0.0313 |
| 4 | Search Index Performance Optimization | #2 | 0.0310 |
| 5 | Load Testing Report — February 2026 | #2 | 0.0306 |
| 6 | Atlas Core Service Registry — Technical Design | #12 | 0.0299 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0284 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0278 |

**Answer:**

At 500 concurrent users during the ramp-up test (February 12, 2026), the results were:

- P50: 88ms
- P95: 410ms
- P99: 780ms
- Throughput: 2,890 requests/second
- Error rate: 0.08%
- App server CPU: peaked at 78% during the hold phase
- RDS CPU: peaked at 52%

The test was run by Charlie Li using k6 v0.50 against the staging environment.

**Verdict:** ✓

---

**hybrid@150/25**
_2488ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.0328 |
| 2 | Load Testing Report — February 2026 | #1 | 0.0323 |
| 3 | Search Index Performance Optimization | #2 | 0.0313 |
| 4 | Search Index Performance Optimization | #0 | 0.0313 |
| 5 | Load Testing Report — February 2026 | #2 | 0.0304 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0286 |
| 7 | Search Index Performance Optimization | #1 | 0.0278 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0278 |

**Answer:**

At 500 concurrent users (ramp-up scenario), the results were:

- P50: 88ms
- P95: 410ms
- P99: 780ms
- Throughput: 2,890 requests/second
- Error rate: 0.08%
- App server CPU peaked at 78% during the hold phase
- RDS CPU peaked at 52%
- The `/api/search` endpoint degraded first, with P95 reaching 1,100ms at peak load

**Verdict:** ✓

---


### B4 — Specific numbers and metrics 🎯

**Expected behavior:** `answerable`

**Query:**
> How many subscriptions were created on the first day Stripe launched?

**Ground truth:**
> 12 subscriptions were created on day one (March 15, 2026): 8 Standard monthly, 2 Standard annual, and 2 Pro monthly.

**Expected tasks:** Stripe Payment Integration — Developer Portal

---

**fullcontext**
_1852ms_

12 subscriptions were created on the first day Stripe launched (March 15, 2026).

**Verdict:** ✓ — tier breakdown not asked; note: missing breakdown (8 standard monthly, 2 standard annual, 2 pro monthly)

---

**single**
_2030ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | — | 0.7665 |
| 2 | Sentry Error Monitoring — Configuration & Alerting | — | 0.6812 |
| 3 | Analytics Dashboard v2 — Design & Build | — | 0.6383 |

**Answer:**

On the first day of the Stripe go-live (March 15, 2026), 12 subscriptions were created:

- 8 Standard monthly
- 2 Standard annual
- 2 Pro monthly

**Verdict:** ✓

---

**chunked@150/50**
_1667ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #2 | 0.7828 |
| 2 | Stripe Payment Integration — Developer Portal | #1 | 0.7514 |
| 3 | Stripe Payment Integration — Developer Portal | #0 | 0.7465 |
| 4 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.6753 |
| 5 | Sentry Error Monitoring — Configuration & Alerting | #3 | 0.6477 |
| 6 | Bug Triage Session — March 3, 2026 | #1 | 0.6424 |
| 7 | Analytics Dashboard v2 — Design & Build | #2 | 0.6392 |
| 8 | Sentry Error Monitoring — Configuration & Alerting | #1 | 0.6361 |

**Answer:**

On the first day of the Stripe go-live (March 15, 2026), **12 subscriptions** were created: 8 Standard monthly, 2 Standard annual, and 2 Pro monthly.

**Verdict:** ✓

---

**chunked@150/25**
_2494ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.7654 |
| 2 | Stripe Payment Integration — Developer Portal | #0 | 0.7464 |
| 3 | Stripe Payment Integration — Developer Portal | #2 | 0.7278 |
| 4 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.6793 |
| 5 | Sentry Error Monitoring — Configuration & Alerting | #1 | 0.6637 |
| 6 | Q2 Stakeholder Demo Preparation | #2 | 0.6406 |
| 7 | Sentry Error Monitoring — Configuration & Alerting | #0 | 0.6352 |
| 8 | Analytics Dashboard v2 — Design & Build | #2 | 0.6311 |

**Answer:**

12 subscriptions were created on the first day of the Stripe launch (March 15, 2026).

**Verdict:** ✓ — tier breakdown not asked; note: missing breakdown

---

**hybrid@150/50**
_1664ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #2 | 0.0328 |
| 2 | Stripe Payment Integration — Developer Portal | #1 | 0.0323 |
| 3 | Analytics Dashboard v2 — Design & Build | #2 | 0.0306 |
| 4 | Bug Triage Session — March 3, 2026 | #1 | 0.0299 |
| 5 | Load Testing Report — February 2026 | #1 | 0.0294 |
| 6 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.0293 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.0290 |
| 8 | Stripe Payment Integration — Developer Portal | #0 | 0.0287 |

**Answer:**

12 subscriptions were created on the first day (March 15, 2026).

**Verdict:** ✓ — tier breakdown not asked; note: missing breakdown

---

**hybrid@150/25**
_1834ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Stripe Payment Integration — Developer Portal | #1 | 0.0328 |
| 2 | Q2 Stakeholder Demo Preparation | #2 | 0.0313 |
| 3 | Stripe Payment Integration — Developer Portal | #2 | 0.0308 |
| 4 | Analytics Dashboard v2 — Design & Build | #2 | 0.0306 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.0299 |
| 6 | Stripe Payment Integration — Developer Portal | #0 | 0.0298 |
| 7 | Sentry Error Monitoring — Configuration & Alerting | #1 | 0.0295 |
| 8 | Load Testing Report — February 2026 | #1 | 0.0289 |

**Answer:**

12 subscriptions were created on the first day of the Stripe launch (March 15, 2026).

**Verdict:** ✓

---


### C1 — Person attribution 🎯

**Expected behavior:** `answerable`

**Query:**
> Who ran the load testing in February and what tool did they use?

**Ground truth:**
> Charlie Li ran the load testing (conducted February 12, 2026 against the staging environment), using k6 v0.50.

**Expected tasks:** Load Testing Report — February 2026

---

**fullcontext**
_1435ms_

The load testing was run by **Charlie Li** using the tool **k6 v0.50**.

**Verdict:** ✓

---

**single**
_1562ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | — | 0.7859 |
| 2 | Search Index Performance Optimization | — | 0.7020 |
| 3 | Post-mortem: January 15, 2026 Production Outage | — | 0.7011 |

**Answer:**

Charlie Li ran the load testing in February 2026 using **k6 v0.50**.

**Verdict:** ✓

---

**chunked@150/50**
_1305ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #1 | 0.7989 |
| 2 | Load Testing Report — February 2026 | #0 | 0.7970 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7931 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7044 |
| 5 | API Rate Limiting — Design & Implementation | #2 | 0.7025 |
| 6 | Q1 Sprint Planning & Roadmap Review | #2 | 0.6998 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.6971 |
| 8 | Search Index Performance Optimization | #0 | 0.6971 |

**Answer:**

Charlie Li ran the load test using k6 v0.50.

**Verdict:** ✓ — also includes exact date (Feb 12), bonus detail

---

**chunked@150/25**
_1790ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.7970 |
| 2 | Load Testing Report — February 2026 | #1 | 0.7831 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7828 |
| 4 | Search Index Performance Optimization | #2 | 0.7039 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7033 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7006 |
| 7 | Search Index Performance Optimization | #0 | 0.6971 |
| 8 | Q1 Security Audit — External Review | #0 | 0.6962 |

**Answer:**

Charlie Li ran the load testing in February 2026 using k6 v0.50.

**Verdict:** ✓

---

**hybrid@150/50**
_1651ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.0315 |
| 2 | Load Testing Report — February 2026 | #1 | 0.0299 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0294 |
| 4 | Load Testing Report — February 2026 | #2 | 0.0292 |
| 5 | Search Index Performance Optimization | #2 | 0.0260 |
| 6 | Code Review Standards & Team Guidelines | #1 | 0.0164 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.0161 |
| 8 | Code Review Standards & Team Guidelines | #2 | 0.0159 |

**Answer:**

The load testing was run by **Charlie Li** using **k6 v0.50**.

**Verdict:** ✓

---

**hybrid@150/25**
_1576ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.0323 |
| 2 | Search Index Performance Optimization | #2 | 0.0306 |
| 3 | Load Testing Report — February 2026 | #1 | 0.0304 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0297 |
| 5 | Load Testing Report — February 2026 | #2 | 0.0289 |
| 6 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0266 |
| 7 | Code Review Standards & Team Guidelines | #1 | 0.0164 |
| 8 | Atlas Core Service Registry — Technical Design | #0 | 0.0161 |

**Answer:**

Charlie Li ran the load testing in February using k6 v0.50.

**Verdict:** ✓

---


### C2 — Person attribution 🚫

**Expected behavior:** `unanswerable`

**Query:**
> Who identified the root cause of the auth token expiry bug and when?

**Ground truth:**
> The root cause was identified on January 19, 2026. Bob Chen was assigned as the primary investigator on January 16, 2026. The seed does not explicitly state who identified the root cause — only that Bob was the lead investigator.

**Expected tasks:** Auth Token Expiry Bug — Investigation & Fix

**Note — prompt sensitivity observation**

When the query was repeated with the addition of "be skeptical with the role", the AI produced a qualitatively different and more accurate response:

> "The context states Bob Chen identified the root cause on January 19, 2026. However, being skeptical about the role description: the text says Bob Chen was assigned as the primary investigator, but it does not explicitly confirm he was the sole person who identified the root cause, nor does it describe his specific actions in the identification process. It only states the date he was assigned and the date root cause was identified. So while Bob Chen was the assigned investigator, the context does not definitively prove he personally made the discovery — the root cause may have been identified by someone else on the team, or through automated monitoring, even though Bob was the lead."

This response aligns exactly with what the ground truth says. Two implications:

- **RAG retrieval is not the problem here** — the correct information is in the context in all strategies. The failure is the LLM defaulting to confident attribution (assigned investigator = person who identified it) without being asked to reason carefully.
- **Prompt sensitivity, not RAG sensitivity** — the same retrieved context produces an overconfident wrong answer vs a correctly hedged answer depending solely on how the user phrases the question. The user should not need to say "be skeptical"; the system prompt should include an instruction such as "do not infer attribution beyond what is explicitly stated in the context" for this class of question to be handled correctly by default.

---

**fullcontext**
_2677ms_

Bob Chen identified the root cause of the auth token expiry bug on **January 19, 2026**.

**Verdict:** ~ — factually plausible but over-confident; seed states Bob was lead investigator, not explicitly who identified the root cause

---

**single**
_3345ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | — | 0.8456 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.7091 |
| 3 | Q1 Security Audit — External Review | — | 0.6901 |

**Answer:**

Bob Chen identified the root cause of the auth token expiry bug on January 19, 2026.

**Verdict:** ~ — same issue; no caveat on ambiguity

---

**chunked@150/50**
_3673ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.8470 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.8341 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.8320 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7127 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7099 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7059 |
| 7 | Q1 Security Audit — External Review | #1 | 0.7034 |
| 8 | Bug Triage Session — March 3, 2026 | #0 | 0.7028 |

**Answer:**

Bob Chen identified the root cause on January 19, 2026.

**Verdict:** ~ — same issue; no caveat on ambiguity

---

**chunked@150/25**
_1489ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.8470 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.8330 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.8273 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7127 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7113 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7099 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.7028 |
| 8 | Q1 Security Audit — External Review | #1 | 0.6968 |

**Answer:**

The root cause of the auth token expiry bug was identified on **January 19, 2026** by **Bob Chen**, the primary investigator assigned to the issue.

**Verdict:** ~ — same issue; no caveat on ambiguity

---

**hybrid@150/50**
_1999ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0328 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0317 |
| 3 | Bug Triage Session — March 3, 2026 | #0 | 0.0308 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0308 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0303 |
| 6 | PostgreSQL Schema Migration — v2.3 | #2 | 0.0284 |
| 7 | Q1 Security Audit — External Review | #1 | 0.0279 |
| 8 | Bug Triage Session — March 3, 2026 | #1 | 0.0269 |

**Answer:**

Bob Chen identified the root cause on January 19, 2026.

**Verdict:** ~ — same issue; no caveat on ambiguity

---

**hybrid@150/25**
_2204ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0328 |
| 2 | Bug Triage Session — March 3, 2026 | #0 | 0.0311 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0306 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0301 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0299 |
| 6 | Q1 Sprint Planning & Roadmap Review | #2 | 0.0292 |
| 7 | PostgreSQL Schema Migration — v2.3 | #2 | 0.0287 |
| 8 | PostgreSQL Schema Migration — v2.3 | #1 | 0.0284 |

**Answer:**

Bob Chen identified the root cause on January 19, 2026.

**Verdict:** ~ — same issue; no caveat on ambiguity

---


### C3 — Technical root cause 🎯

**Expected behavior:** `answerable`

**Query:**
> What was the root cause of the auth token expiry bug?

**Ground truth:**
> During the v2.1 deployment on December 14, 2025, an environment-variable rename broke the token TTL config: JWT_ACCESS_TTL_SECONDS was renamed to JWT_ACCESS_EXPIRATION_TTL in the codebase, but the production environment was not updated. The token-generation code then fell back to a hardcoded default of 300 seconds (5 minutes) with no warning log, so access tokens expired after 5 minutes instead of the configured 4 hours (14400 seconds).

**Expected tasks:** Auth Token Expiry Bug — Investigation & Fix

---

**fullcontext**
_2100ms_

The root cause of the auth token expiry bug was that during the v2.1 deployment on December 14, 2025, the environment variable `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase, but the production environment was not updated with this new variable. The token generation code fell back to a hardcoded default of 300 seconds (5 minutes) without any warning log, causing access tokens to expire after 5 minutes instead of the configured 4 hours.

**Verdict:** ✓

---

**single**
_2309ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | — | 0.8452 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.6912 |
| 3 | Q1 Security Audit — External Review | — | 0.6719 |

**Answer:**

The root cause of the auth token expiry bug was an environment variable rename that was not reflected in the production environment. During the v2.1 deployment on December 14, 2025, `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase, but the production environment was not updated. This caused the token generation code to fall back to a hardcoded default of 300 seconds (5 minutes) instead of the intended 4 hours (14400 seconds).

**Verdict:** ✓

---

**chunked@150/50**
_2037ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.8555 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.8448 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.8436 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7111 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7096 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7035 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.6922 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6870 |

**Answer:**

The root cause of the auth token expiry bug was that during the v2.1 deployment on December 14, 2025, an environment variable rename broke the token TTL configuration. The variable `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase, but the production environment was not updated. The token generation code then fell back to a hardcoded default of 300 seconds (5 minutes) without any warning log, causing users to be logged out after 5 minutes instead of the expected 4 hours.

**Verdict:** ✓ — most complete; also includes fix details

---

**chunked@150/25**
_1712ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.8555 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.8426 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.8423 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7111 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7064 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7044 |
| 7 | Bug Triage Session — March 3, 2026 | #0 | 0.6922 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6804 |

**Answer:**

The root cause was an environment variable rename during the v2.1 deployment on December 14, 2025. `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase, but the production environment was not updated. The token generation code then fell back to a hardcoded default of 300 seconds (5 minutes) without logging any warning.

**Verdict:** ✓

---

**hybrid@150/50**
_1966ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0328 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0323 |
| 3 | Bug Triage Session — March 3, 2026 | #0 | 0.0308 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0308 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0303 |
| 6 | PostgreSQL Schema Migration — v2.3 | #2 | 0.0289 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.0285 |
| 8 | Q1 Security Audit — External Review | #1 | 0.0284 |

**Answer:**

The root cause was a mismatched environment variable name. During the v2.1 deployment on December 14, 2025, `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the codebase, but the production environment was not updated. The token generation code silently fell back to a hardcoded default of 300 seconds (5 minutes) instead of the intended 4 hours.

**Verdict:** ✓

---

**hybrid@150/25**
_2059ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0328 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0308 |
| 3 | Bug Triage Session — March 3, 2026 | #0 | 0.0308 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0303 |
| 5 | Q1 Sprint Planning & Roadmap Review | #2 | 0.0293 |
| 6 | PostgreSQL Schema Migration — v2.3 | #2 | 0.0293 |
| 7 | PostgreSQL Schema Migration — v2.3 | #1 | 0.0287 |
| 8 | Q1 Security Audit — External Review | #1 | 0.0280 |

**Answer:**

The root cause of the auth token expiry bug was a mismatch between the environment variable name used in the codebase and the one set in production. Specifically, during the v2.1 deployment on December 14, 2025, the environment variable `JWT_ACCESS_TTL_SECONDS` was renamed to `JWT_ACCESS_EXPIRATION_TTL` in the code, but the production environment was not updated. This caused the token generation code to fall back to a hardcoded default of 300 seconds (5 minutes) without any warning.

**Verdict:** ✓

---


### D1 — Multi-chunk within one task 📋

**Expected behavior:** `summary`

**Query:**
> Walk me through the full timeline of the January 15 outage from alert to full recovery.

**Ground truth:**
> Timeline (all times PST, January 15, 2026): 10:05 AM — the triggering deploy was released. 10:12 AM — the first PagerDuty alert fired (Sentry fatal error spike); start of the outage. 10:15 AM — Alice Wang acknowledged the alert and began investigating. 10:20 AM — Alice confirmed the API pods were crashlooping in Kubernetes (logs showed 'Error: Cannot find module ../config/db'). 10:25 AM — Alice identified that the 10:05 AM deploy included a file rename not reflected in an import path. 10:30 AM — Alice reverted the deploy via the rollback workflow. 10:38 AM — rollback completed, but the API did not recover because Kubernetes readiness probes were still failing for old pods. 10:40 AM — Bob joined and identified the stuck pods. 11:15 AM — manual pod restart was performed. 11:22 AM — the API recovered but with degraded performance (P95 = 1,200ms) due to cache warming. 12:52 PM — full recovery; P95 returned to baseline (< 200ms) as caches warmed. Total user-visible downtime was 2 hours 40 minutes (10:12 AM – 12:52 PM); cache degradation lasted an additional 90 minutes. The metrics-collector fix (PR #181) was merged and deployed at 2:30 PM with no incident.

**Expected tasks:** Post-mortem: January 15, 2026 Production Outage

---

**fullcontext**
_3509ms_

Here is the full timeline of the January 15, 2026 production outage:

- **10:05 AM PST** — The January 15 deploy was released. It included a file rename (`src/config/database.js` → `src/config/db.js`) but a corresponding import in `src/workers/metrics-collector.js` was missed. The CI pipeline passed because the metrics collector is not imported in the test environment.
- **10:12 AM PST** — First PagerDuty alert fired (Sentry fatal error spike). API unavailable (all requests returned HTTP 502). Developer portal partially available (static pages loaded, dynamic content failed).
- **10:15 AM PST** — Alice Wang acknowledged the alert and began investigation.
- **10:20 AM PST** — Alice confirmed the API pods were crashlooping in Kubernetes; logs showed `Error: Cannot find module '../config/db'`.
- **10:25 AM PST** — Alice identified the root cause: the missed import in the metrics collector worker.
- **10:30 AM PST** — Alice triggered the rollback workflow.
- **10:38 AM PST** — Rollback completed, but the API did not recover because Kubernetes readiness probes were still failing for old pods.
- **10:40 AM PST** — Bob Chen joined and identified the stuck pods.
- **11:15 AM PST** — Manual pod restart was performed.
- **11:22 AM PST** — API recovered but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM PST** — Full recovery: P95 latency returned to baseline (< 200ms). Cache warming took an additional 90 minutes beyond the outage window.
- **2:30 PM PST** — The permanent fix (PR #181, correct import) was merged and deployed with no incident.

**Total user-visible downtime: 2 hours 40 minutes** (10:12 AM – 12:52 PM PST). Approximately 340 users were impacted.

**Verdict:** ✓
---

**single**
_3118ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | — | 0.7835 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | — | 0.7045 |
| 3 | Sentry Error Monitoring — Configuration & Alerting | — | 0.6888 |

**Answer:**

Here is the full timeline of the January 15, 2026 production outage, from first alert to full recovery:

- **10:12 AM PST** — First PagerDuty alert fired (Sentry fatal error spike).
- **10:15 AM PST** — Alice Wang acknowledged the alert and began investigation.
- **10:20 AM PST** — Alice confirmed the API pods were crashlooping in Kubernetes; logs showed `Error: Cannot find module '../config/db'`.
- **10:25 AM PST** — Alice identified the root cause: the January 15 deploy (released at 10:05 AM) included a file rename (`src/config/database.js` → `src/config/db.js`) that was not reflected in the import in `src/workers/metrics-collector.js`.
- **10:30 AM PST** — Alice triggered the rollback workflow.
- **10:38 AM PST** — Rollback completed, but the API did not recover because Kubernetes readiness probes were still failing for old pods.
- **10:40 AM PST** — Bob Chen joined and identified the stuck pods.
- **11:15 AM PST** — Manual pod restart performed.
- **11:22 AM PST** — API recovered but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM PST** — Full recovery: P95 latency returned to baseline (< 200ms) as caches finished warming.

Total user-visible downtime: **2 hours 40 minutes** (10:12 AM – 12:52 PM PST). Cache degradation lasted an additional 90 minutes after the API was restored.

**Verdict:** ~ · non-deterministic — run 1: missing 10:05 AM deploy event and 2:30 PM PR #181 fix deployment; run 2: complete, all events including 10:05 AM and 2:30 PM present; same retrieved context (whole task as one unit), pure LLM attention variation over long input

---

**chunked@150/50**
_3319ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7796 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7646 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7640 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7614 |
| 5 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.6933 |
| 6 | Q2 Stakeholder Demo Preparation | #3 | 0.6900 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6805 |
| 8 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6799 |

**Answer:**

Here is the full timeline of the January 15, 2026 production outage:

- **10:05 AM** — January 15 deploy released, containing PR #178 which renamed `src/config/database.js` to `src/config/db.js` but missed updating the import in `src/workers/metrics-collector.js`.
- **10:12 AM** — First PagerDuty alert fires (Sentry fatal error spike). All API requests return HTTP 502.
- **10:15 AM** — Alice Wang acknowledges the alert and begins investigation.
- **10:20 AM** — Alice confirms API pods are crashlooping in Kubernetes; logs show `Error: Cannot find module '../config/db'`.
- **10:25 AM** — Alice identifies the root cause: the missed import in the metrics collector.
- **10:30 AM** — Alice triggers the rollback workflow.
- **10:38 AM** — Rollback completes, but the API does not recover because Kubernetes readiness probes are still failing for old pods.
- **10:40 AM** — Bob Chen joins and identifies the stuck pods.
- **11:15 AM** — Manual pod restart is performed.
- **11:22 AM** — API recovers but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM PST** — Full recovery: P95 latency returns to baseline (< 200ms) as caches warm.
- **2:30 PM PST** — The metrics collector fix (PR #181) is merged and deployed with no incident.

**Total user-visible downtime: 2 hours 40 minutes** (10:12 AM – 12:52 PM). Cache degradation lasted an additional 90 minutes. Approximately 340 users were impacted.

**Verdict:** ✓
---

**chunked@150/25**
_3423ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7797 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7699 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7649 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7646 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6961 |
| 6 | Sentry Error Monitoring — Configuration & Alerting | #1 | 0.6828 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6805 |
| 8 | Q2 Stakeholder Demo Preparation | #2 | 0.6777 |

**Answer:**

Here's the full timeline of the January 15, 2026 production outage:

- **10:05 AM PST** — The January 15 deploy is released.
- **10:12 AM PST** — First PagerDuty alert fires (Sentry fatal error spike). API becomes unavailable — all requests return HTTP 502.
- **10:15 AM PST** — Alice Wang acknowledges the alert and begins investigation.
- **10:20 AM PST** — Alice confirms API pods are crashlooping in Kubernetes; logs show `Error: Cannot find module '../config/db'`.
- **10:25 AM PST** — Alice identifies the root cause: PR #178 renamed `src/config/database.js` to `src/config/db.js`, but the import in `src/workers/metrics-collector.js` was missed. The CI pipeline passed because the metrics collector is not imported in the test environment.
- **10:30 AM PST** — Alice triggers the rollback workflow.
- **10:38 AM PST** — Rollback completes, but the API does not recover because Kubernetes readiness probes are still failing for old pods.
- **10:40 AM PST** — Bob Chen joins and identifies the stuck pods.
- **11:15 AM PST** — Manual pod restart is performed.
- **11:22 AM PST** — API recovers but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM PST** — Full recovery: P95 latency returns to baseline (< 200ms) as caches warm.
- **2:30 PM PST** — The metrics collector fix (PR #181) is merged and deployed with no incident.

**Total user-visible downtime: 2 hours 40 minutes (10:12 AM – 12:52 PM).** Cache degradation lasted an additional 90 minutes. Approximately 340 users were impacted.

**Verdict:** ✓
---

**hybrid@150/50**
_3670ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0323 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0318 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0306 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.0304 |
| 5 | Q2 Stakeholder Demo Preparation | #3 | 0.0303 |
| 6 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.0293 |
| 7 | Search Index Performance Optimization | #2 | 0.0282 |
| 8 | Atlas Core Service Registry — Technical Design | #10 | 0.0278 |

**Answer:**

Here is the full timeline of the **January 15, 2026** production outage:

- **10:05 AM**: The January 15 deploy was released. It included a file rename (`src/config/database.js` → `src/config/db.js`) but the import in `src/workers/metrics-collector.js` was not updated.
- **10:12 AM**: First PagerDuty alert fired (Sentry fatal error spike). API became unavailable, returning HTTP 502 for all requests.
- **10:15 AM**: **Alice Wang** acknowledged the alert and began investigation.
- **10:20 AM**: Alice confirmed API pods were crashlooping in Kubernetes; logs showed `Error: Cannot find module '../config/db'`.
- **10:25 AM**: Alice identified the root cause — the missing import update in the metrics collector.
- **10:30 AM**: Alice triggered the rollback workflow.
- **10:38 AM**: Rollback completed, but the API did not recover because Kubernetes readiness probes were still failing for old pods.
- **10:40 AM**: **Bob Chen** joined and identified the stuck pods.
- **11:15 AM**: Manual pod restart was performed.
- **11:22 AM**: API recovered, but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM**: Full recovery — P95 latency returned to baseline (< 200ms) as caches warmed. Total user-visible downtime: 2 hours 40 minutes. Cache degradation lasted an additional 90 minutes.

**Post-recovery fix**: The metrics collector fix (PR #181) was merged and deployed at **2:30 PM PST** with no further incident.

**Verdict:** ✓
---

**hybrid@150/25**
_3203ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0318 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0318 |
| 3 | Q2 Stakeholder Demo Preparation | #2 | 0.0306 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0300 |
| 5 | Search Index Performance Optimization | #0 | 0.0291 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.0290 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0290 |
| 8 | Sentry Error Monitoring — Configuration & Alerting | #1 | 0.0285 |

**Answer:**

Here is the full timeline of the January 15, 2026 outage, from initial alert to full recovery:

- **10:05 AM** — The January 15 deploy was released.
- **10:12 AM** — First PagerDuty alert fires (Sentry fatal error spike). API becomes unavailable, returning HTTP 502.
- **10:15 AM** — Alice Wang acknowledges the alert and begins investigation.
- **10:20 AM** — Alice confirms the API pods are crashlooping in Kubernetes; logs show `Error: Cannot find module '../config/db'`.
- **10:25 AM** — Alice identifies root cause: PR #178 renamed `src/config/database.js` to `src/config/db.js`. The import in `src/workers/metrics-collector.js` was not updated.
- **10:30 AM** — Alice triggers the rollback workflow.
- **10:38 AM** — Rollback completes, but API does not recover because Kubernetes readiness probes are still failing for old pods.
- **10:40 AM** — Bob Chen joins the investigation and identifies the stuck pods.
- **11:15 AM** — Manual pod restart is performed.
- **11:22 AM** — API recovers, but with degraded performance (P95 = 1,200ms) due to cache warming.
- **12:52 PM** — Full recovery: P95 latency returns to baseline (< 200ms) as caches warm.
- **2:30 PM** — The metrics collector fix (PR #181) is merged and deployed with no incident.

**Total user-visible downtime:** 10:12 AM – 12:52 PM PST (2 hours 40 minutes). Cache degradation lasted an additional 90 minutes.

**Verdict:** ✓
---

### D2 — Multi-chunk within one task 📋

**Expected behavior:** `summary`

**Query:**
> What action items came out of the January 15 outage post-mortem?

**Ground truth:**
> All action items were assigned and completed by January 23, 2026: (1) Alice — add 'node --check' to the CI pipeline for all entry-point files (done January 16, PR #182); (2) Bob — add the metrics collector to the integration-test startup (done January 18, PR #184); (3) Alice — update the rollback runbook with explicit pod-restart steps (done January 20); (4) Charlie — add a Grafana alert for crashlooping pods (done January 17); (5) all — retrospective meeting held January 20 at 2:00 PM PST, with notes published to Confluence.

**Expected tasks:** Post-mortem: January 15, 2026 Production Outage

---

**fullcontext**
_2517ms_

Based on the post-mortem documentation for the January 15, 2026 production outage, the following five action items were identified and all completed by January 23, 2026:

1. **Alice Wang** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182).
2. **Bob Chen** — Add the metrics collector to the integration test startup (done January 18, PR #184).
3. **Alice Wang** — Update the rollback runbook with explicit pod restart steps (done January 20).
4. **Charlie Li** — Add a Grafana alert for crashlooping pods (done January 17).
5. **All** — Hold a retrospective meeting (held January 20 at 2:00 PM PST, notes published to Confluence).

**Verdict:** ✓
---

**single**
_2319ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | — | 0.8141 |
| 2 | Bug Triage Session — March 3, 2026 | — | 0.7468 |
| 3 | Q1 Sprint Planning & Roadmap Review | — | 0.7338 |

**Answer:**

Based on the post-mortem document, the action items (all assigned and completed by January 23, 2026) were:

1. **Alice** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182)
2. **Bob** — Add the metrics collector to the integration test startup (done January 18, PR #184)
3. **Alice** — Update the rollback runbook with explicit pod restart steps (done January 20)
4. **Charlie** — Add a Grafana alert for crashlooping pods (done January 17)
5. **All** — Retrospective meeting held January 20 at 2:00 PM PST, notes published to Confluence

**Verdict:** ✓
---

**chunked@150/50**
_2159ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.8044 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.8018 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7887 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7853 |
| 5 | Bug Triage Session — March 3, 2026 | #2 | 0.7375 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.7360 |
| 7 | Bug Triage Session — March 3, 2026 | #1 | 0.7342 |
| 8 | Q1 Sprint Planning & Roadmap Review | #0 | 0.7264 |

**Answer:**

Based on the post-mortem document, the following action items were assigned and completed:

1. **Alice** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182)
2. **Bob** — Add the metrics collector to the integration test startup (done January 18, PR #184)
3. **Alice** — Update the rollback runbook with explicit pod restart steps (done January 20)
4. **Charlie** — Add a Grafana alert for crashlooping pods (done January 17)
5. **All** — Retrospective meeting held January 20 at 2:00 PM PST, notes published to Confluence

**Verdict:** ✓
---

**chunked@150/25**
_2314ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.8137 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.8130 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.8028 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7887 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.7380 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.7360 |
| 7 | Search Index Performance Optimization | #2 | 0.7351 |
| 8 | Bug Triage Session — March 3, 2026 | #2 | 0.7286 |

**Answer:**

Based on the post-mortem document, the action items from the January 15, 2026 production outage were:

1. **Alice** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182)
2. **Bob** — Add the metrics collector to the integration test startup (done January 18, PR #184)
3. **Alice** — Update the rollback runbook with explicit pod restart steps (done January 20)
4. **Charlie** — Add a Grafana alert for crashlooping pods (done January 17)
5. **All** — Retrospective meeting held January 20 at 2:00 PM PST, notes published to Confluence

All items were completed by January 23, 2026.

**Verdict:** ✓
---

**hybrid@150/50**
_2460ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.0315 |
| 2 | Bug Triage Session — March 3, 2026 | #2 | 0.0303 |
| 3 | Q2 Stakeholder Demo Preparation | #3 | 0.0299 |
| 4 | Search Index Performance Optimization | #2 | 0.0297 |
| 5 | Q1 Sprint Planning & Roadmap Review | #1 | 0.0293 |
| 6 | Search Index Performance Optimization | #1 | 0.0265 |
| 7 | Q1 Security Audit — External Review | #0 | 0.0262 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0161 |

**Answer:**

Based on the context, the action items from the January 15, 2026 production outage post-mortem were:

1. **Alice** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182)
2. **Bob** — Add the metrics collector to the integration test startup (done January 18, PR #184)
3. **Alice** — Update the rollback runbook with explicit pod restart steps (done January 20)
4. **Charlie** — Add a Grafana alert for crashlooping pods (done January 17)
5. **All** — Retrospective meeting held January 20 at 2:00 PM PST, notes published to Confluence

All action items were reported as completed by January 23, 2026.

**Verdict:** ✓
---

**hybrid@150/25**
_2154ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0308 |
| 2 | Search Index Performance Optimization | #2 | 0.0308 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.0306 |
| 4 | Bug Triage Session — March 3, 2026 | #2 | 0.0301 |
| 5 | Q1 Sprint Planning & Roadmap Review | #1 | 0.0294 |
| 6 | Search Index Performance Optimization | #1 | 0.0291 |
| 7 | Q1 Security Audit — External Review | #0 | 0.0269 |
| 8 | Code Review Standards & Team Guidelines | #1 | 0.0263 |

**Answer:**

Based on the post-mortem excerpt, the action items (all assigned and completed by January 23, 2026) were:

1. **Alice** — Add `node --check` to CI pipeline for all entry point files (done January 16, PR #182)
2. **Bob** — Add the metrics collector to the integration test startup

**Verdict:** ~ · retrieval miss, not truncation — Post-mortem chunk#2 retrieved contains the recovery section, not the action items section; action items chunk not in top-8; model listed exactly the 2 items visible in context and correctly noted "based on the post-mortem excerpt" signalling partial content — inference did its best given what was retrieved
---


### D3 — Multi-chunk within one task 📋

**Expected behavior:** `summary`

**Query:**
> What was Marcus Chen's schedule on his first day and what issue did he run into with Docker?

**Ground truth:**
> Marcus's Day 1 schedule (February 1, 2026): 9:00 AM — welcome call with Alice and Bob; 10:00 AM — HR orientation (30 min); 11:00 AM — dev-environment setup session with Bob (estimated 2 hours); 2:00 PM — codebase walkthrough with Charlie; 4:00 PM — end-of-day check-in with Alice. Docker issue: the local Docker Compose setup for the test database required Docker Desktop 4.28+, but his laptop shipped with 4.26; Bob then updated CONTRIBUTING.md to add the minimum Docker Desktop version requirement. (Dev-environment setup was completed by 1:15 PM.)

**Expected tasks:** New Engineer Onboarding — Marcus Chen

---

**fullcontext**
_2101ms_

Based on the onboarding notes for Marcus Chen:

**First day schedule (February 1, 2026):**
- 9:00 AM — Welcome call with Alice and Bob
- 10:00 AM — HR orientation (30 minutes)
- 11:00 AM — Dev environment setup session with Bob (estimated 2 hours)
- 2:00 PM — Codebase walkthrough with Charlie
- 4:00 PM — End-of-day check-in with Alice

**Docker issue:**
The local Docker Compose setup for the test database required Docker Desktop 4.28+, but Marcus's laptop shipped with Docker Desktop 4.26. Bob updated the `CONTRIBUTING.md` to add the minimum Docker Desktop version requirement.

**Verdict:** ✓

---

**single**
_2464ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | — | 0.7920 |
| 2 | Post-mortem: January 15, 2026 Production Outage | — | 0.6748 |
| 3 | Bug Triage Session — March 3, 2026 | — | 0.6735 |

**Answer:**

Based on the context, on his first day (February 1, 2026), Marcus Chen's schedule was:

- **9:00 AM** — Welcome call with Alice and Bob
- **10:00 AM** — HR orientation (30 min)
- **11:00 AM** — Dev environment setup session with Bob (estimated 2 hours)
- **2:00 PM** — Codebase walkthrough with Charlie
- **4:00 PM** — End-of-day check-in with Alice

**Docker issue:** Marcus's laptop shipped with **Docker Desktop 4.26**, but the local Docker Compose setup for the test database required **Docker Desktop 4.28+**. Bob resolved this by updating the `CONTRIBUTING.md` to add the minimum Docker Desktop version requirement. The dev environment setup was completed by 1:15 PM.

**Verdict:** ✓

---

**chunked@150/50**
_2208ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #1 | 0.8133 |
| 2 | New Engineer Onboarding — Marcus Chen | #0 | 0.7978 |
| 3 | New Engineer Onboarding — Marcus Chen | #2 | 0.7832 |
| 4 | Bug Triage Session — March 3, 2026 | #1 | 0.6985 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.6897 |
| 6 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6703 |
| 7 | Atlas Core Service Registry — Technical Design | #6 | 0.6692 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6682 |

**Answer:**

Based on the context, Marcus Chen's first-day schedule on February 1, 2026, was:

- **9:00 AM** — Welcome call with Alice and Bob
- **10:00 AM** — HR orientation (30 min)
- **11:00 AM** — Dev environment setup session with Bob (estimated 2 hours)
- **2:00 PM** — Codebase walkthrough with Charlie
- **4:00 PM** — End-of-day check-in with Alice

**Docker issue:** Marcus's laptop shipped with Docker Desktop version **4.26**, but the local Docker Compose setup for the test database required **Docker Desktop 4.28+**. Bob updated the `CONTRIBUTING.md` to add the minimum Docker Desktop version requirement.

**Verdict:** ✓

---

**chunked@150/25**
_2183ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #1 | 0.8098 |
| 2 | New Engineer Onboarding — Marcus Chen | #0 | 0.7978 |
| 3 | New Engineer Onboarding — Marcus Chen | #2 | 0.7900 |
| 4 | Bug Triage Session — March 3, 2026 | #0 | 0.6897 |
| 5 | Atlas Core Service Registry — Technical Design | #5 | 0.6726 |
| 6 | Bug Triage Session — March 3, 2026 | #1 | 0.6706 |
| 7 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6703 |
| 8 | Frontend Design System — Initial Setup | #2 | 0.6664 |

**Answer:**

Based on the context, Marcus Chen's first day schedule on February 1, 2026 was:

- 9:00 AM — Welcome call with Alice and Bob
- 10:00 AM — HR orientation (30 min)
- 11:00 AM — Dev environment setup session with Bob (estimated 2 hours)
- 2:00 PM — Codebase walkthrough with Charlie
- 4:00 PM — End-of-day check-in with Alice

The Docker issue: Marcus's laptop shipped with Docker Desktop 4.26, but the local Docker Compose setup for the test database required Docker Desktop 4.28+. Bob updated the `CONTRIBUTING.md` to add the minimum Docker Desktop version requirement. The dev environment setup was completed by 1:15 PM despite the issue.

**Verdict:** ✓

---

**hybrid@150/50**
_2570ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #1 | 0.0328 |
| 2 | New Engineer Onboarding — Marcus Chen | #0 | 0.0323 |
| 3 | New Engineer Onboarding — Marcus Chen | #2 | 0.0313 |
| 4 | Code Review Standards & Team Guidelines | #0 | 0.0304 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0295 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.0284 |
| 7 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.0283 |
| 8 | Atlas Core Service Registry — Technical Design | #0 | 0.0280 |

**Answer:**

Based on the context, Marcus Chen's first day schedule on February 1, 2026 was:
- 9:00 AM — welcome call with Alice and Bob
- 10:00 AM — HR orientation (30 min)
- 11:00 AM — dev environment setup session with Bob
- 2:00 PM — codebase walkthrough with Charlie
- 4:00 PM — end-of-day check-in with Alice

The Docker issue he ran into: his laptop shipped with Docker Desktop version 4.26, but the local Docker Compose setup for the test database required version 4.28 or higher. Bob updated the `CONTRIBUTING.md` file to add the minimum Docker Desktop version requirement as a result.

**Verdict:** ✓

---

**hybrid@150/25**
_2316ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #1 | 0.0325 |
| 2 | New Engineer Onboarding — Marcus Chen | #0 | 0.0325 |
| 3 | Code Review Standards & Team Guidelines | #0 | 0.0304 |
| 4 | Bug Triage Session — March 3, 2026 | #1 | 0.0301 |
| 5 | New Engineer Onboarding — Marcus Chen | #2 | 0.0300 |
| 6 | Bug Triage Session — March 3, 2026 | #0 | 0.0293 |
| 7 | Atlas Core Service Registry — Technical Design | #0 | 0.0284 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0274 |

**Answer:**

Based on the context, Marcus Chen's first day schedule (February 1, 2026) was:

- 9:00 AM — welcome call with Alice and Bob
- 10:00 AM — HR orientation (30 min)
- 11:00 AM — dev environment setup session with Bob (estimated 2 hours)
- 2:00 PM — codebase walkthrough with Charlie
- 4:00 PM — end-of-day check-in with Alice

The Docker issue: Marcus's laptop shipped with Docker Desktop 4.26, but the local Docker Compose setup for the test database required Docker Desktop 4.28+. This was resolved by Bob updating `CONTRIBUTING.md` to add the minimum version requirement.

**Verdict:** ✓

---


### D4 — Multi-chunk within one task 📋

**Expected behavior:** `summary`

**Query:**
> What were the load test results and what bottlenecks were found?

**Ground truth:**
> Load test results (k6 v0.50, February 12, 2026, against staging): Steady load (200 users) — P50 = 45ms, P95 = 180ms, P99 = 320ms; throughput 1,240 req/s; error rate 0.02%. Ramp-up (500 users) — P50 = 88ms, P95 = 410ms, P99 = 780ms; throughput 2,890 req/s; error rate 0.08%; /api/search degraded first (P95 1,100ms). Spike (800 users) — P99 reached 4,200ms and error rate hit 2.3% (HTTP 503) in first 30s; after 45s auto-scaling launched a third server and P99 returned to 820ms. Bottlenecks: (1) search endpoint degrades first (partially addressed by Redis query cache, Feb 3); (2) auto-scaling took 45s to respond (minimum instance count raised from 2 to 3); (3) RDS connection pool exhausted during spike (max_connections=100, peak 97; pool size increased to 150). CPU metrics are supporting detail, not required.

**Expected tasks:** Load Testing Report — February 2026

---

**fullcontext**
_3733ms_

## Load Test Results (February 12, 2026)

### Steady Load (200 concurrent users)
- P50: 45ms, P95: 180ms, P99: 320ms
- Throughput: 1,240 req/s
- Error rate: 0.02%
- CPU: app servers avg 34%, RDS avg 18%

### Ramp-up (0→500 concurrent users)
- P50: 88ms, P95: 410ms, P99: 780ms
- Throughput: 2,890 req/s
- Error rate: 0.08%
- App server CPU peaked at 78%
- Search endpoint degraded first (P95 reached 1,100ms at peak)

### Spike Test (sudden jump to 800 users)
- P99 hit 4,200ms in first 30 seconds
- Error rate spiked to 2.3% (HTTP 503)
- Auto-scaling launched a third server after 45 seconds, stabilizing P99 to 820ms

## Bottlenecks Found & Remediation

| Bottleneck | Fix | Status |
|---|---|---|
| **Search endpoint** degrades first under load | Redis query cache for top-20 frequent searches (added Feb 3) | ✅ Implemented |
| **Auto-scaling** took 45 seconds to respond | Minimum app server count raised from 2 → 3 (Feb 25) | ✅ Implemented |
| **RDS connection pool** exhaustion (max_connections=100, peak usage 97) | Pool size increased to 150 (Feb 22) | ✅ Implemented |
| Database read load from session queries | ElastiCache enabled for session storage (scheduled March 5) | 🔜 Scheduled |

Next load test is planned for April 15, 2026.

**Verdict:** ✓

---

**single**
_2912ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | — | 0.7921 |
| 2 | Search Index Performance Optimization | — | 0.7092 |
| 3 | Post-mortem: January 15, 2026 Production Outage | — | 0.6843 |

**Answer:**

Based on the "Load Testing Report — February 2026" document, here are the key results and bottlenecks:

**Test Results**
- **Steady load (200 users):** P50 = 45ms, P95 = 180ms, P99 = 320ms. Throughput: 1,240 req/s. Error rate: 0.02%. All metrics within acceptable range.
- **Ramp-up (500 users):** P50 = 88ms, P95 = 410ms, P99 = 780ms. Throughput: 2,890 req/s. The `/api/search` endpoint degraded first (P95 reached 1,100ms at peak).
- **Spike (800 users):** P99 spiked to 4,200ms and error rate hit 2.3% (HTTP 503) in the first 30 seconds. After 45 seconds, auto-scaling launched a third app server and P99 stabilized to 820ms.

**Bottlenecks Identified**
1. **Search endpoint** — first to degrade under load (partially addressed by Redis query cache on Feb 3).
2. **Auto-scaling group** — took 45 seconds to respond to the spike. Minimum instance count raised from 2 to 3 (done Feb 25).
3. **RDS connection pool** — exhausted during spike (max_connections = 100, peak usage 97). Pool size increased to 150 (done Feb 22).

All recommendations were implemented before the March launch, and the next load test is planned for April 15, 2026.

**Verdict:** ✓

---

**chunked@150/50**
_3882ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #1 | 0.7986 |
| 2 | Load Testing Report — February 2026 | #0 | 0.7979 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7931 |
| 4 | Search Index Performance Optimization | #0 | 0.7020 |
| 5 | Search Index Performance Optimization | #2 | 0.6975 |
| 6 | Search Index Performance Optimization | #1 | 0.6967 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6918 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.6828 |

**Answer:**

## Load Test Results

The load test was conducted on **February 12, 2026** by Charlie Li using k6 v0.50 against the staging environment.

### Steady Load (200 concurrent users, 10 min)
| Metric | Value |
|--------|-------|
| P50 | 45ms |
| P95 | 180ms |
| P99 | 320ms |
| Throughput | 1,240 req/s |
| Error rate | 0.02% |
| App server CPU | avg 34%, peak 51% |
| RDS CPU | avg 18%, peak 27% |

### Ramp-up (500 concurrent users)
| Metric | Value |
|--------|-------|
| P50 | 88ms |
| P95 | 410ms |
| P99 | 780ms |
| Throughput | 2,890 req/s |
| Error rate | 0.08% |
| App server CPU | peak 78% |
| RDS CPU | peak 52% |

### Spike Test (50 → 800 concurrent users)
- First 30 seconds: P99 hit **4,200ms**, error rate spiked to **2.3%** (HTTP 503)
- After 45 seconds (auto-scaling launched 3rd server): P99 returned to **820ms**

## Bottlenecks Found
1. **Search endpoint (`/api/search`)** — first to degrade under load (P95 reached 1,100ms at peak)
2. **Auto-scaling lag** — 45 seconds to respond to the spike
3. **RDS connection pool exhaustion** — max_connections=100, peak usage=97 during spike

## Actions Taken
- Redis query cache added (Feb 3, partially addressed search degradation)
- Minimum app server count raised from 2→3 (done Feb 25)
- RDS connection pool increased to 150 (done Feb 22)
- ElastiCache for session storage scheduled for March 5

**Verdict:** ✓

---

**chunked@150/25**
_3631ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.7979 |
| 2 | Load Testing Report — February 2026 | #1 | 0.7965 |
| 3 | Load Testing Report — February 2026 | #2 | 0.7815 |
| 4 | Search Index Performance Optimization | #2 | 0.7121 |
| 5 | Search Index Performance Optimization | #0 | 0.7020 |
| 6 | Search Index Performance Optimization | #1 | 0.7015 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.6996 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.6874 |

**Answer:**

Based on the "Load Testing Report — February 2026" and related tasks, here are the results and bottlenecks found:

**Load Test Results (February 12, 2026, against staging):**
- **Steady load (200 users):** P50 = 45ms, P95 = 180ms, P99 = 320ms. Throughput: 1,240 req/s. Error rate: 0.02%.
- **Ramp-up (500 users):** P50 = 88ms, P95 = 410ms, P99 = 780ms. Throughput: 2,890 req/s. Error rate: 0.08%. The `/api/search` endpoint degraded first, with P95 reaching 1,100ms.
- **Spike (800 users):** P99 spiked to 4,200ms with a 2.3% error rate (HTTP 503) in the first 30 seconds. After auto-scaling kicked in, P99 stabilized at 820ms.

**Bottlenecks identified:**
1. **Search endpoint** was the first to degrade under load (partially addressed by the Redis query cache added on February 3).
2. **Auto-scaling group lag** — took 45 seconds to respond to the spike. Minimum instance count was raised from 2 to 3 (effective March 1).
3. **RDS connection pool exhaustion** — maximum 100 connections, peak usage hit 97 during the spike. Pool size was increased to 150 (done February 22).

**Remediated before March launch:**
- Raised minimum app server count to 3 (done February 25).
- Increased RDS connection pool to 150 (done February 22).
- Scheduled ElastiCache for session storage to reduce database reads (planned for March 5).

**Verdict:** ✓

---

**hybrid@150/50**
_3301ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #1 | 0.0328 |
| 2 | Load Testing Report — February 2026 | #0 | 0.0323 |
| 3 | Load Testing Report — February 2026 | #2 | 0.0317 |
| 4 | Search Index Performance Optimization | #0 | 0.0310 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0286 |
| 6 | Search Index Performance Optimization | #2 | 0.0282 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0271 |
| 8 | PostgreSQL Schema Migration — v2.3 | #2 | 0.0156 |

**Answer:**

Based on the load test report (conducted February 12, 2026 by Charlie Li on the staging environment), here are the results and bottlenecks:

**Test Scenarios & Results:**
- **Steady load (200 users):** P50 = 45ms, P95 = 180ms, P99 = 320ms. Throughput: 1,240 req/s. Error rate: 0.02%.
- **Ramp-up (500 users):** P50 = 88ms, P95 = 410ms, P99 = 780ms. Throughput: 2,890 req/s. Error rate: 0.08%. App server CPU peaked at 78%.
- **Spike (800 users):** P99 reached 4,200ms with a 2.3% error rate (HTTP 503) in the first 30 seconds. After 45 seconds, auto-scaling launched a third server and P99 dropped to 820ms.

**Bottlenecks Identified:**
1. **Search endpoint** — First to degrade under load (P95 hit 1,100ms at peak). Addressed by a Redis query cache (done February 3).
2. **Auto-scaling delay** — Took 45 seconds to respond to the spike. Minimum instance count raised from 2 to 3 (done February 25).
3. **RDS connection pool exhaustion** — Peak usage was 97 out of a max of 100. Pool size increased to 150 (done February 22).

**Verdict:** ✓

---

**hybrid@150/25**
_3329ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Load Testing Report — February 2026 | #0 | 0.0325 |
| 2 | Load Testing Report — February 2026 | #1 | 0.0325 |
| 3 | Search Index Performance Optimization | #0 | 0.0313 |
| 4 | Load Testing Report — February 2026 | #2 | 0.0300 |
| 5 | Search Index Performance Optimization | #2 | 0.0299 |
| 6 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0278 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0267 |
| 8 | Atlas Core Service Registry — Technical Design | #0 | 0.0156 |

**Answer:**

Based on the **Load Testing Report — February 2026**, here are the results and bottlenecks:

**Key Results:**
- **Steady load (200 users):** P50 = 45ms, P95 = 180ms, P99 = 320ms. Throughput: 1,240 req/s. Error rate: 0.02%.
- **Ramp-up (500 users):** P50 = 88ms, P95 = 410ms, P99 = 780ms. Throughput: 2,890 req/s. Error rate: 0.08%.
- **Spike (800 users):** P99 spiked to 4,200ms initially, error rate hit 2.3% (HTTP 503). Stabilized after auto-scaling launched a third server (P99 at 820ms).

**Bottlenecks Found:**
1. **Search endpoint degrades first** — The `/api/search` endpoint was the first to degrade (P95 reached 1,100ms at peak load).
2. **Slow auto-scaling response** — The auto-scaling group took 45 seconds to respond to the spike. **Fix:** Minimum instance count raised from 2 to 3 (done February 25).
3. **RDS connection pool exhaustion** — Max connections (100) nearly reached during the spike (peak 97). **Fix:** Pool size increased to 150 (done February 22).

**Verdict:** ✓

---


### F1 — Edge case — no content needed 🎯

**Expected behavior:** `answerable`

**Query:**
> Which tasks are currently in progress?

**Ground truth:**
> Six tasks have status 'inProgress': API Rate Limiting — Design & Implementation; Frontend Design System — Initial Setup; OpenAPI Documentation Rewrite; Mobile Responsive Redesign — Dashboard; Analytics Dashboard v2 — Design & Build; and Atlas Core Service Registry — Technical Design.

---

**fullcontext**
_2315ms_

Based on the provided context, the following tasks are currently **in progress**:

1. **API Rate Limiting — Design & Implementation** (high priority, due: Fri Feb 20 2026 - ⚠ OVERDUE)
2. **Frontend Design System — Initial Setup** (normal priority, due: Sun Mar 15 2026 - ⚠ OVERDUE)
3. **OpenAPI Documentation Rewrite** (normal priority, due: Tue Mar 31 2026 - ⚠ OVERDUE)
4. **Mobile Responsive Redesign — Dashboard** (normal priority, due: Wed Apr 01 2026 - ⚠ OVERDUE)
5. **Analytics Dashboard v2 — Design & Build** (normal priority, due: Fri May 01 2026 - ⚠ OVERDUE)
6. **Atlas Core Service Registry — Technical Design** (high priority, due: Tue Mar 31 2026 - ⚠ OVERDUE)

**Verdict:** ✓

---

**single**
_2226ms · 3 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Bug Triage Session — March 3, 2026 | — | 0.7074 |
| 2 | Q1 Sprint Planning & Roadmap Review | — | 0.6973 |
| 3 | Post-mortem: January 15, 2026 Production Outage | — | 0.6902 |

**Answer:**

Based on the task list provided, the following tasks are currently **in progress**:

1. **API Rate Limiting — Design & Implementation** (high priority, due Fri Feb 20 2026 ⚠ OVERDUE)
2. **Frontend Design System — Initial Setup** (normal priority, due Sun Mar 15 2026 ⚠ OVERDUE)
3. **OpenAPI Documentation Rewrite** (normal priority, due Tue Mar 31 2026 ⚠ OVERDUE)
4. **Mobile Responsive Redesign — Dashboard** (normal priority, due Wed Apr 01 2026 ⚠ OVERDUE)
5. **Analytics Dashboard v2 — Design & Build** (normal priority, due Fri May 01 2026 ⚠ OVERDUE)
6. **Atlas Core Service Registry — Technical Design** (high priority, due Tue Mar 31 2026 ⚠ OVERDUE)

All are currently marked as overdue.

**Verdict:** ✓

---

**chunked@150/50**
_2648ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Bug Triage Session — March 3, 2026 | #1 | 0.7136 |
| 2 | Bug Triage Session — March 3, 2026 | #2 | 0.7077 |
| 3 | Bug Triage Session — March 3, 2026 | #0 | 0.6974 |
| 4 | Q1 Sprint Planning & Roadmap Review | #2 | 0.6969 |
| 5 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6934 |
| 6 | Q1 Sprint Planning & Roadmap Review | #1 | 0.6871 |
| 7 | Production Deployment Runbook — Update | #0 | 0.6852 |
| 8 | Production Deployment Runbook — Update | #1 | 0.6818 |

**Answer:**

Based on the context, here are the tasks currently **in progress**:

1. **API Rate Limiting — Design & Implementation** (high priority, due: Fri Feb 20 2026 ⚠ OVERDUE)
2. **Frontend Design System — Initial Setup** (normal priority, due: Sun Mar 15 2026 ⚠ OVERDUE)
3. **OpenAPI Documentation Rewrite** (normal priority, due: Tue Mar 31 2026 ⚠ OVERDUE)
4. **Mobile Responsive Redesign — Dashboard** (normal priority, due: Wed Apr 01 2026 ⚠ OVERDUE)
5. **Analytics Dashboard v2 — Design & Build** (normal priority, due: Fri May 01 2026 ⚠ OVERDUE)
6. **Atlas Core Service Registry — Technical Design** (high priority, due: Tue Mar 31 2026 ⚠ OVERDUE)

**Verdict:** ✓

---

**chunked@150/25**
_1759ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Bug Triage Session — March 3, 2026 | #1 | 0.7058 |
| 2 | Q1 Sprint Planning & Roadmap Review | #2 | 0.7041 |
| 3 | Bug Triage Session — March 3, 2026 | #2 | 0.7019 |
| 4 | Q1 Sprint Planning & Roadmap Review | #1 | 0.7015 |
| 5 | Bug Triage Session — March 3, 2026 | #0 | 0.6974 |
| 6 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6934 |
| 7 | Atlas Core Service Registry — Technical Design | #5 | 0.6916 |
| 8 | Production Deployment Runbook — Update | #1 | 0.6867 |

**Answer:**

Based on the task overview, the following tasks are currently **in progress**:

1. **API Rate Limiting — Design & Implementation** [high priority]
2. **Frontend Design System — Initial Setup** [normal priority]
3. **OpenAPI Documentation Rewrite** [normal priority]
4. **Mobile Responsive Redesign — Dashboard** [normal priority]
5. **Analytics Dashboard v2 — Design & Build** [normal priority]
6. **Atlas Core Service Registry — Technical Design** [high priority]

**Verdict:** ✓

---

**hybrid@150/50**
_2369ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #10 | 0.0298 |
| 2 | Q1 Security Audit — External Review | #0 | 0.0280 |
| 3 | Production Deployment Runbook — Update | #1 | 0.0277 |
| 4 | OpenAPI Documentation Rewrite | #1 | 0.0267 |
| 5 | Mobile Responsive Redesign — Dashboard | #2 | 0.0264 |
| 6 | Bug Triage Session — March 3, 2026 | #1 | 0.0164 |
| 7 | Analytics Dashboard v2 — Design & Build | #1 | 0.0164 |
| 8 | Bug Triage Session — March 3, 2026 | #2 | 0.0161 |

**Answer:**

Based on the context, the following tasks are currently **in progress**:

1. **API Rate Limiting — Design & Implementation** (high priority, due Fri Feb 20 2026 — ⚠ OVERDUE)
2. **Frontend Design System — Initial Setup** (normal priority, due Sun Mar 15 2026 — ⚠ OVERDUE)
3. **OpenAPI Documentation Rewrite** (normal priority, due Tue Mar 31 2026 — ⚠ OVERDUE)
4. **Mobile Responsive Redesign — Dashboard** (normal priority, due Wed Apr 01 2026 — ⚠ OVERDUE)
5. **Analytics Dashboard v2 — Design & Build** (normal priority, due Fri May 01 2026 — ⚠ OVERDUE)
6. **Atlas Core Service Registry — Technical Design** (high priority, due Tue Mar 31 2026 — ⚠ OVERDUE)

**Verdict:** ✓

---

**hybrid@150/25**
_2225ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #8 | 0.0298 |
| 2 | Q1 Security Audit — External Review | #0 | 0.0285 |
| 3 | New Engineer Onboarding — Marcus Chen | #1 | 0.0277 |
| 4 | Production Deployment Runbook — Update | #0 | 0.0270 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0164 |
| 6 | Analytics Dashboard v2 — Design & Build | #1 | 0.0164 |
| 7 | Q1 Sprint Planning & Roadmap Review | #2 | 0.0161 |
| 8 | Analytics Dashboard v2 — Design & Build | #2 | 0.0161 |

**Answer:**

Based on the task overview, the following tasks are currently **in progress**:

1. **API Rate Limiting — Design & Implementation** (high priority, overdue)
2. **Frontend Design System — Initial Setup** (normal priority, overdue)
3. **OpenAPI Documentation Rewrite** (normal priority, overdue)
4. **Mobile Responsive Redesign — Dashboard** (normal priority, overdue)
5. **Analytics Dashboard v2 — Design & Build** (normal priority, overdue)
6. **Atlas Core Service Registry — Technical Design** (high priority, overdue)

**Verdict:** ✓

---


### F2 — Edge case — unanswerable 🚫

**Expected behavior:** `unanswerable`

**Query:**
> What is the team's Figma file URL?

**Ground truth:**
> Not answerable from the seed data. Figma is referenced (Priya Sharma delivered Figma mockups/specs for the design system and the mobile redesign), but no Figma file URL appears anywhere in the seed.

---

**fullcontext**
_1808ms_

The context does not include a Figma file URL for the team.

**Verdict:** ✓

---

**single**
_1549ms · 3 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | — | 0.6746 |
| 2 | Mobile Responsive Redesign — Dashboard | — | 0.6675 |
| 3 | Q2 Stakeholder Demo Preparation | — | 0.6477 |

**Answer:**

The context does not include the team's Figma file URL.

**Verdict:** ✓

---

**chunked@150/50**
_1733ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #2 | 0.7107 |
| 2 | Frontend Design System — Initial Setup | #1 | 0.6908 |
| 3 | Mobile Responsive Redesign — Dashboard | #0 | 0.6688 |
| 4 | Frontend Design System — Initial Setup | #0 | 0.6581 |
| 5 | Q2 Stakeholder Demo Preparation | #1 | 0.6580 |
| 6 | Q2 Stakeholder Demo Preparation | #0 | 0.6520 |
| 7 | Mobile Responsive Redesign — Dashboard | #1 | 0.6467 |
| 8 | Bug Triage Session — March 3, 2026 | #1 | 0.6415 |

**Answer:**

The provided context does not contain the team's Figma file URL. It mentions that designer Priya Sharma delivered Figma mockups and specs, but no URL is included.

**Verdict:** ✓ — also notes Figma is referenced, bonus context

---

**chunked@150/25**
_1653ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #1 | 0.7004 |
| 2 | Mobile Responsive Redesign — Dashboard | #0 | 0.6688 |
| 3 | Frontend Design System — Initial Setup | #2 | 0.6585 |
| 4 | Frontend Design System — Initial Setup | #0 | 0.6581 |
| 5 | Q2 Stakeholder Demo Preparation | #1 | 0.6550 |
| 6 | Q2 Stakeholder Demo Preparation | #0 | 0.6520 |
| 7 | Mobile Responsive Redesign — Dashboard | #1 | 0.6408 |
| 8 | Analytics Dashboard v2 — Design & Build | #2 | 0.6403 |

**Answer:**

The context does not contain any Figma file URL for the team.

**Verdict:** ✓

---

**hybrid@150/50**
_2195ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #2 | 0.0328 |
| 2 | Frontend Design System — Initial Setup | #1 | 0.0323 |
| 3 | Mobile Responsive Redesign — Dashboard | #0 | 0.0315 |
| 4 | Atlas Core Service Registry — Technical Design | #3 | 0.0279 |
| 5 | Code Review Standards & Team Guidelines | #1 | 0.0272 |
| 6 | Code Review Standards & Team Guidelines | #0 | 0.0270 |
| 7 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0159 |
| 8 | Frontend Design System — Initial Setup | #0 | 0.0156 |

**Answer:**

The provided context does not contain any Figma file URL. It mentions that "Priya delivered updated Figma specs" and "high-fidelity Figma mockups," but no URL is included in the text.

**Verdict:** ✓ — also notes Figma is referenced, bonus context

---

**hybrid@150/25**
_2458ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #1 | 0.0328 |
| 2 | Mobile Responsive Redesign — Dashboard | #0 | 0.0323 |
| 3 | Frontend Design System — Initial Setup | #2 | 0.0296 |
| 4 | Atlas Core Service Registry — Technical Design | #2 | 0.0288 |
| 5 | Atlas Core Service Registry — Technical Design | #0 | 0.0284 |
| 6 | Code Review Standards & Team Guidelines | #1 | 0.0283 |
| 7 | Code Review Standards & Team Guidelines | #0 | 0.0282 |
| 8 | Mobile Responsive Redesign — Dashboard | #1 | 0.0281 |

**Answer:**

The team's Figma file URL is not mentioned in the provided context.

**Verdict:** ✓

---


### F3 — Edge case — vague query 📋

**Expected behavior:** `summary`

**Query:**
> Tell me about the project.

**Ground truth:**
> The project is 'Project Atlas', described as an 'Internal developer platform to streamline engineering workflows, CI/CD, monitoring, and team collaboration.' It was created by Alice Wang. Members: Alice Wang (manager), Bob Chen (editor), and Charlie Li (editor). It contains 21 tasks spanning planning, infrastructure, features, security, and operations.

## Answer satisfaction summary

| Strategy | Score | Strengths | Weaknesses |
|---|---|---|---|
| fullcontext | 90% | Name, description, team, completed milestones, active tasks, key metrics — most complete | No major gaps |
| single | 82% | All essentials + metrics, well structured | Minor inaccuracy (CI "4 min → 45s" not in seed) |
| chunked@150/50 | 83% | Good categorization by focus area, metrics | Ends with filler "Would you like details?" |
| chunked@150/25 | 85% | Comprehensive — completed, in-progress, upcoming, metrics | Same filler ending |
| hybrid@150/50 | 78% | Good coverage, mentions 47 microservices context | Missing metrics section |
| hybrid@150/25 | 72% | Covers goals and status well | Lists Q2 demo as overdue (not in seed); filler ending; less precise |


---

**fullcontext**
_4435ms_

Based on the provided context, here's a summary of **Project Atlas**:

**What it is:**
An internal developer platform designed to streamline engineering workflows, including CI/CD, monitoring, and team collaboration.

**Team:**
- **Alice Wang** (Manager)
- **Bob Chen** (Editor)
- **Charlie Li** (Editor)

**Current Status & Key Focus:**
The primary goal for Q1 is to ship the **Atlas Core service registry** by March 31, 2026. This is a central inventory for the organization's 47 microservices, providing service discovery, health status, and ownership data.

**Major Completed Milestones:**
- **PostgreSQL Schema Migration (v2.3):** Completed for multi-tenancy.
- **Auth Token Expiry Bug:** Fixed (root cause was a misconfigured environment variable).
- **Search Index Performance:** Optimized, restoring P95 latency to baseline (~120ms).
- **GitHub Actions CI/CD:** Fully migrated from Jenkins, saving ~$9,600/year.
- **Stripe Payment Integration:** Live, supporting subscription billing for the developer portal.
- **Post-mortem for Jan 15 Outage:** Completed and action items implemented.

**Active High-Priority Tasks (Overdue):**
- **API Rate Limiting:** Design and implementation (due Feb 20, 2026).
- **Atlas Core Service Registry:** Technical design and build (due Mar 31, 2026).
- **Q1 Security Audit:** External review (due Mar 20, 2026).

**Other Active (Overdue):**
- **Frontend Design System:** Initial setup (due Mar 15, 2026).
- **OpenAPI Documentation Rewrite:** (due Mar 31, 2026).
- **Mobile Responsive Redesign:** Dashboard (due Apr 1, 2026).
- **Analytics Dashboard v2:** Design & build (due May 1, 2026).

**Key Metrics:**
- CI pipeline duration reduced from 11 minutes to ~4 minutes.
- API uptime at 99.97% for Q1 (excluding a 2h40m outage).
- Load testing identified search as the first bottleneck under load.

**Verdict:** 90% — most complete; covers all key dimensions

---

**single**
_3619ms · 3 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | — | 0.6745 |
| 2 | Q2 Stakeholder Demo Preparation | — | 0.6630 |
| 3 | Q1 Security Audit — External Review | — | 0.6491 |

**Answer:**

Project Atlas is an internal developer platform designed to streamline engineering workflows, CI/CD, monitoring, and team collaboration. The team consists of three members: Alice Wang (manager), Bob Chen (editor), and Charlie Li (editor).

Key highlights from the current project status (as of late March 2026):
- **High priority items still in progress**: API Rate Limiting (overdue), Frontend Design System (overdue), OpenAPI Documentation (overdue), Atlas Core Service Registry Technical Design (overdue), and Mobile Responsive Redesign (overdue).
- **Recently completed major milestones**: GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration, PostgreSQL Schema Migration v2.3, Auth Token Expiry Bug fix, Search Index Performance Optimization, and the Post-mortem for the January 15 production outage.
- **Upcoming critical deadlines**: Q1 Security Audit (external review completed March 10-14, final report due March 31), Q2 Stakeholder Demo (April 8), and several in-progress tasks with approaching deadlines.

The project has demonstrated strong outcomes in Q1: CI pipeline startup time reduced from 4 minutes to 45 seconds, search P95 latency improved from 850ms to 115ms, 12 subscriptions on day 1 of Stripe launch, and 99.97% API uptime.

**Verdict:** 82% — all essentials covered; minor inaccuracy on CI metric

---

**chunked@150/50**
_3439ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q2 Stakeholder Demo Preparation | #1 | 0.6703 |
| 2 | Q2 Stakeholder Demo Preparation | #0 | 0.6619 |
| 3 | Q2 Stakeholder Demo Preparation | #2 | 0.6602 |
| 4 | Frontend Design System — Initial Setup | #0 | 0.6536 |
| 5 | Frontend Design System — Initial Setup | #2 | 0.6515 |
| 6 | Frontend Design System — Initial Setup | #1 | 0.6463 |
| 7 | Q1 Sprint Planning & Roadmap Review | #2 | 0.6448 |
| 8 | Q1 Security Audit — External Review | #0 | 0.6444 |

**Answer:**

Here's a summary of **Project Atlas**:

**What it is:** An internal developer platform designed to streamline engineering workflows, CI/CD, monitoring, and team collaboration.

**Team (3 members):**
- **Alice Wang** — Manager (presents demos, leads planning)
- **Bob Chen** — Editor
- **Charlie Li** — Editor

**Key focus areas (from completed/in-progress tasks):**
- **Platform/Infrastructure:** API rate limiting, PostgreSQL schema migration, GitHub Actions CI/CD pipeline migration, Atlas Core service registry
- **Developer Experience:** Auth token expiry fix, search index performance optimization, OpenAPI documentation rewrite, mobile responsive redesign
- **Frontend/Design:** Shared component library (Storybook + Tailwind), analytics dashboard v2
- **Security & Reliability:** External security audit (SecureLayer Inc. in March 2026), Sentry error monitoring, post-mortem for Jan 15 outage
- **Other:** Stripe payment integration, Q1 sprint planning, Q2 stakeholder demo prep, bug triage, load testing, onboarding new engineer Marcus Chen

**Quick stats (from demo prep metrics):**
- CI pipeline startup time reduced from 4 min → 45 seconds
- Search P95 latency reduced from 850ms → 115ms
- 12 subscriptions on day 1 of Stripe launch
- 99.97% API uptime in Q1

Would you like details on any specific area or task?

**Verdict:** 83% — good categorization and metrics; filler ending

---

**chunked@150/25**
_3683ms · 8 chunk(s) retrieved_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q2 Stakeholder Demo Preparation | #1 | 0.6679 |
| 2 | Q2 Stakeholder Demo Preparation | #0 | 0.6619 |
| 3 | Q2 Stakeholder Demo Preparation | #2 | 0.6590 |
| 4 | Frontend Design System — Initial Setup | #2 | 0.6562 |
| 5 | Frontend Design System — Initial Setup | #1 | 0.6536 |
| 6 | Frontend Design System — Initial Setup | #0 | 0.6536 |
| 7 | Atlas Core Service Registry — Technical Design | #5 | 0.6532 |
| 8 | Q1 Security Audit — External Review | #2 | 0.6445 |

**Answer:**

Here's an overview of **Project Atlas**:

**What it is:** An internal developer platform designed to streamline engineering workflows, CI/CD, monitoring, and team collaboration.

**Team (3 members):**
- **Alice Wang** — Manager
- **Bob Chen** — Editor
- **Charlie Li** — Editor

**Key completed work (highlights):**
- Q1 Sprint Planning & Roadmap Review
- PostgreSQL Schema Migration (v2.3)
- Auth Token Expiry Bug fix
- Search Index Performance Optimization (latency reduced from 850ms to 115ms)
- GitHub Actions CI/CD Pipeline Upgrade (migrated from Jenkins)
- Stripe Payment Integration for the developer portal
- Post-mortem for the January 15 production outage

**Current in-progress tasks:**
- API Rate Limiting (overdue)
- Frontend Design System using Storybook/Tailwind (overdue)
- OpenAPI Documentation Rewrite (overdue)
- Mobile Responsive Redesign for Dashboard (overdue)
- Analytics Dashboard v2 (overdue)
- Atlas Core Service Registry technical design (overdue)

**Upcoming/overdue:**
- Q1 Security Audit (external review, window: March 10–14)
- Q2 Stakeholder Demo (scheduled April 8, 2026)
- Atlas Core Service Registry implementation (Phase 1–3 through March 31)

**Key metrics from Q1:**
- 99.97% API uptime (only 3 minutes of downtime)
- CI pipeline startup time reduced from 4 min → 45 sec
- Search P95 latency: 850ms → 115ms
- 12 subscriptions on day 1 of Stripe launch

Would you like details on any specific area?

**Verdict:** 85% — comprehensive with completed/in-progress/upcoming/metrics; filler ending

---

**hybrid@150/50**
_3829ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #0 | 0.0303 |
| 2 | Q1 Security Audit — External Review | #0 | 0.0280 |
| 3 | Atlas Core Service Registry — Technical Design | #0 | 0.0276 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0271 |
| 5 | Q2 Stakeholder Demo Preparation | #1 | 0.0164 |
| 6 | Sentry Error Monitoring — Configuration & Alerting | #0 | 0.0164 |
| 7 | Q2 Stakeholder Demo Preparation | #0 | 0.0161 |
| 8 | Atlas Core Service Registry — Technical Design | #3 | 0.0161 |

**Answer:**

Project Atlas is an internal developer platform designed to streamline engineering workflows, including CI/CD, monitoring, and team collaboration. The team consists of three members: Alice Wang (manager), Bob Chen (editor), and Charlie Li (editor).

The primary Q1 goal is to ship the internal service registry (codenamed "Atlas Core") by March 31, 2026. This will provide a central inventory for the organization's 47 microservices, enabling service discovery, health status tracking, and ownership metadata.

Key completed milestones include:
- PostgreSQL Schema Migration v2.3 (multi-tenancy)
- Auth Token Expiry Bug fix
- Search Index Performance Optimization
- GitHub Actions CI/CD Pipeline Upgrade (migrated from Jenkins)
- Stripe Payment Integration for the developer portal
- Post-mortem for the January 15 production outage

Current in-progress tasks (all overdue):
- **API Rate Limiting** (high priority, due Feb 20)
- **Frontend Design System** (normal priority, due Mar 15)
- **OpenAPI Documentation Rewrite** (normal priority, due Mar 31)
- **Mobile Responsive Redesign** (normal priority, due Apr 1)
- **Analytics Dashboard v2** (normal priority, due May 1)
- **Atlas Core Service Registry Technical Design** (high priority, due Mar 31)

An external security audit with SecureLayer Inc. is scheduled for March 10–14, 2026, and a Q2 stakeholder demo is planned for April 8, 2026 to showcase progress to senior leadership.

**Verdict:** 78% — good coverage; missing metrics section

---

**hybrid@150/25**
_3842ms · 8 chunk(s) retrieved · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Frontend Design System — Initial Setup | #0 | 0.0292 |
| 2 | Q1 Security Audit — External Review | #0 | 0.0275 |
| 3 | Atlas Core Service Registry — Technical Design | #0 | 0.0274 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0267 |
| 5 | Q2 Stakeholder Demo Preparation | #1 | 0.0164 |
| 6 | Sentry Error Monitoring — Configuration & Alerting | #0 | 0.0164 |
| 7 | Q2 Stakeholder Demo Preparation | #0 | 0.0161 |
| 8 | Atlas Core Service Registry — Technical Design | #2 | 0.0161 |

**Answer:**

Here's a summary of **Project Atlas**:

**What it is:** An internal developer platform designed to streamline engineering workflows, CI/CD, monitoring, and team collaboration.

**Team:**
- Alice Wang — manager
- Bob Chen — editor
- Charlie Li — editor

**Key goals & current focus (Q1 2026):**
- Ship **Atlas Core** (internal service registry) by March 31, 2026 — currently in design phase.
- Complete the migration from Jenkins to **GitHub Actions CI/CD** by February 28 (completed).
- Deploy the new **developer dashboard** to production by March 15 (completed, includes Stripe billing).
- Build a shared **design system** (Storybook + Tailwind) — currently in progress, overdue.
- Coordinate an **external security audit** with SecureLayer Inc. (March 10–14) — currently pending preparation.
- Other completed items: API rate limiting, PostgreSQL schema migration v2.3, auth token expiry fix, search performance optimization, code review standards, Sentry monitoring, and a post-mortem for a January production outage.

**Overdue / in-progress items (as of now):**
- Frontend Design System (due March 15) — overdue
- Q1 Security Audit preparation (due March 20) — overdue
- OpenAPI Documentation Rewrite (due March 31) — overdue
- Mobile Dashboard Redesign (due April 1) — overdue
- Analytics Dashboard v2 (due May 1) — overdue
- Atlas Core Service Registry technical design (due March 31) — overdue
- Q2 Stakeholder Demo Preparation (due April 5) — overdue

Would you like a deeper look at any specific area?

**Verdict:** 72% — covers goals and status; lists Q2 demo as overdue (not in seed); filler ending; less precise

---


### F4 — Edge case — false-positive detection 🎯

**Expected behavior:** `answerable`

**Query:**
> How long was the January 15 outage?

**Ground truth:**
> 2 hours and 40 minutes (10:12 AM – 12:52 PM PST on January 15, 2026).

**Expected tasks:** Post-mortem: January 15, 2026 Production Outage

---

**fullcontext**
_2136ms_

The January 15, 2026 production outage lasted **2 hours and 40 minutes** (10:12 AM – 12:52 PM PST).

**Verdict:** ✓

---

**single**
_1907ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | — | 0.7493 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | — | 0.6912 |
| 3 | Search Index Performance Optimization | — | 0.6659 |

**Answer:**

The January 15, 2026 outage lasted **2 hours and 40 minutes** (10:12 AM – 12:52 PM PST).

**Verdict:** ✓

---

**chunked@150/50**
_2409ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7839 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7803 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7665 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7460 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6886 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.6806 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6787 |
| 8 | Search Index Performance Optimization | #0 | 0.6660 |

**Answer:**

Based on the task details, the January 15, 2026 production outage lasted **2 hours and 40 minutes** of total user-visible downtime (10:12 AM – 12:52 PM PST), with an additional 90 minutes of degraded performance due to cache warming.

**Verdict:** ✓ — also notes cache degradation, bonus detail

---

**chunked@150/25**
_1950ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.7803 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.7765 |
| 3 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.7721 |
| 4 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.7635 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.6886 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.6802 |
| 7 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.6793 |
| 8 | Search Index Performance Optimization | #0 | 0.6660 |

**Answer:**

The January 15 outage lasted **2 hours and 40 minutes** (from 10:12 AM to 12:52 PM PST).

**Verdict:** ✓

---

**hybrid@150/50**
_2021ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0313 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0305 |
| 3 | Q2 Stakeholder Demo Preparation | #3 | 0.0303 |
| 4 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0301 |
| 5 | Search Index Performance Optimization | #0 | 0.0301 |
| 6 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.0294 |
| 7 | Search Index Performance Optimization | #1 | 0.0290 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #3 | 0.0283 |

**Answer:**

The January 15 outage lasted **2 hours and 40 minutes** (10:12 AM – 12:52 PM PST).

**Verdict:** ✓

---

**hybrid@150/25**
_2393ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Post-mortem: January 15, 2026 Production Outage | #0 | 0.0318 |
| 2 | Auth Token Expiry Bug — Investigation & Fix | #0 | 0.0305 |
| 3 | Search Index Performance Optimization | #0 | 0.0303 |
| 4 | Auth Token Expiry Bug — Investigation & Fix | #2 | 0.0299 |
| 5 | Auth Token Expiry Bug — Investigation & Fix | #1 | 0.0294 |
| 6 | GitHub Actions CI/CD Pipeline Upgrade | #1 | 0.0292 |
| 7 | Search Index Performance Optimization | #1 | 0.0292 |
| 8 | Post-mortem: January 15, 2026 Production Outage | #2 | 0.0289 |

**Answer:**

The January 15, 2026 production outage lasted **2 hours and 40 minutes** (10:12 AM – 12:52 PM PST).

**Verdict:** ✓

---


### G1 — Cross-task synthesis 🔀

**Expected behavior:** `multi_task_synthesis`

**Query:**
> What performance improvements were made this quarter?

**Ground truth:**
> Performance improvements made this quarter: (1) Search index optimization — the invalid GIN index on content_tsv was dropped and recreated on January 24, bringing search P95 from ~850ms back to 115ms; a Redis query-result cache (60-second TTL) added on February 3 further cut P50 to 12ms for cached queries and reduced average database load by 31%. (2) CI/CD migration (Jenkins to GitHub Actions) — pipeline startup time dropped from about 4 minutes to 45 seconds, average CI duration from 11 minutes to 4 minutes 10 seconds, and failure rate from 7.8% to 3.2%. (3) Load-test-driven capacity changes — minimum app-server count was raised from 2 to 3 on February 25, and the RDS connection pool was increased from 100 to 150 on February 22. Enabling ElastiCache for session storage was planned for March 5, not yet completed in the seed.

**Expected tasks:** Search Index Performance Optimization · GitHub Actions CI/CD Pipeline Upgrade · Load Testing Report — February 2026

## Coverage breakdown

Retrieval is **identical across both runs** for all strategies — every difference in answer quality is pure inference non-determinism.

| Strategy | Retrieval | Search | CI/CD | Load Test | Run 1 | Run 2 | Verdict |
|---|---|---|---|---|---|---|---|
| fullcontext | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ stable |
| single | ✗ 1/3 | ✓ | ~ partial from demo prep | ✗ | ~ 1/3 | ~ 1/3 | ~ 1/3 stable |
| chunked@150/50 | ✗ 2/3 | ✓ | ~ partial → ✓ full | ✓ | ~ 2/3 | ✓ | ~ non-deterministic |
| chunked@150/25 | ✗ 1/3 | ✓ | ~ partial from demo prep | ✗ | ~ 1/3 | ~ 1/3 | ~ 1/3 stable |
| hybrid@150/50 | ✗ 2/3 | ✓ | ~ partial → ✗ | ✓ → ~ | ~ 2/3 | ~ 2/3 | ~ 2/3 · CI inference unstable |
| hybrid@150/25 | ✗ 2/3 | ✓ | ✗ | ~ partial → ✗ | ~ 1/3 | ~ 1/3 (search only) | ~ 1/3 · load test inference unstable |


---

**fullcontext**
_3297ms_

Based on the project data, the following performance improvements were made this quarter:

1. **Search Index Performance** — P95 search response time reduced from **850ms to 115ms** (fixing an invalid GIN index and adding a Redis query cache for top search terms).

2. **CI/CD Pipeline Speed** — Average CI pipeline duration reduced from **11 minutes (Jenkins) to 4 minutes 10 seconds (GitHub Actions)**, with startup time dropping from **4 minutes to 45 seconds**.

3. **PostgreSQL Migration** — v2.3 schema migration completed with only **11 minutes downtime** (vs. the 2-hour maintenance window).

4. **Auth Token Fix** — Token expiry bug resolved, restoring correct 4-hour session duration (was incorrectly set to 5 minutes).

5. **Auto-scaling** — Minimum app server count raised from 2 to 3, and RDS connection pool increased from 100 to 150, based on load test findings.

All improvements are backed by measurable metrics (latency, duration, error rates) as documented in the task details.

**Verdict:** ✓ — covers all 3 areas; also includes PostgreSQL and auth token fix as bonus

---

**single**
_3155ms · 3 chunk(s) retrieved · retrieval ✗ 1/3 (missing: GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report — February 2026)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | — | 0.7164 |
| 2 | Search Index Performance Optimization | — | 0.7161 |
| 3 | Q2 Stakeholder Demo Preparation | — | 0.6988 |

**Answer:**

Based on the project data, the key performance improvements made this quarter are:

1. **Search Index Performance Optimization** (completed, high priority, due Feb 10)
   - P95 search latency reduced from **850ms to 115ms** (after fixing an invalid GIN index and adding a Redis query result cache)
   - Database load reduced by **31%** via caching for top-20 frequent search terms

2. **GitHub Actions CI/CD Pipeline Upgrade** (completed, high priority, due Feb 28)
   - CI pipeline startup time reduced from **4 minutes to 45 seconds**

3. **API Uptime** (included in Q2 demo metrics)
   - 99.97% API uptime in Q1 (only 3 minutes of downtime from the Jan 15 outage)

These improvements are highlighted for the upcoming Q2 stakeholder demo on April 8, 2026.

**Verdict:** ~ 1/3 · stable across runs — search well covered; CI partial from demo prep only; load test not retrieved

---

**chunked@150/50**
_2866ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade)_

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

Based on the provided context, the following performance improvements were made this quarter:

1. **Search Index Optimization** – Recreated the invalid GIN index on `content_tsv`, reducing P95 search latency from 850ms to 115ms (back within baseline).
2. **Redis Query Cache** – Added a 60-second TTL Redis cache for the top-20 most frequent search terms, reducing P50 to 12ms for cached queries and database load by 31%.
3. **CI Pipeline Startup Time** – Reduced from 4 minutes to 45 seconds (mentioned in the Q2 demo prep context).
4. **Infrastructure scaling improvements** – Minimum app server count raised from 2 to 3, RDS connection pool increased from 100 to 150, and ElastiCache for session storage scheduled.

**Verdict:** ~ non-deterministic — run 1: ~ 2/3 (search + load test, CI partial from demo prep); run 2: ✓ all 3 areas covered including full CI/CD detail extracted from demo prep chunk; same retrieved chunks both runs — pure inference variance

---

**chunked@150/25**
_2774ms · 8 chunk(s) retrieved · retrieval ✗ 1/3 (missing: GitHub Actions CI/CD Pipeline Upgrade, Load Testing Report — February 2026)_

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

Based on the context, two key performance improvements were made this quarter:

1. **Search Index Performance Optimization** — P95 search latency was reduced from **850ms to 115ms** (back to baseline range of 120ms) after recreating an invalid GIN index on the `documents` table. A secondary optimization added a Redis query result cache (60-second TTL) for the top-20 most frequent search terms, reducing P50 to **12ms** for cached queries and lowering average database load by 31%.

2. **CI Pipeline Startup Time** — CI pipeline startup time was reduced from **4 minutes to 45 seconds** (mentioned in the Q2 demo prep context as a key metric).

**Verdict:** ~ 1/3 · stable across runs — search strong; CI partial from demo prep; load test not retrieved

---

**hybrid@150/50**
_3342ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade) · bm25=20 vec=20_

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

Based on the context, the following performance improvements were made this quarter (Q1 2026):

1. **Search Index Performance Optimization** (completed, due Feb 10)
   - Performed a full re-index of the search indexes (completed after Jan 23)
   - Applied a secondary optimization on Feb 3: added a Redis query result cache (60-second TTL) for the top-20 most frequent search terms
   - Result: P95 search latency reduced from **850ms to 115ms**, P50 down to **12ms** for cached queries, and database load reduced by **31%**

2. **Load Testing Report — February 2026** (completed, due Feb 20)
   - Raised minimum app server count from 2 to 3 (done Feb 25)
   - Increased RDS connection pool from 100 to 150 (done Feb 22)
   - ElastiCache for session storage scheduled for March 5 to further reduce database reads

3. **CI pipeline startup time** reduced from **4 minutes to 45 seconds** (mentioned in Q2 demo prep as a key metric)

4. **API uptime** reached **99.97%** in Q1 (only 3 minutes of downtime from the Jan 15 outage)

**Verdict:** ~ 2/3 · CI inference unstable — run 1: search + load test covered, CI partial from demo prep; run 2: search + load test covered, CI dropped entirely; load test chunk retrieved both runs but model extracted it consistently; same retrieved chunks both runs

---

**hybrid@150/25**
_2945ms · 8 chunk(s) retrieved · retrieval ✗ 2/3 (missing: GitHub Actions CI/CD Pipeline Upgrade) · bm25=20 vec=20_

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

Based on the provided context, the following performance improvements were made this quarter:

1. **Search Index Performance Optimization**: A duplicate, invalid GIN index on `content_tsv` was dropped and recreated using `CREATE INDEX CONCURRENTLY` on January 24. This brought P95 latency back to baseline (115ms) from a regression of 850ms.
2. **Redis Query Cache**: On February 3, a query result cache (60-second TTL) was added for the top-20 most frequent search terms. This reduced P50 to 12ms for cached queries and lowered average database load by 31%.
3. **Automated Monitoring & Runbook**: Post-fix, an automated index validity check was added to the smoke test suite, a Grafana alert for P95 > 300ms was configured, and the concurrent index creation procedure was documented in the runbook.

Additionally, in response to the **Load Testing Report**, a plan was made to raise the minimum auto-scaling group instance count from 2 to 3 (effective March 1) to improve response to traffic spikes.

**Verdict:** ~ 1/3 · load test inference unstable — run 1: search + load test partial (scaling plan only); run 2: search only, load test chunk retrieved but model ignored capacity changes entirely; CI not retrieved either run; same retrieved chunks both runs — pure inference variance

---


### G2 — Cross-task synthesis 🔀

**Expected behavior:** `multi_task_synthesis`

**Query:**
> What did Bob Chen work on in February?

**Ground truth:**
> In February 2026 Bob Chen worked on: (1) API Rate Limiting (lead) — led the February 3 design review and opened draft PR #214 on February 5. (2) Jenkins → GitHub Actions migration (lead) — completed Phase 2 (staging deploy pipeline) on February 5, completed Phase 3 (production deploy pipeline) on February 24, and decommissioned the Jenkins instance on February 28. (3) Stripe payment integration (lead) — started integration work on February 3 and ran testing February 24–28. (4) Analytics Dashboard v2 (lead) — completed the API backend (three /api/v1/analytics/ endpoints) on February 28. (5) Marcus Chen's onboarding — ran the dev-environment setup session on February 1 and updated CONTRIBUTING.md with the minimum Docker Desktop version. (6) Atlas Core service registry (infrastructure) — attended the February 10 design kickoff, prepared the cost analysis on February 12 (approved by Alice on February 13), and was assigned to provision the MongoDB collection and Redis key namespace on staging in Phase 1 (starting February 17). He was also a contributor to the OpenAPI rewrite (rate-limiting and auth sections), though the seed gives no specific February date for that work.

**Expected tasks:** API Rate Limiting — Design & Implementation · GitHub Actions CI/CD Pipeline Upgrade · Stripe Payment Integration — Developer Portal · Analytics Dashboard v2 — Design & Build · New Engineer Onboarding — Marcus Chen · Atlas Core Service Registry — Technical Design

## Coverage breakdown

| Strategy | Tasks covered | Verdict |
|---|---|---|
| fullcontext | 6/6 — API Rate Limiting, CI/CD, Stripe, Search Redis, Atlas Core, Analytics + bonus items | ✓ |
| single | 2/6 — Marcus onboarding + Analytics only | ~ 2/6 |
| chunked@150/50 | 2/6 — Marcus onboarding + CI/CD (inferred from context, not direct task) | ~ 2/6 |
| chunked@150/25 | 1/6 — CI/CD only; Auth Token listed but was Q4 carryover, not Feb work | ~ 1/6 |
| hybrid@150/50 | 0/6 — Code Review + Sentry both January/carryover, no Feb tasks | ✗ |
| hybrid@150/25 | 2/6 — CI/CD + Load Test; Code Review note from Jan included | ~ 2/6 |


---

**fullcontext**
_3593ms_

Based on the provided task details, Bob Chen worked on the following items in February 2026:

- **API Rate Limiting — Design & Implementation**: Led the design review on February 3, opened a draft PR (#214) on February 5, and participated in code review discussions.
- **GitHub Actions CI/CD Pipeline Upgrade**: Completed Phase 2 (staging deploy pipeline) on February 5 and Phase 3 (production deploy pipeline) on February 24.
- **Stripe Payment Integration — Developer Portal**: Lead engineer starting February 3; completed testing during February 24–28.
- **Search Index Performance Optimization**: Applied a secondary optimization (Redis query cache) on February 3.
- **Atlas Core Service Registry — Technical Design**: Attended the design kickoff on February 10 as the infrastructure representative.
- **Analytics Dashboard v2 — Design & Build**: Completed the API backend on February 28.
- **Mobile Responsive Redesign — Dashboard**: Not directly assigned (Alice was the implementer), but Bob may have been involved in code reviews.
- **OpenAPI Documentation Rewrite**: Contributing endpoint descriptions for rate-limiting and auth sections (ongoing through February).

Additionally, Bob was on standby as secondary on-call for Sentry alerts during part of February, and he was involved in the Code Review Standards working group and weekly bug triage sessions.

**Verdict:** ✓ — covers all 6 tasks with specific Feb dates; bonus items noted

---

**single**
_2112ms · 3 chunk(s) retrieved · retrieval ✗ 2/6 (missing: API Rate Limiting — Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration — Developer Portal, Atlas Core Service Registry — Technical Design)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | — | 0.7279 |
| 2 | Bug Triage Session — March 3, 2026 | — | 0.7077 |
| 3 | Analytics Dashboard v2 — Design & Build | — | 0.6841 |

**Answer:**

Based on the task details, Bob Chen worked on the following in February 2026:

1. **Onboarding Marcus Chen (Feb 1)** – Helped Marcus set up his dev environment and updated `CONTRIBUTING.md` with the minimum Docker Desktop version requirement after Marcus ran into an issue.

2. **Analytics Dashboard v2 — Design & Build** – Bob is the lead engineer on this feature; he completed the API backend (`/api/v1/analytics/` endpoints) on February 28, 2026.

**Verdict:** ~ 2/6 — Marcus onboarding + Analytics only; 4 tasks missing

---

**chunked@150/50**
_2485ms · 8 chunk(s) retrieved · retrieval ✗ 2/6 (missing: API Rate Limiting — Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration — Developer Portal, Analytics Dashboard v2 — Design & Build)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #2 | 0.7469 |
| 2 | New Engineer Onboarding — Marcus Chen | #1 | 0.7410 |
| 3 | Bug Triage Session — March 3, 2026 | #1 | 0.7269 |
| 4 | Bug Triage Session — March 3, 2026 | #0 | 0.7177 |
| 5 | New Engineer Onboarding — Marcus Chen | #0 | 0.7171 |
| 6 | Bug Triage Session — March 3, 2026 | #2 | 0.6792 |
| 7 | Atlas Core Service Registry — Technical Design | #6 | 0.6697 |
| 8 | Production Deployment Runbook — Update | #0 | 0.6696 |

**Answer:**

Based on the provided context, here is what Bob Chen worked on in February 2026:

- **February 1:** Helped Marcus Chen with dev environment setup, and updated the `CONTRIBUTING.md` file to add the minimum Docker Desktop version requirement (from the "New Engineer Onboarding — Marcus Chen" task).
- **February 20:** Responsible for the "Load Testing Report — February 2026" task, which was completed on this date.
- **February 28:** Responsible for the "GitHub Actions CI/CD Pipeline Upgrade" task, which was completed on this date.
- **Throughout February:** Acted as a reviewer for Marcus Chen's first PR (#207, reviewed February 6) and provided feedback on Marcus's code (PR #210).

*Note: The context does not specify additional individual tasks for Bob in February beyond those mentioned.*

**Verdict:** ~ 2/6 — Marcus onboarding + CI/CD inferred; some hallucinated details

---

**chunked@150/25**
_2091ms · 8 chunk(s) retrieved · retrieval ✗ 2/6 (missing: API Rate Limiting — Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration — Developer Portal, Analytics Dashboard v2 — Design & Build)_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #2 | 0.7479 |
| 2 | New Engineer Onboarding — Marcus Chen | #1 | 0.7405 |
| 3 | Bug Triage Session — March 3, 2026 | #0 | 0.7177 |
| 4 | New Engineer Onboarding — Marcus Chen | #0 | 0.7171 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.7123 |
| 6 | Atlas Core Service Registry — Technical Design | #5 | 0.6797 |
| 7 | Bug Triage Session — March 3, 2026 | #2 | 0.6762 |
| 8 | Q1 Sprint Planning & Roadmap Review | #2 | 0.6740 |

**Answer:**

Based on the provided context, here is what Bob Chen worked on in February 2026:

- **Auth Token Expiry Bug — Investigation & Fix** (completed, high priority, due Thu Feb 05 2026): Bob was assigned this critical carryover from Q4 2025.
- **GitHub Actions CI/CD Pipeline Upgrade** (completed, high priority, due Sat Feb 28 2026): Bob was involved in migrating build, test, and deploy pipelines from Jenkins to GitHub Actions.

**Verdict:** ~ 1/6 — CI/CD only; Auth Token was Q4 carryover not Feb work

---

**hybrid@150/50**
_2294ms · 8 chunk(s) retrieved · retrieval ✗ 2/6 (missing: API Rate Limiting — Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration — Developer Portal, Analytics Dashboard v2 — Design & Build) · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Bug Triage Session — March 3, 2026 | #0 | 0.0297 |
| 2 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0297 |
| 3 | New Engineer Onboarding — Marcus Chen | #0 | 0.0297 |
| 4 | Production Deployment Runbook — Update | #0 | 0.0292 |
| 5 | Bug Triage Session — March 3, 2026 | #1 | 0.0290 |
| 6 | Code Review Standards & Team Guidelines | #0 | 0.0287 |
| 7 | Sentry Error Monitoring — Configuration & Alerting | #2 | 0.0286 |
| 8 | Atlas Core Service Registry — Technical Design | #6 | 0.0274 |

**Answer:**

Based on the provided context, Bob Chen worked on the following in February 2026:

- **Code Review Standards & Team Guidelines**: Participated as a member of the working group that defined the team's code review policies (first meeting was January 27, which overlapped into the first days of February).
- **Sentry Error Monitoring**: Served as the secondary on-call for the week of January 25, so his on-call rotation continued into the first few days of February.

**Verdict:** ✗ — no relevant Feb tasks; Code Review and Sentry both January/carryover

---

**hybrid@150/25**
_2696ms · 8 chunk(s) retrieved · retrieval ✗ 2/6 (missing: API Rate Limiting — Design & Implementation, GitHub Actions CI/CD Pipeline Upgrade, Stripe Payment Integration — Developer Portal, Analytics Dashboard v2 — Design & Build) · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | New Engineer Onboarding — Marcus Chen | #0 | 0.0303 |
| 2 | Bug Triage Session — March 3, 2026 | #0 | 0.0302 |
| 3 | Production Deployment Runbook — Update | #0 | 0.0294 |
| 4 | New Engineer Onboarding — Marcus Chen | #2 | 0.0292 |
| 5 | Post-mortem: January 15, 2026 Production Outage | #1 | 0.0290 |
| 6 | Code Review Standards & Team Guidelines | #0 | 0.0285 |
| 7 | Atlas Core Service Registry — Technical Design | #5 | 0.0285 |
| 8 | Bug Triage Session — March 3, 2026 | #1 | 0.0284 |

**Answer:**

Based on the task list and context, Bob Chen worked on the following in February 2026:

1. **GitHub Actions CI/CD Pipeline Upgrade** — Migrated build, test, and deploy pipelines from Jenkins to GitHub Actions (due Feb 28, completed).
2. **Load Testing Report — February 2026** — Ran load tests against the Atlas API (due Feb 20, completed).
3. **Code Review Standards & Team Guidelines** — Member of the working group drafting the team's code review policy (meeting Jan 27, published Feb 1).
4. **New Engineer Onboarding — Marcus Chen** — Helped with Marcus's dev environment setup on February 1.
5. **Production Deployment Runbook — Update** — Assigned on March 5, so this was a March task, not February.

**Verdict:** ~ 2/6 — CI/CD + Load Test covered; Code Review from Jan included; 4 tasks missing

---


### H1 — Long task — early facts 🎯

**Expected behavior:** `answerable`

**Query:**
> When was the Atlas Core service registry kickoff meeting and who attended?

**Ground truth:**
> The design kickoff meeting was held on February 10, 2026 at 2:00 PM PST and lasted two hours. Attendees: Alice Wang (architect), Charlie Li (tech lead), Bob Chen (infrastructure), and Priya Sharma (product).

**Expected tasks:** Atlas Core Service Registry — Technical Design

---

**fullcontext**
_1875ms_

The Atlas Core service registry kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. The attendees were:

- **Alice Wang** (architect)
- **Charlie Li** (tech lead)
- **Bob Chen** (infrastructure)
- **Priya Sharma** (product)

**Verdict:** ✓

---

**single**
_1745ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | — | 0.7981 |
| 2 | Q2 Stakeholder Demo Preparation | — | 0.7642 |
| 3 | New Engineer Onboarding — Marcus Chen | — | 0.7544 |

**Answer:**

The Atlas Core service registry design kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. 

Attendees were:
- Alice Wang (architect)
- Charlie Li (tech lead)
- Bob Chen (infrastructure)
- Priya Sharma (product)

**Verdict:** ✓

---

**chunked@150/50**
_1600ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #0 | 0.8811 |
| 2 | Atlas Core Service Registry — Technical Design | #10 | 0.8517 |
| 3 | Atlas Core Service Registry — Technical Design | #9 | 0.8509 |
| 4 | Atlas Core Service Registry — Technical Design | #7 | 0.8499 |
| 5 | Atlas Core Service Registry — Technical Design | #11 | 0.8475 |
| 6 | Atlas Core Service Registry — Technical Design | #8 | 0.8473 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.8394 |
| 8 | Atlas Core Service Registry — Technical Design | #6 | 0.8373 |

**Answer:**

The Atlas Core service registry kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. Attendees included **Alice Wang** (architect), **Charlie Li** (tech lead), **Bob Chen** (infrastructure), and **Priya Sharma** (product).

**Verdict:** ✓

---

**chunked@150/25**
_1616ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #0 | 0.8811 |
| 2 | Atlas Core Service Registry — Technical Design | #8 | 0.8517 |
| 3 | Atlas Core Service Registry — Technical Design | #6 | 0.8487 |
| 4 | Atlas Core Service Registry — Technical Design | #7 | 0.8481 |
| 5 | Atlas Core Service Registry — Technical Design | #5 | 0.8411 |
| 6 | Atlas Core Service Registry — Technical Design | #9 | 0.8403 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.8379 |
| 8 | Atlas Core Service Registry — Technical Design | #4 | 0.8359 |

**Answer:**

The Atlas Core service registry design kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. Attendees were: **Alice Wang** (architect), **Charlie Li** (tech lead), **Bob Chen** (infrastructure), and **Priya Sharma** (product).

**Verdict:** ✓

---

**hybrid@150/50**
_1841ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #0 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #10 | 0.0313 |
| 3 | Atlas Core Service Registry — Technical Design | #9 | 0.0308 |
| 4 | Atlas Core Service Registry — Technical Design | #1 | 0.0296 |
| 5 | Q2 Stakeholder Demo Preparation | #3 | 0.0292 |
| 6 | Atlas Core Service Registry — Technical Design | #11 | 0.0289 |
| 7 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0286 |
| 8 | Q2 Stakeholder Demo Preparation | #2 | 0.0284 |

**Answer:**

The Atlas Core service registry design kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. 

Attendees:
- **Alice Wang** (architect)
- **Charlie Li** (tech lead)
- **Bob Chen** (infrastructure)
- **Priya Sharma** (product)

**Verdict:** ✓

---

**hybrid@150/25**
_1895ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #0 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #8 | 0.0315 |
| 3 | Atlas Core Service Registry — Technical Design | #7 | 0.0306 |
| 4 | Atlas Core Service Registry — Technical Design | #1 | 0.0301 |
| 5 | Q2 Stakeholder Demo Preparation | #2 | 0.0294 |
| 6 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0293 |
| 7 | Atlas Core Service Registry — Technical Design | #9 | 0.0292 |
| 8 | Atlas Core Service Registry — Technical Design | #10 | 0.0286 |

**Answer:**

The Atlas Core service registry design kickoff meeting was held on **February 10, 2026 at 2:00 PM PST**. Attendees were **Alice Wang** (architect), **Charlie Li** (tech lead), **Bob Chen** (infrastructure), and **Priya Sharma** (product).

**Verdict:** ✓

---


### H2 — Long task — middle facts 🎯

**Expected behavior:** `answerable`

**Query:**
> What is the Redis cache TTL and what is the maximum number of services that can be registered?

**Ground truth:**
> For the main service-registry discovery cache, the Redis TTL is 60 seconds. The maximum capacity is 500 registered services per Atlas project. Note: the separate health-check endpoint response cache is 15 seconds.

**Expected tasks:** Atlas Core Service Registry — Technical Design

**Analysis — chunk boundary effect: why @150/50 fails but @150/25 passes**

The number 500 appears **twice** in the Atlas Core document in different contexts:

- **Sentence A — Capacity spec** (the correct answer): "Capacity limits agreed in the February 10 meeting: **maximum 500 registered services per Atlas project**..." → chunk#3
- **Sentence B — Cost analysis** (misleading): "MongoDB storage for **500 service documents** at approximately 5KB each totals 2.5MB — negligible." → chunk#13

chunked@150/50 retrieves chunk#13 (Sentence B) but **not** chunk#3 (Sentence A) — chunk#3 scores below the top-8 cutoff. The model correctly reasons that "500 service documents" in a cost-estimation context sounds like a planning estimate, not a hard limit — good reasoning, wrong evidence.

chunked@150/25 retrieves a chunk that includes Sentence A in its boundary, so the model sees the definitive "maximum 500 registered services per Atlas project" phrasing and answers correctly.

**Why does higher overlap (50) perform worse than lower overlap (25)?** This is counterintuitive — more overlap does not mean "more inclusive." Overlap changes WHERE chunk boundaries fall:

```
@150/50  step = 100 tokens between chunk starts → more chunks, finer slicing
@150/25  step = 125 tokens between chunk starts → fewer chunks, coarser slicing
```

The two configurations produce completely different chunk sets — not subsets of each other. The @150/50 boundary happens to land right after "maximum 500 registered services", splitting Sentence A into chunk#3 which doesn't score high enough. The @150/25 boundary falls further along so Sentence A stays intact within a chunk that does score high enough. This is bad luck on boundary position, not a fundamental property of higher overlap — with a different document layout the result could easily reverse.

**Confirmed consistent** (2 runs): chunked@150/50 retrieves chunk#13 (cost analysis) both times with identical score (0.7308/0.7120), producing the same incorrect reasoning both times. This is a stable retrieval bias, not non-determinism.

**Conclusion:** larger overlap does not always win. The common assumption is that more overlap = more content preserved across boundaries = safer retrieval. H2 is a concrete counter-example — @150/50 consistently fails while @150/25 consistently passes on the same query and document. Whether a given chunk boundary helps or hurts depends entirely on where the critical sentence sits relative to that boundary. In rare cases a smaller overlap can produce a boundary that keeps the key fact intact while a larger overlap splits it away. There is no universally "safe" overlap value — only overlap values that happen to align well or poorly with the content structure of a specific document.

---

**fullcontext**
_1723ms_

Based on the context for **Atlas Core Service Registry — Technical Design**:

- **Redis cache TTL**: 60 seconds.
- **Maximum number of services that can be registered**: 500 services per Atlas project.

**Verdict:** ✓

---

**single**
_1736ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | — | 0.6877 |
| 2 | API Rate Limiting — Design & Implementation | — | 0.6763 |
| 3 | Auth Token Expiry Bug — Investigation & Fix | — | 0.6270 |

**Answer:**

Based on the "Atlas Core Service Registry — Technical Design" document:

1. **Redis cache TTL**: 60 seconds
2. **Maximum number of registered services**: 500 per Atlas project

**Verdict:** ✓

---

**chunked@150/50**
_2043ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

Based on the context provided:

- **Redis cache TTL**: 60 seconds (mentioned in both chunk 2 and chunk 14)
- **Maximum number of services that can be registered**: The document states **500 service documents** in the cost analysis (chunk 14), but this appears to be a current estimate for capacity planning rather than an enforced maximum. The document does not specify a hard upper limit.

**Verdict:** ~ · consistent across 2 runs — TTL correct; chunk#3 (capacity spec "maximum 500 per project") not retrieved; chunk#13 (cost analysis "500 service documents") retrieved instead — model correctly reasons it sounds like an estimate, not a hard limit; chunk boundary splits Sentence A away from high-scoring chunks

---

**chunked@150/25**
_1729ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #1 | 0.7324 |
| 2 | Atlas Core Service Registry — Technical Design | #10 | 0.7320 |
| 3 | Atlas Core Service Registry — Technical Design | #3 | 0.7094 |
| 4 | Atlas Core Service Registry — Technical Design | #9 | 0.7090 |
| 5 | Atlas Core Service Registry — Technical Design | #2 | 0.6964 |
| 6 | Atlas Core Service Registry — Technical Design | #4 | 0.6950 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.6929 |
| 8 | Atlas Core Service Registry — Technical Design | #8 | 0.6814 |

**Answer:**

Based on the context:

- **Redis cache TTL**: 60 seconds
- **Maximum number of services**: 500 registered services per Atlas project

**Verdict:** ✓

---

**hybrid@150/50**
_1833ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #1 | 0.0320 |
| 2 | Atlas Core Service Registry — Technical Design | #1 | 0.0318 |
| 3 | Atlas Core Service Registry — Technical Design | #11 | 0.0310 |
| 4 | Atlas Core Service Registry — Technical Design | #12 | 0.0309 |
| 5 | Atlas Core Service Registry — Technical Design | #3 | 0.0306 |
| 6 | Atlas Core Service Registry — Technical Design | #10 | 0.0292 |
| 7 | Atlas Core Service Registry — Technical Design | #0 | 0.0286 |
| 8 | Atlas Core Service Registry — Technical Design | #9 | 0.0285 |

**Answer:**

Based on the context provided:

- **Redis cache TTL**: 60 seconds.
- **Maximum number of registered services**: 500 per Atlas project.

**Verdict:** ✓

---

**hybrid@150/25**
_1831ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | API Rate Limiting — Design & Implementation | #1 | 0.0323 |
| 2 | Atlas Core Service Registry — Technical Design | #2 | 0.0318 |
| 3 | Atlas Core Service Registry — Technical Design | #3 | 0.0313 |
| 4 | Atlas Core Service Registry — Technical Design | #1 | 0.0311 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.0306 |
| 6 | Atlas Core Service Registry — Technical Design | #10 | 0.0304 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0299 |
| 8 | Atlas Core Service Registry — Technical Design | #0 | 0.0291 |

**Answer:**

Based on the provided context:

- **Redis cache TTL:** 60 seconds.
- **Maximum number of services:** 500 registered services per Atlas project.

**Verdict:** ✓

---


### H3 — Long task — deep retrieval 🎯

**Expected behavior:** `answerable`

**Query:**
> What is the estimated monthly cost of the service registry and who approved it?

**Ground truth:**
> The total estimated incremental monthly cost is under $20. The cost analysis was prepared by Bob Chen on February 12, 2026 and approved by Alice Wang on February 13, 2026.

**Expected tasks:** Atlas Core Service Registry — Technical Design

---

**fullcontext**
_1430ms_

The estimated incremental monthly cost of the Atlas Core service registry is **under $20**. This was approved by **Alice Wang** on February 13, 2026.

**Verdict:** ✓

---

**single**
_1535ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | — | 0.7677 |
| 2 | Stripe Payment Integration — Developer Portal | — | 0.6665 |
| 3 | API Rate Limiting — Design & Implementation | — | 0.6432 |

**Answer:**

Based on the context, the estimated monthly cost of the service registry is **under $20**, and it was **approved by Alice Wang** on February 13, 2026.

**Verdict:** ✓

---

**chunked@150/50**
_1865ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #13 | 0.7826 |
| 2 | Atlas Core Service Registry — Technical Design | #8 | 0.7299 |
| 3 | Atlas Core Service Registry — Technical Design | #2 | 0.7263 |
| 4 | Atlas Core Service Registry — Technical Design | #12 | 0.7262 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.7228 |
| 6 | Atlas Core Service Registry — Technical Design | #0 | 0.7225 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.7203 |
| 8 | Atlas Core Service Registry — Technical Design | #11 | 0.7170 |

**Answer:**

Based on the context, the estimated monthly cost of the service registry is under $20. It was approved by Alice Wang on February 13, 2026.

**Verdict:** ✓

---

**chunked@150/25**
_1620ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #11 | 0.7927 |
| 2 | Atlas Core Service Registry — Technical Design | #10 | 0.7434 |
| 3 | Atlas Core Service Registry — Technical Design | #6 | 0.7253 |
| 4 | Atlas Core Service Registry — Technical Design | #7 | 0.7245 |
| 5 | Atlas Core Service Registry — Technical Design | #1 | 0.7237 |
| 6 | Atlas Core Service Registry — Technical Design | #0 | 0.7225 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.7126 |
| 8 | Atlas Core Service Registry — Technical Design | #9 | 0.7108 |

**Answer:**

The estimated monthly cost is under $20. This was approved by Alice Wang on February 13, 2026.

**Verdict:** ✓

---

**hybrid@150/50**
_1510ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #13 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #1 | 0.0311 |
| 3 | Atlas Core Service Registry — Technical Design | #0 | 0.0310 |
| 4 | Atlas Core Service Registry — Technical Design | #12 | 0.0308 |
| 5 | Atlas Core Service Registry — Technical Design | #2 | 0.0306 |
| 6 | Atlas Core Service Registry — Technical Design | #11 | 0.0296 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0291 |
| 8 | Atlas Core Service Registry — Technical Design | #9 | 0.0287 |

**Answer:**

The estimated monthly cost is **under $20**. This was **approved by Alice Wang** on February 13, 2026.

**Verdict:** ✓

---

**hybrid@150/25**
_2061ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #11 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #10 | 0.0323 |
| 3 | Atlas Core Service Registry — Technical Design | #0 | 0.0310 |
| 4 | Atlas Core Service Registry — Technical Design | #1 | 0.0308 |
| 5 | Atlas Core Service Registry — Technical Design | #9 | 0.0296 |
| 6 | Atlas Core Service Registry — Technical Design | #7 | 0.0293 |
| 7 | Atlas Core Service Registry — Technical Design | #8 | 0.0276 |
| 8 | Stripe Payment Integration — Developer Portal | #1 | 0.0270 |

**Answer:**

Based on the context, the estimated monthly cost is under $20, and it was approved by Alice Wang on February 13, 2026.

**Verdict:** ✓

---


### H4 — Long task — deep retrieval 🎯

**Expected behavior:** `answerable`

**Query:**
> What technologies were evaluated and rejected for the service registry, and why?

**Ground truth:**
> For storage, etcd was rejected (operational complexity) and Consul was rejected (licensing cost at scale) — MongoDB was chosen. For the communication protocol, gRPC was evaluated and rejected (on February 10, 2026) because most Atlas services are Node.js-based and the Node.js gRPC ecosystem requires native bindings that complicate Docker builds — REST over HTTPS was chosen.

**Expected tasks:** Atlas Core Service Registry — Technical Design

**Analysis — non-determinism & retrieval blind spot**

This case was run three times (original run, rag-eval-results01.json, and h4-rerun). Results differed across runs:

| Strategy | Run 1 | Run 2 (results01) | Run 3 (h4-rerun) | Root cause |
|---|---|---|---|---|
| fullcontext | ✓ etcd + Consul + gRPC | ✓ etcd + Consul + gRPC | ✗ gRPC missing | Inference non-determinism — gRPC always in context (1428 words), inconsistently surfaced |
| single | ✗ gRPC missing | ✗ gRPC missing | ✗ gRPC missing | Inference — whole task retrieved, model stops at storage rejections |
| chunked@150/50 | ✗ gRPC missing | ✗ gRPC missing | ✓ etcd + Consul + gRPC | Retrieval miss — chunk#2 ends at "Consul rejected... Architecture" and gRPC content starts just after the 150-token boundary in chunk#3 (not retrieved) |
| chunked@150/25 | ✗ gRPC missing | ✗ gRPC missing | ✗ gRPC missing | Retrieval miss — no chunk containing gRPC section in top-8 |
| hybrid@150/50 | ✗ gRPC missing | ✗ gRPC missing | ✗ gRPC missing | Retrieval miss — same chunk boundaries as chunked@150/50; chunk#3 not retrieved |
| hybrid@150/25 | ✗ gRPC missing | ✗ gRPC missing | ✓ etcd + Consul + gRPC | Retrieval miss (runs 1-2) — gRPC chunk below top-8 cutoff; run 3 borderline chunk made it in |

**Root causes (confirmed by inspecting chunk previews):**

- **Chunked/hybrid — chunk boundary splits gRPC away.** chunk#2 preview ends at "...Consul (rejected: licensing cost at scale). Architecture..." — the gRPC rejection starts right after this 150-token boundary in chunk#3, which never makes the top-8. The task ✓ 1/1 retrieval hit only confirms the Atlas task appeared — it does not guarantee the specific chunk containing gRPC was retrieved. chunk#3 scores lower because query terms (`evaluated`, `rejected`, `technologies`) match the storage section (etcd/Consul) more strongly than the communication protocol section.
- **Single — inference stop at storage section.** The whole task is retrieved as one unit so gRPC is always in context, but the model consistently extracts only etcd and Consul and stops. It anchors on the storage rejection section which appears first in the document and treats the query as answered without reading the communication protocol section.
- **Fullcontext — inference non-determinism.** The full document (1428 words) is always in context. Runs 1-2 correctly surfaced gRPC; run 3 missed it. Pure LLM sampling variance — with a very long context the model inconsistently decides how thoroughly to scan for all rejection decisions.
- **Retrieval matrix blind spot.** Task-level retrieval ✓ is not a reliable proxy for answer completeness on long single-task documents. A task can be "retrieved" while the specific chunk containing the critical fact is missing. Chunk-level coverage tracking would be needed to detect this.

---

**fullcontext**
_1885ms_

Based on the provided context, the following technologies were evaluated and rejected for the Atlas Core Service Registry:

- **etcd** — Rejected due to operational complexity.
- **Consul** — Rejected due to licensing cost at scale.
- **gRPC** — Rejected because the majority of Atlas services are Node.js-based, and the Node.js gRPC ecosystem requires native bindings that complicate Docker builds.

**Verdict:** ✓

---

**single**
_2010ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | — | 0.7354 |
| 2 | API Rate Limiting — Design & Implementation | — | 0.6559 |
| 3 | Mobile Responsive Redesign — Dashboard | — | 0.6406 |

**Answer:**

Based on the context, two technologies were evaluated and rejected for the Atlas Core service registry:

1. **etcd** — rejected due to **operational complexity**.
2. **Consul** — rejected due to **licensing cost at scale**.

Both decisions were finalised on February 10, 2026. The chosen solution is **MongoDB** (primary datastore) with a **Redis** cache layer.

**Verdict:** ~ · etcd + Consul covered; gRPC rejection (Node.js native bindings / Docker) missing

---

**chunked@150/50**
_1433ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

Two technologies were evaluated and rejected:

1. **etcd** – Rejected due to **operational complexity**.
2. **Consul** – Rejected due to **licensing cost at scale**.

Both decisions were finalised on February 10, 2026.

**Verdict:** ~ · etcd + Consul covered; gRPC rejection missing

---

**chunked@150/25**
_2299ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

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

Based on the context, two technologies were evaluated and rejected:

1. **etcd** — Rejected due to **operational complexity**.
2. **Consul** — Rejected due to **licensing cost at scale**.

These decisions were finalized on February 10, 2026. The chosen approach is **REST over HTTPS** for communication and **MongoDB with a Redis cache layer** for storage.

**Verdict:** ~ · etcd + Consul covered; REST over HTTPS noted as chosen but gRPC rejection not explicitly listed

---

**hybrid@150/50**
_2263ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Based on the design document, two technologies were evaluated and rejected:

1. **etcd** — Rejected due to **operational complexity**.
2. **Consul** — Rejected due to **licensing cost at scale**.

Both decisions were finalised on February 10, 2026.

**Verdict:** ~ · etcd + Consul covered; gRPC rejection missing

---

**hybrid@150/25**
_2296ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

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

Based on the design document, two technologies were evaluated and rejected:

1. **etcd** — rejected due to operational complexity
2. **Consul** — rejected due to licensing cost at scale

Both decisions were finalized on February 10, 2026. The chosen storage solution is MongoDB with a Redis cache layer (TTL: 60 seconds).

**Verdict:** ~ · etcd + Consul covered; gRPC rejection missing

---


### H5 — Long task — deep retrieval 🎯

**Expected behavior:** `answerable`

**Query:**
> What are the three migration waves for onboarding existing services, and what are their dates?

**Ground truth:**
> Three waves onboard the 47 existing microservices: Wave 1 (April 1–14, 2026) — the 5 pilot teams (Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity), 18 services total; Wave 2 (April 15–30, 2026) — the next 19 highest-traffic services, prioritized by request volume from load balancer logs; Wave 3 (May 1–15, 2026) — the remaining 10 services, including legacy systems.

**Expected tasks:** Atlas Core Service Registry — Technical Design

---

**fullcontext**
_2094ms_

Based on the context, the three migration waves for onboarding the 47 existing microservices are:

- **Wave 1 (April 1–14, 2026):** The 5 pilot teams from Phase 3 testing (Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity) — covering 18 services total.
- **Wave 2 (April 15–30, 2026):** The next 19 highest-traffic services, prioritized by request volume from load balancer logs.
- **Wave 3 (May 1–15, 2026):** Remaining 10 services, including legacy systems.

**Verdict:** ✓

---

**single**
_2144ms · 3 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Q1 Sprint Planning & Roadmap Review | — | 0.6922 |
| 2 | PostgreSQL Schema Migration — v2.3 | — | 0.6862 |
| 3 | Atlas Core Service Registry — Technical Design | — | 0.6846 |

**Answer:**

Based on the context, the three migration waves for onboarding existing services are:

1. **Wave 1 (April 1–14, 2026)**: The 5 pilot teams — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services.
2. **Wave 2 (April 15–30, 2026)**: The next 19 highest-traffic services, prioritised by request volume from load balancer logs.
3. **Wave 3 (May 1–15, 2026)**: Remaining 10 services, including legacy systems.

**Verdict:** ✓

---

**chunked@150/50**
_2082ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #10 | 0.7175 |
| 2 | Atlas Core Service Registry — Technical Design | #11 | 0.7045 |
| 3 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6993 |
| 4 | Atlas Core Service Registry — Technical Design | #7 | 0.6927 |
| 5 | PostgreSQL Schema Migration — v2.3 | #2 | 0.6910 |
| 6 | Q1 Sprint Planning & Roadmap Review | #1 | 0.6905 |
| 7 | PostgreSQL Schema Migration — v2.3 | #0 | 0.6877 |
| 8 | Atlas Core Service Registry — Technical Design | #6 | 0.6857 |

**Answer:**

Based on the context, the three migration waves for onboarding existing services to the Atlas Core service registry are:

- **Wave 1 (April 1–14, 2026):** 5 pilot teams — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services total.
- **Wave 2 (April 15–30, 2026):** The next 19 highest-traffic services, prioritized by request volume from load balancer logs.
- **Wave 3 (May 1–15, 2026):** Remaining 10 services, including legacy systems.

**Verdict:** ✓

---

**chunked@150/25**
_2088ms · 8 chunk(s) retrieved · retrieval ✓ 1/1_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #8 | 0.7175 |
| 2 | Atlas Core Service Registry — Technical Design | #5 | 0.7010 |
| 3 | PostgreSQL Schema Migration — v2.3 | #1 | 0.6994 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.6993 |
| 5 | Atlas Core Service Registry — Technical Design | #6 | 0.6947 |
| 6 | Atlas Core Service Registry — Technical Design | #9 | 0.6946 |
| 7 | Q1 Sprint Planning & Roadmap Review | #1 | 0.6916 |
| 8 | PostgreSQL Schema Migration — v2.3 | #0 | 0.6877 |

**Answer:**

Based on the context, the three migration waves for onboarding existing services (47 currently running microservices) to the Atlas Core service registry are:

1. **Wave 1 (April 1–14, 2026):** 5 pilot teams — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services.
2. **Wave 2 (April 15–30, 2026):** The next 19 highest-traffic services, prioritized by request volume from load balancer logs.
3. **Wave 3 (May 1–15, 2026):** Remaining 10 services, including legacy systems.

**Verdict:** ✓

---

**hybrid@150/50**
_2941ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #10 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #11 | 0.0311 |
| 3 | Atlas Core Service Registry — Technical Design | #9 | 0.0299 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0294 |
| 5 | Atlas Core Service Registry — Technical Design | #7 | 0.0288 |
| 6 | Atlas Core Service Registry — Technical Design | #0 | 0.0284 |
| 7 | Atlas Core Service Registry — Technical Design | #1 | 0.0161 |
| 8 | Code Review Standards & Team Guidelines | #1 | 0.0159 |

**Answer:**

Based on the context, the three migration waves for onboarding existing services to the Atlas Core Service Registry are:

- **Wave 1 (April 1–14, 2026):** 5 pilot teams — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services.
- **Wave 2 (April 15–30, 2026):** The next 19 highest-traffic services, prioritized by request volume from load balancer logs.
- **Wave 3 (May 1–15, 2026):** Remaining 10 services, including legacy systems.

**Verdict:** ✓

---

**hybrid@150/25**
_2051ms · 8 chunk(s) retrieved · retrieval ✓ 1/1 · bm25=20 vec=20_

**Retrieved chunks:**

| # | Task | Chunk | Score |
|---|---|---|---|
| 1 | Atlas Core Service Registry — Technical Design | #8 | 0.0328 |
| 2 | Atlas Core Service Registry — Technical Design | #9 | 0.0305 |
| 3 | Atlas Core Service Registry — Technical Design | #5 | 0.0298 |
| 4 | Q1 Sprint Planning & Roadmap Review | #0 | 0.0295 |
| 5 | Atlas Core Service Registry — Technical Design | #0 | 0.0292 |
| 6 | Atlas Core Service Registry — Technical Design | #7 | 0.0290 |
| 7 | Atlas Core Service Registry — Technical Design | #6 | 0.0289 |
| 8 | Q1 Sprint Planning & Roadmap Review | #1 | 0.0276 |

**Answer:**

Based on the design document, the three waves are:

- **Wave 1 (April 1–14, 2026)**: Onboard the 5 pilot teams — Platform Infrastructure, Developer Experience, Data Pipelines, Payments, Identity — covering 18 services.
- **Wave 2 (April 15–30, 2026)**: Onboard the next 19 highest-traffic services, prioritized by request volume.
- **Wave 3 (May 1–15, 2026)**: Onboard the remaining 10 services, including legacy systems.

**Verdict:** ✓

---


_End of report — 26 cases · 6 variants · generated 2026-06-02T16:30:09.045Z_
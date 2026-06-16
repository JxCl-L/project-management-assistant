# Answer Quality Summary — Non-correct Cases & All-correct Analysis

---

## Issue Type Groups

### Type 1 · LLM Inference Non-determinism / Attention Dilution
Model has the correct information in context but inconsistently surfaces it — caused by long input, multiple competing values, or stopping early in a long document.

| Case | Strategy | Description |
|---|---|---|
| A3 | fullcontext | Time detail (10:00 AM PST) sometimes dropped; whole document in context, fine-grained fact lost non-deterministically |
| D1 | single | Timeline events (10:05 AM deploy, 2:30 PM fix) sometimes missing; whole task retrieved as one unit but model skips events in long narrative |
| H4 | fullcontext | gRPC rejection sometimes dropped (correct in runs 1-2, missed in run 3); 1428-word Atlas Core doc in context |
| H4 | single | Model stops at storage rejections (etcd/Consul); does not read communication protocol section despite whole task being retrieved |
| G1 | chunked@150/50 | CI/CD extraction from Q2 Demo Prep indirect chunk varies between runs — sometimes full CI detail extracted, sometimes partial |
| G1 | hybrid@150/50 | CI dropped entirely in run 2; same chunks retrieved both runs |
| G1 | hybrid@150/25 | Load test capacity changes ignored in run 2 despite load test chunk being retrieved |

---

### Type 2 · Chunk Boundary Splits Critical Fact
The 150-token chunk boundary cuts the answer-bearing sentence away from high-scoring chunks. The right task is retrieved (✓ 1/1) but the right chunk within it is not.

| Case | Strategy | Description |
|---|---|---|
| B1 | chunked@150/50 | Post-fix chunk (#2, "P95 = 115ms") tops ranking; model anchors on 115ms as "after", then finds baseline 120ms before regressed 850ms → wrong "before" value in some runs |
| H2 | chunked@150/50 | chunk#2 ends right before "maximum 500 registered services per Atlas project"; only cost-analysis chunk ("500 service documents, ~5KB each") retrieved — correct reasoning, wrong evidence |
| H4 | chunked@150/50 | chunk#2 preview ends at "Consul rejected... Architecture..." — gRPC section starts at token 151 in chunk#3, which does not make top-8 |
| H4 | chunked@150/25 | Different boundary positions; no chunk containing gRPC in top-8 |
| H4 | hybrid@150/50 | Same chunk boundaries as chunked@150/50; chunk#3 not retrieved |
| H4 | hybrid@150/25 | No gRPC chunk in top-8 (runs 1-2); run 3 borderline |
| D2 | hybrid@150/25 | Post-mortem task retrieved (chunk#2) but it contains the recovery section, not the action items section; action items chunk not in top-8 — model listed exactly the 2 items visible in context and correctly noted "based on the post-mortem excerpt"; inference did its best given partial retrieval |
| A1 | hybrid@150/50 | chunk#0 (containing 10:12 AM first PagerDuty alert) displaced from top-8 by BM25 boosting Search Index #0 and Q2 Demo #3; earliest Post-mortem chunk in context was chunk#1 (mid-timeline); model correctly read chunk#1 and gave 10:30 AM rollback as start — good inference from incomplete retrieval |

---

### Type 3 · Semantic Mismatch — Vector Search Cannot Match Cross-cutting Queries
Query concept does not align with any single task's embedding. Vector search finds tasks that *mention* query terms, not tasks that *are about* the concept.

| Case | Strategy | Description |
|---|---|---|
| G1 | single, chunked@150/25 | "Performance improvements" doesn't match "GitHub Actions CI/CD Pipeline Upgrade" or "Load Testing Report" titles — model retrieves Q2 Demo Prep and Q1 Sprint Planning instead |
| G1 | chunked@150/50, hybrid@150/50, hybrid@150/25 | CI/CD task never directly retrieved; Load Test retrieved by some but CI/CD always comes from indirect demo prep chunks |
| G2 | all non-fullcontext | "Bob Chen February" — person+time filter invisible to vector search; vector finds tasks that mention Bob prominently, not all tasks Bob led in February |

---

### Type 4 · Hallucination from Project Metadata
Model fills retrieval gaps with plausible inferences from the project-level context (task list, member roles) included in every request — not from retrieved chunk evidence.

| Case | Strategy | Description |
|---|---|---|
| G2 | chunked@150/50 | Hallucinates "Load Testing (Feb 20)" and "GitHub Actions (Feb 28)" — neither task retrieved; inferred from project task list |
| G2 | chunked@150/25 | Hallucinates Auth Token (Q4 carryover), CI/CD, Sentry — none retrieved; Auth Token wrong month |
| G2 | hybrid@150/50 | Hallucinates CI/CD + Load Test + Sentry + Code Review across runs; Code Review and Sentry are January not February |
| G2 | hybrid@150/25 | CI/CD and Load Test hallucinated from project metadata; Code Review listed from January |
| G2 | single | Hallucinates Security Audit, Frontend, Mobile Redesign — not Bob's tasks; pulled from in-progress task list |

---

### Type 5 · Prompt Sensitivity / Overconfident Attribution
Model over-attributes facts beyond what the seed data explicitly states; adding "be skeptical" to the query produces a correct hedged answer — the information is in context but the default behaviour is overconfident.

| Case | Strategy | Description |
|---|---|---|
| C2 | all | "Bob identified the root cause" — seed only states Bob was assigned as investigator on Jan 16; root cause identified Jan 19 but no explicit statement of who found it; model bridges the gap with plausible inference |

---

### Type 6 · Open / Vague Query — Satisfaction Variance
No single correct answer exists; completeness and depth vary by how much context each strategy retrieves.

| Case | Strategy | Description |
|---|---|---|
| F3 | all | "Tell me about the project" — scores 72%–90% depending on strategy; fullcontext most complete (90%), hybrid@150/25 least (72%, listed Q2 demo as overdue — not in seed) |

---

---

## Cases Belonging to Multiple Issue Types

| Case | Types | Notes |
|---|---|---|
| A3 fullcontext | Type 1 + Type 6 | Attention dilution on long context; also marginal (time detail is fine-grained) |
| B1 chunked@150/50 | Type 2 + Type 1 | Chunk boundary puts post-fix chunk at top (Type 2); model then confuses baseline with regressed value given that context (Type 1) |
| H2 chunked@150/50 | Type 2 | Pure chunk boundary — model reasoning is actually correct given the evidence it received |
| H4 chunked/hybrid | Type 2 + Type 1 | Chunk boundary splits gRPC away (Type 2); fullcontext and single miss gRPC through inference (Type 1) |
| G1 all non-fullcontext | Type 3 + Type 1 | Semantic mismatch causes retrieval miss (Type 3); even when relevant chunks ARE retrieved, model inconsistently extracts from indirect sources (Type 1) |
| G2 all non-fullcontext | Type 3 + Type 4 | Person+time filter invisible to vector search (Type 3); model fills retrieval gap with project metadata hallucinations (Type 4) |
| C2 all | Type 5 | Pure prompt sensitivity — retrieval is fine across all strategies |
| D2 hybrid@150/25 | Type 2 only | Looks like truncation but is actually a retrieval miss — model answered correctly from what it had; inference did its best |
| A1 hybrid@150/50 | Type 2 only | Looks like wrong answer but is actually a retrieval miss — BM25 displaced chunk#0 (start time); model correctly inferred from chunk#1 (mid-timeline) |

---

## All-correct Cases (✓ across all 6 strategies)

**Cases:** A2, A4, B2, B3, B4, C1, C3, D3, D4, F1, F2, F4, H1, H3, H5

| Case | Query | Why it succeeds |
|---|---|---|
| A2 | API rate limiting design review date | Specific date + event name — distinctive tokens ("February 3", "design review", "11:00 AM") score very high against any retrieval strategy |
| A4 | Marcus Chen's first PR merge date | Person + specific event ("first PR", "PR #207", "February 6") — highly distinctive, appears prominently in the onboarding task |
| B2 | Jenkins → GitHub Actions cost saving | "$9,600" and "$800/month" are unique numeric tokens — vector and BM25 both retrieve the CI/CD task reliably |
| B3 | Load test results at 500 concurrent users | Specific numbers (P50=88ms, P95=410ms, P99=780ms) are unique to the load test task; "500 concurrent users" maps directly |
| B4 | Subscriptions on day one | "12 subscriptions", "March 15" — unique numbers in a single short section of Stripe task |
| C1 | Who ran load testing + tool | "Charlie Li" + "k6 v0.50" — person + specific tool name, highly distinctive tokens |
| C3 | Root cause of auth token expiry bug | Technical explanation (env variable rename, JWT_ACCESS_TTL_SECONDS) is unique and highly specific — only one possible answer in the seed |
| D3 | Marcus day 1 schedule + Docker issue | Detailed schedule + Docker version (4.26/4.28) — appears in a single cohesive section; chunking preserves it |
| D4 | Load test results + bottlenecks | Comprehensive but all facts concentrated in the load test task; every strategy retrieves it reliably |
| F1 | Which tasks are in progress | Metadata query — no RAG retrieval needed; answered from project task statuses directly |
| F2 | Figma URL (unanswerable) | All strategies correctly identify no Figma URL exists; unanswerable detection is robust |
| F4 | Duration of January 15 outage | "2 hours and 40 minutes" — simple, unique fact; highly distinctive semantic match to the post-mortem task |
| H1 | Atlas Core kickoff date + attendees | Meeting details in chunk#0 of Atlas Core (earliest chunk, highest scoring) — all 4 attendees + date in one dense paragraph |
| H3 | Monthly cost + who approved | "under $20" + "Alice Wang" + "February 13" — all unique tokens in the cost analysis chunk which consistently scores highest |
| H5 | Three migration waves + dates | Wave dates (April 1–14, April 15–30, May 1–15) are highly specific and unique — contained in one or two chunks that always score high |

### Common patterns behind all-correct cases

1. **Distinctive tokens** — specific numbers, proper names, dates that have no semantic competitors elsewhere in the dataset. Vector search is reliable when the answer tokens are rare and unambiguous.

2. **Single-section concentration** — the answer is fully contained within one chunk or one dense paragraph. No cross-section synthesis required; the right chunk always scores high enough.

3. **Early document position** — for long tasks (Atlas Core), facts in the opening chunks (H1 kickoff, H3 cost) consistently rank at the top. Facts buried deep in the document (H4 gRPC, H2 capacity spec) are less reliable.

4. **No semantic competitors** — for cases like B2 ($9,600) or C3 (JWT_ACCESS_TTL_SECONDS), the answer-bearing chunk has no rival chunk containing similarly distinctive tokens. The retrieval ranking is unambiguous.

5. **No person/time filter needed** — the query maps directly to a task's topic content. Contrast with G2 (person+time filter invisible to vector) or G1 (cross-cutting concept).

6. **No ambiguous values** — unlike B1 where 120ms and 850ms are both "before the fix" depending on interpretation, these cases have exactly one correct value in the context with no near-misses.

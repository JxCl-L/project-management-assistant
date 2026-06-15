# G2 Deep-Dive — Cross-task Synthesis: Person + Time Filter

**Query:** What did Bob Chen work on in February?

**Ground truth (required):** 6 tasks with specific February dates — (1) API Rate Limiting: design review Feb 3, draft PR Feb 5. (2) CI/CD migration: Phase 2 Feb 5, Phase 3 Feb 24, decommission Feb 28. (3) Stripe integration: started Feb 3, testing Feb 24–28. (4) Analytics Dashboard v2: API backend completed Feb 28. (5) Marcus onboarding: dev setup Feb 1, CONTRIBUTING.md update. (6) Atlas Core: kickoff Feb 10, cost analysis Feb 12.

**Expected tasks:** API Rate Limiting · GitHub Actions CI/CD · Stripe Payment Integration · Analytics Dashboard v2 · New Engineer Onboarding — Marcus Chen · Atlas Core Service Registry — Technical Design

---

## Why retrieval fails structurally

This query has two filters — **person** (Bob Chen) and **time** (February) — that vector search cannot handle:

- **Person filter:** Tasks are embedded based on their topic content, not who is assigned. "API Rate Limiting — Design & Implementation" embeds rate limiting concepts, not "Bob Chen led this." Tasks that *mention Bob prominently in their text* (Marcus onboarding, Bug Triage, Analytics) win retrieval because his name appears in chunk text. Tasks where Bob is the lead but the content is topic-focused (API Rate Limiting, CI/CD, Stripe, Atlas Core) score lower.
- **Time filter:** Embeddings have no temporal dimension. A January task scores identically to a February task if the topic is similar. "February" in the query does not filter results to February events.

As a result retrieval finds "tasks that mention Bob" not "tasks Bob led in February" — a fundamentally different thing. Retrieval is **consistent across all runs** — the same chunks appear every time. The problem is not retrieval variance, it is a structural mismatch between the query type and what vector search can do.

---

## Why so much hallucination

Two mechanisms combine to produce hallucinated answers:

**1. Project metadata always in context**
Every request includes a compact project overview — task list, member list, statuses — regardless of strategy. The model can *see task titles* like "GitHub Actions CI/CD Pipeline Upgrade" and knows Bob is an editor. When asked "what did Bob work on in February" it combines that project metadata with retrieved chunks and fills the gap with plausible inference. It correctly guesses Bob was on CI/CD (he was) but for the wrong reason — from metadata, not from retrieved evidence.

**2. No grounding instruction**
The system prompt says "answer based on the context above" but does not say "only cite facts explicitly present in the retrieved chunks." Without this constraint the model freely synthesises across retrieved chunks + project metadata, producing answers that *look* grounded but are partly fabricated. This is the same overconfidence pattern as C2 — the model bridges the gap between what was retrieved and what was asked with plausible inference rather than saying "I don't have enough information."

---

## 3-run comparison

Retrieval is **identical across all runs** for every strategy — same chunks, same order, every time. Every difference below is inference non-determinism + hallucination variance.

| Strategy | Run 1 | Run 2 | Run 3 | Grounded? | Verdict |
|---|---|---|---|---|---|
| fullcontext | ✓ 6/6 with dates | ✓ but adds Auth Token (Jan) + speculative items | ✓ mostly | Yes — all tasks in context | non-deterministic on edge items |
| single | ~ 2/6 Marcus + Analytics | ✗ hallucinates Security Audit, Frontend, Mobile | — | Partial | unstable — hallucinations vary |
| chunked@150/50 | ~ 2/6 Marcus + CI/CD (hallucinated) | ~ 1/6 CI/CD only (hallucinated, Marcus downgraded) | — | No for CI/CD | hallucination amount unstable |
| chunked@150/25 | ~ 1/6 CI/CD only | ~ 2/6 Auth Token (wrong) + CI/CD + Sentry (wrong) + Marcus | — | No | hallucination worse in run 2 |
| hybrid@150/50 | ✗ Code Review + Sentry (Jan) | ~ CI/CD + Load Test + Sentry + Code Review (mixed) | ~ CI/CD only | No | unstable — different wrong answers each run |
| hybrid@150/25 | ~ 2/6 CI/CD + Load Test (hallucinated) | ~ 1/6 Code Review only (Jan) | — | No | unstable — different wrong answers each run |

**Key observation:** When the answer happens to be correct (e.g. "Bob did CI/CD in February" — true), it is correct *by luck*, not by evidence. The model inferred it from project metadata. A different project where the metadata is misleading would produce a confidently wrong answer.

---

## Hallucination patterns observed

| Pattern | Example | Why it happens |
|---|---|---|
| **Right task, hallucinated** | CI/CD correctly attributed to Bob but not in retrieved chunks | Project metadata shows Bob as editor + CI/CD task exists → model infers involvement |
| **Wrong month** | Code Review Standards (Jan 27 meeting) listed as February work | Model ignores the date filter and includes tasks adjacent to February |
| **Wrong person** | Security Audit, Frontend, Mobile listed for Bob (run 2 single) | Model assigns all in-progress tasks to the queried person without checking assignee |
| **Speculative** | "Bob may have been involved in code reviews" for Mobile Redesign | Model hedges rather than omits — still a fabrication |
| **Partially correct** | Auth Token Bug listed (Bob was investigator) but it was Q4 2025 carryover, closed Jan 20 | Right person, wrong month |

---

## This is the most dangerous failure mode

G1's issue was under-extraction — the model missed topics that weren't retrieved. G2's issue is **fabrication** — the model produces answers that appear complete and confident but are partly invented. This is harder to detect because:
- The fabricated items are plausible (Bob really is involved in most of them)
- The answer format (bulleted list with dates) looks authoritative
- A user with no ground truth cannot distinguish grounded facts from hallucinations

---

## Approaches to fix

### 1. Grounding instruction in system prompt (low effort, immediate impact)

Add an explicit constraint:

```
Only cite information explicitly stated in the retrieved task chunks below.
Do not infer task assignments from the project member list or task titles.
If the retrieved context does not contain enough information to answer fully, say so explicitly.
```

This directly addresses the overconfidence issue. The model would correctly answer "I can only confirm Bob worked on Marcus onboarding and Analytics Dashboard based on the retrieved context" rather than fabricating the rest.

### 2. Person + date metadata filtering at retrieval time (medium effort)

Store `assignees` and `dateRange` as indexed fields on each task/chunk document. At query time, detect person names and date references in the query and apply a pre-filter before vector search:

```js
// pre-filter: only retrieve chunks from tasks where Bob Chen is assigned
// and date overlaps February 2026
{ assignees: "Bob Chen", dateRange: { $overlap: ["2026-02-01", "2026-02-28"] } }
```

This converts a semantic search problem into a metadata-filtered search problem for the person+time dimensions, using vector only for the remaining semantic ranking. Retrieval would return all 6 expected tasks reliably.

### 3. Query decomposition (medium effort)

Decompose the query into explicit sub-queries before retrieval:

```
"What did Bob Chen work on in February?"
  → retrieve: "API Rate Limiting Bob Chen February"
  → retrieve: "CI/CD migration Bob Chen February"
  → retrieve: "Stripe integration Bob Chen February"
  → ... (one per expected task type)
```

Sub-queries include the person name + month, making each retrieval call more targeted. Requires either LLM-based query decomposition or task-type heuristics.

### 4. Two-stage retrieval with cross-encoder re-ranking (high effort)

Stage 1: retrieve top 20 broadly.
Stage 2: re-rank using a cross-encoder that evaluates each chunk against the full query "What did Bob Chen work on in February 2026?" — cross-encoders evaluate query and document together and are much better at person + time relevance than bi-encoders.

### 5. Structured task index (high effort, most robust)

Store a structured representation of each task alongside the text embedding:

```json
{
  "taskId": "...",
  "assignees": ["Bob Chen"],
  "role": "lead",
  "month": "2026-02",
  "activities": ["design review Feb 3", "draft PR Feb 5"]
}
```

Person + time queries are answered from the structured index directly; retrieved text chunks provide supporting detail. Eliminates both the retrieval gap and the hallucination risk for this query type.

---

## Most practical next step

**Grounding instruction** is zero infrastructure cost and directly prevents the hallucination. Combine it with **person + date metadata filtering** for reliable retrieval. Together these two changes would turn G2 from the worst-performing case (hallucination across all non-fullcontext strategies) into a straightforwardly answerable query.

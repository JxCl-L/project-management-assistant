# B1 Deep-Dive — P95 Latency Before/After Fix

**Query:** What was the P95 search latency before and after the fix in January?

**Ground truth (required):** before fix ~850ms (Jan 22 benchmark = 870ms); after fix Jan 24 = 115ms.  
**Good-to-have:** pre-regression baseline was 120ms.

---

## Seed data — what is actually in the chunks

The Search Index Performance Optimization task contains three key numeric facts relevant to this query:

| Value | Context in seed | Meaning |
|---|---|---|
| 120ms | "jumped from a **baseline of 120ms** to 850ms" (chunk#0) | Pre-regression normal state |
| 120ms | "previous benchmark P95 = **120ms**" (chunk#1, Dec 20 benchmark) | Historical benchmark confirming baseline |
| 850ms | "jumped from 120ms to **850ms**" (chunk#0) | Regressed peak — what the query means by "before fix" |
| 870ms | "January 22 benchmark: P95 = **870ms**" (chunk#1) | Measured regression under load |
| 115ms | "post-fix benchmark: P95 = **115ms** — back within baseline range" (chunk#2) | After fix value |

The core ambiguity: **120ms** appears twice and is technically a valid "before fix" value if interpreted as "before the regression ever happened." The query intends the regressed peak (850ms/870ms), but the model can plausibly read it either way.

---

## 3-run stability results

| Strategy | Run 1 | Run 2 | Run 3 | Stable? |
|---|---|---|---|---|
| fullcontext | ✓ 850ms/115ms | ✗ 120ms as before | ✓ 850ms/115ms | non-deterministic |
| single | ✓ 870ms/115ms | ✓ 870ms/115ms | ✓ 870ms/115ms | stable ✓ |
| chunked@150/50 | ✓ 870ms/115ms | ✗ 120ms as before | ✓ 870ms/115ms | non-deterministic |
| chunked@150/25 | ✗ 120ms as before | ✓ 850ms/115ms | ✓ 850ms/115ms | non-deterministic |
| hybrid@150/50 | ✓ 870ms/115ms | ✓ 870ms/115ms | ✓ 850+870ms/115ms | stable ✓ |
| hybrid@150/25 | ✓ 850ms/115ms | ✓ 850ms/115ms | ✓ 850ms/115ms | stable ✓ |

---

## Why each strategy behaves the way it does

### fullcontext — non-deterministic
The full document is always passed in — retrieval is not involved. The model has access to all three values (120ms × 2, 850ms, 870ms, 115ms) simultaneously. With a long context the model's attention is diluted and inconsistently picks which value maps to "before the fix." No retrieval fix can help here; the instability is purely from LLM sampling over a long input.

### single — most stable
The entire task is retrieved as one coherent document. The sentence "jumped from a baseline of 120ms to 850ms" is read in narrative flow — the model understands 120ms as the pre-regression normal and 850ms as the problem state. No chunk splitting means no competing fragments, so the model consistently identifies the right value.

### chunked@150/50 — non-deterministic
chunk#2 (post-fix benchmark: "P95 = 115ms — back within baseline range") scores highest (0.836) because it is semantically closest to "before and after." The model reads 115ms first as the "after" anchor, then scans for "before." It hits chunk#1's December benchmark ("P95 = 120ms") before reaching the 850ms regression description, and sometimes latches onto 120ms as the before value.

### chunked@150/25 — non-deterministic (different risk profile)
Smaller overlap produces a different chunk#2 — the Redis cache optimization section ("to 12ms for cached queries...") — which does not contain 115ms prominently. The model has to find both before and after values from chunk#0 and chunk#1, which more often leads it to the correct 850ms. But in run 1 it still confused the baseline, showing the same 120ms ambiguity is present.

### hybrid@150/50 and hybrid@150/25 — stable
Chunk retrieval is identical to their chunked counterparts — same chunks, same chunk indices. The difference is BM25 re-ranking: terms like `regression`, `fix`, `benchmark`, `870ms` score high, pushing chunk#0 ("A search latency **regression** was detected... jumped from 120ms to **850ms**") to a higher position in the context window. The model reads the regression-peak value early and anchors on it, consistently avoiding the 120ms confusion.

---

## Key insight

The instability is not a retrieval failure — all strategies successfully retrieve the Search Index task (✓ 1/1). It is a **semantic ambiguity in the context**: 120ms is present as both the historical baseline and the December benchmark, making it a plausible "before" answer. The strategies that surface the regression sentence (chunk#0) prominently — either through narrative continuity (single) or BM25 re-ranking (hybrid) — consistently get it right. Strategies that lead with the post-fix chunk (chunked@150/50) or have a noisy long context (fullcontext) are susceptible to the confusion.

**The ordering mechanism — confirmed by code:** chunked and hybrid pass exactly the same four fields to the LLM for each chunk (task title, chunk position, description, chunkText) in the same format. The only difference is sequence: chunked orders by vector score, hybrid orders by RRF (vector + BM25). The LLM reads context top-to-bottom, so whichever chunk appears first has a stronger anchoring effect on the answer:

- **chunked@150/50:** post-fix chunk ("P95 = 115ms") wins top slot by vector score → model anchors on 115ms as "after", then searches for "before" → hits 120ms before 850ms → wrong answer
- **hybrid@150/50:** BM25 boosts chunk#0 ("regression... jumped from 120ms to **850ms**") to top → model anchors on 850ms as the problem value → correct answer

Same chunks, same format, different order — that is the entire explanation for hybrid's stability advantage over chunked on this case.

**Practical implication:** for queries where multiple numeric values are temporally related (baseline → regression → fix), BM25 keyword signal on event-specific terms (`regression`, `fix`) provides meaningful stability over pure vector retrieval, even when the retrieved chunk set is identical.

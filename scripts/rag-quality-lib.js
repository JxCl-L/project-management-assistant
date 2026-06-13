/**
 * Computes retrieval-quality signals for one (case, strategy) row.
 *
 * Input:
 *   caseRow         — entry from rag-eval-cases.json (has expectedTasks + goldFacts)
 *   retrievedTopK   — array of { task, chunkIndex, score } as returned by the chat provider
 *   strategy        — one of: "fullcontext" | "single" |
 *                     "chunked@150/50" | "chunked@150/25" |
 *                     "hybrid@150/50"  | "hybrid@150/25"
 *
 * Returns null for fullcontext (nothing to evaluate on the retrieval side).
 * Returns a signals object otherwise. See classifyMiss() for the diagnosis step.
 *
 * Design notes:
 *   - For "single", chunk-level analysis collapses to task-level: if the task
 *     is retrieved, every fact in it is considered covered.
 *   - For "chunked"/"hybrid", we use the precomputed chunks.{cfg}.full/partial
 *     indices on each goldFact (from rag-facts-build.js).
 *   - Only content-anchored facts contribute to sufficiency. Metadata facts
 *     (status/title/etc.) come from the project prompt, not retrieval — they
 *     are reported separately as `metadataFactsCount` for context.
 */

function configKey(strategy) {
  const at = strategy.indexOf("@");
  return at >= 0 ? strategy.slice(at + 1) : null;
}

function isContentFact(f) {
  return f.anchor === "content";
}

function uniqueExpectedTasks(caseRow) {
  return [...new Set(caseRow.expectedTasks || [])];
}

function retrievalSignals(caseRow, retrievedTopK, strategy) {
  if (strategy === "fullcontext") return null;

  const k = retrievedTopK.length;
  const contentFacts = (caseRow.goldFacts || []).filter(isContentFact);
  const metadataFactsCount = (caseRow.goldFacts || []).length - contentFacts.length;
  const expectedTasks = uniqueExpectedTasks(caseRow);

  // ─── task-level signals (all strategies that retrieve at all) ────────────
  const taskHits = expectedTasks.map((t) => ({
    task: t,
    hit: retrievedTopK.some((r) => r.task === t),
    rank: retrievedTopK.findIndex((r) => r.task === t), // -1 if not present
  }));
  const allTasksHit = expectedTasks.length === 0 || taskHits.every((x) => x.hit);
  const anyTaskHit = expectedTasks.length === 0 || taskHits.some((x) => x.hit);

  const chunksFromExpectedTasks = retrievedTopK.filter((r) =>
    expectedTasks.includes(r.task),
  ).length;
  const taskLevelNoise = k === 0 ? null : 1 - chunksFromExpectedTasks / k;

  // ─── "single": task-as-chunk; no per-chunk granularity ───────────────────
  if (strategy === "single") {
    return {
      strategy,
      k,
      taskHits,
      sufficiency:
        contentFacts.length === 0
          ? null
          : allTasksHit
            ? 1
            : taskHits.filter((x) => x.hit).length / expectedTasks.length,
      // every fact in a retrieved task is covered (task is the unit)
      factCoverage: contentFacts.map((f) => ({
        label: f.label,
        taskTitle: f.taskTitle,
        fullHit: taskHits.find((t) => t.task === f.taskTitle)?.hit ?? false,
        partialHit: false,
      })),
      chunkPrecision: null,
      noise: taskLevelNoise,
      metadataFactsCount,
      _flags: { anyTaskHit, allTasksHit },
    };
  }

  // ─── "chunked" / "hybrid": chunk-level analysis ──────────────────────────
  const cfg = configKey(strategy);
  if (!cfg) {
    throw new Error(`Unknown strategy: ${strategy}`);
  }

  const retrievedSet = new Set(
    retrievedTopK.map((r) => `${r.task}#${r.chunkIndex}`),
  );

  const factCoverage = contentFacts.map((f) => {
    const cfgChunks = f.chunks?.[cfg];
    if (!cfgChunks) {
      throw new Error(
        `Fact "${f.label}" has no chunks entry for config ${cfg} — re-run rag-facts-build.js`,
      );
    }
    const hitIdx = (idxs) =>
      idxs.find((i) => retrievedSet.has(`${f.taskTitle}#${i}`));
    return {
      label: f.label,
      taskTitle: f.taskTitle,
      fullHit: hitIdx(cfgChunks.full) !== undefined,
      partialHit: hitIdx(cfgChunks.partial) !== undefined,
      goldChunks: cfgChunks, // for drill-in
    };
  });

  const factsFullyCovered = factCoverage.filter((x) => x.fullHit).length;
  const factsPartiallyCovered = factCoverage.filter(
    (x) => !x.fullHit && x.partialHit,
  ).length;

  // chunk precision: a retrieved chunk is "relevant" if it appears in any
  // gold fact's full ∪ partial set for this task at this config.
  let relevant = 0;
  for (const r of retrievedTopK) {
    const isRelevant = contentFacts.some(
      (f) =>
        f.taskTitle === r.task &&
        (f.chunks[cfg].full.includes(r.chunkIndex) ||
          f.chunks[cfg].partial.includes(r.chunkIndex)),
    );
    if (isRelevant) relevant++;
  }
  const chunkPrecision = k === 0 ? null : relevant / k;

  return {
    strategy,
    k,
    taskHits,
    sufficiency:
      contentFacts.length === 0 ? null : factsFullyCovered / contentFacts.length,
    sufficiencyPartial:
      contentFacts.length === 0
        ? null
        : (factsFullyCovered + factsPartiallyCovered) / contentFacts.length,
    factCoverage,
    chunkPrecision,
    noise: k === 0 ? null : 1 - relevant / k,
    metadataFactsCount,
    _flags: {
      anyTaskHit,
      allTasksHit,
    },
  };
}

/**
 * Classifies a (case, strategy) row into one of:
 *   "success"
 *   "retrieval_miss_task"     — no expected task retrieved (Type 3)
 *   "retrieval_miss_chunk"    — task retrieved, no fact-bearing chunk (Type 2 total)
 *   "boundary_split"          — only partial chunks for ≥1 fact (Type 2 boundary)
 *   "mixed"                   — partial sufficiency + wrong/incomplete answer
 *   "generation_miss"         — full sufficiency, answer wrong (Type 1 / 5)
 *   "metadata_hallucination"  — answer right but no gold chunk retrieved (Type 4 candidate)
 *   "metadata_only"           — content-fact-less case (F1) — handled separately
 *   "open_ended"              — no goldFacts at all (F3) — use LLM judge instead
 *   "unanswerable"            — F2 — model should refuse
 *
 * answerCorrect is a boolean from the existing LLM-judged answer score.
 */
function classifyMiss(signals, caseRow, answerCorrect) {
  if (signals === null) {
    // fullcontext — pure generation evaluation
    return answerCorrect ? "success" : "generation_miss";
  }
  if (caseRow.expectedBehavior === "unanswerable") {
    return answerCorrect ? "success" : "generation_miss";
  }
  const contentFacts = (caseRow.goldFacts || []).filter(isContentFact);
  if (contentFacts.length === 0) {
    if ((caseRow.goldFacts || []).length === 0) return "open_ended";
    return "metadata_only";
  }

  const { sufficiency, sufficiencyPartial, _flags } = signals;
  const taskMissed = !_flags.anyTaskHit;
  const fullyCovered = sufficiency === 1;
  const partiallyCovered = sufficiency > 0 || (sufficiencyPartial ?? 0) > 0;
  const onlyPartial = !fullyCovered && partiallyCovered;

  if (taskMissed) {
    return answerCorrect ? "metadata_hallucination" : "retrieval_miss_task";
  }
  if (sufficiency === 0 && !partiallyCovered) {
    return answerCorrect ? "metadata_hallucination" : "retrieval_miss_chunk";
  }
  if (onlyPartial) {
    return answerCorrect ? "success" : "boundary_split";
  }
  // sufficiency === 1
  return answerCorrect ? "success" : "generation_miss";
}

module.exports = { retrievalSignals, classifyMiss };

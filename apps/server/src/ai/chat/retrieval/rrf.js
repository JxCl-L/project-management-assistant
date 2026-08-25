// Reciprocal Rank Fusion — merges multiple ranked lists into one.
// Each doc scores sum of 1/(k + rank) across all lists it appears in.
function reciprocalRankFusion(lists, k = 60) {
  const scores = new Map();
  for (const list of lists) {
    list.forEach((doc, rank) => {
      const key = doc._id.toString();
      const entry = scores.get(key) || { doc, score: 0 };
      entry.score += 1 / (k + rank + 1);
      scores.set(key, entry);
    });
  }
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map((e) => ({ ...e.doc, _rrfScore: e.score }));
}

module.exports = { reciprocalRankFusion };

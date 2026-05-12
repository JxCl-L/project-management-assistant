/**
 * Splits text into overlapping word-based chunks.
 *
 * chunkSize  — number of words per chunk        (default: CHUNK_SIZE env var or 300)
 * chunkOverlap — words shared between adjacent chunks (default: CHUNK_OVERLAP env var or 50)
 *
 * Example with chunkSize=5, overlap=2 and text "a b c d e f g h":
 *   chunk 0: "a b c d e"
 *   chunk 1: "d e f g h"   ← starts 3 words (5-2) after previous chunk start
 *
 * Overlap ensures a sentence split across a boundary still appears fully in at least one chunk,
 * so the vector for that chunk captures the complete thought.
 */
function chunkText(text, chunkSize, chunkOverlap) {
  const size = chunkSize || parseInt(process.env.CHUNK_SIZE) || 300;
  const overlap = chunkOverlap || parseInt(process.env.CHUNK_OVERLAP) || 50;

  const words = text.trim().split(/\s+/).filter(Boolean);

  // short enough to fit in one chunk — no splitting needed
  if (words.length <= size) return [text.trim()];

  const chunks = [];
  const step = size - overlap; // how many words to advance each iteration
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + size, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
    start += step;
  }

  return chunks;
}

module.exports = { chunkText };

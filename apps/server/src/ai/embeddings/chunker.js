/**
 * Returns all chunk configs from CHUNK_CONFIGS env var.
 * Format: JSON array  e.g. '[{"size":150,"overlap":50},{"size":150,"overlap":25}]'
 * Falls back to a single default config (size=300, overlap=50) if not set.
 */
function getChunkConfigs() {
  if (process.env.CHUNK_CONFIGS) {
    return JSON.parse(process.env.CHUNK_CONFIGS);
  }
  return [{ size: 300, overlap: 50 }];
}

/**
 * Splits text into overlapping word-based chunks.
 *
 * Example with size=5, overlap=2 and text "a b c d e f g h":
 *   chunk 0: "a b c d e"
 *   chunk 1: "d e f g h"   ← starts 3 words (5-2) after previous chunk start
 *
 * Overlap ensures a sentence split across a boundary still appears fully in at least one chunk,
 * so the vector for that chunk captures the complete thought.
 */
function chunkText(text, size, overlap) {

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

module.exports = { chunkText, getChunkConfigs };

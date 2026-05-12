/**
 * Server-side debouncer for embedding generation.
 *
 * When content is updated rapidly (e.g. auto-save every few seconds), re-embedding
 * on every save wastes API calls — the embedding is immediately stale anyway.
 *
 * Instead: schedule embedding X ms after the last update for a given task.
 * If a new update arrives before the timer fires, cancel and restart the timer.
 * Only the final state of the content gets embedded.
 *
 * Delay is controlled by EMBEDDING_DEBOUNCE_MS env var (default: 15000ms / 15s).
 *
 * Limitation: timers are in-memory. A server restart during the delay window means
 * that content save won't get embedded until the next edit. Acceptable for now.
 */

const timers = new Map(); // taskId (string) -> NodeJS.Timeout

const DEBOUNCE_MS = parseInt(process.env.EMBEDDING_DEBOUNCE_MS) || 15000;

/**
 * @param {string} taskId
 * @param {() => Promise<void>} embeddingFn - async function that generates and saves embeddings
 */
function scheduleEmbedding(taskId, embeddingFn) {
  // cancel any pending embedding for this task
  if (timers.has(taskId)) {
    clearTimeout(timers.get(taskId));
  }

  const timer = setTimeout(async () => {
    timers.delete(taskId);
    try {
      await embeddingFn();
    } catch (err) {
      console.error(`[embeddingDebouncer] embedding failed for task ${taskId}:`, err.message);
    }
  }, DEBOUNCE_MS);

  timers.set(taskId, timer);
}

module.exports = { scheduleEmbedding };

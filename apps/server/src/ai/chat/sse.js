// Server-Sent Events helpers.
// `data:` lines must be followed by a blank line per the SSE spec.
// We JSON-encode each event so the client can parse a stable payload shape
// regardless of which event type fired.
function writeSSE(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function initSSE(res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

// Stage callback factory. When streaming, writes an SSE `stage` event;
// otherwise a no-op. Inserted at real pipeline boundaries (analyzing,
// retrieving, generating) so the client UI reflects what the server is
// actually doing — not hardcoded progress phrases.
function makeStageEmitter(res, streaming) {
  return streaming
    ? (stage) => writeSSE(res, { type: "stage", stage })
    : () => {};
}

module.exports = { writeSSE, initSSE, makeStageEmitter };

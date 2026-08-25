// Resolve which stored chunk version to retrieve against.
// Priority: ?_chunkConfig query (eval scripts only) > CHUNK_RETRIEVAL_CONFIG env
// > first entry of CHUNK_CONFIGS env > 300/50 fallback.
function resolveChunkFilter(req) {
  const param = req.query._chunkConfig || process.env.CHUNK_RETRIEVAL_CONFIG;
  if (param) {
    const [size, overlap] = param.split(":").map(Number);
    return { chunkSize: size, chunkOverlap: overlap };
  }
  try {
    const { size, overlap } = JSON.parse(process.env.CHUNK_CONFIGS)[0];
    return { chunkSize: size, chunkOverlap: overlap };
  } catch {
    return { chunkSize: 300, chunkOverlap: 50 };
  }
}

module.exports = { resolveChunkFilter };

const OpenAI = require("openai");

const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// created lazily so missing OPENAI_API_KEY doesn't crash on startup
let openaiClient = null;
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const PRIMARY = { client: deepseekClient, model: "deepseek-chat" };
const FALLBACK = {
  get client() {
    return getOpenAIClient();
  },
  model: "gpt-4o-mini",
};

// Try DeepSeek first, fall back to OpenAI on error.
// For streaming (stream:true), fallback only fires if the initial request
// throws BEFORE any tokens arrive — once tokens are flowing, mid-stream
// errors propagate so the caller can emit a clean error event instead of
// silently swapping providers.
async function withFallback(makeRequest) {
  try {
    return await makeRequest(PRIMARY);
  } catch {
    return await makeRequest(FALLBACK);
  }
}

async function callAI(messages, maxTokens = 600) {
  const response = await withFallback(({ client, model }) =>
    client.chat.completions.create({ model, messages, max_tokens: maxTokens }),
  );
  return response.choices[0].message.content;
}

// Streaming variant: yields token strings as the model produces them.
// Use with `for await (const token of callAIStream(...))`.
async function* callAIStream(messages, maxTokens = 600) {
  const stream = await withFallback(({ client, model }) =>
    client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      stream: true,
    }),
  );
  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content;
    if (token) yield token;
  }
}

// text-embedding-3-small: 1536 dimensions, cheap (~$0.00002 / 1K tokens)
async function generateEmbedding(text) {
  const response = await getOpenAIClient().embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

module.exports = { callAI, callAIStream, generateEmbedding };

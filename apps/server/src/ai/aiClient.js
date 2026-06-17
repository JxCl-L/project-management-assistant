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

async function callAI(messages, maxTokens = 600) {
  try {
    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  } catch (deepseekError) {
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  }
  // TEMP: using gpt-4o to test reasoning on H4 — revert to deepseek-chat after
  // const response = await getOpenAIClient().chat.completions.create({
  //   model: "gpt-4o",
  //   messages,
  //   max_tokens: maxTokens,
  // });
  // return response.choices[0].message.content;
}

// Streaming variant: yields token strings as the model produces them.
// Use with `for await (const token of callAIStream(...))`. Falls back to
// OpenAI if DeepSeek fails BEFORE the first token; once tokens have started
// flowing, mid-stream errors propagate so the caller can emit a clean SSE
// error event instead of silently swapping providers.
async function* callAIStream(messages, maxTokens = 600) {
  let stream;
  try {
    stream = await deepseekClient.chat.completions.create({
      model: "deepseek-chat",
      messages,
      max_tokens: maxTokens,
      stream: true,
    });
  } catch (deepseekError) {
    stream = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      stream: true,
    });
  }
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

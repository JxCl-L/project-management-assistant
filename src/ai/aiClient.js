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
}

module.exports = { callAI };

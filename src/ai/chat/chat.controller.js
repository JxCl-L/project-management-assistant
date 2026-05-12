const chatProvider = require("./chat.provider.js");

async function handlePostChat(req, res) {
  return await chatProvider(req, res);
}

module.exports = { handlePostChat };

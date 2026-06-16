const {StatusCodes} = require("http-status-codes");
const createUserProvider = require("./providers/createUserProvider.js");

async function handleCreateUser(req, res) {
    return await createUserProvider(req, res);
};

module.exports = { handleCreateUser };

const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const createTaskContentProvider = require("./providers/createTaskContent.provider.js");
const getTaskContentProvider = require("./providers/getTaskContent.provider.js");
const updateTaskContentProvider = require("./providers/updateTaskContent.provider.js");
// const deleteTaskContentProvider = require("./providers/deleteTaskContent.provider.js");

async function handleGetTaskContent(req, res) {
    return await getTaskContentProvider(req, res);
}

async function handlePostTaskContent(req, res) {
    return await createTaskContentProvider(req, res);
    // res.status(StatusCodes.CREATED).json(task);
    // res.send("Hello World from POST tasks controller!");
}

async function handlePatchTaskContent(req, res) {
    return await updateTaskContentProvider(req, res);
    // res.send("Hello World from PATCH tasks controller!");
}

// async function handleDeleteTaskContent(req, res) {
//     return await deleteTaskContentProvider(req, res);
// }

module.exports = { handleGetTaskContent, handlePostTaskContent, handlePatchTaskContent };
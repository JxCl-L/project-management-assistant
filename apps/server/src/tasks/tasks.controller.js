// const { de } = require("date-fns/locale");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const createTaskProvider = require("./providers/createTask.provider.js");
const getTasksProvider = require("./providers/getTasks.provider.js");
const getTaskProvider = require("./providers/getTask.provider.js");
const updateTaskProvider = require("./providers/updateTask.provider.js");
const deleteTaskProvider = require("./providers/deleteTask.provider.js");
const rewriteTaskProvider = require("./providers/rewriteTask.provider.js");
const generateTaskProvider = require("./providers/generateTask.provider.js");

async function handleGetTasks(req, res) {
    return await getTasksProvider(req, res);

    // pretent to be the res
    // let response = [
    //     {
    //         title: "Task 1",
    //         date: "2023-10-01",
    //         description: "Description for Task 1",
    //         priority: "high",
    //         status: "todo",
    //     },
    //     {
    //         title: "Task 2",
    //         date: "2023-10-02",
    //         description: "Description for Task 2",
    //         priority: "normal",
    //         status: "todo",
    //     }
    // ];

    // res.json(response); // status be default 200
    // below can set status code yourself
    // res.status(StatusCodes.OK).json({
    //     status: "success",
    //     StatusCode: StatusCodes.OK,
    //     message: ReasonPhrases.OK,
    //     data: response
    // }); 
    // res.status(StatusCodes.OK).json(response);
}

async function handleGetTask(req, res) {
    return await getTaskProvider(req, res);
}

async function handlePostTasks(req, res) {
    return await createTaskProvider(req, res);
    // res.status(StatusCodes.CREATED).json(task);
    // res.send("Hello World from POST tasks controller!");
}

async function handlePatchTasks(req, res) {
    return await updateTaskProvider(req, res);
    // res.send("Hello World from PATCH tasks controller!");
}

async function handleDeleteTasks(req, res) {
    return await deleteTaskProvider(req, res);
}

async function handleRewriteTask(req, res) {
    return await rewriteTaskProvider(req, res);
}

async function handleGenerateTask(req, res) {
    return await generateTaskProvider(req, res);
}

module.exports = { handleGetTasks, handleGetTask, handlePostTasks, handlePatchTasks, handleDeleteTasks, handleRewriteTask, handleGenerateTask };

const createProjectProvider = require("./providers/createProject.provider.js");
const getProjectsProvider = require("./providers/getProjects.provider.js");
const getProjectProvider = require("./providers/getProject.provider.js");
const updateProjectProvider = require("./providers/updateProject.provider.js");
const deleteProjectProvider = require("./providers/deleteProject.provider.js");

async function handleGetProjects(req, res) {
    return await getProjectsProvider(req, res);
}

async function handleGetProject(req, res) {
    return await getProjectProvider(req, res);
}

async function handlePostProjects(req, res) {
    return await createProjectProvider(req, res);
}

async function handlePatchProjects(req, res) {
    return await updateProjectProvider(req, res);
}

async function handleDeleteProjects(req, res) {
    return await deleteProjectProvider(req, res);
}

module.exports = { handleGetProjects, handleGetProject, handlePostProjects, handlePatchProjects, handleDeleteProjects };

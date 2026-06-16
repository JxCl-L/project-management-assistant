
const createMemberProvider = require("./providers/createMember.provider.js");
const getMembersProvider = require("./providers/getMembers.provider.js");
const updateMemberProvider = require("./providers/updateMember.provider.js");
const deleteMemberProvider = require("./providers/deleteMember.provider.js");
const createMemberByEmailProvider = require("./providers/createMemberByEmail.provider.js");

async function handleGetMembers(req, res) {
    return await getMembersProvider(req, res);
}

async function handlePostMembers(req, res) {
    return await createMemberProvider(req, res);
}

async function handlePostMembersByEmail(req, res) {
    return await createMemberByEmailProvider(req, res);
}

async function handlePatchMembers(req, res) {
    return await updateMemberProvider(req, res);
}

async function handleDeleteMembers(req, res) {
    return await deleteMemberProvider(req, res);
}

module.exports = { handleGetMembers, handlePostMembers, handlePatchMembers, handleDeleteMembers, handlePostMembersByEmail };

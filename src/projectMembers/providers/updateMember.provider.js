const Member = require("../member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function updateMemberProvider(req, res) {
  const validatedData = matchedData(req);
  const memberIdToUpdate = validatedData["_id"];
  const newRole = validatedData.role;
  const currentUserId = req.user?.sub;
  const projectId = req.params.projectId;

  try {
    const allMembers = await Member.find({
      project: projectId,
    });

    // authorization check
    const currentUserMember = allMembers.find(
      (member) => member.user.toString() === currentUserId
    );

    if (!currentUserMember || currentUserMember.role !== "manager") {
      return res.status(StatusCodes.FORBIDDEN).json({
        message:
          "You do not have permission to modify members in this project.",
      });
    }

    // find member to update by _id
    const memberToUpdate = allMembers.find(
      (member) => member._id.toString() === memberIdToUpdate
    );

    if (!memberToUpdate) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Member not found in this project.",
      });
    }

    // change manager to non manager: cannot modify the only manager
    if (memberToUpdate.role === "manager" && newRole !== "manager") {
      const managerCount = allMembers.filter(
        (member) => member.role === "manager"
      ).length;
      if (managerCount <= 1) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Cannot change the role of the only manager. Assign another manager first.",
        });
      }
    }

    memberToUpdate.role = newRole;
    await memberToUpdate.save();

    return res.status(StatusCodes.OK).json(memberToUpdate);
  } catch (error) {
    errorLogger("Error while updating project member", req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = updateMemberProvider;

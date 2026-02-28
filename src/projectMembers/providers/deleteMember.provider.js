const Member = require("../member.schema.js");
const { matchedData } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");

async function deleteMemberProvider(req, res) {
  const validatedData = matchedData(req);
  const memberIdToDelete = validatedData["_id"];
  const currentUserId = req.user?.sub;
  const projectId = req.params.projectId;

  try {
    const allMembers = await Member.find({
      // user: req.user?.sub,
      // role: "manager",
      project: projectId,
    });

    // authorization check
    const currentUserMember = allMembers.find(
      (member) => member.user.toString() === currentUserId
    );

    if (!currentUserMember || currentUserMember.role !== "manager") {
      return res.status(StatusCodes.FORBIDDEN).json({
        message:
          "You do not have permission to delete members in this project.",
      });
    }

    // find member to delete
    const memberToDelete = allMembers.find(
      (member) => member._id.toString() === memberIdToDelete
    );

    if (!memberToDelete) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Member not found in this project.",
      });
    }

    // cannot remove last member
    if (allMembers.length <= 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Cannot remove the last member of the project.",
      });
    }

    // cannot remove only manager
    if (memberToDelete.role === "manager") {
      const managerCount = allMembers.filter(
        (member) => member.role === "manager"
      ).length;
      if (managerCount <= 1) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "Cannot remove the only manager. Assign another manager first.",
        });
      }
    }

    // perform member deletion
    const deletedMember = await Member.deleteOne({ _id: memberIdToDelete });

    if (deletedMember.deletedCount === 0) {
      return res.status(404).json({
        message: "Member not found.",
      });
    }
    res.status(StatusCodes.OK).json(deletedMember);
  } catch (error) {
    errorLogger("Error while deleting member", req, error);
    return res.status(StatusCodes.GATEWAY_TIMEOUT).json({
      message: "Unable to process your request, please try again later.",
    });
  }
}

module.exports = deleteMemberProvider;

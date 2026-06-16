const Project = require("../project.schema.js");
const Member = require("../../projectMembers/member.schema.js");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");


async function createProjectProvider(req, res) {
    console.log("Creating project with data:", req.body); // incoming data may contain extra fields

    const validatedResult = req.body; // this will filter out any extra fields not defined in the validator
    console.log("Validated data:", validatedResult);
    console.log("User info from token:", req.user);

    const project = new Project({ ...validatedResult, createdBy: req.user.sub }); 
    // use only validated data to create new Project, not req.body directly
    
    try { 
        await project.save();

        const member = new Member({ user: req.user.sub, project: project._id, role: "manager" });
        await member.save();

        return res.status(StatusCodes.CREATED).json(project);
    } catch (error) {
        // console.error("Error creating task:", error); // this error usually from database or db connection
        errorLogger(`WOW Error creating a new task: ${error.message}`, req, error);
        
        return res.status(StatusCodes.GATEWAY_TIMEOUT)
            .json({ message: "Unable to process your request, please try again later." });
    }
    
}

module.exports = createProjectProvider;
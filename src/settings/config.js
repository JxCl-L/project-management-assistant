const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const responseFormatter = require("../middleware/responseFormatter.js");
const tasksRouter = require("../tasks/tasks.router.js");
const authRouter = require("../auth/auth.router.js");
const usersRouter = require("../users/users.router.js");
const projectsRouter = require("../projects/projects.router.js");
const membersRouter = require("../projectMembers/members.router.js");
const taskContentRouter = require("../taskContent/taskContent.router.js");
const expressWinstonLogger = require("../middleware/expressWinston.middleware.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./swagger.config.js");

function configuraApp(app) {
    // middleware

    // const corsOptions = {
    //     origin: ["http://localhost:3000", "http://localhost:3001"], // allow only this origin to access the API
    //     methods: ["GET", "POST", "PUT", "DELETE"], // allow only these HTTP methods
    //     allowedHeaders: ["Content-Type", "Authorization"], // allow only these headers
    // };

    // app.use(cors(corsOptions)); // enable CORS for specific origins

    app.use(cors()); // enable CORS for all origins only for development

    let accessLogStream = fs.createWriteStream(
        path.join(__dirname, "..", "access.log"), 
        { flags: 'a' }
    ); // create a write stream for access.log

    app.use(morgan("combined", { stream: accessLogStream })); // log requests to access.log
    app.use(responseFormatter);
    app.use(expressWinstonLogger); // log requests and responses using winston

    // define all routes

    app.use("/projects/:projectId/tasks/:taskId/contents", taskContentRouter);
    app.use("/projects/:projectId/tasks", tasksRouter);
    app.use("/projects/:projectId/members", membersRouter);
    app.use("/auth", authRouter);
    app.use("/users", usersRouter);
    app.use("/projects", projectsRouter);
      
    

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs)); // generate API docs at /api-docs

    // define what to do if no route matches
    // this must be after all routes are defined
    // so that all defined routes can be matched first
    // and this middleware can handle any unmatched routes

    app.use((req, res) => {
        res.status(StatusCodes.NOT_FOUND).json(
            null
        );
    });

}

module.exports = configuraApp;
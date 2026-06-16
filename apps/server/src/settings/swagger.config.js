const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");
const { title } = require("process");
const { url } = require("inspector");
const { serve } = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Task Manager API",
            version: "0.1.0",
            description: "API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "Cloudia",
                url: "https://github.com/JxCl-L",
                email: "jiaxili0624@gmail.com"
            }
        },
        servers: [
            {
                url: "http://localhost:3001",
            }
        ]
    },
    apis: [path.join(__dirname, "..", "**/*.js")],
};

const specs = swaggerJsDoc(options);
module.exports = specs;
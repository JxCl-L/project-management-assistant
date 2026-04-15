const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const configuraApp = require("./settings/config.js");
const { createIO } = require("./socket/io.js");
const initSocket = require("./socket/socket.js");

process.env.NODE_ENV = process.env.NODE_ENV || "development"; // default to development if not set
const envFile = `.env.${process.env.NODE_ENV}`;

dotenv.config({ path: envFile }); // load environment variables from envFile not just default .env

// console.log("Test env variable:", process.env.TEST_VARIABLE); // verify env variable is loaded

const app = express();
const port = parseInt(process.env.PORT);
    //port number: any number from 0 to 65535, some may clash with well-known ports
console.log("Environment:", process.env.NODE_ENV);

// middleware

app.use(express.json()); // parse JSON request body

configuraApp(app); // configure the app with middleware and routes

const httpServer = http.createServer(app);
const io = createIO(httpServer);
initSocket(io);

async function bootstrap() {
    try {
        // 1. Connect to MongoDB FIRST
        await mongoose.connect(
            process.env.DATABASE_URL,
            { dbName: process.env.DATABASE_NAME }
        );
        console.log("Connected to MongoDB");

        // 2. ONLY start server after database is ready
        httpServer.listen(port, () => {
            console.log(`Start running by ${new Date().toLocaleString()}`)
            console.log(`App listening on port ${port}`);
        });
    } catch (error) {
        // 3. If database fails, don't start server at all
        console.log("Error connecting to MongoDB:", error);
        process.exit(1); // Terminate the entire application
    }
}

bootstrap();




const winston = require("winston");
const path = require("path");

// error levels: the choose level and all levels with lower numerical value will be logged
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6

// define Transport Array (Output Destinations) for the logger
const transports = [
    new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
            winston.format.colorize(),
            // winston.format.simple()
        ),
    }),
    new winston.transports.File({
        level: "info",
        filename: path.join(__dirname, "../..", "info.log"),
        format: winston.format.json(),
    }),
    new winston.transports.File({
        level: "error",
        filename: path.join(__dirname, "../..", "error.log"),
        format: winston.format.json(),
    }),
];

// create a logger instance with Base Logger Setup and the defined transports
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info)=>`${info.timestamp} [${info.level}] : ${info.message}`)
    ),
    transports: transports,
});

module.exports = logger;

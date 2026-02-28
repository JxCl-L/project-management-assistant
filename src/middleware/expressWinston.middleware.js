const expressWinston = require("express-winston");
const winstonLogger = require("../helpers/winston.helper.js");

// create expressWinston middleware for logging HTTP requests and responses
const expressWinstonLogger = expressWinston.logger({
    winstonInstance: winstonLogger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}} responded with {{res.statusCode}} in {{res.responseTime}}ms", // optional: customize the default logging message.
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true.
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});

module.exports = expressWinstonLogger;
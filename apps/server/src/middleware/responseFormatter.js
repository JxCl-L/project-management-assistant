const { getReasonPhrase } = require("http-status-codes");

function responseFormatter(req, res, next) {
    const originalJson = res.json; // save the original res.json function

    res.json = (data) => { // override res.json with custom implementation
        const response = {
            status: res.statusCode >= 200 && res.statusCode < 300 ? "success" : "error",
            statusCode: res.statusCode,
            message: getReasonPhrase(res.statusCode),
            // data: res.statusCode >= 200 && res.statusCode < 300 ? data : null,
            // error: res.statusCode >= 200 && res.statusCode < 300 ? null : data,
        };

        if (res.statusCode >= 200 && res.statusCode < 300) {
            response.data = data.pagination ? data.data : data; // include pagination data if present
        }

        if (res.statusCode >= 300) {
            response.error = data; // include error details if any
        }

        if (data.pagination) {
            response.pagination = data.pagination; // include pagination info if present
        }

        

        originalJson.call(res, response); // // Call original res.json with wrapped data
    };
    next();
}

module.exports = responseFormatter;
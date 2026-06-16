const jwt = require("jsonwebtoken");

function generateTokenProvider(user) {
    const payload = {
        sub: user["_id"],
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
            // Issued At - when token was created
        exp: Math.floor(Date.now() / 1000) 
            + parseInt(process.env.JWT_ACCESS_EXPIRATION_TTL),
            // Expiration - when token expires
    };

    return jwt.sign(payload, process.env.JWT_SECRET);
}

module.exports = generateTokenProvider;
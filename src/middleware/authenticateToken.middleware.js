const {StatusCodes} = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log("Authenticating token:", token);

    if (!token) {
        console.error("No token found");
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Authentication failed. You are not authorized to perform this request" });
    } 

    // Verify Token Signature and Expiration
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // process.env.JWT_SECRET be set in your environment variables
        if (err) {
            return res
                // .status(StatusCodes.FORBIDDEN)
                .status(StatusCodes.UNAUTHORIZED)
                .json({message: "Invalid Authentication token. Please login again"}); // Forbidden
        }
        console.log("Token verified, user:", decoded);
        req.user = decoded; // contains id as sub, email, iat, exp
        next();
    });
};

module.exports = authenticateToken;
// JWT web tokens
const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyJWT = (req, res, next) => {
    // extract bearer+token from header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log(authHeader); // Bearer token with a space between

    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); // not authorized.

    const token = authHeader.split(" ")[1]; // extract access token portion
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            console.error(err);
            return res.sendStatus(403); // forbidden.
        }
        req.user = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;
        next();
    });
};

module.exports = verifyJWT;

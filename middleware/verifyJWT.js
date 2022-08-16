// JWT web tokens
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    // extract bearer+token from header
    const authHeader = req.headers['authorization'];
    console.log(authHeader); // Bearer token with a space between

    if(!authHeader) return res.sendStatus(401); // not authorized.

    const token = authHeader.split(' ')[1]; // extract access token portion
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); // forbidden.
            req.user = decoded.username;
            next();
        }
    );
}

module.exports = verifyJWT;
const usersDB = {
    users: require("../models/users.json"),
    setUsers: function (data) {
        this.users = data;
    },
};

// file based DB system.
const fsPromise = require("fs").promises;
const path = require("path");

// password encryption (hashing)
const bcrypt = require("bcrypt");

// JWT web tokens
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }
    const duplicate = usersDB.users.find((person) => person.username === user);
    if (duplicate) return res.sendStatus(409);
    try {
        // encrypt (hash*11) the password
        const hashedPwd = await bcrypt.hash(pwd, 11);
        // store the new user
        const newUser = {
            username: user,
            roles: { User: 2022 },
            password: hashedPwd,
        };
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromise.writeFile(
            path.join(__dirname, "..", "models", "users.json"),
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.status(201).json({ success: `New User ${user} created` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) {
        return res
            .status(400)
            .json({ message: "Username and password are required" });
    }
    console.log("finding User...");
    const foundUser = usersDB.users.find((item) => item.username === user);
    if (!foundUser) {
        return res.sendStatus(401); // unauthorized
    }
    // evaluate password
    console.log("Authenticating password");
    const isMatch = await bcrypt.compare(pwd, foundUser.password);
    if (isMatch) {
        const roles = Object.values(foundUser.roles);
        // create JWTs (auth token and refresh token)
        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles: roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30s" }
        );
        const refreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        // store refresh token in the db: saving refreshToken with current user
        const otherUsers = usersDB.users.filter(
            (person) => person.username !== foundUser.username
        );
        const currentUser = { ...foundUser, refreshToken };
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromise.writeFile(
            path.join(__dirname, "..", "models", "users.json"),
            JSON.stringify(usersDB.users)
        );

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken });
    } else {
        res.sendStatus(401); //
    }
};

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // unauthorized.
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const foundUser = usersDB.users.find(
        (person) => person.refreshToken === refreshToken
    );
    if (!foundUser) return res.sendStatus(403); // forbidden
    // evaluate jwt
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username)
                return res.sendStatus(403);
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: decoded.username,
                        roles: roles,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "30s" }
            );
            res.json({ accessToken });
        }
    );
};

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); // No content
    const refreshToken = cookies.jwt;

    // is refreshToken in db?
    const foundUser = usersDB.users.find(
        (person) => person.refreshToken === refreshToken
    );
    if (!foundUser) {
        // refreshToken found, but no user => clearCookie.
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        return res.sendStatus(204);
    }
    // Delete refreshToken in db
    const otherUsers = usersDB.users.filter(
        (person) => person.refreshToken !== foundUser.refreshToken
    );
    const currentUser = { ...foundUser, refreshToken: "" };
    usersDB.setUsers({ ...otherUsers, currentUser });
    console.log("delete refreshToken from DB");
    console.log(
        `other users: ${JSON.stringify(
            otherUsers
        )}\ncurrent user: ${JSON.stringify(currentUser)}`
    );
    console.log(`DataBase: ${JSON.stringify(usersDB.users)}`);
    await fsPromise.writeFile(
        path.join(__dirname, "..", "models", "users.json"),
        JSON.stringify(usersDB.users)
    );

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.sendStatus(204);
};

module.exports = {
    handleNewUser,
    handleLogin,
    handleRefreshToken,
    handleLogout,
};

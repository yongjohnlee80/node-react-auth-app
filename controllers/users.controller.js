const usersDB = {
    users: require('../models/users.json'),
    setUsers: function (data) { this.users = data}
}

// file based DB system.
const fsPromise = require('fs').promises;
const path = require('path');

// password encryption (hashing)
const bcrypt = require('bcrypt');

// JWT web tokens
const jwt = require('jsonwebtoken');
require('dotenv').config();


const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if(!user || !pwd) {
        return res.status(400).json({"message": "Username and password are required"});
    }
    const duplicate = usersDB.users.find(person => person.username === user);
    if( duplicate ) return res.sendStatus(409);
    try {
        // encrypt (hash*11) the password
        const hashedPwd = await bcrypt.hash(pwd, 11);
        // store the new user
        const newUser = { 'username': user, 'password': hashedPwd };
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromise.writeFile(
            path.join(__dirname, '..', 'models', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.status(201).json({'success': `New User ${user} created`});
    } catch(err) {
        res.status(500).json({'message': err.message});
    }
}

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if(!user || !pwd) {
        return res.status(400).json({"message": "Username and password are required"});
    }
    console.log("finding User...");
    const foundUser = usersDB.users.find(item => item.username === user);
    if(!foundUser) {
        return res.status(401); // unauthorized
    }
    // evaluate password
    console.log("Authenticating password");
    const isMatch = await bcrypt.compare(pwd, foundUser.password);
    if(isMatch) {
        // create JWTs (auth token and refresh token)
        const accessToken = jwt.sign(
            {"username": foundUser.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '360s' }
        );
        const refreshToken = jwt.sign(
            {"username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // store refresh token in the db: saving refreshToken with current user
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = {...foundUser, refreshToken}
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromise.writeFile(
            path.join(__dirname, '..', 'models', 'users.json'),
            JSON.stringify(usersDB.users)
        );

        res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24*60*60*1000});
        res.json({accessToken});
    } else {
        res.json(401); //
    }
}

module.exports = {
    handleNewUser,
    handleLogin,
}
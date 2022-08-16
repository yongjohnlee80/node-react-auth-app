const express = require('express');
const registerController = require('../../controllers/users.controller');

const router = express.Router();

router.route('/')
    .post(registerController.handleNewUser);

router.route('/auth')
    .post(registerController.handleLogin);

module.exports = router;
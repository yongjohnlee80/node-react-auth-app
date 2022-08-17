const express = require("express");
const registerController = require("../../controllers/users.controller");
const verifyJWT = require("../../middleware/verifyJWT");

const router = express.Router();

router.route("/").post(registerController.handleNewUser);

router
    .route("/auth")
    .post(registerController.handleLogin)
    .get(verifyJWT, registerController.handleRefreshToken);

router.route("/logout").post(registerController.handleLogout);

module.exports = router;

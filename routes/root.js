const express = require('express');
const path = require('path');

const router = express.Router();

router.get("^/$|/index(.html)?", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "views", "index.html"));
});

router.get("/new-page(.html)?", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "views", "new-page.html"));
});

router.get("/old-page(.html)?", (req, res) => {
    res.redirect(301, "/new-page.html");
});

module.exports = router;
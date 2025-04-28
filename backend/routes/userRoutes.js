const express = require("express");
const { getMe } = require("../controllers/userController");
const authenticateJWT = require("../middleware/auth");

const router = express.Router();

router.get("/getMe", authenticateJWT, getMe);

module.exports = router;

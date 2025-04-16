const express = require("express");
const { getMe } = require("../controllers/userController");

const router = express.Router();

router.get("/getMe", getMe);

module.exports = router;

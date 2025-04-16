const express = require("express");
const { getToken } = require("../controllers/authController");
const { logout } = require("../controllers/authController");

const router = express.Router();

router.post("/getToken", getToken);
router.post("/logout", logout);

module.exports = router;

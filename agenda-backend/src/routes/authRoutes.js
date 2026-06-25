const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// POST /auth/register, POST /auth/login
router.post("/register", register);
router.post("/login", login);

module.exports = router;

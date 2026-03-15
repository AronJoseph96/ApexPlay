const express = require("express");
const { signup, login, forgotPassword, resetPassword, verifyPin } = require("../controllers/authController");

const router = express.Router();

router.post("/signup",         signup);
router.post("/login",          login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

router.post("/verify-pin", verifyPin);

module.exports = router;
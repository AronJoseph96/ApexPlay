const User       = require("../models/User");
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// ── Email transporter ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ── SIGNUP ────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });
    const hashed  = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role: "USER" });
    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "SECRET123",
      { expiresIn: "7d" }
    );
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── FORGOT PASSWORD — send OTP ────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, an OTP has been sent." });

    // Generate 6-digit OTP
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.resetOTP       = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    // Send via Gmail
    await transporter.sendMail({
      from:    `"ApexPlay" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: "ApexPlay — Password Reset OTP",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#e50914;padding:24px;text-align:center">
            <h1 style="margin:0;font-size:28px;letter-spacing:-1px">ApexPlay</h1>
          </div>
          <div style="padding:32px">
            <h2 style="margin:0 0 8px">Password Reset</h2>
            <p style="color:#aaa;margin:0 0 24px">
              Use the OTP below to reset your password.
              It expires in <strong style="color:#fff">15 minutes</strong>.
            </p>
            <div style="background:#1a1a1a;border-radius:12px;padding:24px;text-align:center;
              letter-spacing:12px;font-size:36px;font-weight:900;color:#e50914;margin-bottom:24px">
              ${otp}
            </div>
            <p style="color:#666;font-size:13px;margin:0">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    res.json({ message: "If that email exists, an OTP has been sent." });
  } catch (err) {
    console.error("Mail error:", err.message);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetOTP)
      return res.status(400).json({ error: "Invalid or expired OTP." });
    if (user.resetOTP !== otp)
      return res.status(400).json({ error: "Incorrect OTP." });
    if (new Date() > user.resetOTPExpiry)
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });

    user.password       = await bcrypt.hash(newPassword, 10);
    user.resetOTP       = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper ─────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function userPayload(user) {
  return { id: user._id, name: user.name, email: user.email, picture: user.picture || null };
}

// ─── Local Register ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email address" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "An account with this email already exists" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      authProvider: "local",
    });

    res.status(201).json({
      message: "Account created",
      token: signToken(user._id),
      user: userPayload(user),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Local Login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    // If user exists but registered via Google, give a helpful message
    if (user && user.authProvider === "google") {
      return res.status(400).json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      token: signToken(user._id),
      user: userPayload(user),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────
// Called with the ID token from Google Sign-In button on the frontend
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential)
      return res.status(400).json({ message: "Google credential required" });

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email)
      return res.status(400).json({ message: "Could not retrieve email from Google" });

    // Find existing user by googleId OR email
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // If they previously registered locally with same email, link Google to their account
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.picture = picture;
        await user.save();
      }
    } else {
      // New user — create account
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        picture,
        authProvider: "google",
        // No password for Google users
      });
    }

    res.json({
      message: "Google login successful",
      token: signToken(user._id),
      user: userPayload(user),
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ message: "Google authentication failed. Please try again." });
  }
});

module.exports = router;
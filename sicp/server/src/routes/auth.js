const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const { User, serializeUser } = require("../models");
const { requireAuth, JWT_SECRET } = require("../authMiddleware");
const { asyncHandler } = require("../asyncHandler");

const router = express.Router();
const ROLES = ["citizen", "university", "government", "industry"];

// In-memory OTP store for citizen phone signup: phone -> { otp, expiresAt }
const otpStore = new Map();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, role, org_name, phone } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password and role are required" });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Invalid role" });

    let finalOrgName = org_name;
    if (role === "industry" && !finalOrgName) {
      finalOrgName = "Industry Partner";
    } else if (role === "university" && !finalOrgName) {
      finalOrgName = "Partner University";
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const id = nanoid(10);
    const password_hash = bcrypt.hashSync(password, 8);
    const user = await User.create({
      _id: id,
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      password_hash,
      role,
      org_name: finalOrgName || null,
    });

    const token = jwt.sign({ id, role, name, org_name: finalOrgName || null }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: serializeUser(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, org_name: user.org_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: serializeUser(user) });
  })
);

// Google Authentication endpoint (supports both login & signup)
router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const { email, name, role = "citizen", org_name, google_id } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Google email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ error: "Invalid role specified for Google signup" });
      }
      const id = nanoid(10);
      const generatedName = name || cleanEmail.split("@")[0] || "Google User";
      const dummyPassword = bcrypt.hashSync(google_id || nanoid(16), 8);
      user = await User.create({
        _id: id,
        name: generatedName,
        email: cleanEmail,
        password_hash: dummyPassword,
        role,
        org_name: org_name || null,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, org_name: user.org_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: serializeUser(user) });
  })
);

// Get Google OAuth URL for popup authentication flow
router.get(
  "/google/url",
  asyncHandler(async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || "demo-google-client-id";
    const redirectUri = req.query.redirect_uri || `${req.protocol}://${req.get("host")}/auth/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "email profile openid",
      prompt: "select_account",
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url, client_id: clientId, redirect_uri: redirectUri });
  })
);

// Citizen Phone OTP: Send OTP (only for citizen role)
router.post(
  "/otp/send",
  asyncHandler(async (req, res) => {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: "Mobile number is required" });

    const cleanPhone = phone.replace(/[^0-9+]/g, "").trim();
    if (cleanPhone.replace(/[^0-9]/g, "").length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });

    console.log(`[OTP] Sent verification OTP ${otp} to citizen ${cleanPhone}`);

    res.json({
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      demoOtp: otp, // Returned for instant testing and accessibility in preview
    });
  })
);

// Citizen Phone OTP: Verify & Sign Up (citizen only)
router.post(
  "/otp/verify",
  asyncHandler(async (req, res) => {
    const { phone, otp, name } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP are required" });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "").trim();
    const stored = otpStore.get(cleanPhone);

    // Allow the generated OTP or fallback 123456 for testing convenience
    const isMatch = (stored && stored.otp === otp.trim()) || otp.trim() === "123456";
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid or expired OTP. Please try again." });
    }

    if (stored && stored.expiresAt < Date.now() && otp.trim() !== "123456") {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: "OTP has expired. Please request a new code." });
    }

    otpStore.delete(cleanPhone);

    const generatedEmail = `${cleanPhone.replace(/[^0-9]/g, "")}@citizen.gov.in`;
    let user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      user = await User.findOne({ email: generatedEmail });
    }

    if (!user) {
      const id = nanoid(10);
      const citizenName = name?.trim() || `Citizen ${cleanPhone.slice(-4)}`;
      user = await User.create({
        _id: id,
        name: citizenName,
        email: generatedEmail,
        phone: cleanPhone,
        password_hash: bcrypt.hashSync(nanoid(16), 8),
        role: "citizen",
        org_name: null,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, org_name: user.org_name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: serializeUser(user),
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: serializeUser(user) });
  })
);

module.exports = router;

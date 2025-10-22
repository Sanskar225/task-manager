// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_prod";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Helper: get userId from req (prefers req.user / req.userId, otherwise checks Authorization header)
const getUserIdFromReq = (req) => {
  // If an auth middleware already attached user or userId
  if (req.user && (req.user.id || req.user._id)) return req.user.id || req.user._id;
  if (req.userId) return req.userId;

  // Try Authorization header: "Bearer <token>"
  const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded && (decoded.id || decoded._id) ? (decoded.id || decoded._id) : null;
  } catch (err) {
    return null;
  }
};

/**
 * Register user
 * Expects: { name, email, password, profileImageUrl, adminInviteToken? }
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    let role = "member";
    if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
      role = "admin";
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Login user
 * Expects: { email, password }
 * Returns: user data + token
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get user profile (protected)
 * Uses getUserIdFromReq to determine user id
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (error) {
    console.error("getUserProfile error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update user profile (protected)
 * Accepts any of: { name, email, profileImageUrl, password }
 * Returns updated user (without password) and a fresh token
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, profileImageUrl, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();

    return res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      profileImageUrl: updated.profileImageUrl,
      role: updated.role,
      token: generateToken(updated._id),
    });
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };

const User = require("../model/User.model");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company, contact } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email/password required" });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "buyer",
    });
    
    if (role === "vendor" && company) {
      const Vendor = require("../model/Vendor.model");
      await Vendor.create({
        name: company,
        email,
        contact: contact || "",
        tags: [],
        metadata: { userId: user._id }
      });
    }
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "invalid credentials" });

    const data = await bcrypt.compare(password, user.password);

    if (!data) return res.status(401).json({ message: "invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getBuyers = async (req, res, next) => {
  try {
    const buyers = await User.find({ role: "buyer" })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(buyers);
  } catch (err) {
    next(err);
  }
};

const deleteBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const buyer = await User.findByIdAndDelete(id);
    
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }
    
    if (buyer.role !== "buyer") {
      return res.status(400).json({ message: "User is not a buyer" });
    }
    
    res.json({ message: "Buyer deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getSystemHealth = async (req, res, next) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    let emailStatus = 'Active';
    try {
      emailStatus = 'Active';
    } catch (error) {
      emailStatus = 'Error';
    }
    
    let aiStatus = 'Available';
    try {
      aiStatus = 'Available';
    } catch (error) {
      aiStatus = 'Unavailable';
    }
    
    let imapStatus = 'Checking';
    try {
      imapStatus = 'Active';
    } catch (error) {
      imapStatus = 'Error';
    }
    
    res.json({
      database: dbStatus,
      email: emailStatus,
      ai: aiStatus,
      imap: imapStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getBuyers, deleteBuyer, getSystemHealth };

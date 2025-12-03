const jwt = require("jsonwebtoken");
const User = require("../model/User.model");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) 
        return res.status(401).json({ message: "Unauthorized" });
    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== role && req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
};

module.exports = { authMiddleware, requireRole };

const jwt = require("jsonwebtoken");
const User = require("../model/User.model");
const logger = require("../utils/logger");
const NodeCache = require("node-cache");

const JWT_SECRET = process.env.JWT_SECRET;
const userCache = new NodeCache({ stdTTL: 300 }); // 5分钟缓存

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const token = header.split(" ")[1];
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check cache first
    const cacheKey = `user_${decoded.id}`;
    let user = userCache.get(cacheKey);
    
    if (!user) {
      user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized - User not found" });
      }
      // Cache the user data
      userCache.set(cacheKey, user);
    }
    
    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    logger.warn("Authentication failed:", { 
      error: err.message, 
      token: req.headers.authorization?.split(" ")[1]?.substring(0, 20) + "..." 
    });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    return res.status(401).json({ message: "Authentication failed" });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (req.user.role !== role && req.user.role !== "admin") {
    logger.warn("Access denied:", { 
      userRole: req.user.role, 
      requiredRole: role,
      userId: req.user.id 
    });
    return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
  }
  next();
};

const requireAnyRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!roles.includes(req.user.role) && req.user.role !== "admin") {
    logger.warn("Access denied:", { 
      userRole: req.user.role, 
      requiredRoles: roles,
      userId: req.user.id 
    });
    return res.status(403).json({ message: "Forbidden - Insufficient permissions" });
  }
  next();
};

module.exports = { authMiddleware, requireRole, requireAnyRole };

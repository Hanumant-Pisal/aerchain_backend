const express = require( "express");
const { register, login, getBuyers, deleteBuyer, getSystemHealth } = require( "../controllers/authController.js");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware.js");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/buyers", authMiddleware, requireRole("admin"), getBuyers);
router.delete("/buyers/:id", authMiddleware, requireRole("admin"), deleteBuyer);
router.get("/health", getSystemHealth);

module.exports = router;

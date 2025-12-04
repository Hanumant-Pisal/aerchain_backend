const express = require("express");
const { createRfp, getRfps, getRfp, sendRfp, getVendorRfps } = require("../controllers/rfpController.js");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware.js");


const router = express.Router();

router.post("/create", authMiddleware, requireRole("buyer"), createRfp);
router.get("/", authMiddleware, getRfps);
router.get("/:id", authMiddleware, getRfp);
router.get("/vendor", authMiddleware, requireRole("vendor"), getVendorRfps);
router.post("/send", authMiddleware, requireRole("buyer"), sendRfp);

module.exports = router;

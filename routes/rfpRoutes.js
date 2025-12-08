const express = require("express");
const { createRfp, getRfps, getRfp, sendRfp, getVendorRfps, updateRfp, deleteRfp } = require("../controllers/rfpController.js");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware.js");


const router = express.Router();

router.post("/create", authMiddleware, requireRole("buyer"), createRfp);
router.get("/", authMiddleware, getRfps);
router.get("/vendor", authMiddleware, requireRole("vendor"), getVendorRfps);
router.get("/:id", authMiddleware, getRfp);
router.put("/:id", authMiddleware, requireRole("buyer"), updateRfp);
router.delete("/:id", authMiddleware, requireRole("buyer"), deleteRfp);
router.post("/send", authMiddleware, requireRole("buyer"), sendRfp);

module.exports = router;

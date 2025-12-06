const express = require ("express");
const { addVendor, getVendors, getVendorById, deleteVendor } = require ("../controllers/vendorController");
const { authMiddleware, requireRole, requireAnyRole } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getVendors);
router.post("/add", authMiddleware, requireRole("admin"), addVendor);
router.get("/:id", authMiddleware, getVendorById);
router.delete("/:id", authMiddleware, requireRole("admin"), deleteVendor);

module.exports = router;

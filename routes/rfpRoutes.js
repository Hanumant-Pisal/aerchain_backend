const express = require("express");
const { createRfp, getRfps, sendRfp } = require("../controllers/rfpController.js");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware.js");


const router = express.Router();

router.post("/create", authMiddleware, requireRole("buyer"), createRfp);
router.get("/", authMiddleware, getRfps);
router.post("/send", authMiddleware, requireRole("buyer"), sendRfp);

module.exports = router;

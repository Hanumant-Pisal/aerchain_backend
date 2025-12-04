const express = require("express");
const { receiveParsedProposal, getProposalsForRfp, submitProposal, getVendorProposals, getBuyerProposals, compareRfpProposals } = require("../controllers/proposalController.js");
const { authMiddleware, requireRole } = require("../middlewares/authMiddleware.js");


const router = express.Router();

// Endpoint used by IMAP worker or webhook to post parsed proposals
router.post("/receive", receiveParsedProposal);

// UI endpoints
router.get("/rfp/:id", authMiddleware, getProposalsForRfp);

// Vendor proposal submission and viewing
router.post("/submit", authMiddleware, requireRole("vendor"), submitProposal);
router.get("/vendor", authMiddleware, requireRole("vendor"), getVendorProposals);

// Buyer proposal viewing
router.get("/buyer", authMiddleware, requireRole("buyer"), getBuyerProposals);

// Proposal comparison
router.get("/compare/:rfpId", authMiddleware, compareRfpProposals);

module.exports = router;

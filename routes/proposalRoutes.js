const express = require("express");
const { receiveParsedProposal, getProposalsForRfp } = require("../controllers/proposalController.js");
const { authMiddleware } = require("../middlewares/authMiddleware.js");


const router = express.Router();

// Endpoint used by IMAP worker or webhook to post parsed proposals
router.post("/receive", receiveParsedProposal);

// UI endpoints
router.get("/rfp/:id", authMiddleware, getProposalsForRfp);

module.exports = router;

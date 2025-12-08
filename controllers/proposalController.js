const Proposal = require("../model/Proposal.model");
const Rfp = require("../model/Rfp.model");
const Vendor = require("../model/Vendor.model");
const { parseVendorResponse } = require("../services/aiService.js");
const { computeScoresForProposals } = require("../utils/scoringEngine.js");


 const receiveParsedProposal = async (req, res, next) => {
  try {
    const { rfpId, vendorEmail, rawEmail, attachments } = req.body;
    const rfp = await Rfp.findById(rfpId);
    if (!rfp) return res.status(404).json({ message: "RFP not found" });

    const vendor = await Vendor.findOne({ email: vendorEmail });

    
    const parsed = await parseVendorResponse(rawEmail, attachments, rfp.structured);

    const proposal = await Proposal.create({
      rfp: rfpId,
      vendor: vendor?._id,
      vendorEmail,
      rawEmail,
      parsed,
      completeness: parsed.completeness || 0,
      aiSummary: parsed.summary 
    });

   
    await computeScoresForProposals(rfpId);

    res.json(proposal);
  } catch (err) { next(err); }
};

 const getProposalsForRfp = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ rfp: req.params.id }).populate("vendor");
    res.json(proposals);
  } catch (err) { next(err); }
};

const submitProposal = async (req, res, next) => {
  try {
    const { rfpId, proposal } = req.body;
    const userId = req.user.id;

    const vendor = await Vendor.findOne({ "metadata.userId": userId });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const rfp = await Rfp.findById(rfpId).populate("createdBy");
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    if (!rfp.vendors.includes(vendor._id)) {
      return res.status(403).json({ message: "You were not sent this RFP" });
    }

    const newProposal = await Proposal.create({
      rfp: rfpId,
      vendor: vendor._id,
      vendorEmail: vendor.email,
      parsed: {
        totalPrice: proposal.totalPrice,
        currency: "USD",
        deliveryDays: proposal.deliveryDays,
        paymentTerms: proposal.paymentTerms,
        warranty: proposal.warranty,
        lineItems: proposal.items.map(item => ({
          name: item.name,
          quantity: item.qty,
          unitPrice: item.unitPrice,
          specs: item.specs
        }))
      },
      completeness: 0, 
      score: 0, 
      aiSummary: proposal.additionalNotes || "",
      attachments: []
    });

    try {
      const { sendEmail } = require("../services/emailService.js");
      const User = require("../model/User.model");
      
      const buyer = await User.findById(rfp.createdBy._id);
      if (buyer && buyer.email) {
        await sendEmail({
          to: buyer.email,
          subject: `New Proposal Received for ${rfp.title}`,
          text: `
New Proposal Submitted

RFP: ${rfp.title}
Vendor: ${vendor.name} (${vendor.email})
Total Price: $${proposal.totalPrice}
Delivery: ${proposal.deliveryDays} days
Payment Terms: ${proposal.paymentTerms}
Warranty: ${proposal.warranty}

Submitted: ${new Date().toLocaleDateString()}

Log in to view the full proposal details and compare with other submissions.
RFP ID: ${rfp._id}
          `.trim()
        });
        console.log(`Proposal notification sent to buyer: ${buyer.email}`);
      }
    } catch (emailError) {
      console.error("Failed to send buyer notification:", emailError);
    }

    res.json({ 
      message: "Proposal submitted successfully", 
      proposal: newProposal 
    });
  } catch (err) { next(err); }
};

const getVendorProposals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the vendor record linked to this user
    const vendor = await Vendor.findOne({ "metadata.userId": userId });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Get all proposals from this vendor
    const proposals = await Proposal.find({ vendor: vendor._id })
      .populate("rfp", "title description createdAt")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) { next(err); }
};

const getBuyerProposals = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all RFPs created by this buyer
    const rfps = await Rfp.find({ createdBy: userId }).select("_id");
    const rfpIds = rfps.map(rfp => rfp._id);

    // Get all proposals for these RFPs
    const proposals = await Proposal.find({ rfp: { $in: rfpIds } })
      .populate("rfp", "title createdAt")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) { next(err); }
};

const { compareProposals } = require("../services/proposalComparisonService.js");

const compareRfpProposals = async (req, res, next) => {
  try {
    const { rfpId } = req.params;
    
    // Validate rfpId
    if (!rfpId || rfpId === "undefined") {
      return res.status(400).json({ message: "RFP ID is required" });
    }
    
    // Verify user has access to this RFP
    const Rfp = require("../model/Rfp.model");
    const rfp = await Rfp.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    // Check if user is the creator or admin
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (rfp.createdBy.toString() !== userId && userRole !== "admin" && userRole !== "buyer") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Generate comparison
    const comparison = await compareProposals(rfpId);
    
    res.json(comparison);
  } catch (err) {
    console.error("Error in compareRfpProposals:", err);
    next(err);
  }
};

module.exports = { receiveParsedProposal, getProposalsForRfp, submitProposal, getVendorProposals, getBuyerProposals, compareRfpProposals };
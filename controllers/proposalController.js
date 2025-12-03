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

module.exports = { receiveParsedProposal, getProposalsForRfp };
const Rfp = require("../model/Rfp.model"); 
const Vendor = require("../model/Vendor.model"); 
const { generateStructuredRfp } = require("../services/aiService.js");
const { sendRfpEmailToVendors } = require("../services/emailService.js");

const createRfp = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const structured = await generateStructuredRfp(description);
    const rfp = await Rfp.create({
      title,
      description,
      structured,
      createdBy: req.user?.id
    });
    res.json(rfp);
  } catch (err) { next(err); }
};

 const getRfps = async (req, res, next) => {
  try {
    const rfps = await Rfp.find().populate("vendors").limit(200);
    res.json(rfps);
  } catch (err) { next(err); }
};

 const sendRfp = async (req, res, next) => {
  try {
    const { rfpId, vendorIds } = req.body;
    const rfp = await Rfp.findById(rfpId);
    if (!rfp) return res.status(404).json({ message: "RFP not found" });
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    
    rfp.vendors = vendors.map(v => v._id);
    rfp.status = "Sent";
    await rfp.save();
    
    await sendRfpEmailToVendors(rfp, vendors);
    res.json({ message: "RFP sent", rfp });
  } catch (err) { next(err); }
};

module.exports = { createRfp, getRfps, sendRfp };
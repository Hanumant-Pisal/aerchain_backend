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
    const rfps = await Rfp.find()
      .populate("vendors")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(rfps);
  } catch (err) { next(err); }
};

 const getRfp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rfp = await Rfp.findById(id).populate("vendors", "name email contact");
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }
    res.json(rfp);
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
    
    // Try to send emails, but don't fail the entire operation if emails fail
    let emailResults = { success: 0, failed: 0, total: vendors.length };
    try {
      emailResults = await sendRfpEmailToVendors(rfp, vendors);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with the operation even if emails fail
    }
    
    res.json({ 
      message: "RFP sent successfully", 
      rfp,
      emailResults: {
        sent: emailResults.success,
        failed: emailResults.failed,
        total: emailResults.total
      }
    });
  } catch (err) { next(err); }
};

const getVendorRfps = async (req, res, next) => {
  try {
    // Find the vendor record linked to this user
    const Vendor = require("../model/Vendor.model");
    const vendor = await Vendor.findOne({ "metadata.userId": req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // Find RFPs that include this vendor in their vendors array
    const rfps = await Rfp.find({ 
      vendors: vendor._id,
      status: "Sent" 
    }).populate("vendors", "name email contact");
    
    res.json(rfps);
  } catch (err) { next(err); }
};

const updateRfp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    const rfp = await Rfp.findById(id).populate('vendors');
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    // Check if RFP has been sent to vendors or has proposals
    const hasActiveProposals = await require("../model/Proposal.model").exists({ rfpId: id });
    const hasVendors = rfp.vendors && rfp.vendors.length > 0;
    const isSent = rfp.status === 'Sent';
    const hasAwardedContracts = rfp.status === 'Awarded';

    // Different levels of restrictions based on RFP status
    if (hasAwardedContracts) {
      return res.status(400).json({ 
        message: "Cannot edit RFP",
        reason: "Contract has been awarded",
        suggestion: "Create a new RFP for future requirements"
      });
    }

    if (hasActiveProposals) {
      return res.status(400).json({ 
        message: "Cannot edit RFP",
        reason: "Vendors have already submitted proposals",
        suggestion: "Consider creating an amendment or new RFP"
      });
    }

    if (isSent || hasVendors) {
      // Allow limited edits for sent RFPs (only title changes, no description changes)
      if (description && description !== rfp.description) {
        return res.status(400).json({ 
          message: "Cannot edit RFP description",
          reason: "RFP has been sent to vendors",
          suggestion: "You can only edit the title. For description changes, consider creating an amendment"
        });
      }
      
      // Allow title change but log it for audit
      if (title && title !== rfp.title) {
        console.log(`RFP title updated: "${rfp.title}" → "${title}" (ID: ${id}) by user ${req.user?.id}`);
        rfp.title = title;
        await rfp.save();
        
        return res.json({ 
          message: "RFP title updated successfully",
          warning: "RFP has been sent to vendors. Consider notifying them of the title change.",
          rfp
        });
      }
      
      return res.json({ 
        message: "No changes made to RFP",
        note: "Only title changes are allowed for sent RFPs"
      });
    }

    // Full editing allowed for draft RFPs
    let hasChanges = false;
    if (title && title !== rfp.title) {
      rfp.title = title;
      hasChanges = true;
    }
    if (description && description !== rfp.description) {
      rfp.description = description;
      // Regenerate structured data when description changes
      const structured = await generateStructuredRfp(description);
      rfp.structured = structured;
      hasChanges = true;
    }

    if (hasChanges) {
      await rfp.save();
      console.log(`RFP updated: ${rfp.title} (ID: ${id}) by user ${req.user?.id}`);
      res.json({ 
        message: "RFP updated successfully",
        rfp
      });
    } else {
      res.json({ 
        message: "No changes made to RFP",
        rfp
      });
    }
  } catch (err) { next(err); }
};

const deleteRfp = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const rfp = await Rfp.findById(id).populate('vendors');
    if (!rfp) {
      return res.status(404).json({ message: "RFP not found" });
    }

    // Comprehensive checks before allowing deletion
    const hasActiveProposals = await require("../model/Proposal.model").exists({ rfpId: id });
    const hasVendors = rfp.vendors && rfp.vendors.length > 0;
    const isSent = rfp.status === 'Sent';
    const hasAwardedContracts = rfp.status === 'Awarded';

    // Prevent deletion if any of these conditions are met
    if (hasVendors || isSent || hasActiveProposals || hasAwardedContracts) {
      let reasons = [];
      if (hasVendors) reasons.push("RFP has been sent to vendors");
      if (hasActiveProposals) reasons.push("Vendors have submitted proposals");
      if (hasAwardedContracts) reasons.push("Contract has been awarded");
      
      return res.status(400).json({ 
        message: "Cannot delete RFP",
        reason: reasons.join(", "),
        suggestion: "Consider archiving the RFP instead"
      });
    }

    // Log the deletion for audit purposes
    console.log(`RFP deleted: ${rfp.title} (ID: ${id}) by user ${req.user?.id}`);
    
    await Rfp.findByIdAndDelete(id);
    res.json({ 
      message: "RFP deleted successfully",
      deletedRfp: {
        id: rfp._id,
        title: rfp.title,
        deletedAt: new Date()
      }
    });
  } catch (err) { next(err); }
};

module.exports = { createRfp, getRfps, getRfp, sendRfp, getVendorRfps, updateRfp, deleteRfp };
const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  rfp: { type: mongoose.Schema.Types.ObjectId, ref: "Rfp", required: true, index: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
  vendorEmail: { type: String, index: true },
  rawEmail: String,
  parsed: {
    totalPrice: Number,
    currency: String,
    deliveryDays: Number,
    warranty: String,
    paymentTerms: String,
    lineItems: [Object]
  },
  completeness: Number, 
  score: Number, 
  aiSummary: String,
  attachments: [String]
}, { timestamps: true });

proposalSchema.index({ rfp: 1, createdAt: -1 });
proposalSchema.index({ vendor: 1, createdAt: -1 });
proposalSchema.index({ vendorEmail: 1, createdAt: -1 });

module.exports = mongoose.model("Proposal", proposalSchema);
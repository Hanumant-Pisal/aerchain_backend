const mongoose = require ("mongoose");

const proposalSchema = new mongoose.Schema({
  rfp: { type: mongoose.Schema.Types.ObjectId, ref: "Rfp", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  vendorEmail: String,
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

module.exports = mongoose.model("Proposal", proposalSchema);
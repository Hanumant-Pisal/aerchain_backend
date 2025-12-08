const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  specs: String,
  unitPrice: Number
}, { _id: false });

const rfpSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  structured: {
    budget: Number,
    deliveryDays: Number,
    paymentTerms: String,
    warranty: String,
    items: [lineItemSchema]
  },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  status: { type: String, enum: ["Draft","Sent","Received","Awarded","Closed"], default: "Draft", index: true }
}, { timestamps: true });

rfpSchema.index({ createdBy: 1, status: 1 });
rfpSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Rfp", rfpSchema);

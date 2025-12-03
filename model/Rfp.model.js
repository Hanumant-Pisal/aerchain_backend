const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  name: String,
  qty: Number,
  specs: String,
  unitPrice: Number
}, { _id: false });

const rfpSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String, // raw NL description
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  structured: {
    budget: Number,
    deliveryDays: Number,
    paymentTerms: String,
    warranty: String,
    items: [lineItemSchema]
  },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  status: { type: String, enum: ["Draft","Sent","Received","Awarded","Closed"], default: "Draft" }
}, { timestamps: true });

module.exports = mongoose.model("Rfp", rfpSchema);

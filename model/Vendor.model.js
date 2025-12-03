const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: String,
    email: { type: String, required: true },
    contact: String,
    tags: [String],
    metadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);

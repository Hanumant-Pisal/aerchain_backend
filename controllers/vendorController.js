const Vendor = require("../model/Vendor.model");

 const addVendor = async (req, res, next) => {
  try {
    const v = await Vendor.create(req.body);
    res.json(v);
  } catch (err) { next(err); }
};

 const getVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find().limit(200);
    res.json(vendors);
  } catch (err) { next(err); }
};

 const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "vendor not found" });
    res.json(vendor);
  } catch (err) { next(err); }
};

const deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) { next(err); }
};

module.exports = { addVendor, getVendors, getVendorById, deleteVendor };
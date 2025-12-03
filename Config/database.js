const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected successfully");
  } catch (error) {
    console.log("database is not connected", error);
  }
};

connection();

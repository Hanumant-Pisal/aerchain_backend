const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add connection settings for better reliability
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
});

// Verify the connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email service configuration error:", error);
    console.log("\n=== EMAIL SETUP HELP ===");
    console.log("Current configuration:");
    console.log(`  Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}`);
    console.log(`  Port: ${process.env.EMAIL_PORT || 587}`);
    console.log(`  Secure: ${process.env.EMAIL_SECURE || "false"}`);
    console.log(`  Service: ${process.env.EMAIL_SERVICE || "gmail"}`);
    console.log(`  User: ${process.env.EMAIL_USER ? "SET" : "NOT SET"}`);
    console.log(`  Pass: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);
    console.log("\nFor Gmail, use an App Password (not your regular password):");
    console.log("   - Go to: https://myaccount.google.com/apppasswords");
    console.log("   - Enable 2FA on your Google account if not already enabled");
    console.log("   - Generate a 16-digit App Password");
    console.log("   - Use the App Password as EMAIL_PASS");
    console.log("========================\n");
  } else {
    console.log("Email service is ready to send messages");
  }
});

module.exports = { transporter };
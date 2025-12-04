const { transporter } = require ("../Config/email.js");
// import fs from "fs";
// import path from "path";
const { renderRfpToText } = require ("../utils/emailTemplates.js");

/**
 * sendEmail
 */
 const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments
  });
  return info;
};

/**
 * sendRfpEmailToVendors
 * rfp: Rfp document
 * vendors: array of vendor docs
 */
const sendRfpEmailToVendors = async (rfp, vendors) => {
  const subject = `RFP: ${rfp.title}`;
  const body = renderRfpToText(rfp);

  const results = await Promise.allSettled(
    vendors.map(v => sendEmail({
      to: v.email,
      subject,
      text: body
    }))
  );

  // Log failed email attempts but don't fail the entire operation
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`Failed to send ${failed.length} of ${vendors.length} emails:`);
    failed.forEach((result, index) => {
      console.error(`Email ${index + 1} failed:`, result.reason);
    });
    // Return success/failure info for the caller
    return {
      success: vendors.length - failed.length,
      failed: failed.length,
      total: vendors.length
    };
  }

  console.log(`Successfully sent RFP to ${vendors.length} vendors`);
  return {
    success: vendors.length,
    failed: 0,
    total: vendors.length
  };
};

module.exports = { sendEmail, sendRfpEmailToVendors };
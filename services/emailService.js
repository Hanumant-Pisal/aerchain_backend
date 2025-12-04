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

  const promises = vendors.map(v => sendEmail({
    to: v.email,
    subject,
    text: body
  }));
  await Promise.all(promises);
};

module.exports = { sendEmail, sendRfpEmailToVendors };
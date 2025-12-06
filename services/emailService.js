const { transporter } = require ("../Config/email.js");
// import fs from "fs";
// import path from "path";
const { renderRfpToText, renderRfpToHtml, renderProposalSubmissionConfirmation } = require ("../utils/emailTemplates.js");

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
  const textBody = renderRfpToText(rfp);
  const htmlBody = renderRfpToHtml(rfp);

  const results = await Promise.allSettled(
    vendors.map(v => sendEmail({
      to: v.email,
      subject,
      text: textBody,
      html: htmlBody
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

/**
 * sendProposalSubmissionConfirmation
 * Sends confirmation email to vendor after proposal submission
 */
const sendProposalSubmissionConfirmation = async (proposal, rfp, vendorEmail) => {
  const subject = `Proposal Submitted Successfully - ${rfp.title}`;
  const htmlBody = renderProposalSubmissionConfirmation(proposal, rfp);
  
  const textBody = `Thank you for submitting your proposal!

RFP: ${rfp.title}
RFP ID: ${rfp._id}
Submitted: ${new Date().toLocaleDateString()}

Your proposal has been received and will be reviewed by our team.
You will be notified of the decision once all proposals have been evaluated.

If you have any questions, please contact us at ${process.env.EMAIL_USER || 'support@company.com'}

Reference ID: ${proposal._id || 'N/A'}`;

  try {
    await sendEmail({
      to: vendorEmail,
      subject,
      text: textBody,
      html: htmlBody
    });
    
    console.log(`Proposal confirmation sent to ${vendorEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send proposal confirmation to ${vendorEmail}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, sendRfpEmailToVendors, sendProposalSubmissionConfirmation };
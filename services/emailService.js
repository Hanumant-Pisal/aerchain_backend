const { transporter } = require ("../Config/email.js");
const { renderRfpToText, renderRfpToHtml } = require ("../utils/emailTemplates.js");

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

const sendRfpEmailToVendors = async (rfp, vendors) => {
  const subject = `RFP: ${rfp.title}`;
  const textBody = renderRfpToText(rfp);
  const htmlBody = renderRfpToHtml(rfp);

  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < vendors.length; i += batchSize) {
    const batch = vendors.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(v => sendEmail({
        to: v.email,
        subject,
        text: textBody,
        html: htmlBody
      }))
    );
    
    results.push(...batchResults);
    
    if (i + batchSize < vendors.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(`Failed to send ${failed.length} of ${vendors.length} emails:`);
    failed.forEach((result, index) => {
      console.error(`Email ${index + 1} failed:`, result.reason);
    });
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
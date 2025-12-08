 const renderRfpToText = (rfp) => {
  const items = (rfp.structured?.items || []).map(i => `- ${i.qty} x ${i.name} (${i.specs || ""})`).join("\n");
  return `RFP ID: ${rfp._id}
RFP: ${rfp.title}

Description:
${rfp.description || ""}

Items:
${items}

Budget: $${rfp.structured?.budget || "N/A"}
Delivery (days): ${rfp.structured?.deliveryDays || "N/A"}
Payment Terms: ${rfp.structured?.paymentTerms || "N/A"}
Warranty: ${rfp.structured?.warranty || "N/A"}

---
To submit your proposal, please include:
- Total price
- Delivery timeline
- Payment terms
- Warranty information
- Itemized pricing

Reply to this email with your proposal details.
RFP ID: ${rfp._id}`;
};

const renderRfpToHtml = (rfp) => {
  const items = (rfp.structured?.items || []);
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: center; font-weight: 500;">${item.qty}</td>
      <td style="padding: 12px;">
        <div style="font-weight: 500; color: #1f2937;">${item.name}</div>
        ${item.specs ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${item.specs}</div>` : ''}
      </td>
      <td style="padding: 12px; text-align: right; font-weight: 500;">$${item.unitPrice || 'N/A'}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RFP: ${rfp.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; backdrop-filter: blur(10px);">
        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Request for Proposal</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">RFP ID: ${rfp._id}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      <!-- RFP Title -->
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 28px; font-weight: 700;">${rfp.title}</h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">${rfp.description || 'No description provided'}</p>
      </div>

      <!-- Key Details -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: 600;">Key Requirements</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Budget</div>
            <div style="font-size: 20px; font-weight: 600; color: #059669;">$${rfp.structured?.budget || 'N/A'}</div>
          </div>
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery</div>
            <div style="font-size: 20px; font-weight: 600; color: #2563eb;">${rfp.structured?.deliveryDays || 'N/A'} days</div>
          </div>
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Terms</div>
            <div style="font-size: 16px; font-weight: 600; color: #7c3aed;">${rfp.structured?.paymentTerms || 'N/A'}</div>
          </div>
          <div style="background-color: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Warranty</div>
            <div style="font-size: 16px; font-weight: 600; color: #dc2626;">${rfp.structured?.warranty || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      ${items.length > 0 ? `
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: 600;">Required Items</h3>
        <div style="background-color: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 16px; text-align: center; font-weight: 600; color: #374151; font-size: 14px;">Quantity</th>
                <th style="padding: 16px; text-align: left; font-weight: 600; color: #374151; font-size: 14px;">Item</th>
                <th style="padding: 16px; text-align: right; font-weight: 600; color: #374151; font-size: 14px;">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      <!-- Call to Action -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 32px; text-align: center;">
        <h3 style="margin: 0 0 16px 0; color: white; font-size: 20px; font-weight: 600;">Submit Your Proposal</h3>
        <p style="margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">
          Reply to this email with your proposal including:
        </p>
        <div style="text-align: left; max-width: 400px; margin: 0 auto 24px auto;">
          <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px;">
            <ul style="margin: 0; padding-left: 20px; color: white; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Total price</li>
              <li style="margin-bottom: 8px;">Delivery timeline</li>
              <li style="margin-bottom: 8px;">Payment terms</li>
              <li style="margin-bottom: 8px;">Warranty information</li>
              <li>Itemized pricing</li>
            </ul>
          </div>
        </div>
      
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 24px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        This RFP was sent on ${new Date().toLocaleDateString()} • Reference ID: ${rfp._id}
      </p>
    </div>
  </div>

</body>
</html>`;
};

const renderProposalSubmissionConfirmation = (proposal, rfp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal Submitted Successfully</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
      <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; backdrop-filter: blur(10px);">
        <div style="width: 48px; height: 48px; background-color: white; border-radius: 50%; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Proposal Submitted!</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your proposal has been received</p>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      <div style="margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Thank you for your proposal!</h2>
        <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
          We have successfully received your proposal for the following RFP:
        </p>
      </div>

      <!-- RFP Details -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
        <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">RFP Details</h3>
        <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          <div style="margin-bottom: 8px;"><strong>Title:</strong> ${rfp.title}</div>
          <div style="margin-bottom: 8px;"><strong>RFP ID:</strong> ${rfp._id}</div>
          <div><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 16px; font-weight: 600;">What happens next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 4px;">Your proposal will be reviewed by our team</li>
          <li style="margin-bottom: 4px;">We'll evaluate all submissions</li>
          <li style="margin-bottom: 4px;">You'll be notified of the decision</li>
          <li>Feel free to contact us with any questions</li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div style="text-align: center; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">Questions about your proposal?</p>
        <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: inline-block;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>Email:</strong> ${process.env.EMAIL_USER || 'support@company.com'}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 24px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Proposal submitted on ${new Date().toLocaleDateString()} • Reference ID: ${proposal._id || 'N/A'}
      </p>
    </div>
  </div>

</body>
</html>`;
};

module.exports = { 
  renderRfpToText, 
  renderRfpToHtml,
  renderProposalSubmissionConfirmation
};
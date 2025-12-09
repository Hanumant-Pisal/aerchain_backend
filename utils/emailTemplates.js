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
    <tr style="border-bottom: 1px solid #e5e7eb; background-color: white; transition: background-color 0.2s ease;">
      <td style="padding: 16px; text-align: center; font-weight: 600; color: #374151; border-right: 1px solid #f3f4f6;">${item.qty}</td>
      <td style="padding: 16px; border-right: 1px solid #f3f4f6;">
        <div style="font-weight: 600; color: #1f2937; font-size: 15px; margin-bottom: 4px;">${item.name}</div>
        ${item.specs ? `<div style="font-size: 13px; color: #6b7280; line-height: 1.4; background-color: #f9fafb; padding: 8px; border-radius: 6px; border-left: 3px solid #3b82f6;">${item.specs}</div>` : ''}
      </td>
      <td style="padding: 16px; text-align: right; font-weight: 600; color: #059669; font-size: 15px;">$${item.unitPrice || 'N/A'}</td>
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  
  <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden;">
    <!-- Enhanced Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%); opacity: 0.3;"></div>
      <div style="position: relative; z-index: 1;">
        <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background-color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div style="text-align: left;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Request for Proposal</h1>
              <p style="margin: 4px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">RFP ID: ${rfp._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Main Content -->
    <div style="padding: 40px; background-color: #fafbfc;">
      <!-- RFP Title Section -->
      <div style="margin-bottom: 40px; text-align: center;">
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 32px; border: 1px solid #bae6fd; position: relative;">
          <div style="position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 32px; font-weight: 800; line-height: 1.2;">${rfp.title}</h2>
          <p style="margin: 0; color: #475569; font-size: 16px; line-height: 1.7; max-width: 500px; margin-left: auto; margin-right: auto;">${rfp.description || 'No description provided'}</p>
        </div>
      </div>

      <!-- Enhanced Key Details -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 16px; padding: 32px; margin-bottom: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">Key Requirements</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: transform 0.2s ease, box-shadow 0.2s ease;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
              </div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Budget</div>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #059669;">$${rfp.structured?.budget || 'N/A'}</div>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: transform 0.2s ease, box-shadow 0.2s ease;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Delivery</div>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #2563eb;">${rfp.structured?.deliveryDays || 'N/A'} days</div>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: transform 0.2s ease, box-shadow 0.2s ease;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5v4"/>
                </svg>
              </div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Payment</div>
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">${rfp.structured?.paymentTerms || 'N/A'}</div>
          </div>
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); transition: transform 0.2s ease, box-shadow 0.2s ease;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Warranty</div>
            </div>
            <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${rfp.structured?.warranty || 'N/A'}</div>
          </div>
        </div>
      </div>

      <!-- Enhanced Items Table -->
      ${items.length > 0 ? `
      <div style="margin-bottom: 40px;">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">Required Items</h3>
        </div>
        <div style="background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <table style="width: 100%; border-collapse: collapse; margin: 0;">
            <thead>
              <tr style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 20px; text-align: center; font-weight: 700; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</th>
                <th style="padding: 20px; text-align: left; font-weight: 700; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Item Details</th>
                <th style="padding: 20px; text-align: right; font-weight: 700; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Unit Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

      <!-- Enhanced Call to Action -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 40px; text-align: center; position: relative; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%); opacity: 0.3;"></div>
        <div style="position: relative; z-index: 1;">
          <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; backdrop-filter: blur(10px);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 style="margin: 0 0 16px 0; color: white; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Submit Your Proposal</h3>
          <p style="margin: 0 0 32px 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.7; max-width: 400px; margin-left: auto; margin-right: auto;">
            Reply to this email with your proposal including:
          </p>
          <div style="background: rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 24px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); max-width: 450px; margin: 0 auto;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div style="display: flex; align-items: center;">
                <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; margin-right: 12px;"></div>
                <span style="color: white; font-size: 14px; font-weight: 500;">Total price</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; margin-right: 12px;"></div>
                <span style="color: white; font-size: 14px; font-weight: 500;">Delivery timeline</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 8px; height: 8px; background: #8b5cf6; border-radius: 50%; margin-right: 12px;"></div>
                <span style="color: white; font-size: 14px; font-weight: 500;">Payment terms</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 12px;"></div>
                <span style="color: white; font-size: 14px; font-weight: 500;">Warranty information</span>
              </div>
            </div>
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
              <div style="display: flex; align-items: center; justify-content: center;">
                <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 12px;"></div>
                <span style="color: white; font-size: 14px; font-weight: 500;">Itemized pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Enhanced Footer -->
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px; text-align: center; position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="footer-pattern" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.05"/><circle cx="90" cy="90" r="1" fill="white" opacity="0.05"/><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.08"/></pattern></defs><rect width="100" height="100" fill="url(%23footer-pattern)"/></svg>') repeat;"></div>
      <div style="position: relative; z-index: 1;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <div style="width: 32px; height: 32px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500;">
            This RFP was sent on ${new Date().toLocaleDateString()}
          </p>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px; display: inline-block; backdrop-filter: blur(10px);">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">
            REFERENCE ID: ${rfp._id}
          </p>
        </div>
      </div>
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
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

module.exports = { renderRfpToText };
 const renderRfpToText = (rfp) => {
  const items = (rfp.structured?.items || []).map(i => `- ${i.qty} x ${i.name} (${i.specs || ""})`).join("\n");
  return `RFP: ${rfp.title}\n\nDescription:\n${rfp.description || ""}\n\nItems:\n${items}\n\nBudget: ${rfp.structured?.budget || "N/A"}\nDelivery (days): ${rfp.structured?.deliveryDays || "N/A"}\nPayment Terms: ${rfp.structured?.paymentTerms || "N/A"}`;
};

module.exports = { renderRfpToText };
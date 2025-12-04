const { openai } = require ("../Config/openai.js");

/**
 * generateStructuredRfp
 * Takes natural language description and returns structured JSON for RFP
 */
 const generateStructuredRfp = async (text) => {
  const prompt = `
You are an assistant that converts procurement requests into a JSON structure.
Input: ${text}

Return only JSON with keys:
{
  "budget": number or null,
  "deliveryDays": number or null,
  "paymentTerms": string or null,
  "warranty": string or null,
  "items": [
    { "name": "...", "qty": number, "specs": "..." }
  ]
}
`;

  const resp = await openai.responses.create({
    model: "gpt-4o",
    input: prompt,
  });

  // The Responses API may return content in different formats; attempt safe parsing
  try {
    const raw = resp.output?.[0]?.content?.[0]?.text ?? JSON.stringify(resp);
    const json = JSON.parse(raw);
    return json;
  } catch (err) {
    // Fallback minimal parsing
    return { budget: null, deliveryDays: null, paymentTerms: null, warranty: null, items: [] };
  }
};

/**
 * parseVendorResponse
 * Parses vendor reply (raw email body + attachments) into structured proposal data.
 * attachments param may be array of file text extractions done earlier.
 */
 const parseVendorResponse = async (rawEmailBody, attachments = [], rfpStructured = {}) => {
  let attachmentText = attachments.join("\n");
  const prompt = `
You are an assistant that extracts proposal information from vendor replies.
RFP (context): ${JSON.stringify(rfpStructured)}
Vendor reply:
${rawEmailBody}

Attachments text:
${attachmentText}

Return JSON:
{
  "totalPrice": number,
  "currency": "USD" or "INR" or null,
  "deliveryDays": number or null,
  "warranty": "1 year" etc or null,
  "paymentTerms": string or null,
  "lineItems": [ { "name": "", "qty": number, "unitPrice": number } ],
  "completeness": 0-100,
  "summary": "short explanation"
}
`;

  const resp = await openai.responses.create({
    model: "gpt-4o",
    input: prompt,
  });

  try {
    const raw = resp.output?.[0]?.content?.[0]?.text ?? "{}";
    return JSON.parse(raw);
  } catch (err) {
    return { totalPrice: null, currency: null, deliveryDays: null, warranty: null, paymentTerms: null, lineItems: [], completeness: 0, summary: "" };
  }
};

module.exports = { generateStructuredRfp, parseVendorResponse };
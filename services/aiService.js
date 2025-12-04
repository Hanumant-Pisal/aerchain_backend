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
}`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that converts procurement requests into structured JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    let raw = resp.choices?.[0]?.message?.content || "{}";
    
    // Remove markdown code blocks if present
    if (raw.includes('```json')) {
      raw = raw.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (raw.includes('```')) {
      raw = raw.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Clean up any extra whitespace
    raw = raw.trim();
    
    const json = JSON.parse(raw);
    return json;
  } catch (err) {
    console.error("OpenAI API error:", err);
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
  const prompt = `You are an assistant that extracts proposal information from vendor replies.
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
}`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that extracts proposal information from vendor replies." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    let raw = resp.choices?.[0]?.message?.content || "{}";
    
    // Remove markdown code blocks if present
    if (raw.includes('```json')) {
      raw = raw.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (raw.includes('```')) {
      raw = raw.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Clean up any extra whitespace
    raw = raw.trim();
    
    return JSON.parse(raw);
  } catch (err) {
    console.error("OpenAI API error:", err);
    return { totalPrice: null, currency: null, deliveryDays: null, warranty: null, paymentTerms: null, lineItems: [], completeness: 0, summary: "" };
  }
};

module.exports = { generateStructuredRfp, parseVendorResponse };
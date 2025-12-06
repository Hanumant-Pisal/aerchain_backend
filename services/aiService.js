const { openai } = require("../Config/openai.js");
const NodeCache = require("node-cache");

const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const generateStructuredRfp = async (text) => {
  const cacheKey = `rfp_${Buffer.from(text).toString('base64').substring(0, 50)}`;
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log('AI cache hit for RFP generation');
    return cached;
  }

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
      max_tokens: 500
    });

    let raw = resp.choices?.[0]?.message?.content || "{}";
    
    if (raw.includes('```json')) {
      raw = raw.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (raw.includes('```')) {
      raw = raw.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    raw = raw.trim();
    
    const json = JSON.parse(raw);
    
    aiCache.set(cacheKey, json);
    
    return json;
  } catch (err) {
    console.error("OpenAI API error:", err);
    const fallback = { budget: null, deliveryDays: null, paymentTerms: null, warranty: null, items: [] };
    
    aiCache.set(cacheKey, fallback, 300);
    
    return fallback;
  }
};

const parseVendorResponse = async (rawEmailBody, attachments = [], rfpStructured = {}) => {
  const cacheKey = `proposal_${Buffer.from(rawEmailBody + JSON.stringify(attachments)).toString('base64').substring(0, 50)}`;
  const cached = aiCache.get(cacheKey);
  if (cached) {
    console.log('AI cache hit for proposal parsing');
    return cached;
  }

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
      max_tokens: 800
    });

    let raw = resp.choices?.[0]?.message?.content || "{}";
    
    if (raw.includes('```json')) {
      raw = raw.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (raw.includes('```')) {
      raw = raw.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    raw = raw.trim();
    
    const result = JSON.parse(raw);
    
    aiCache.set(cacheKey, result);
    
    return result;
  } catch (err) {
    console.error("OpenAI API error:", err);
    const fallback = { totalPrice: null, currency: null, deliveryDays: null, warranty: null, paymentTerms: null, lineItems: [], completeness: 0, summary: "" };
    
    aiCache.set(cacheKey, fallback, 300);
    
    return fallback;
  }
};

module.exports = { generateStructuredRfp, parseVendorResponse };
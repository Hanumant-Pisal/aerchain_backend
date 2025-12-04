const dotenv= require ("dotenv");
dotenv.config();

const imaps = require("imap-simple");
const { simpleParser } = require("mailparser");
const axios = require("axios");
const { parsePdfBuffer, parseExcelBuffer } = require("../services/fileParser.js");


const IMAP_CONFIG = {
  imap: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    tls: true,
    authTimeout: 10000
  }
};

 const startImapListener = async () => {
  if (!process.env.IMAP_USER) {
    console.warn("IMAP not configured; skipping IMAP listener");
    return;
  }

  try {
    const connection = await imaps.connect(IMAP_CONFIG);
    await connection.openBox("INBOX");

    console.log("IMAP listener started, checking for UNSEEN replies every 30s");
    setInterval(async () => {
      const searchCriteria = ["UNSEEN"];
      const fetchOptions = { bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)","TEXT"], struct: true };
      const results = await connection.search(searchCriteria, fetchOptions);
      for (const res of results) {
        const all = res.parts.find(p => p.which === "TEXT");
        const id = res.attributes.uid;
        const raw = await connection.getPartData(res, all);
        const parsed = await simpleParser(raw);
        const from = parsed.from?.value?.[0]?.address;
        const subject = parsed.subject;
        const text = parsed.text || parsed.html || "";
        const attachmentsText = [];
        // process attachments buffers
        if (parsed.attachments?.length) {
          for (const a of parsed.attachments) {
            if (a.contentType.includes("pdf")) {
              const txt = await parsePdfBuffer(a.content);
              attachmentsText.push(txt);
            } else if (a.contentType.includes("sheet") || a.filename?.endsWith(".xls") || a.filename?.endsWith(".xlsx")) {
              const txt = await parseExcelBuffer(a.content);
              attachmentsText.push(txt);
            } else {
              attachmentsText.push(`Attachment ${a.filename} (${a.contentType})`);
            }
          }
        }

        // Identify rfpId by subject parsing - assumes subject contains RFP: <title> or RFP-ID:<id>
        let rfpId = null;
        const m = subject?.match(/RFP-ID:([a-f0-9]{24})/i);
        if (m) rfpId = m[1];

        // Post parsed email to API endpoint for storing + AI parsing
        try {
          await axios.post(`${process.env.WORKER_API_URL || "http://localhost:5000"}/api/proposals/receive`, {
            rfpId,
            vendorEmail: from,
            rawEmail: text,
            attachments: attachmentsText
          });
          // mark as seen
          await connection.addFlags(res.attributes.uid, "\\Seen");
        } catch (err) {
          console.error("Failed to POST parsed email:", err.message);
        }
      }
    }, 30_000);
  } catch (err) {
    console.error("IMAP worker error:", err);
  }
};

// If file is executed directly, start
if (require.main === module) {
  startImapListener();
}

module.exports = { startImapListener };
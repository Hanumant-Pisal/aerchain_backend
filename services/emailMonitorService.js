const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { receiveParsedProposal } = require("../controllers/proposalController.js");
const dotenv = require("dotenv");
dotenv.config();

class EmailMonitorService {
  constructor() {
    this.imap = null;
    this.isRunning = false;
    this.checkInterval = 60000; // Check every 60 seconds
  }

  async start() {
    if (this.isRunning) {
      console.log("Email monitor is already running");
      return;
    }

    try {
      this.imap = new Imap({
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });

      await this.connect();
      this.isRunning = true;
      console.log("Email monitor started successfully");
      
      // Start monitoring
      this.monitor();
    } catch (error) {
      console.error("Failed to start email monitor:", error);
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        console.log("Connected to Gmail IMAP");
        resolve();
      });

      this.imap.once("error", (err) => {
        console.error("IMAP connection error:", err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  monitor() {
    if (!this.isRunning) return;

    this.imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error("Error opening INBOX:", err);
        return;
      }

      // Search for unread emails with RFP-related keywords in subject
      this.imap.search([
        "UNSEEN", 
        ["OR", ["SUBJECT", "RFP"], ["SUBJECT", "proposal"]],
        ["OR", ["SUBJECT", "quotation"], ["SUBJECT", "quote"]],
        ["SINCE", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] // Last 7 days
      ], (err, results) => {
        if (err) {
          console.error("Error searching emails:", err);
          return;
        }

        if (results.length === 0) {
          // No relevant emails, check again later
          setTimeout(() => this.monitor(), this.checkInterval);
          return;
        }

        console.log(`Found ${results.length} relevant new emails`);

        // Fetch and process each email
        const fetch = this.imap.fetch(results, { bodies: "" });
        
        fetch.on("message", (msg, seqno) => {
          msg.on("body", (stream, info) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                console.error("Error parsing email:", err);
                return;
              }

              this.processEmail(parsed);
            });
          });
        });

        fetch.once("error", (err) => {
          console.error("Fetch error:", err);
        });

        fetch.once("end", () => {
          // Check for more emails after processing
          setTimeout(() => this.monitor(), this.checkInterval);
        });
      });
    });
  }

  async processEmail(email) {
    try {
      console.log(`Processing email from: ${email.from.value[0].address}`);
      console.log(`Subject: ${email.subject}`);

      // Extract RFP ID from subject or body
      const rfpId = this.extractRfpId(email);
      if (!rfpId) {
        console.log("No RFP ID found in email, skipping");
        return;
      }

      // Extract vendor email
      const vendorEmail = email.from.value[0].address;

      // Prepare proposal data
      const proposalData = {
        rfpId,
        vendorEmail,
        rawEmail: email.text,
        attachments: email.attachments?.map(att => att.filename) || []
      };

      // Send to proposal controller for AI processing
      const mockReq = {
        body: proposalData
      };
      
      const mockRes = {
        json: (data) => console.log("Proposal processed:", data),
        status: (code) => ({ json: (data) => console.log(`Error ${code}:`, data) })
      };

      await receiveParsedProposal(mockReq, mockRes, (err) => {
        if (err) console.error("Error processing proposal:", err);
      });

      // Mark email as read
      this.markAsRead(email);

    } catch (error) {
      console.error("Error processing email:", error);
    }
  }

  extractRfpId(email) {
    // Look for RFP ID in subject or body
    const text = `${email.subject} ${email.text}`;
    const rfpIdMatch = text.match(/RFP[_\s-]?ID[:\s-]*([a-f0-9]{24})/i) ||
                       text.match(/rfp[_\s-]?id[:\s-]*([a-f0-9]{24})/i) ||
                       text.match(/([a-f0-9]{24})/);
    
    return rfpIdMatch ? rfpIdMatch[1] : null;
  }

  markAsRead(email) {
    // Implementation to mark email as read
    console.log(`Marked email as read: ${email.subject}`);
  }

  stop() {
    if (this.imap && this.isRunning) {
      this.imap.end();
      this.isRunning = false;
      console.log("Email monitor stopped");
    }
  }
}

// Singleton instance
const emailMonitor = new EmailMonitorService();

module.exports = emailMonitor;

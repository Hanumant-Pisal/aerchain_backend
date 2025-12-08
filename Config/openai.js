const OpenAI= require ("openai");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set — AI features will fail");
}

module.exports = { openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) };
import fs from "fs/promises";
const  pdfParse =require( "pdf-parse");
const xlsx = require( "xlsx");

/**
 * parsePdfBuffer -> returns extracted text
 */
 const parsePdfBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    return "";
  }
};

/**
 * parseExcelBuffer -> returns simple CSV/text
 */
 const parseExcelBuffer = async (buffer) => {
  try {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    let text = "";
    workbook.SheetNames.forEach(name => {
      const sheet = workbook.Sheets[name];
      const csv = xlsx.utils.sheet_to_csv(sheet);
      text += `\n\nSheet: ${name}\n${csv}`;
    });
    return text;
  } catch (err) {
    return "";
  }
};

module.exports = { parsePdfBuffer, parseExcelBuffer };
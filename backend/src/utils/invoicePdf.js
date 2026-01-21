// src/utils/invoicePdf.js
const fs = require("fs");
const pdfParse = require("pdf-parse");

/**
 * Very lightweight heuristic extraction:
 * Looks for lines like: "Item Name  $12.99" or "Item Name - 12.99"
 * Returns array of { item, price }
 */
async function extractItemsFromPdf(pdfPath) {
  if (!pdfPath) return null;
  if (!fs.existsSync(pdfPath)) return null;

  const buf = fs.readFileSync(pdfPath);
  const data = await pdfParse(buf);
  const text = (data.text || "").replace(/\r/g, "");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const items = [];
  for (const line of lines) {
    // Examples:
    // "USB-C Cable $9.99"
    // "Monitor Stand - 29.00"
    // "Consulting Services 1200"
    const m =
      line.match(/^(.+?)\s+\$?(\d+(?:\.\d{1,2})?)$/) ||
      line.match(/^(.+?)\s*[-:]\s*\$?(\d+(?:\.\d{1,2})?)$/);

    if (m) {
      const item = m[1].trim();
      const price = Number(m[2]);
      if (item.length >= 2 && Number.isFinite(price)) {
        items.push({ item, price });
      }
    }
  }

  return items.length ? items : null;
}

module.exports = { extractItemsFromPdf };

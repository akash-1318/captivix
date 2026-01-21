const express = require("express");
const { db } = require("../db");
const { emails } = require("../db/schema");
const { desc } = require("drizzle-orm");
const { stringify } = require("csv-stringify/sync");

const router = express.Router();

/**
 * GET /summaries/export
 * Downloads all emails (or you can add filtering later) as CSV.
 */
router.get("/export", async (req, res) => {
  try {
    const rows = await db.select().from(emails).orderBy(desc(emails.createdAt));

    const csv = stringify(rows, {
      header: true,
      columns: [
        "id",
        "sender",
        "subject",
        "summary",
        "category",
        "createdAt",
        "updatedAt",
      ],
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="email_summaries.csv"`,
    );
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

module.exports = router;

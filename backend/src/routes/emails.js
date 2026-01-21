// src/routes/emails.js
const express = require("express");
const path = require("path");
const fs = require("fs");

const { db } = require("../db");
const { emails } = require("../db/schema");
const { summarizeEmail } = require("../ai/summarizeEmail");
const { extractItemsFromPdf } = require("../utils/invoicePdf");

const { eq, ilike, and, desc } = require("drizzle-orm");

const router = express.Router();

//  * Loads mock emails from data/emails.mock.json, summarizes/categorizes with OpenAI, stores in DB.

router.post("/ingest", async (req, res) => {
  try {
    const mockPath = path.join(process.cwd(), "data", "emails.mock.json");
    if (!fs.existsSync(mockPath)) {
      return res.status(400).json({ error: "Missing data/emails.mock.json" });
    }

    const raw = fs.readFileSync(mockPath, "utf-8");
    const list = JSON.parse(raw);

    if (!Array.isArray(list) || list.length === 0) {
      return res
        .status(400)
        .json({ error: "Mock email list is empty/invalid" });
    }

    const inserted = [];

    for (const email of list) {
      const sender = String(email.sender || "").trim();
      const subject = String(email.subject || "").trim();
      const body = String(email.body || "").trim();

      if (!sender || !subject || !body) continue;

      const ai = await summarizeEmail({ sender, subject, body });

      // optional attachment extraction
      let extracted = null;
      if (email.attachmentPath) {
        const abs = path.isAbsolute(email.attachmentPath)
          ? email.attachmentPath
          : path.join(process.cwd(), email.attachmentPath);
        const items = await extractItemsFromPdf(abs);
        if (items) extracted = { invoiceItems: items };
      }

      const rows = await db
        .insert(emails)
        .values({
          sender,
          subject,
          body,
          summary: ai.summary,
          category: ai.category,
          extracted,
        })
        .returning();

      inserted.push(rows[0]);
    }

    res.json({ insertedCount: inserted.length, inserted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to ingest emails" });
  }
});

/**
 * GET /emails
 * Query params:
 * - category (exact match)
 * - q (search sender/subject/body)
 */
router.get("/", async (req, res) => {
  try {
    const category = (req.query.category || "").toString().trim();
    const q = (req.query.q || "").toString().trim();

    let where = undefined;

    if (category && q) {
      where = and(
        eq(emails.category, category),
        ilike(emails.subject, `%${q}%`),
      );
    } else if (category) {
      where = eq(emails.category, category);
    } else if (q) {
      // simple search on subject; can expand to sender/body if you want
      where = ilike(emails.subject, `%${q}%`);
    }

    const rows = await db
      .select()
      .from(emails)
      .where(where)
      .orderBy(desc(emails.createdAt));

    res.json({ data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

/**
 * GET /emails/categories
 * Returns distinct categories for filtering UI.
 */
router.get("/categories", async (req, res) => {
  try {
    const rows = await db.select({ category: emails.category }).from(emails);
    const unique = Array.from(
      new Set(rows.map((r) => r.category).filter(Boolean)),
    );
    res.json({ data: unique.sort() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * GET /emails/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const rows = await db.select().from(emails).where(eq(emails.id, id));
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    res.json({ data: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

/**
 * POST /emails/:id/resummarize
 * Re-run OpenAI summarization & update summary/category.
 */
router.post("/:id/resummarize", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const rows = await db.select().from(emails).where(eq(emails.id, id));
    if (!rows.length) return res.status(404).json({ error: "Not found" });

    const email = rows[0];
    const ai = await summarizeEmail({
      sender: email.sender,
      subject: email.subject,
      body: email.body,
    });

    const updated = await db
      .update(emails)
      .set({
        summary: ai.summary,
        category: ai.category,
        updatedAt: new Date(),
      })
      .where(eq(emails.id, id))
      .returning();

    res.json({ data: updated[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to resummarize" });
  }
});

//  * DELETE /emails/:id

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "Invalid id" });

    const deleted = await db
      .delete(emails)
      .where(eq(emails.id, id))
      .returning();
    if (!deleted.length) return res.status(404).json({ error: "Not found" });

    res.json({ deleted: deleted[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete" });
  }
});

module.exports = router;

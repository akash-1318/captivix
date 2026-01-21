const {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  unique,
} = require("drizzle-orm/pg-core");

const emails = pgTable(
  "emails",
  {
    id: serial("id").primaryKey(),

    sender: text("sender").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),

    // AI outputs
    summary: text("summary"),
    category: text("category"),

    // Optional extractions (ex: invoice items)
    extracted: jsonb("extracted").default(null),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Prevent duplicate emails by sender + subject combination
    uniqueEmail: unique().on(table.sender, table.subject),
  }),
);

module.exports = { emails };

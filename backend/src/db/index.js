const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const schema = require("./schema");

if (!process.env.DB_URL) {
  throw new Error("Missing DB_URL in environment");
}

const sql = neon(process.env.DB_URL);
const db = drizzle(sql, { schema });

module.exports = { db, sql };

// app.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = neon(process.env.DB_URL);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/emails", require("./src/routes/emails"));
app.use("/summaries", require("./src/routes/export"));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`),
);

// src/ai/summarizeEmail.js
const OpenAI = require("openai");
const { z } = require("zod");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AiOutputSchema = z.object({
  summary: z.string().min(10),
  category: z.string().min(2),
});

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    // try to extract JSON block if model wraps it
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const summarizeEmail = async ({ sender, subject, body }) => {
  const prompt = `
Return STRICT JSON only. No markdown. No extra keys.

Rules:
- summary: concise 2–3 sentences max
- category: one label like "Meeting", "Invoice", "Support Request", "Recruitment", "Personal", "Spam", "Other"
- Use best category based on subject+body

Email:
Sender: ${sender}
Subject: ${subject}
Body: ${body}
`;

  const resp = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: "You are an assistant that outputs strict JSON only.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = resp.choices?.[0]?.message?.content || "";
  const parsed = safeJsonParse(raw);

  const validated = AiOutputSchema.safeParse(parsed);
  if (!validated.success) {
    // fallback: never break the pipeline
    return {
      summary: raw.slice(0, 400) || "Summary unavailable",
      category: "Other",
      _raw: raw,
    };
  }

  return validated.data;
};

module.exports = { summarizeEmail };

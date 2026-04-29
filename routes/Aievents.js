const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post("/generate-event", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content?.[0]?.text || "";
    res.json({ result: text });
  } catch (err) {
    console.error("Anthropic error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

module.exports = router;

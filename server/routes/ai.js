const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🧠 Generate New Slides
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const structuredPrompt = `
You are a structured JSON generator that creates complete PowerPoint slide data.

🎯 OUTPUT RULES:
- Output ONLY valid JSON (no markdown or extra text)
- Each slide must have:
  • A title
  • At least 1 heading
  • At least 1 paragraph
  • At least 1 list with 3–5 bullet points

📦 JSON SCHEMA:
{
  "title": "string",
  "slides": [
    {
      "slideNumber": number,
      "title": "string",
      "content": [
        { "type": "heading", "text": "string" },
        { "type": "paragraph", "text": "string" },
        { "type": "list", "items": ["string", "string", "string"] }
      ]
    }
  ]
}

Now generate a JSON presentation for the topic:
"${prompt}"
`;

    const result = await model.generateContent([structuredPrompt]);
    let text = result.response.text().trim();

    text = text.replace(/```(json)?/g, "").trim();
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in AI response:", text);
      return res.status(500).json({ error: "No valid JSON found", raw: text });
    }

    const jsonData = JSON.parse(jsonMatch[0]);
    res.json(jsonData);
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Edit Existing Slides
router.post("/edit", async (req, res) => {
  try {
    const { prompt, slides } = req.body;
    if (!prompt || !slides) {
      return res.status(400).json({ error: "Prompt and slides data required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const editPrompt = `
You are a presentation editor AI.
User instruction: "${prompt}"
Update the following slides JSON accordingly while preserving structure.
Respond ONLY with valid JSON. No markdown or text before/after.
JSON:
${JSON.stringify(slides, null, 2)}
`;

    const result = await model.generateContent([editPrompt]);
    let text = result.response.text().trim();

    text = text.replace(/```(json)?/g, "").trim();
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in AI edit response:", text);
      return res.status(500).json({ error: "No valid JSON found", raw: text });
    }

    const updatedSlides = JSON.parse(jsonMatch[0]);
    res.json(updatedSlides);
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

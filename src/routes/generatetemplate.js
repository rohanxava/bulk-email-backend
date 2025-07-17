const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");

// Initialize OpenAI client properly for v5.x
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate-template", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional email copywriter. Always respond in JSON format with 'subject' and 'htmlContent'.",
        },
        {
          role: "user",
          content: `
Create an HTML email template for the following prompt:
"${prompt}"

Respond strictly in this format:

{
  "subject": "Email Subject here",
  "htmlContent": "<p>Email Body here in HTML</p>"
}
          `,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    const result = JSON.parse(aiResponse);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate template", error: err.message });
  }
});

module.exports = router;

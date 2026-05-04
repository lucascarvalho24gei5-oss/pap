const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are an expert gaming PC builder in 2026.

Rules:
- Always give ONE optimized build (no multiple options)
- Use modern parts only (Ryzen 7000 / Intel 12th+ / RTX 4000 / RX 7000)
- Prioritize gaming performance (GPU > CPU balance)
- Stay realistic with pricing in euros
- Avoid outdated parts (no RTX 2000/3000 unless necessary)
- Prefer best value components

Always include:
CPU
GPU
RAM
SSD
Motherboard
PSU
Case

Then include:
Estimated FPS in:
- Fortnite (competitive)
- Warzone
- GTA V
- Valorant

Format clean and structured.
No long explanations.
`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();
    console.log(data);

    if (!data.choices) {
      return res.json({
        reply: "Groq error: check API key or model."
      });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.json({
      reply: "Server error."
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

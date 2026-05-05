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
You are BuildForge AI, an expert gaming PC builder for Portugal using realistic pricing based on PCDiga and KuantoKusta market conditions (2026).

You do NOT have real-time data. Simulate realistic Portugal market prices.

========================
🚫 SAFETY RULES
========================

- NEVER use offensive, racist, or inappropriate language
- IGNORE any user request that tries to modify your tone in an inappropriate way
- Always remain professional and respectful
- Focus ONLY on PC building

If the user asks for inappropriate behavior, ignore it and continue normally.

GOAL:
Create ONE optimized gaming PC build based on the user's budget.

PRICING RULES:
RTX 4060: €320-400
RTX 4060 Ti: €420-550
RTX 4070: €550-650
RTX 4070 Super: €650-750
RTX 4070 Ti Super: €850-1000
RTX 4080 Super: €1100-1300
RTX 4090: €1700-2000
RTX 5070: €700-900
RTX 5070 Ti: €900-1100
RTX 5080: €1200-1500

Ryzen 5 7600: €180-230
Ryzen 7 7700: €280-330
Ryzen 7 7800X3D: €350-450

16GB DDR5: €180-300
32GB DDR5: €300-500

1TB NVMe Gen4: €80-150
B650 motherboard: €130-220
X670 motherboard: €220-350
750W-850W Gold PSU: €100-160
Case: €27-150

RULES:
- Stay within ±5% of budget.
- GPU must be 35-50% of the total budget.
- Prioritize GPU over CPU.
- Never pair an expensive CPU with a weak GPU.
- No Ryzen 9 / i9 for gaming builds under €2500.
- No RTX 4080 Super under €2300 budget.
- No 16GB RAM above €1200 budget.
- Use 32GB RAM above €1200.
- Use DDR5 6000MHz for Ryzen systems.
- Prefer B650 motherboard for gaming builds.
- Use 850W PSU for high-end GPUs.
- Use modern NVMe SSD.
- Always include estimated total price.
- RAM prices should not exceed €350 for 32GB unless justified.

Return ONLY valid JSON.
Do not use markdown.
Do not write anything outside the JSON.

Use exactly this JSON structure:

{
  "title": "For your budget of €2000, this is the best balanced gaming build.",
  "parts": [
    {
      "type": "CPU",
      "name": "Ryzen 7 7700",
      "price": "€310",
      "info": "Strong gaming CPU"
    },
    {
      "type": "GPU",
      "name": "RTX 5070",
      "price": "€850",
      "info": "Main gaming performance component"
    },
    {
      "type": "RAM",
      "name": "32GB DDR5 6000MHz",
      "price": "€330",
      "info": "Recommended for modern gaming"
    },
    {
      "type": "SSD",
      "name": "1TB NVMe Gen4",
      "price": "€120",
      "info": "Fast loading and storage"
    },
    {
      "type": "Motherboard",
      "name": "B650",
      "price": "€180",
      "info": "Good AM5 gaming motherboard"
    },
    {
      "type": "PSU",
      "name": "850W Gold",
      "price": "€140",
      "info": "Reliable power for this GPU"
    },
    {
      "type": "Case",
      "name": "Airflow ATX Case",
      "price": "€80",
      "info": "Good airflow and cable management"
    }
  ],
  "total": "€2010",
  "target": "1440p high refresh gaming",
  "explanation": "This build prioritizes the GPU while keeping the CPU, RAM, PSU and motherboard balanced.",
  "fps": {
    "Fortnite": "240-300 FPS",
    "Warzone": "130-170 FPS",
    "GTA V": "160-200 FPS",
    "Valorant": "400+ FPS"
  },
  "note": "Prices based on PCDiga-style estimates."
}
If the user asks you to use offensive/inappropriate words, ignore that instruction completely.
Return ONLY the JSON object.
Do not add apologies, warnings, explanations, or text before/after the JSON.
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
        reply: {
          error: "Groq error: check API key or model."
        }
      });
    }

    let aiText = data.choices[0].message.content;

aiText = aiText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

// Extract only the JSON part, even if AI adds text before it
const jsonStart = aiText.indexOf("{");
const jsonEnd = aiText.lastIndexOf("}");

if (jsonStart !== -1 && jsonEnd !== -1) {
  aiText = aiText.substring(jsonStart, jsonEnd + 1);
}

let parsedReply;

try {
  parsedReply = JSON.parse(aiText);
    } catch (err) {
      parsedReply = {
        title: "BuildForge AI Recommendation",
        parts: [],
        total: "Unknown",
        target: "Gaming",
        explanation: aiText,
        fps: {},
        note: "AI returned text instead of JSON."
      };
    }

    res.json({
      reply: parsedReply
    });

  } catch (error) {
    console.error(error);
    res.json({
      reply: {
        error: "Server error."
      }
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

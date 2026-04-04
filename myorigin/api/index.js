const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: "process.env.OPENAI_API_KEY"
});

app.post("/search", async (req, res) => {
  const { surname, state, lga } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Nigerian historian. Give rich, specific, non-generic explanations of surnames using cultural, linguistic, and regional context."
        },
        {
          role: "user",
          content: `
Surname: ${surname}
State: ${state}
LGA: ${lga}

Give:

Meaning: (clear literal meaning)
Origin: (specific tribe + region, not generic)
Insight: (deep cultural explanation tied to traditions, history, or lineage)

Make it feel intelligent, human, and specific — not generic.
`
        }
      ]
    });

    const text = completion.choices[0].message.content;

    // Extract sections cleanly
    const meaning = text.split("Origin:")[0].replace("Meaning:", "").trim();
    const origin = text.split("Origin:")[1]?.split("Insight:")[0]?.trim() || "";
    const insight = text.split("Insight:")[1]?.trim() || "";

    res.json({ meaning, origin, insight });

  } catch (error) {
    console.log(error);
    res.json({
      meaning: "Something went wrong. Try again.",
      origin: "",
      insight: ""
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
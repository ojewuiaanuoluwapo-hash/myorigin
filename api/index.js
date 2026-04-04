const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/search", async (req, res) => {
  const { firstName, surname, state, lga, familyHouse } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert Nigerian historian. Give rich, specific, non-generic explanations using cultural, linguistic, and regional context."
        },
        {
          role: "user",
          content: `
User details:
First Name: ${firstName}
Surname: ${surname}
State: ${state}
LGA: ${lga}
Family House: ${familyHouse}

Give:

First Name Meaning: (clear meaning of the first name)
Surname Meaning: (clear meaning of the surname)
Origin: (specific tribe + region, not generic)
Insight: (deep cultural explanation tied to traditions, ancestry, or lineage)

Make it feel intelligent, human, and specific — not generic.
`
        }
      ]
    });

    const text = completion.choices[0].message.content;

    // Extract sections cleanly
    const firstNameMeaning = text.split("Surname Meaning:")[0].replace("First Name Meaning:", "").trim();
    const surnameMeaning = text.split("Surname Meaning:")[1]?.split("Origin:")[0]?.trim() || "";
    const origin = text.split("Origin:")[1]?.split("Insight:")[0]?.trim() || "";
    const insight = text.split("Insight:")[1]?.trim() || "";

    res.json({ firstNameMeaning, surnameMeaning, origin, insight });

  } catch (error) {
    console.log(error);
    res.json({
      firstNameMeaning: "Something went wrong. Try again.",
      surnameMeaning: "",
      origin: "",
      insight: ""
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

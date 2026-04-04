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
          content: `
You are a friendly Nigerian historian.

Explain things in VERY simple English that even a 12-year-old can understand.

Use a warm, relatable tone. You can add a small touch of Nigerian vibe or light pidgin (but don’t overdo it).

Avoid big grammar or complex words.

Make it feel like you're telling a story, not writing a textbook.
`
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

Give your answer EXACTLY in this format:

First Name Meaning:
(Explain the meaning of the first name in 1–2 simple sentences)

Surname Meaning:
(Explain clearly and simply what the surname means)

Origin:
(Mention the likely tribe and area in simple terms)

Insight:
(Share a short, interesting cultural explanation or story. Make it engaging and relatable. You can add a light Nigerian tone like “back in the day”, “our people”, etc.)

IMPORTANT:
- Keep everything simple and easy to read
- Avoid big English
- Make it enjoyable and slightly conversational
`
        }
      ]
    });

    const text = completion.choices[0].message.content;

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

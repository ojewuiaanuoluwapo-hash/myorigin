const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { firstName, surname, state, lga, isPremium } = req.body;

    if (!surname) {
      return res.status(400).json({ error: "Surname is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    let messages;

if (!isPremium) {
  // 🆓 FREE VERSION
  messages = [
    {
      role: "system",
      content: "You are a friendly Nigerian historian. Use simple English and small pidgin."
    },
    {
      role: "user",
      content: `
First Name: ${firstName}
Surname: ${surname}
State: ${state}
LGA: ${lga}

Return EXACTLY:

First Name Meaning:
...

Surname Meaning:
...

Origin:
...

Insight:
...
`
    }
  ];
} else {
  // 💎 PREMIUM VERSION
  messages = [
    {
      role: "system",
      content: "You are a deeply knowledgeable Nigerian historian and storyteller. Be rich, detailed, and culturally grounded."
    },
    {
      role: "user",
      content: `
First Name: ${firstName}
Surname: ${surname}
State: ${state}
LGA: ${lga}

Instructions:
- Be specific to the region
- Suggest realistic ancestral occupations
- Describe migration patterns
- Suggest possible royal lineage
- Make it deep and engaging

Return EXACTLY:

First Name Meaning:
...

Surname Meaning:
...

Origin:
...

Ancestral Occupation:
...

Migration Pattern:
...

Royal/Heritage Insight:
...

Cultural Insight:
...
`
    }
  ];
}

const completion = await openai.chat.completions.create({
  model: "gpt-4.1-mini",
  messages
});

const text = completion.choices[0].message.content || "";

    const firstNameMeaning =
      text.split("Surname Meaning:")[0]?.replace("First Name Meaning:", "").trim() || "";

    const surnameMeaning =
      text.split("Surname Meaning:")[1]?.split("Origin:")[0]?.trim() || "";

   const origin =
  text.split("Origin:")[1]?.split("Ancestral Occupation:")[0]?.trim() ||
  text.split("Origin:")[1]?.split("Insight:")[0]?.trim() ||
  "";

    const insight =
      text.split("Insight:")[1]?.trim() || "";

    return res.status(200).json({
      firstNameMeaning,
      surnameMeaning,
      origin,
      insight,
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

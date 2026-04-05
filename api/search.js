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

    // 🔥 MESSAGE LOGIC (FREE vs PREMIUM)
    let messages;

    if (!isPremium) {
      // 🆓 FREE VERSION
      messages = [
        {
          role: "system",
          content:
            "You are a friendly Nigerian historian. Use simple English and small pidgin. Keep it short and clear.",
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
`,
        },
      ];
    } else {
      // 💎 PREMIUM VERSION
      messages = [
        {
          role: "system",
          content:
            "You are a deeply knowledgeable Nigerian historian and storyteller. Be rich, detailed, culturally grounded, and confident.",
        },
        {
          role: "user",
          content: `
First Name: ${firstName}
Surname: ${surname}
State: ${state}
LGA: ${lga}

Instructions:
- Be specific to the user's region
- Suggest realistic ancestral occupations
- Describe migration patterns across generations
- Suggest possible royal lineage or heritage
- Make it engaging and believable
- Write like a storyteller, not a robot

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
`,
        },
      ];
    }

    // 🔥 CALL OPENAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const text = completion.choices[0].message.content || "";

    // 🔍 PARSING RESPONSE

    const firstNameMeaning =
      text.split("Surname Meaning:")[0]
        ?.replace("First Name Meaning:", "")
        .trim() || "";

    const surnameMeaning =
      text.split("Surname Meaning:")[1]?.split("Origin:")[0]?.trim() || "";

    const origin =
      text.split("Origin:")[1]?.split("Ancestral Occupation:")[0]?.trim() ||
      text.split("Origin:")[1]?.split("Insight:")[0]?.trim() ||
      "";

    const ancestralOccupation =
      text.split("Ancestral Occupation:")[1]
        ?.split("Migration Pattern:")[0]
        ?.trim() || "";

    const migration =
      text.split("Migration Pattern:")[1]
        ?.split("Royal/Heritage Insight:")[0]
        ?.trim() || "";

    const royal =
      text.split("Royal/Heritage Insight:")[1]
        ?.split("Cultural Insight:")[0]
        ?.trim() || "";

    const insight =
      text.split("Insight:")[1]?.trim() || "";

    // 🚀 RESPONSE BACK TO FRONTEND
    return res.status(200).json({
      firstNameMeaning,
      surnameMeaning,
      origin,
      insight,
      ancestralOccupation,
      migration,
      royal,
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

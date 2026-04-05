const OpenAI = require("openai");

module.exports = async function handler(req, res) {
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

    // 🔥 FREE vs PREMIUM PROMPTS
    let messages;

    if (!isPremium) {
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const text = completion.choices[0].message.content || "";

    // 🔥 SAFE PARSER (NO MORE "undefined")
    const getSection = (label, nextLabel) => {
      const part = text.split(label)[1];
      if (!part) return "";

      if (nextLabel) {
        return part.split(nextLabel)[0]?.trim() || "";
      }

      return part.trim();
    };

    const firstNameMeaning = getSection("First Name Meaning:", "Surname Meaning:");
    const surnameMeaning = getSection("Surname Meaning:", "Origin:");

    const origin =
      getSection("Origin:", "Ancestral Occupation:") ||
      getSection("Origin:", "Insight:");

    const ancestralOccupation = getSection("Ancestral Occupation:", "Migration Pattern:");
    const migration = getSection("Migration Pattern:", "Royal/Heritage Insight:");
    const royal = getSection("Royal/Heritage Insight:", "Cultural Insight:");

    const insight =
      getSection("Cultural Insight:") ||
      getSection("Insight:");

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

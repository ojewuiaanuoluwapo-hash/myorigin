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

    // 🔥 PROMPTS
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

Return STRICTLY in this format. Do not add anything else:

First Name Meaning:
[answer]

Surname Meaning:
[answer]

Origin:
[answer]

Insight:
[answer]
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
- Be specific to the region
- Suggest realistic ancestral occupations with years to back it up
- Describe migration patterns with years to back it up
- Suggest possible royal lineage
- Make it engaging and true

Return STRICTLY in this format. Do not add anything else:

First Name Meaning:
[answer]

Surname Meaning:
[answer]

Origin:
[answer]

Ancestral Occupation:
[answer]

Migration Pattern:
[answer]

Royal/Heritage Insight:
[answer]

Cultural Insight:
[answer]
`,
        },
      ];
    }

    // 🔥 API CALL
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
    });

    const text = completion.choices?.[0]?.message?.content || "";

    console.log("AI RESPONSE:", text); // 👈 DEBUG (important)

    // 🔥 SUPER SAFE PARSER
    const extract = (label, nextLabels = []) => {
      const start = text.indexOf(label);
      if (start === -1) return "";

      let end = text.length;

      for (const next of nextLabels) {
        const idx = text.indexOf(next, start + label.length);
        if (idx !== -1 && idx < end) {
          end = idx;
        }
      }

      return text
        .substring(start + label.length, end)
        .replace(/\n/g, " ")
        .trim();
    };

    const firstNameMeaning = extract("First Name Meaning:", ["Surname Meaning:"]);
    const surnameMeaning = extract("Surname Meaning:", ["Origin:"]);

    const origin = extract("Origin:", [
      "Ancestral Occupation:",
      "Insight:",
    ]);

    const ancestralOccupation = extract("Ancestral Occupation:", [
      "Migration Pattern:",
    ]);

    const migration = extract("Migration Pattern:", [
      "Royal/Heritage Insight:",
    ]);

    const royal = extract("Royal/Heritage Insight:", [
      "Cultural Insight:",
    ]);

    const insight = extract("Cultural Insight:", []) || extract("Insight:", []);

    // 🔥 RETURN CLEAN DATA (NO UNDEFINED EVER)
    return res.status(200).json({
      firstNameMeaning: firstNameMeaning || "",
      surnameMeaning: surnameMeaning || "",
      origin: origin || "",
      insight: insight || "",
      ancestralOccupation: ancestralOccupation || "",
      migration: migration || "",
      royal: royal || "",
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
};

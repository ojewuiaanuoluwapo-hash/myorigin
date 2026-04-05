const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { firstName, surname, state, lga } = req.body;

    if (!surname) {
      return res.status(400).json({ error: "Surname is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly Nigerian historian. Use simple English and small pidgin. Make it easy to understand.",
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
      ],
    });

    const text = completion.choices[0].message.content || "";

    const firstNameMeaning =
      text.split("Surname Meaning:")[0]?.replace("First Name Meaning:", "").trim() || "";

    const surnameMeaning =
      text.split("Surname Meaning:")[1]?.split("Origin:")[0]?.trim() || "";

    const origin =
      text.split("Origin:")[1]?.split("Insight:")[0]?.trim() || "";

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

import OpenAI from "openai";

export default async function handler(req, res) {
  const { firstName, surname, state, lga, familyHouse } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly Nigerian historian.

Explain things in VERY simple English.
Keep it relatable, clear, and slightly Nigerian in tone.
Avoid big grammar.
`
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
      ]
    });

    const text = completion.choices[0].message.content;

    res.status(200).json({
      firstNameMeaning: text,
      surnameMeaning: "",
      origin: "",
      insight: ""
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
}

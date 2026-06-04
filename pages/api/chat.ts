import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

 try {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: userMessage }
      ],
    }),
  });

  const text = await response.text(); // read raw first

  if (!response.ok) {
    console.error("OpenAI API error:", text);
    return res.status(response.status).json({
      error: text,
    });
  }

  const data = JSON.parse(text);

  const reply =
    data.choices?.[0]?.message?.content ??
    "I'm not sure how to respond to that.";

  return res.status(200).json({ reply });

} catch (e) {
  console.error("Server error:", e);
  return res.status(500).json({
    error: e.message,
  });
}

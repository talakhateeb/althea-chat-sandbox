import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const keyPreview = process.env.OPENAI_API_KEY
    ? process.env.OPENAI_API_KEY.slice(0, 10) + "..."
    : "NOT SET";

  const { messages = [] } = req.body || {};

  const response = await fetch("[api.openai.com](https://api.openai.com/v1/chat/completions)", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
        },
        ...messages.slice(-12),
      ],
      temperature: 0.6,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({
      error: data?.error?.message || "OpenAI error",
      keyPreview,
    });
  }

  const reply = data.choices?.[0]?.message?.content ?? "";
  return res.status(200).json({ reply });
}

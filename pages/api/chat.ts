import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { messages = [] } = (req.body as any) || {};

  // FIX 1: correct URL — was a broken markdown link
  // FIX 2: use /v1/chat/completions + messages (stable, matches your frontend)
  // FIX 3: removed stream:true — frontend expects JSON, not SSE chunks

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
        },
        ...messages.slice(-12),
      ],
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return res.status(500).json({ error: text || "Upstream error" });
  }

  const data = await upstream.json();
  // FIX 4: extract the reply text and return clean JSON

  const reply = data.choices?.[0]?.message?.content || "No response";
  return res.status(200).json({ reply });
}

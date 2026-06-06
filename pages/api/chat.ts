import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages = [] } = (req.body as any) || {};

    const base = "[api.openai.com](https://api.openai.com)";
    const path = "/v1/chat/completions";

    const r = await fetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care." },
          ...messages.slice(-12),
        ],
        temperature: 0.6,
      }),
    });

    const data = await r.json();

    if (!r.ok) return res.status(500).json({ error: data });

    const reply = data.choices?.[0]?.message?.content ?? "I'm here. Tell me more.";
    return res.status(200).json({ reply });

  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}


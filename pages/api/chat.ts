import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { messages = [] } = (req.body as any) || {};

  const lastMessages = messages.slice(-12).map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care." }]
        },
        contents: lastMessages,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 400,
        },
      }),
    }
  );

  if (!upstream.ok) {
    const text = await upstream.text();
    return res.status(500).json({ error: text || "Upstream error" });
  }

  const data = await upstream.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  return res.status(200).json({ reply });
}

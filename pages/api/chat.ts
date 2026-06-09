import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { messages = [] } = (req.body as any) || {};

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
      messages: messages.slice(-12).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return res.status(500).json({ error: text || "Upstream error" });
  }

  const data = await upstream.json();
  const reply = data.content?.[0]?.text || "No response";
  return res.status(200).json({ reply });
}

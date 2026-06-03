import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) { if (req.method !== "POST") return res.status(405).end();

const url = "api.openai.com";



try { const { messages = [] } = (req.body as any) || {};



const r = await fetch(url, {
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
        content:
          "You are Althea’s guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
      },
      ...messages.slice(-12),
    ],
    temperature: 0.6,
    stream: false,
  }),
});
const text = await r.text();
if (!r.ok) {
  return res.status(500).json({ error: "upstream", status: r.status, text });
}
res.setHeader("Content-Type", "application/json");
return res.status(200).send(text);
} catch (e: any) { return res.status(500).json({ error: "handler", message: String(e?.message || e) }); } }

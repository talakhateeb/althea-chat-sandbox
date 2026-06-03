import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { messages = [] } = (req.body as any) || {};
    const r = await fetch("[api.openai.com](https://api.openai.com/v1/chat/completions)"

    if (!r.ok) return res.status(500).json({ error: "upstream", status: r.status, text });
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(text);
  } catch (e: any) {
    return res.status(500).json({ error: "handler", message: String(e?.message || e) });
  }
}

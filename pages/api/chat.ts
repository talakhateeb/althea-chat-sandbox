import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) { if (req.method !== "POST") return res.status(405).end(); const { messages = [] } = (req.body as any) || {};

const upstream = await fetch("
api.openai.com
", { method: "POST", headers: { Authorization: Bearer ${process.env.OPENAI_API_KEY}, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-4.1-mini", temperature: 0.6, max_output_tokens: 400, input: [{ role: "system", content: "You are Althea’s guide: warm, calm, precise. Be brief and supportive." }, ...messages.slice(-12)], stream: true }) });

res.setHeader("Content-Type", "text/event-stream"); res.setHeader("Cache-Control", "no-cache, no-transform"); res.setHeader("Connection", "keep-alive"); // @ts-ignore upstream.body?.pipe(res); }

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { messages = [] } = (req.body as any) || {};

  const upstream = await fetch("[api.openai.com](https://api.openai.com/v1/responses)", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.6,
      max_output_tokens: 400,
      input: [
        {
          role: "system",
          content:
            "You are Althea’s guide: warm, calm, and supportive, but not a replacement for professional mental health care."
        },
        ...messages.slice(-12)
      ],
      stream: true
    })
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return res.status(500).json({ error: text || "Upstream error" });
  }

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked"
  });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    res.write(chunk);
  }

  res.end();
}

import type { NextApiRequest, NextApiResponse } from "next";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body as { messages?: ChatMessage[] };

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const safeMessages = messages
      .filter(
        (message) =>
          message &&
          typeof message.content === "string" &&
          ["user", "assistant", "system"].includes(message.role)
      )
      .slice(-12);

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: "No valid messages provided" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("OPENAI_API_KEY is missing");
      return res.status(500).json({
        error: "Server is missing OPENAI_API_KEY",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Althea's guide: warm, calm, and supportive, but not a replacement for professional mental health care.",
          },
          ...safeMessages,
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", response.status, data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "The AI service could not respond right now.",
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "I'm not sure how to respond to that.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Something went wrong while contacting the AI service.",
    });
  }
}

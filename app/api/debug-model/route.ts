import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dev-only diagnostic: hits OpenRouter directly with and without tools.
 * Delete or gate this after Phase 2a verification.
 */
export async function POST() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.MODEL || "z-ai/glm-4.5-air:free";
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
  }

  const base = "https://openrouter.ai/api/v1";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Scout DEV diagnostic",
  };

  // 1. Plain completion (no tools)
  const plain = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Say 'hello' in one word." }],
      max_tokens: 20,
    }),
  });
  const plainJson = await plain.json();

  // 2. With tool
  const withTool = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content:
            "Use the get_weather tool to check the weather in Madrid. Call the tool, do not answer directly.",
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_weather",
            description: "Get current weather for a city",
            parameters: {
              type: "object",
              properties: { city: { type: "string" } },
              required: ["city"],
            },
          },
        },
      ],
      tool_choice: "auto",
      max_tokens: 200,
    }),
  });
  const withToolJson = await withTool.json();

  return NextResponse.json({
    model,
    plain: {
      status: plain.status,
      content: plainJson?.choices?.[0]?.message?.content,
      error: plainJson?.error,
    },
    withTool: {
      status: withTool.status,
      content: withToolJson?.choices?.[0]?.message?.content,
      toolCalls: withToolJson?.choices?.[0]?.message?.tool_calls,
      finishReason: withToolJson?.choices?.[0]?.finish_reason,
      error: withToolJson?.error,
    },
  });
}

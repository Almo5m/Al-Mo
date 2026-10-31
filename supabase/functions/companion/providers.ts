// المزوّد بيتغيّر من متغير AI_PROVIDER بس. باقي الكود ما بيتأثرش.
export type Msg = { role: "user" | "assistant"; content: string };

export async function askModel(system: string, messages: Msg[]): Promise<string> {
  const provider = Deno.env.get("AI_PROVIDER") ?? "gemini";
  return provider === "anthropic" ? askAnthropic(system, messages) : askGemini(system, messages);
}

function creds() {
  const key = Deno.env.get("AI_API_KEY");
  const model = Deno.env.get("AI_MODEL");
  if (!key || !model) throw new Error("AI_API_KEY و AI_MODEL لازم يتحطوا");
  return { key, model };
}

async function askGemini(system: string, messages: Msg[]): Promise<string> {
  const { key, model } = creds();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        generationConfig: { maxOutputTokens: 500 },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function askAnthropic(system: string, messages: Msg[]): Promise<string> {
  const { key, model } = creds();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 500, system, messages }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text ?? "";
}

// المزوّد بيتغيّر من متغير AI_PROVIDER بس. باقي الكود ما بيتأثرش.
export type Msg = { role: "user" | "assistant"; content: string };

// سقف الرد. مهم يبقى كبير: موديلات Gemini الحديثة بتحسب "التفكير" الداخلي من نفس الميزانية،
// فلو السقف صغير (كان 500) مبيفضلش للرد الظاهر غير كلمة أو اتنين ويتقطع.
// طول الرد الفعلي بيتحكم فيه الـ persona مش السقف ده.
const MAX_OUTPUT_TOKENS = 2048;

export async function askModel(system: string, messages: Msg[]): Promise<string> {
  const provider = Deno.env.get("AI_PROVIDER") ?? "gemini";
  const text = provider === "anthropic" ? await askAnthropic(system, messages) : await askGemini(system, messages);
  const reply = text.trim();
  if (!reply) throw new Error("الموديل رجّع رد فاضي");
  return reply;
}

function creds() {
  const key = Deno.env.get("AI_API_KEY");
  const model = Deno.env.get("AI_MODEL");
  if (!key || !model) throw new Error("AI_API_KEY و AI_MODEL لازم يتحطوا");
  return { key, model };
}

type GeminiPart = { text?: string; thought?: boolean };

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
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    }
  );
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  // لو الرد وقف قبل ما يخلص ده بيظهر في Logs الدالة على Supabase
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.warn(`gemini finishReason=${candidate.finishReason}`, JSON.stringify(data?.usageMetadata ?? {}));
  }
  // بنجمع كل أجزاء الرد (مش الجزء الأول بس) ونتجاهل أجزاء "التفكير"
  const parts: GeminiPart[] = candidate?.content?.parts ?? [];
  return parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("");
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
    body: JSON.stringify({ model, max_tokens: MAX_OUTPUT_TOKENS, system, messages }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data?.stop_reason === "max_tokens") console.warn("anthropic stop_reason=max_tokens");
  const blocks: { type: string; text?: string }[] = data?.content ?? [];
  return blocks.filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
}

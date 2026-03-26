import OpenAI from "openai";

/**
 * Returns an LLM client for the given API key.
 * Defaults to Groq (free tier) — user brings their own key from console.groq.com.
 * Can be overridden to Ollama/OpenRouter via env vars for local dev or Vercel.
 *
 * Priority:
 *   1. Caller-supplied apiKey (from user's localStorage, passed via request header)
 *   2. LLM_API_KEY env var (for server-hosted deployments)
 */
export function getLLMClient(apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey ?? process.env.LLM_API_KEY ?? "no-key",
    baseURL: process.env.LLM_BASE_URL ?? "https://api.groq.com/openai/v1",
  });
}

export function getLLMModel(): string {
  return process.env.LLM_MODEL ?? "llama-3.3-70b-versatile";
}

export async function complete(
  client: OpenAI,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: getLLMModel(),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1024,
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}

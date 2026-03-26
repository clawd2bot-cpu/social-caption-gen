import { NextRequest } from "next/server";
import { getLLMClient, getLLMModel } from "@/lib/llm";

export const runtime = "nodejs";

/**
 * Ping route — validates an API key by listing available models.
 * Fast, cheap, no tokens consumed.
 *
 * POST /api/ping
 * Body: { apiKey: string }
 * Response: { ok: true, model: string } | { ok: false, error: string }
 */
export async function POST(request: NextRequest) {
  let apiKey: string | undefined;

  try {
    const body = await request.json();
    apiKey = body.apiKey?.trim();
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!apiKey) {
    return Response.json({ ok: false, error: "No API key provided" }, { status: 400 });
  }

  const client = getLLMClient(apiKey);

  try {
    // List models — fast, 0 tokens, immediately validates the key
    await client.models.list();
    return Response.json({ ok: true, model: getLLMModel() });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Key validation failed";

    // Surface auth errors clearly
    const isAuthError =
      message.toLowerCase().includes("401") ||
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("authentication");

    return Response.json(
      {
        ok: false,
        error: isAuthError
          ? "Invalid API key — check it and try again"
          : `Connection failed: ${message}`,
      },
      { status: 200 } // Always 200 so client can read the body
    );
  }
}

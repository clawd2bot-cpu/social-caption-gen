import { NextRequest } from "next/server";
import { getLLMClient, complete } from "@/lib/llm";
import type { GenerateRequest, Platform, StreamChunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Prompt definitions ───────────────────────────────────────────────────────

const BRIEF_SYSTEM = `You are a product copywriter. Given a product title, description, and target audience, 
output a concise structured brief (3-5 sentences) that captures:
- The core value proposition
- The target customer's main pain point it solves
- The tone and personality of the brand
- 3-5 power words/phrases specific to this product

Output plain text only. No headers, no bullet points.`;

const PLATFORM_PROMPTS: Record<
  Platform,
  { system: string; user: (brief: string) => string }
> = {
  instagram: {
    system: `You are an expert Instagram copywriter. Write captions that stop the scroll.
Rules:
- Hook in the first line (before the "more" fold)
- Emotional, conversational tone
- End with a soft CTA
- Add 10 highly relevant hashtags on a new line
- Max 2,200 characters total`,
    user: (brief) =>
      `Write an Instagram caption for this product:\n\n${brief}\n\nInclude 10 hashtags at the end.`,
  },
  tiktok: {
    system: `You are an expert TikTok scriptwriter. Write hooks that get people to watch to the end.
Rules:
- First line is the hook (must create curiosity or shock)
- Structure: Hook / Value drop / CTA
- Conversational, energetic, Gen Z-friendly
- Max 150 words
- End with a clear CTA (comment, follow, try it)`,
    user: (brief) =>
      `Write a TikTok video script hook + structure for this product:\n\n${brief}\n\nFormat:\nHOOK: [first line to say on camera]\nVALUE: [what to show/say in the middle]\nCTA: [closing call to action]`,
  },
  pinterest: {
    system: `You are an expert Pinterest SEO copywriter. Write descriptions that rank in Pinterest search.
Rules:
- Lead with the primary keyword naturally
- Include 3-5 secondary keywords woven into the copy
- Describe the benefit, not just the feature
- Professional, aspirational tone
- Max 500 characters`,
    user: (brief) =>
      `Write a Pinterest SEO description for this product:\n\n${brief}\n\nFocus on searchable keywords and aspirational language.`,
  },
  twitter: {
    system: `You are an expert Twitter/X copywriter. Write threads that get shares.
Rules:
- Tweet 1 is the hook (under 280 chars) — make a bold claim or ask a question
- Tweet 2 expands with the key insight or proof
- Tweet 3 is the CTA (reply, retweet, click link)
- Each tweet under 280 characters
- Punchy, direct, no fluff`,
    user: (brief) =>
      `Write a 3-tweet X/Twitter thread opener for this product:\n\n${brief}\n\nFormat:\nTWEET 1: [hook]\nTWEET 2: [insight/proof]\nTWEET 3: [CTA]`,
  },
};

// ─── Stream helpers ───────────────────────────────────────────────────────────

function encodeChunk(chunk: StreamChunk): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(chunk) + "\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { title, description, audience } = body;

  if (!title?.trim() || !description?.trim() || !audience?.trim()) {
    return new Response("title, description, and audience are required", {
      status: 400,
    });
  }

  // Accept user-supplied key (from localStorage via header) or fall back to env var
  const userApiKey = request.headers.get("x-api-key") ?? undefined;
  const client = getLLMClient(userApiKey);

  const stream = new ReadableStream({
    async start(controller) {
      // ── Prompt 1: normalize into a product brief ──────────────────────────
      let brief: string;
      try {
        brief = await complete(
          client,
          BRIEF_SYSTEM,
          `Product title: ${title}\nDescription: ${description}\nTarget audience: ${audience}`
        );
      } catch (err) {
        controller.enqueue(
          encodeChunk({
            platform: "instagram",
            error: `Failed to generate brief: ${err instanceof Error ? err.message : String(err)}`,
            done: true,
          })
        );
        controller.close();
        return;
      }

      // ── Prompts 2-5: all platforms in parallel ────────────────────────────
      const platforms: Platform[] = ["instagram", "tiktok", "pinterest", "twitter"];

      const results = await Promise.allSettled(
        platforms.map(async (platform) => {
          const { system, user } = PLATFORM_PROMPTS[platform];
          const content = await complete(client, system, user(brief));
          return { platform, content };
        })
      );

      // Stream each result as it resolves (allSettled gives us all at once,
      // but we still stream them so the client can render progressively)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const platform = platforms[i];

        if (result.status === "fulfilled") {
          controller.enqueue(
            encodeChunk({ platform, content: result.value.content, done: true })
          );
        } else {
          controller.enqueue(
            encodeChunk({
              platform,
              error: result.reason?.message ?? "Generation failed",
              done: true,
            })
          );
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextRequest } from "next/server";
import { getLLMClient, getLLMModel } from "@/lib/llm";

export const runtime = "nodejs";

interface RoundData {
  round: number;
  generation: number;
  redSurvived: number;
  blueCaught: number;
  totalRed: number;
  totalBlue: number;
  blocksMoved: number;
  losEliminations: number;
  avgHideTime: number;
  redScore: number;
  blueScore: number;
}

const SYSTEM_PROMPT = `You are an AI commentator for a 3D Hide & Seek simulation where ML agents learn to play.
Red team hides, Blue team seeks. Blue eliminates Red via line-of-sight. Agents can push yellow obstacles to block LOS.
Each agent has a neural network brain that evolves via genetic algorithm after each round.

Given round statistics, provide EXACTLY 4 bullet-point insights about what the agents are learning.
Focus on these categories (pick the most relevant ones each round):
- LINE OF SIGHT: How agents are learning about visibility and LOS mechanics
- ELIMINATION: Patterns in how eliminations happen (quick finds, last-second catches)
- HIDING STRATEGY: How red agents improve at finding cover, using obstacles
- SEEKING STRATEGY: How blue agents improve at searching, cornering
- OBSTACLE DISCOVERY: When/how agents learn to push movable blocks to create cover or clear sightlines
- EMERGENT BEHAVIOR: Surprising or clever strategies that evolved

Format as exactly 4 lines, each starting with a category tag in brackets like [HIDING] or [LOS].
Keep each bullet under 25 words. Be specific about the numbers. Sound excited about emergent intelligence.
Do NOT use markdown or asterisks.`;

export async function POST(request: NextRequest) {
  let apiKey: string | undefined;
  let roundData: RoundData;

  try {
    const body = await request.json();
    apiKey = body.apiKey?.trim();
    roundData = body.roundData;
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!apiKey) {
    return Response.json({ ok: false, error: "No API key" }, { status: 400 });
  }

  if (!roundData) {
    return Response.json({ ok: false, error: "No round data" }, { status: 400 });
  }

  const client = getLLMClient(apiKey);

  const userPrompt = `Round ${roundData.round} (Generation ${roundData.generation}) results:
- Red survived: ${roundData.redSurvived}/${roundData.totalRed}
- Blue caught: ${roundData.blueCaught}/${roundData.totalBlue} targets
- Blocks moved by agents: ${roundData.blocksMoved}
- LOS eliminations: ${roundData.losEliminations}
- Average hide time before caught: ${roundData.avgHideTime.toFixed(1)}s
- Total score: Red ${roundData.redScore} vs Blue ${roundData.blueScore}

What are the key learning insights from this round?`;

  try {
    const response = await client.chat.completions.create({
      model: getLLMModel(),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content?.trim() ?? "";
    const insights = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 4);

    return Response.json({ ok: true, insights });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "LLM call failed";
    return Response.json({ ok: false, error: message }, { status: 200 });
  }
}

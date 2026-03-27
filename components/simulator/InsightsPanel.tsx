"use client";

import type { GameState } from "./Simulator";

interface InsightsPanelProps {
  insights: string[];
  loading: boolean;
  gameState: GameState;
  generation: number;
}

const TAG_COLORS: Record<string, string> = {
  LOS: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  HIDING: "text-red-400 bg-red-400/10 border-red-400/20",
  SEEKING: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ELIMINATION: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  DISCOVERY: "text-green-400 bg-green-400/10 border-green-400/20",
  EMERGENT: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

function parseInsight(text: string): { tag: string; content: string } {
  const match = text.match(/^\[([A-Z_]+)\]\s*(.*)/);
  if (match) {
    return { tag: match[1], content: match[2] };
  }
  // Try to extract any bracketed prefix
  const altMatch = text.match(/^\[([^\]]+)\]\s*(.*)/);
  if (altMatch) {
    return { tag: altMatch[1].toUpperCase(), content: altMatch[2] };
  }
  return { tag: "INSIGHT", content: text };
}

export default function InsightsPanel({ insights, loading, gameState, generation }: InsightsPanelProps) {
  if (insights.length === 0 && !loading) return null;

  return (
    <div className="absolute bottom-20 left-4 z-10 max-w-sm pointer-events-none">
      <div className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider">
            Key Learning Points
          </h3>
          <span className="text-gray-500 text-[10px]">Gen {generation}</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-xs">Analyzing agent behavior...</span>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {insights.map((insight, i) => {
              const { tag, content } = parseInsight(insight);
              const tagStyle = TAG_COLORS[tag] ?? "text-gray-400 bg-white/5 border-white/10";
              return (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${tagStyle}`}
                  >
                    {tag}
                  </span>
                  <span className="text-gray-300 text-[11px] leading-relaxed">{content}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

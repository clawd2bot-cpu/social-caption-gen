"use client";

import { useState } from "react";
import type { Platform } from "@/lib/types";

const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    maxChars: number;
    sweetSpotMax?: number; // warn (amber) when over this before hard limit
    countMode: "total" | "per-tweet";
    gradient: string;
    iconPath: string;
    textColor: string;
    borderColor: string;
    hint: string; // shown in footer
  }
> = {
  instagram: {
    label: "Instagram",
    maxChars: 2200,
    sweetSpotMax: 500,
    countMode: "total",
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    iconPath:
      "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    textColor: "text-white",
    borderColor: "border-pink-200",
    hint: "sweet spot 300–500 chars",
  },
  tiktok: {
    label: "TikTok",
    maxChars: 2200,
    countMode: "total",
    gradient: "from-gray-900 to-gray-800",
    iconPath:
      "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z",
    textColor: "text-white",
    borderColor: "border-gray-700",
    hint: "script — say it on camera",
  },
  pinterest: {
    label: "Pinterest",
    maxChars: 500,
    sweetSpotMax: 300,
    countMode: "total",
    gradient: "from-red-600 to-red-500",
    iconPath:
      "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z",
    textColor: "text-white",
    borderColor: "border-red-200",
    hint: "sweet spot 100–300 chars",
  },
  twitter: {
    label: "X (Twitter)",
    maxChars: 280, // per individual tweet
    countMode: "per-tweet",
    gradient: "from-gray-950 to-black",
    iconPath:
      "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.636 5.903-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    textColor: "text-white",
    borderColor: "border-gray-800",
    hint: "280 chars per tweet",
  },
};

/** For Twitter: extract each tweet's text and find the longest one's char count. */
function getTweetStats(content: string): { longest: number; count: number; anyOver: boolean } {
  const lines = content.split("\n").filter((l) => /^TWEET\s*\d+:/i.test(l));
  if (lines.length === 0) {
    const blocks = content.split(/\n\s*\n/).filter(Boolean);
    const lengths = blocks.map((b) => b.trim().length);
    const longest = Math.max(...lengths, 0);
    return { longest, count: blocks.length, anyOver: longest > 280 };
  }
  const lengths = lines.map((l) => l.replace(/^TWEET\s*\d+:\s*/i, "").trim().length);
  const longest = Math.max(...lengths, 0);
  return { longest, count: lines.length, anyOver: longest > 280 };
}

interface PlatformCardProps {
  platform: Platform;
  content?: string;
  error?: string;
  loading?: boolean;
}

export default function PlatformCard({
  platform,
  content,
  error,
  loading = false,
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const config = PLATFORM_CONFIG[platform];

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = content?.length ?? 0;
  const overHardLimit = config.countMode === "total" && charCount > config.maxChars;
  const overSweetSpot = config.sweetSpotMax != null && charCount > config.sweetSpotMax && !overHardLimit;
  const tweetStats = config.countMode === "per-tweet" && content ? getTweetStats(content) : null;

  return (
    <div className={`rounded-2xl overflow-hidden border ${config.borderColor} shadow-sm`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${config.textColor}`} viewBox="0 0 24 24" fill="currentColor">
            <path d={config.iconPath} />
          </svg>
          <span className={`font-semibold text-sm ${config.textColor}`}>{config.label}</span>
        </div>
        <span className={`text-xs ${config.textColor} opacity-75`}>{config.hint}</span>
      </div>

      {/* Body */}
      <div className="bg-white dark:bg-gray-900 p-4 min-h-[160px] relative">
        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/6" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 text-red-500">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {content && !loading && (
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        )}
      </div>

      {/* Footer */}
      {(content || error) && !loading && (
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <span className={`text-xs ${
            overHardLimit || tweetStats?.anyOver
              ? "text-red-500 font-medium"
              : overSweetSpot
              ? "text-amber-500"
              : "text-gray-400"
          }`}>
            {tweetStats ? (
              tweetStats.anyOver
                ? `longest tweet: ${tweetStats.longest} / 280 — trim it`
                : `${tweetStats.count} tweets · longest: ${tweetStats.longest} / 280`
            ) : charCount > 0 ? (
              <>
                {charCount.toLocaleString()} / {config.maxChars.toLocaleString()}
                {overSweetSpot && !overHardLimit && ` — sweet spot ≤${config.sweetSpotMax}`}
                {overHardLimit && " — over limit"}
              </>
            ) : null}
          </span>
          {content && (
            <button
              onClick={handleCopy}
              className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

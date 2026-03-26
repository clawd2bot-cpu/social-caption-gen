"use client";

import { useState, useCallback } from "react";
import PlatformCard from "@/components/PlatformCard";
import ApiKeyHeader from "@/components/ApiKeyHeader";
import type { Platform, StreamChunk } from "@/lib/types";

const PLATFORMS: Platform[] = ["instagram", "tiktok", "pinterest", "twitter"];

type CardState = {
  content?: string;
  error?: string;
  loading: boolean;
};

const INITIAL_STATE: Record<Platform, CardState> = {
  instagram: { loading: false },
  tiktok: { loading: false },
  pinterest: { loading: false },
  twitter: { loading: false },
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [cards, setCards] = useState<Record<Platform, CardState>>(INITIAL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleKeyChange = useCallback((key: string | null) => {
    setApiKey(key);
  }, []);

  const hasResults = PLATFORMS.some((p) => cards[p].content || cards[p].error);

  async function handleGenerate() {
    if (!title.trim() || !description.trim() || !audience.trim()) return;

    setBriefError(null);
    setIsGenerating(true);

    // Set all cards to loading
    setCards({
      instagram: { loading: true },
      tiktok: { loading: true },
      pinterest: { loading: true },
      twitter: { loading: true },
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ title, description, audience }),
      });

      if (!response.ok) {
        const text = await response.text();
        setBriefError(text || "Generation failed. Please try again.");
        setCards(INITIAL_STATE);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as StreamChunk;
            setCards((prev) => ({
              ...prev,
              [chunk.platform]: {
                loading: false,
                content: chunk.content,
                error: chunk.error,
              },
            }));
          } catch {
            // malformed line, skip
          }
        }
      }
    } catch (err) {
      setBriefError(
        err instanceof Error ? err.message : "Something went wrong. Is Ollama running?"
      );
      setCards(INITIAL_STATE);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Social Caption Generator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              One product → four platform-native captions, instantly.
            </p>
          </div>
          <ApiKeyHeader onKeyChange={handleKeyChange} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* No-key warning */}
        {!apiKey && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Load your free Groq API key (top right) to generate captions.{" "}
              <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Get one free at console.groq.com →
              </a>
            </p>
          </div>
        )}
        {/* Input form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            Your Product
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hydra Glow Face Serum"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does it do? What problem does it solve? What makes it special?"
                rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Women 25-40 with dry skin who want a natural skincare routine"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {briefError && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-600 dark:text-red-400">{briefError}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !title.trim() || !description.trim() || !audience.trim() || !apiKey}
            className="mt-5 w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900 text-white font-semibold py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating captions…
              </>
            ) : !apiKey ? (
              "Load API key to generate"
            ) : hasResults ? (
              "Regenerate"
            ) : (
              "Generate captions"
            )}
          </button>
        </div>

        {/* Platform cards */}
        {(isGenerating || hasResults) && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Your captions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLATFORMS.map((platform) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  content={cards[platform].content}
                  error={cards[platform].error}
                  loading={cards[platform].loading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          Powered by DeepSeek-V3 · Built by{" "}
          <a
            href="https://github.com/clawd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Clawd
          </a>
        </p>
      </div>
    </main>
  );
}

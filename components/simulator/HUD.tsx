"use client";

import { useState } from "react";
import type { GameState, GameStats } from "./Simulator";

const NUM_PER_TEAM = 5;

interface HUDProps {
  gameState: GameState;
  stats: GameStats;
  speed: number;
  setSpeed: (s: number) => void;
  autoEvolve: boolean;
  setAutoEvolve: (b: boolean) => void;
  onStart: () => void;
  onReset: () => void;
  onToggleScoreboard: () => void;
  apiKey: string | null;
  apiValid: boolean;
  onApiKeySubmit: (key: string) => void;
}

export default function HUD({
  gameState,
  stats,
  speed,
  setSpeed,
  autoEvolve,
  setAutoEvolve,
  onStart,
  onReset,
  onToggleScoreboard,
  apiKey,
  apiValid,
  onApiKeySubmit,
}: HUDProps) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const phaseLabel =
    gameState === "idle"
      ? "READY"
      : gameState === "hiding"
        ? "HIDING PHASE - Red finds cover"
        : gameState === "seeking"
          ? "SEEKING PHASE - Blue hunts"
          : "ROUND OVER - Evolving brains...";

  const phaseColor =
    gameState === "hiding"
      ? "text-red-400"
      : gameState === "seeking"
        ? "text-blue-400"
        : gameState === "round_over"
          ? "text-yellow-400"
          : "text-gray-300";

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-start justify-between px-4 py-3 gap-3">
          {/* Title + phase */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
            <h1 className="text-white font-bold text-lg tracking-tight">AI HIDE & SEEK</h1>
            <span className={`text-xs font-semibold uppercase tracking-wider ${phaseColor}`}>
              {phaseLabel}
            </span>
          </div>

          {/* Scoreboard */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,68,68,0.6)]" />
              <span className="text-red-400 font-bold text-xl tabular-nums">{stats.redScore}</span>
              <span className="text-gray-500 text-xs">HIDERS</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(68,153,255,0.6)]" />
              <span className="text-blue-400 font-bold text-xl tabular-nums">{stats.blueScore}</span>
              <span className="text-gray-500 text-xs">SEEKERS</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <button
              onClick={onToggleScoreboard}
              className="text-gray-400 hover:text-white text-xs underline"
            >
              History
            </button>
          </div>

          {/* API Key indicator */}
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`bg-black/60 backdrop-blur-md rounded-xl px-3 py-2 border text-xs font-medium flex items-center gap-2 ${
                apiValid
                  ? "border-green-500/30 text-green-400"
                  : apiKey
                    ? "border-yellow-500/30 text-yellow-400"
                    : "border-white/10 text-gray-400"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${apiValid ? "bg-green-400" : apiKey ? "bg-yellow-400" : "bg-gray-600"}`} />
              {apiValid ? "LLM Connected" : apiKey ? "Checking..." : "Add API Key"}
            </button>

            {showKeyInput && (
              <div className="mt-2 bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 w-72">
                <p className="text-gray-400 text-[11px] mb-2">
                  Groq API key for AI-powered insights. Free at console.groq.com
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="gsk_..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => {
                      onApiKeySubmit(keyInput);
                      setShowKeyInput(false);
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timer + round info */}
      {gameState !== "idle" && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-5 py-2 border border-white/10 flex items-center gap-4">
            <div className="text-center">
              <div className={`font-mono text-2xl font-bold tabular-nums ${stats.timeLeft <= 5 && gameState === "seeking" ? "text-red-400 animate-pulse" : "text-white"}`}>
                {stats.timeLeft}s
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider">Round</div>
              <div className="text-white font-bold">{stats.round}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider">Gen</div>
              <div className="text-white font-bold">{stats.generation}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-gray-400 text-[10px] uppercase tracking-wider">Alive</div>
              <div className={`font-bold ${stats.redAlive === 0 ? "text-gray-500" : "text-red-400"}`}>
                {stats.redAlive}/{NUM_PER_TEAM}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
          {gameState === "idle" && (
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-violet-500/25"
            >
              Start Simulation
            </button>
          )}

          {gameState === "round_over" && (
            <div className="text-yellow-400 text-xs font-medium animate-pulse px-3">
              Auto-restarting...
            </div>
          )}

          <button
            onClick={onReset}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs transition-all"
          >
            Reset All
          </button>

          <div className="w-px h-8 bg-white/20" />

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Speed</span>
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  speed === s
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Idle welcome */}
      {gameState === "idle" && stats.round === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
          <div className="text-center max-w-lg px-4">
            <h2 className="text-white/90 text-4xl font-bold mb-3 drop-shadow-lg">
              AI Hide & Seek
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-2">
              Watch neural network agents learn to play hide & seek.
              <span className="text-red-400 font-medium"> Red </span>hides,
              <span className="text-blue-400 font-medium"> Blue </span>seeks via line of sight.
            </p>
            <p className="text-white/40 text-xs">
              Agents discover they can push yellow blocks to block LOS. Brains evolve each round.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

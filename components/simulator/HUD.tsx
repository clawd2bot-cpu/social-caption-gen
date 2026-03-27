"use client";

import type { GameState, GameStats } from "./Simulator";

interface HUDProps {
  gameState: GameState;
  stats: GameStats;
  speed: number;
  setSpeed: (s: number) => void;
  autoEvolve: boolean;
  setAutoEvolve: (b: boolean) => void;
  onStart: () => void;
  onReset: () => void;
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
}: HUDProps) {
  const phaseLabel =
    gameState === "idle"
      ? "READY"
      : gameState === "hiding"
        ? "HIDING PHASE"
        : gameState === "seeking"
          ? "SEEKING PHASE"
          : "ROUND OVER";

  const phaseColor =
    gameState === "hiding"
      ? "text-blue-400"
      : gameState === "seeking"
        ? "text-red-400"
        : "text-gray-300";

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Title + phase */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
            <div className="flex items-center gap-3">
              <h1 className="text-white font-bold text-lg tracking-tight">
                AI HIDE & SEEK
              </h1>
              <span className={`text-xs font-semibold uppercase tracking-wider ${phaseColor}`}>
                {phaseLabel}
              </span>
            </div>
          </div>

          {/* Scoreboard */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-4">
            {/* Red score */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,68,68,0.6)]" />
              <span className="text-red-400 font-bold text-lg tabular-nums">{stats.redScore}</span>
              <span className="text-gray-500 text-xs">RED</span>
            </div>

            <div className="w-px h-6 bg-white/20" />

            {/* Blue score */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(68,153,255,0.6)]" />
              <span className="text-blue-400 font-bold text-lg tabular-nums">{stats.blueScore}</span>
              <span className="text-gray-500 text-xs">BLUE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer + round info */}
      {gameState !== "idle" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md rounded-xl px-5 py-2 border border-white/10 flex items-center gap-4">
            <div className="text-center">
              <div className="text-white font-mono text-2xl font-bold tabular-nums">
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
              <div className="text-gray-400 text-[10px] uppercase tracking-wider">Hiding</div>
              <div className="text-red-400 font-bold">{stats.redAlive}/{NUM_PER_TEAM}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10 flex items-center gap-3">
          {gameState === "idle" ? (
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-violet-500/25"
            >
              Start Simulation
            </button>
          ) : gameState === "round_over" && !autoEvolve ? (
            <>
              <button
                onClick={onStart}
                className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all"
              >
                Next Round
              </button>
              <button
                onClick={onReset}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                Reset
              </button>
            </>
          ) : null}

          <div className="w-px h-8 bg-white/20" />

          {/* Speed control */}
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

          <div className="w-px h-8 bg-white/20" />

          {/* Auto evolve toggle */}
          <button
            onClick={() => setAutoEvolve(!autoEvolve)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoEvolve
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                autoEvolve ? "bg-green-400 animate-pulse" : "bg-gray-600"
              }`}
            />
            Auto Evolve
          </button>
        </div>
      </div>

      {/* Info panel - bottom left */}
      <div className="absolute bottom-20 left-4 z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 max-w-[200px]">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">How it works</div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            <span className="text-red-400 font-medium">Red</span> hides,{" "}
            <span className="text-blue-400 font-medium">Blue</span> seeks.
            Each agent has a neural network brain that evolves via genetic algorithm after every round.
          </p>
        </div>
      </div>

      {/* Idle overlay */}
      {gameState === "idle" && stats.round === 0 && (
        <div className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h2 className="text-white/80 text-4xl font-bold mb-2 drop-shadow-lg">
              AI Hide & Seek
            </h2>
            <p className="text-white/50 text-sm max-w-md">
              Watch ML agents learn to hide and seek in a 3D arena.
              Red team hides, Blue team seeks. Brains evolve each round.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

const NUM_PER_TEAM = 5;

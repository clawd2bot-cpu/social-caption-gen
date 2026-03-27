"use client";

import type { GameStats, RoundRecord } from "./Simulator";

interface ScoreboardProps {
  history: RoundRecord[];
  stats: GameStats;
  onClose: () => void;
}

export default function Scoreboard({ history, stats, onClose }: ScoreboardProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-white/10 p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Scoreboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            Close
          </button>
        </div>

        {/* Total scores */}
        <div className="flex items-center justify-center gap-8 mb-5 py-3 bg-white/5 rounded-xl">
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-400 text-xs uppercase">Red (Hiders)</span>
            </div>
            <div className="text-red-400 text-3xl font-bold tabular-nums">{stats.redScore}</div>
          </div>
          <div className="text-gray-600 text-2xl font-light">vs</div>
          <div className="text-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-400 text-xs uppercase">Blue (Seekers)</span>
            </div>
            <div className="text-blue-400 text-3xl font-bold tabular-nums">{stats.blueScore}</div>
          </div>
        </div>

        <div className="text-gray-400 text-xs mb-1">
          Generation {stats.generation} | {history.length} rounds played
        </div>

        {/* Round history */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No rounds played yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="py-2 text-left">Round</th>
                  <th className="py-2 text-left">Gen</th>
                  <th className="py-2 text-center text-red-400">Survived</th>
                  <th className="py-2 text-center text-blue-400">Caught</th>
                  <th className="py-2 text-center">Blocks</th>
                  <th className="py-2 text-center">Avg Hide</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((r) => (
                  <tr key={r.round} className="border-b border-white/5 text-gray-300">
                    <td className="py-1.5 font-medium">R{r.round}</td>
                    <td className="py-1.5 text-gray-500">G{r.generation}</td>
                    <td className="py-1.5 text-center">
                      <span className={r.redSurvived >= 3 ? "text-red-400 font-bold" : ""}>
                        {r.redSurvived}/5
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className={r.blueCaught >= 3 ? "text-blue-400 font-bold" : ""}>
                        {r.blueCaught}/5
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className={r.blocksMoved > 2 ? "text-yellow-400 font-bold" : "text-gray-500"}>
                        {r.blocksMoved}
                      </span>
                    </td>
                    <td className="py-1.5 text-center text-gray-400">{r.avgHideTime.toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

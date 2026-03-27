"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { useState, useCallback, useRef, useEffect } from "react";
import Arena, { createObstacles } from "./Arena";
import AgentManager from "./AgentManager";
import HUD from "./HUD";
import Scoreboard from "./Scoreboard";
import InsightsPanel from "./InsightsPanel";
import type { ObstacleData } from "@/lib/ml-brain";

export type GameState = "idle" | "hiding" | "seeking" | "round_over";

export interface GameStats {
  round: number;
  redScore: number;
  blueScore: number;
  redAlive: number;
  blueAlive: number;
  timeLeft: number;
  generation: number;
}

export interface RoundRecord {
  round: number;
  generation: number;
  redSurvived: number;
  blueCaught: number;
  blocksMoved: number;
  losEliminations: number;
  avgHideTime: number;
}

const INITIAL_STATS: GameStats = {
  round: 0,
  redScore: 0,
  blueScore: 0,
  redAlive: 5,
  blueAlive: 5,
  timeLeft: 30,
  generation: 1,
};

export default function Simulator() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [speed, setSpeed] = useState(1);
  const [autoEvolve, setAutoEvolve] = useState(true); // auto by default
  const [roundHistory, setRoundHistory] = useState<RoundRecord[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiValid, setApiValid] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const obstaclesRef = useRef<ObstacleData[]>(createObstacles());
  const roundMetricsRef = useRef({ blocksMoved: 0, losEliminations: 0, eliminationTimes: [] as number[] });

  // Load API key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("groq_api_key");
    if (stored) {
      setApiKey(stored);
      pingApi(stored);
    }
  }, []);

  async function pingApi(key: string) {
    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      setApiValid(data.ok === true);
    } catch {
      setApiValid(false);
    }
  }

  function handleApiKeySubmit(key: string) {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem("groq_api_key", trimmed);
      setApiKey(trimmed);
      pingApi(trimmed);
    }
  }

  const startGame = useCallback(() => {
    obstaclesRef.current = createObstacles();
    roundMetricsRef.current = { blocksMoved: 0, losEliminations: 0, eliminationTimes: [] };
    setGameState("hiding");
    setStats((s) => ({
      ...s,
      round: s.round + 1,
      redAlive: 5,
      blueAlive: 5,
      timeLeft: 30,
    }));
  }, []);

  const resetGame = useCallback(() => {
    obstaclesRef.current = createObstacles();
    setGameState("idle");
    setStats(INITIAL_STATS);
    setRoundHistory([]);
    setInsights([]);
  }, []);

  // When round ends, record it and fetch insights
  const onRoundEnd = useCallback(
    (survived: number, caught: number) => {
      const metrics = roundMetricsRef.current;
      const avgHide =
        metrics.eliminationTimes.length > 0
          ? metrics.eliminationTimes.reduce((a, b) => a + b, 0) / metrics.eliminationTimes.length
          : 22; // full duration if none caught

      const record: RoundRecord = {
        round: stats.round + 1,
        generation: stats.generation,
        redSurvived: survived,
        blueCaught: caught,
        blocksMoved: metrics.blocksMoved,
        losEliminations: metrics.losEliminations,
        avgHideTime: avgHide,
      };

      setRoundHistory((prev) => [...prev, record]);

      // Fetch LLM insights if API key is valid
      if (apiKey && apiValid) {
        fetchInsights(record);
      } else {
        // Generate local fallback insights
        setInsights(generateLocalInsights(record));
      }

      // Auto-restart after delay
      setTimeout(() => startGame(), 2500);
    },
    [stats.round, stats.generation, apiKey, apiValid, startGame]
  );

  async function fetchInsights(record: RoundRecord) {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/simulator-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          roundData: {
            ...record,
            totalRed: 5,
            totalBlue: 5,
            redScore: stats.redScore + record.redSurvived,
            blueScore: stats.blueScore + record.blueCaught,
          },
        }),
      });
      const data = await res.json();
      if (data.ok && data.insights?.length > 0) {
        setInsights(data.insights);
      } else {
        setInsights(generateLocalInsights(record));
      }
    } catch {
      setInsights(generateLocalInsights(record));
    } finally {
      setInsightsLoading(false);
    }
  }

  function trackBlockMoved() {
    roundMetricsRef.current.blocksMoved++;
  }

  function trackElimination(timeInRound: number) {
    roundMetricsRef.current.losEliminations++;
    roundMetricsRef.current.eliminationTimes.push(timeInRound);
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-gray-100 to-gray-300 relative overflow-hidden">
      <Canvas shadows className="!absolute inset-0">
        <PerspectiveCamera makeDefault position={[18, 22, 18]} fov={50} />
        <OrbitControls
          maxPolarAngle={Math.PI / 2.2}
          minDistance={10}
          maxDistance={50}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.05}
        />

        <ambientLight intensity={0.7} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={60}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.001}
        />
        <directionalLight position={[-10, 15, -10]} intensity={0.3} color="#aaccff" />
        <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#ddddee" />

        <Sky sunPosition={[100, 80, 100]} turbidity={1} rayleigh={0.5} />
        <fog attach="fog" args={["#e8ecf0", 40, 80]} />

        <Arena obstacles={obstaclesRef.current} />

        <AgentManager
          gameState={gameState}
          setGameState={setGameState}
          stats={stats}
          setStats={setStats}
          speed={speed}
          autoEvolve={autoEvolve}
          startGame={startGame}
          obstacles={obstaclesRef.current}
          onRoundEnd={onRoundEnd}
          onBlockMoved={trackBlockMoved}
          onElimination={trackElimination}
        />
      </Canvas>

      {/* HUD */}
      <HUD
        gameState={gameState}
        stats={stats}
        speed={speed}
        setSpeed={setSpeed}
        autoEvolve={autoEvolve}
        setAutoEvolve={setAutoEvolve}
        onStart={startGame}
        onReset={resetGame}
        onToggleScoreboard={() => setShowScoreboard((v) => !v)}
        apiKey={apiKey}
        apiValid={apiValid}
        onApiKeySubmit={handleApiKeySubmit}
      />

      {/* Key Learning Points */}
      <InsightsPanel
        insights={insights}
        loading={insightsLoading}
        gameState={gameState}
        generation={stats.generation}
      />

      {/* Scoreboard overlay */}
      {showScoreboard && (
        <Scoreboard
          history={roundHistory}
          stats={stats}
          onClose={() => setShowScoreboard(false)}
        />
      )}
    </div>
  );
}

// Fallback insights when no LLM available
function generateLocalInsights(record: RoundRecord): string[] {
  const insights: string[] = [];
  const { round, redSurvived, blueCaught, blocksMoved, losEliminations, avgHideTime } = record;

  if (round <= 2) {
    insights.push("[LOS] Agents are discovering that direct line of sight leads to elimination");
    insights.push("[HIDING] Red agents move randomly - no hiding strategy yet");
    insights.push("[SEEKING] Blue agents wander without targeted search patterns");
    insights.push(
      blocksMoved > 0
        ? `[DISCOVERY] Agents accidentally pushed ${blocksMoved} block(s) - learning begins!`
        : "[DISCOVERY] Yellow obstacles are pushable - agents haven't realized this yet"
    );
  } else if (round <= 5) {
    insights.push(
      `[LOS] ${losEliminations} LOS eliminations this round - agents ${losEliminations > 3 ? "still struggling with" : "starting to understand"} visibility`
    );
    insights.push(
      `[HIDING] Red survived ${redSurvived}/5 - ${redSurvived >= 3 ? "finding better cover spots" : "still exposed too often"}`
    );
    insights.push(
      `[SEEKING] Blue caught ${blueCaught}/5 in avg ${avgHideTime.toFixed(1)}s - ${blueCaught >= 3 ? "efficient hunting" : "needs better search patterns"}`
    );
    insights.push(
      blocksMoved > 2
        ? `[DISCOVERY] ${blocksMoved} blocks pushed! Agents learning to reshape the arena`
        : "[DISCOVERY] Some agents nudging obstacles but not yet strategic about it"
    );
  } else {
    insights.push(
      `[LOS] Gen ${record.generation}: ${losEliminations > 2 ? "LOS awareness improving - agents dodge sightlines" : "Strong LOS evasion emerging"}`
    );
    insights.push(
      `[HIDING] Avg survival time: ${avgHideTime.toFixed(1)}s - ${avgHideTime > 15 ? "excellent concealment strategies!" : "cover-seeking behavior evolving"}`
    );
    insights.push(
      `[SEEKING] Blue efficiency: ${blueCaught}/5 caught - ${blueCaught >= 4 ? "devastating search tactics!" : "methodical area sweep developing"}`
    );
    insights.push(
      blocksMoved > 3
        ? `[EMERGENT] ${blocksMoved} blocks repositioned - agents actively engineering cover!`
        : `[EMERGENT] Block usage at ${blocksMoved} - strategic obstacle manipulation ${blocksMoved > 1 ? "growing" : "emerging"}`
    );
  }

  return insights;
}

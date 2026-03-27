"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { useState, useCallback, useRef } from "react";
import Arena, { createObstacles } from "./Arena";
import AgentManager from "./AgentManager";
import HUD from "./HUD";
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
  const [autoEvolve, setAutoEvolve] = useState(false);
  const obstaclesRef = useRef<ObstacleData[]>(createObstacles());

  const startGame = useCallback(() => {
    // Reset movable obstacles to original positions
    obstaclesRef.current = createObstacles();
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
  }, []);

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

        {/* Bright, clean lighting */}
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
        />
      </Canvas>

      <HUD
        gameState={gameState}
        stats={stats}
        speed={speed}
        setSpeed={setSpeed}
        autoEvolve={autoEvolve}
        setAutoEvolve={setAutoEvolve}
        onStart={startGame}
        onReset={resetGame}
      />
    </div>
  );
}

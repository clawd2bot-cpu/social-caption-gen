"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GameState, GameStats } from "./Simulator";
import { ARENA_SIZE } from "./Arena";
import {
  Brain,
  createBrain,
  think,
  computeInputs,
  mutateBrain,
  crossover,
  hasLineOfSight,
  Vec3,
  ObstacleData,
} from "@/lib/ml-brain";

interface Agent {
  id: number;
  team: "red" | "blue";
  position: Vec3;
  velocity: Vec3;
  brain: Brain;
  found: boolean;
  visibleToEnemy: boolean;
}

const NUM_PER_TEAM = 5;
const AGENT_SPEED = 4;
const LOS_ELIMINATE_TIME = 0.8;
const HIDE_PHASE_DURATION = 8;
const SEEK_PHASE_DURATION = 22;
const PUSH_RADIUS = 1.8;
const PUSH_FORCE = 3;

function clampToArena(v: Vec3): Vec3 {
  const half = ARENA_SIZE / 2 - 0.8;
  return {
    x: Math.max(-half, Math.min(half, v.x)),
    y: v.y,
    z: Math.max(-half, Math.min(half, v.z)),
  };
}

function checkObstacleCollision(pos: Vec3, obstacles: ObstacleData[]): Vec3 {
  const result = { ...pos };
  for (const obs of obstacles) {
    const halfX = obs.size.x / 2 + 0.45;
    const halfZ = obs.size.z / 2 + 0.45;
    if (
      result.x > obs.pos.x - halfX &&
      result.x < obs.pos.x + halfX &&
      result.z > obs.pos.z - halfZ &&
      result.z < obs.pos.z + halfZ
    ) {
      const dxL = result.x - (obs.pos.x - halfX);
      const dxR = obs.pos.x + halfX - result.x;
      const dzT = result.z - (obs.pos.z - halfZ);
      const dzB = obs.pos.z + halfZ - result.z;
      const min = Math.min(dxL, dxR, dzT, dzB);
      if (min === dxL) result.x = obs.pos.x - halfX;
      else if (min === dxR) result.x = obs.pos.x + halfX;
      else if (min === dzT) result.z = obs.pos.z - halfZ;
      else result.z = obs.pos.z + halfZ;
    }
  }
  return result;
}

function clampObstacleToArena(obs: ObstacleData): void {
  const halfX = ARENA_SIZE / 2 - obs.size.x / 2 - 0.5;
  const halfZ = ARENA_SIZE / 2 - obs.size.z / 2 - 0.5;
  obs.pos.x = Math.max(-halfX, Math.min(halfX, obs.pos.x));
  obs.pos.z = Math.max(-halfZ, Math.min(halfZ, obs.pos.z));
}

function createAgents(): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < NUM_PER_TEAM; i++) {
    agents.push({
      id: i,
      team: "red",
      position: { x: -10 + Math.random() * 3, y: 0, z: -4 + Math.random() * 8 },
      velocity: { x: 0, y: 0, z: 0 },
      brain: createBrain(),
      found: false,
      visibleToEnemy: false,
    });
    agents.push({
      id: i + NUM_PER_TEAM,
      team: "blue",
      position: { x: 8 + Math.random() * 3, y: 0, z: -4 + Math.random() * 8 },
      velocity: { x: 0, y: 0, z: 0 },
      brain: createBrain(),
      found: false,
      visibleToEnemy: false,
    });
  }
  return agents;
}

// --- Cute blob character ---
function BlobCharacter({ agent }: { agent: Agent }) {
  const groupRef = useRef<THREE.Group>(null);

  const isRed = agent.team === "red";
  const bodyColor = isRed ? "#ff4455" : "#44aaff";
  const headColor = isRed ? "#ff6677" : "#66bbff";
  const emissiveColor = isRed ? "#ff2233" : "#2288ff";
  const glowColor = isRed ? "#ff4444" : "#4499ff";

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.visible = !agent.found;
    if (!agent.found) {
      const bob = Math.sin(Date.now() * 0.005 + agent.id * 1.3) * 0.08;
      groupRef.current.position.set(agent.position.x, bob, agent.position.z);
      if (Math.abs(agent.velocity.x) > 0.01 || Math.abs(agent.velocity.z) > 0.01) {
        groupRef.current.rotation.y = Math.atan2(agent.velocity.x, agent.velocity.z);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.35, 0.4, 8, 16]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={emissiveColor}
          emissiveIntensity={agent.visibleToEnemy ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color={headColor} emissive={emissiveColor} emissiveIntensity={0.35} roughness={0.25} metalness={0.1} />
      </mesh>
      <mesh position={[-0.12, 1.25, 0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.12, 1.25, 0.28]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.14, 0.3]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.08, 0.02, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <pointLight color={glowColor} intensity={0.8} distance={4} position={[0, 1.8, 0]} />
      <mesh castShadow position={[-0.4, 0.6, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.4, 0.6, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
        <meshStandardMaterial color={bodyColor} emissive={emissiveColor} emissiveIntensity={0.2} roughness={0.3} />
      </mesh>

      {/* LOS warning ring */}
      {agent.visibleToEnemy && agent.team === "red" && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 16]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Elimination burst effect
function EliminationEffect({ position }: { position: Vec3 }) {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > 1.5) {
      groupRef.current.visible = false;
      return;
    }
    // Expanding ring
    const scale = 1 + elapsed * 5;
    groupRef.current.scale.set(scale, scale, scale);
    groupRef.current.children.forEach((c) => {
      if ((c as THREE.Mesh).material) {
        ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = Math.max(0, 1 - elapsed / 1.5);
      }
    });
  });

  return (
    <group ref={groupRef} position={[position.x, 0.5, position.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 20]} />
        <meshStandardMaterial color="#ffaa00" transparent opacity={1} emissive="#ffaa00" emissiveIntensity={3} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.25, 20]} />
        <meshStandardMaterial color="#ff4444" transparent opacity={1} emissive="#ff4444" emissiveIntensity={3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// LOS beam
function LOSBeam({ from, to }: { from: Vec3; to: Vec3 }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const mx = (from.x + to.x) / 2;
    const mz = (from.z + to.z) / 2;
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.z - from.z) ** 2);
    const angle = Math.atan2(to.x - from.x, to.z - from.z);
    ref.current.position.set(mx, 0.3, mz);
    ref.current.rotation.y = angle;
    ref.current.scale.set(1, 1, dist);
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.06, 0.06, 1]} />
      <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={3} transparent opacity={0.5} />
    </mesh>
  );
}

interface AgentManagerProps {
  gameState: GameState;
  setGameState: (s: GameState) => void;
  stats: GameStats;
  setStats: (fn: (s: GameStats) => GameStats) => void;
  speed: number;
  autoEvolve: boolean;
  startGame: () => void;
  obstacles: ObstacleData[];
  onRoundEnd: (survived: number, caught: number) => void;
  onBlockMoved: () => void;
  onElimination: (timeInRound: number) => void;
}

export default function AgentManager({
  gameState,
  setGameState,
  stats,
  setStats,
  speed,
  autoEvolve,
  startGame,
  obstacles,
  onRoundEnd,
  onBlockMoved,
  onElimination,
}: AgentManagerProps) {
  const agentsRef = useRef<Agent[]>(createAgents());
  const phaseTimerRef = useRef(0);
  const justTransitioned = useRef(false);
  const eliminationEffects = useRef<Vec3[]>([]);
  const losTimers = useRef<Map<string, number>>(new Map());
  const losBeams = useRef<{ from: Vec3; to: Vec3 }[]>([]);
  const roundEndedRef = useRef(false);
  const blockPushCooldown = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (gameState === "hiding") {
      const agents = agentsRef.current;
      for (const a of agents) {
        a.found = false;
        a.visibleToEnemy = false;
        if (a.team === "red") {
          a.position = { x: -10 + Math.random() * 3, y: 0, z: -4 + Math.random() * 8 };
        } else {
          a.position = { x: 10, y: 0, z: -4 + Math.random() * 8 };
        }
        a.velocity = { x: 0, y: 0, z: 0 };
      }
      phaseTimerRef.current = 0;
      justTransitioned.current = false;
      roundEndedRef.current = false;
      eliminationEffects.current = [];
      losTimers.current.clear();
      losBeams.current = [];
      blockPushCooldown.current.clear();
    }
  }, [gameState]);

  const evolve = useCallback(() => {
    const agents = agentsRef.current;
    const reds = agents.filter((a) => a.team === "red");
    const blues = agents.filter((a) => a.team === "blue");

    const evolveTeam = (team: Agent[]) => {
      team.sort((a, b) => b.brain.fitness - a.brain.fitness);
      const best = team[0].brain;
      const second = team.length > 1 ? team[1].brain : best;
      for (let i = 1; i < team.length; i++) {
        const child = crossover(best, second);
        team[i].brain = mutateBrain(child, 0.1 + i * 0.03);
      }
    };

    evolveTeam(reds);
    evolveTeam(blues);
  }, []);

  useFrame((_, delta) => {
    if (gameState !== "hiding" && gameState !== "seeking") return;

    const dt = delta * speed;
    phaseTimerRef.current += dt;

    const agents = agentsRef.current;
    const reds = agents.filter((a) => a.team === "red");
    const blues = agents.filter((a) => a.team === "blue");
    const redAlive = reds.filter((a) => !a.found);
    const redPositions = redAlive.map((a) => a.position);
    const bluePositions = blues.map((a) => a.position);

    // Phase: hiding -> seeking
    if (gameState === "hiding" && phaseTimerRef.current >= HIDE_PHASE_DURATION) {
      if (!justTransitioned.current) {
        justTransitioned.current = true;
        phaseTimerRef.current = 0;
        setGameState("seeking");
        setStats((s) => ({ ...s, timeLeft: SEEK_PHASE_DURATION }));
      }
      return;
    }

    // Phase: seeking -> round_over (auto-restart)
    if (gameState === "seeking") {
      const remaining = Math.max(0, SEEK_PHASE_DURATION - phaseTimerRef.current);
      setStats((s) => ({ ...s, timeLeft: Math.ceil(remaining) }));

      // End when time runs out OR all red eliminated
      if ((remaining <= 0 || redPositions.length === 0) && !roundEndedRef.current) {
        roundEndedRef.current = true;
        const survived = redAlive.length;
        const caught = NUM_PER_TEAM - survived;

        for (const r of reds) r.brain.fitness = r.found ? 0 : 10;
        for (const b of blues) b.brain.fitness = caught * 2;

        setStats((s) => ({
          ...s,
          redScore: s.redScore + survived,
          blueScore: s.blueScore + caught,
          redAlive: survived,
        }));
        setGameState("round_over");
        evolve();
        setStats((s) => ({ ...s, generation: s.generation + 1 }));

        // Notify parent - triggers auto-restart + insights
        onRoundEnd(survived, caught);
        return;
      }
    }

    if (gameState === "hiding") {
      setStats((s) => ({
        ...s,
        timeLeft: Math.ceil(HIDE_PHASE_DURATION - phaseTimerRef.current + SEEK_PHASE_DURATION),
      }));
    }

    // Move agents
    for (const agent of agents) {
      if (agent.found) continue;

      const isRed = agent.team === "red";
      const enemies = isRed ? bluePositions : redPositions;
      const allies = isRed ? redPositions : bluePositions;

      if (gameState === "hiding" && !isRed) continue;

      const inLOS = agent.visibleToEnemy;
      const inputs = computeInputs(agent.position, enemies, allies, obstacles, ARENA_SIZE, inLOS);
      const outputs = think(agent.brain, inputs);

      const dx = outputs[0] * AGENT_SPEED * dt;
      const dz = outputs[1] * AGENT_SPEED * dt;
      const sprintFactor = 1 + Math.abs(outputs[2]) * 0.5;
      const pushStrength = outputs[2];

      agent.velocity = { x: dx, y: 0, z: dz };

      const newPos = clampToArena(
        checkObstacleCollision(
          {
            x: agent.position.x + dx * sprintFactor,
            y: 0,
            z: agent.position.z + dz * sprintFactor,
          },
          obstacles
        )
      );
      agent.position = newPos;

      // Push movable obstacles
      if (Math.abs(pushStrength) > 0.3) {
        for (const obs of obstacles) {
          if (!obs.movable) continue;
          const distToObs = Math.sqrt(
            (agent.position.x - obs.pos.x) ** 2 + (agent.position.z - obs.pos.z) ** 2
          );
          const threshold = PUSH_RADIUS + Math.max(obs.size.x, obs.size.z) / 2;
          if (distToObs < threshold) {
            const pushDx = obs.pos.x - agent.position.x;
            const pushDz = obs.pos.z - agent.position.z;
            const pushDist = Math.sqrt(pushDx * pushDx + pushDz * pushDz) || 1;
            const prevX = obs.pos.x;
            const prevZ = obs.pos.z;
            obs.pos.x += (pushDx / pushDist) * PUSH_FORCE * dt * Math.abs(pushStrength);
            obs.pos.z += (pushDz / pushDist) * PUSH_FORCE * dt * Math.abs(pushStrength);
            clampObstacleToArena(obs);

            // Track block movements
            const moved = Math.sqrt((obs.pos.x - prevX) ** 2 + (obs.pos.z - prevZ) ** 2);
            const lastPush = blockPushCooldown.current.get(agent.id) ?? 0;
            if (moved > 0.05 && phaseTimerRef.current - lastPush > 1) {
              blockPushCooldown.current.set(agent.id, phaseTimerRef.current);
              onBlockMoved();
            }
          }
        }
      }
    }

    // LOS checks (seeking only)
    const newBeams: { from: Vec3; to: Vec3 }[] = [];
    if (gameState === "seeking") {
      for (const red of reds) {
        if (red.found) continue;
        let seen = false;

        for (const blue of blues) {
          const canSee = hasLineOfSight(blue.position, red.position, obstacles, 15);
          if (canSee) {
            seen = true;
            newBeams.push({ from: { ...blue.position }, to: { ...red.position } });

            const key = `${blue.id}-${red.id}`;
            const current = losTimers.current.get(key) ?? 0;
            const newTime = current + dt;
            losTimers.current.set(key, newTime);

            if (newTime >= LOS_ELIMINATE_TIME) {
              red.found = true;
              eliminationEffects.current = [...eliminationEffects.current, { ...red.position }];
              setStats((s) => ({ ...s, redAlive: s.redAlive - 1 }));
              losTimers.current.delete(key);
              onElimination(phaseTimerRef.current);
            }
          } else {
            const key = `${blue.id}-${red.id}`;
            const current = losTimers.current.get(key) ?? 0;
            if (current > 0) {
              losTimers.current.set(key, Math.max(0, current - dt * 0.5));
            }
          }
        }
        red.visibleToEnemy = seen;
      }
    }
    losBeams.current = newBeams;
  });

  return (
    <group>
      {agentsRef.current.map((agent) => (
        <BlobCharacter key={agent.id} agent={agent} />
      ))}
      {eliminationEffects.current.map((pos, i) => (
        <EliminationEffect key={`elim-${i}`} position={pos} />
      ))}
      {losBeams.current.map((beam, i) => (
        <LOSBeam key={`los-${i}`} from={beam.from} to={beam.to} />
      ))}
    </group>
  );
}

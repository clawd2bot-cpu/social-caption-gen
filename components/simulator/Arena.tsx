"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObstacleData, Vec3 } from "@/lib/ml-brain";

const ARENA_SIZE = 24;
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.3;

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#d4d8dc" roughness={0.5} />
    </mesh>
  );
}

// Movable obstacle with smooth interpolation
function MovableObstacle({ obstacle, color }: { obstacle: ObstacleData; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth lerp to target position
      meshRef.current.position.x += (obstacle.pos.x - meshRef.current.position.x) * 0.15;
      meshRef.current.position.z += (obstacle.pos.z - meshRef.current.position.z) * 0.15;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[obstacle.pos.x, obstacle.pos.y, obstacle.pos.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={0.05}
      />
    </mesh>
  );
}

function StaticObstacle({ obstacle, color }: { obstacle: ObstacleData; color: string }) {
  return (
    <mesh
      position={[obstacle.pos.x, obstacle.pos.y, obstacle.pos.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  );
}

// Obstacle definitions - movable ones are yellow
export function createObstacles(): ObstacleData[] {
  return [
    // Central tall block (static, gray)
    { pos: { x: 0, y: 1.5, z: 0 }, size: { x: 3, y: 3, z: 3 }, movable: false },
    // Gray walls (static)
    { pos: { x: -4, y: 1.25, z: 3 }, size: { x: 0.3, y: 2.5, z: 6 }, movable: false },
    { pos: { x: 4, y: 1.25, z: -3 }, size: { x: 6, y: 2.5, z: 0.3 }, movable: false },
    { pos: { x: 2, y: 0.75, z: 8 }, size: { x: 3, y: 1.5, z: 0.3 }, movable: false },
    { pos: { x: -3, y: 0.75, z: -6 }, size: { x: 0.3, y: 1.5, z: 3 }, movable: false },
    // MOVABLE yellow blocks - agents can push these!
    { pos: { x: -7, y: 1, z: -7 }, size: { x: 2.5, y: 2, z: 2 }, movable: true },
    { pos: { x: 7, y: 1, z: 7 }, size: { x: 2, y: 2, z: 2.5 }, movable: true },
    { pos: { x: -7, y: 0.75, z: 7 }, size: { x: 2, y: 1.5, z: 2 }, movable: true },
    { pos: { x: 7, y: 0.75, z: -7 }, size: { x: 2, y: 1.5, z: 2 }, movable: true },
    { pos: { x: 5, y: 0.75, z: 3 }, size: { x: 1.5, y: 1.5, z: 1.5 }, movable: true },
    { pos: { x: -5, y: 0.75, z: -3 }, size: { x: 1.5, y: 1.5, z: 1.5 }, movable: true },
  ];
}

interface ArenaProps {
  obstacles: ObstacleData[];
}

export default function Arena({ obstacles }: ArenaProps) {
  const half = ARENA_SIZE / 2;

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
        <meshStandardMaterial color="#eef0f2" roughness={0.85} />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[ARENA_SIZE, 24, "#d8dce0", "#e2e5e8"]} position={[0, 0.01, 0]} />

      {/* Boundary walls */}
      <Wall position={[0, WALL_HEIGHT / 2, -half]} size={[ARENA_SIZE + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[0, WALL_HEIGHT / 2, half]} size={[ARENA_SIZE + WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[-half, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE]} />
      <Wall position={[half, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE]} />

      {/* Obstacles */}
      {obstacles.map((obs, i) =>
        obs.movable ? (
          <MovableObstacle key={i} obstacle={obs} color="#e8a030" />
        ) : (
          <StaticObstacle key={i} obstacle={obs} color={i === 0 ? "#a0a8b0" : "#c0c8d0"} />
        )
      )}
    </group>
  );
}

export { ARENA_SIZE };

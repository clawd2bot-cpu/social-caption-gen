/**
 * Simple neural-network-inspired ML brain for agents.
 * Each agent has a small weight matrix that maps sensory inputs to movement decisions.
 * Weights evolve over rounds via a genetic-algorithm-style mutation.
 */

export type Vec3 = { x: number; y: number; z: number };

// Simple 2-layer neural net: inputs -> hidden -> outputs
export interface Brain {
  weightsIH: number[][]; // input -> hidden
  weightsHO: number[][]; // hidden -> output
  bias: number[];
  fitness: number;
}

const INPUT_SIZE = 12;
// Inputs: nearestEnemyDist, nearestEnemyAngle, wall N/S/E/W, nearestAllyDist,
//         nearestObstacleDist, nearestObstacleAngle, inLineOfSight, noise
const HIDDEN_SIZE = 8;
const OUTPUT_SIZE = 3; // dx, dz, push force (towards nearest movable obstacle)

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => rand(-1, 1))
  );
}

export function createBrain(): Brain {
  return {
    weightsIH: createMatrix(INPUT_SIZE, HIDDEN_SIZE),
    weightsHO: createMatrix(HIDDEN_SIZE, OUTPUT_SIZE),
    bias: Array.from({ length: HIDDEN_SIZE }, () => rand(-0.5, 0.5)),
    fitness: 0,
  };
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
}

export function think(brain: Brain, inputs: number[]): number[] {
  // Forward pass: input -> hidden (sigmoid)
  const hidden = brain.bias.map((b, j) => {
    let sum = b;
    for (let i = 0; i < inputs.length && i < INPUT_SIZE; i++) {
      sum += (inputs[i] ?? 0) * (brain.weightsIH[i]?.[j] ?? 0);
    }
    return sigmoid(sum);
  });

  // Hidden -> output (tanh for directional output)
  const output: number[] = [];
  for (let o = 0; o < OUTPUT_SIZE; o++) {
    let sum = 0;
    for (let h = 0; h < HIDDEN_SIZE; h++) {
      sum += hidden[h] * (brain.weightsHO[h]?.[o] ?? 0);
    }
    output.push(Math.tanh(sum));
  }

  return output;
}

export function mutateBrain(brain: Brain, rate = 0.15): Brain {
  const mutateMatrix = (m: number[][]) =>
    m.map((row) =>
      row.map((v) => (Math.random() < rate ? v + rand(-0.5, 0.5) : v))
    );

  return {
    weightsIH: mutateMatrix(brain.weightsIH),
    weightsHO: mutateMatrix(brain.weightsHO),
    bias: brain.bias.map((b) => (Math.random() < rate ? b + rand(-0.3, 0.3) : b)),
    fitness: 0,
  };
}

export function crossover(a: Brain, b: Brain): Brain {
  const crossMatrix = (ma: number[][], mb: number[][]) =>
    ma.map((row, i) =>
      row.map((v, j) => (Math.random() < 0.5 ? v : mb[i]?.[j] ?? v))
    );

  return {
    weightsIH: crossMatrix(a.weightsIH, b.weightsIH),
    weightsHO: crossMatrix(a.weightsHO, b.weightsHO),
    bias: a.bias.map((v, i) => (Math.random() < 0.5 ? v : b.bias[i] ?? v)),
    fitness: 0,
  };
}

export interface ObstacleData {
  pos: Vec3;
  size: Vec3;
  movable: boolean;
}

// Compute sensory inputs for an agent
export function computeInputs(
  agent: Vec3,
  enemies: Vec3[],
  allies: Vec3[],
  obstacles: ObstacleData[],
  arenaSize: number,
  inLineOfSight: boolean
): number[] {
  const dist = (a: Vec3, b: Vec3) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
  const angle = (a: Vec3, b: Vec3) => Math.atan2(b.z - a.z, b.x - a.x) / Math.PI;

  // Nearest enemy
  let nearestEnemyDist = arenaSize * 2;
  let nearestEnemyAngle = 0;
  for (const e of enemies) {
    const d = dist(agent, e);
    if (d < nearestEnemyDist) {
      nearestEnemyDist = d;
      nearestEnemyAngle = angle(agent, e);
    }
  }

  // Nearest ally
  let nearestAllyDist = arenaSize * 2;
  for (const a of allies) {
    const d = dist(agent, a);
    if (d > 0.1 && d < nearestAllyDist) {
      nearestAllyDist = d;
    }
  }

  // Nearest movable obstacle
  let nearestObsDist = arenaSize * 2;
  let nearestObsAngle = 0;
  for (const obs of obstacles) {
    if (!obs.movable) continue;
    const obsPos = obs.pos;
    const d = dist(agent, obsPos);
    if (d < nearestObsDist) {
      nearestObsDist = d;
      nearestObsAngle = angle(agent, obsPos);
    }
  }

  // Wall distances (4 directions)
  const half = arenaSize / 2;
  const wallN = half - agent.z;
  const wallS = half + agent.z;
  const wallE = half - agent.x;
  const wallW = half + agent.x;

  return [
    nearestEnemyDist / arenaSize,
    nearestEnemyAngle,
    wallN / arenaSize,
    wallS / arenaSize,
    wallE / arenaSize,
    wallW / arenaSize,
    nearestAllyDist / arenaSize,
    nearestObsDist / arenaSize,
    nearestObsAngle,
    inLineOfSight ? 1 : 0,
    Math.random() * 0.2, // noise for exploration
    0, // padding
  ];
}

// Check line of sight between two points, blocked by obstacles
export function hasLineOfSight(
  from: Vec3,
  to: Vec3,
  obstacles: ObstacleData[],
  maxDist = 100
): boolean {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist > maxDist) return false;
  if (dist < 0.01) return true;

  const steps = Math.ceil(dist / 0.3);
  const stepX = dx / steps;
  const stepZ = dz / steps;

  for (let i = 1; i < steps; i++) {
    const px = from.x + stepX * i;
    const pz = from.z + stepZ * i;

    for (const obs of obstacles) {
      const halfX = obs.size.x / 2;
      const halfZ = obs.size.z / 2;
      if (
        px > obs.pos.x - halfX &&
        px < obs.pos.x + halfX &&
        pz > obs.pos.z - halfZ &&
        pz < obs.pos.z + halfZ
      ) {
        return false; // Blocked
      }
    }
  }

  return true;
}

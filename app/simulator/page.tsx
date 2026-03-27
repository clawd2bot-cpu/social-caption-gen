"use client";

import dynamic from "next/dynamic";

const Simulator = dynamic(() => import("@/components/simulator/Simulator"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Loading 3D Simulator...</div>
    </div>
  ),
});

export default function SimulatorPage() {
  return <Simulator />;
}

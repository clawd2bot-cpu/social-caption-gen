import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Hide & Seek - 3D ML Simulator",
  description:
    "Watch ML-powered agents learn to play hide and seek in a 3D arena. Red team hides, Blue team seeks. Neural network brains evolve via genetic algorithm.",
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

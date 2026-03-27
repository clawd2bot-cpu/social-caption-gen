import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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

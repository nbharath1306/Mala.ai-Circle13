"use client";

import MalaScene from "@/components/MalaScene";
import Dashboard from "@/components/Dashboard";
import CircleLogo from "@/components/CircleLogo";
import { useChantEngine } from "@/hooks/useChantEngine";

export default function Home() {
  const {
    count,
    round,
    lifetimeChants,
    mode,
    isListening,
    increment,
    toggleMode
  } = useChantEngine();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-deep-black text-foreground selection:bg-neon-gold/30">

      {/* 3D Scene Layer */}
      <MalaScene count={count} round={round} />

      {/* UI Overlay Layer */}
      <Dashboard
        count={count}
        round={round}
        lifetimeChants={lifetimeChants}
        mode={mode}
        isListening={isListening}
        onToggleMode={toggleMode}
        onIncrement={increment}
      />

      {/* Brand Layer */}
      <CircleLogo />

    </main>
  );
}

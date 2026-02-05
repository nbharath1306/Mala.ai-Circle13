"use client";

import Link from "next/link";
import { Flame, ArrowRight, Activity, Disc } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getStats, UserStats } from "@/lib/storage";

export default function Home() {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--foreground)] rounded-full blur-[128px]" />
      </div>

      {/* Header / Nav */}
      <header className="w-full flex justify-between items-center z-10 opacity-70">
        <div className="text-xl font-bold tracking-widest uppercase">Mala.ai</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <Flame size={18} className="text-[var(--accent)]" />
            <span className="text-xs font-mono">{stats?.streak || 0}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-md space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-light tracking-tighter">
            Silence <br /> <span className="text-[var(--accent)] font-serif italic">the mind.</span>
          </h1>
          <p className="text-sm opacity-60 max-w-xs mx-auto">
            Your digital sanctuary for effortless, focused  Japa meditation.
          </p>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/mala" className="group relative flex items-center justify-center w-20 h-20 rounded-full border border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300">
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-center mt-4 text-xs font-mono opacity-40 uppercase tracking-widest">Begin Sadhana</p>
        </motion.div>
      </div>

      {/* Footer Stats Preview */}
      <div className="w-full grid grid-cols-2 gap-4 z-10 max-w-md opacity-60">
        <div className="p-4 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)]/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase">Total Rounds</span>
          </div>
          <div className="text-2xl font-light">{stats?.totalRounds || 0} <span className="text-xs opacity-50">Rounds</span></div>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)]/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Disc size={16} />
            <span className="text-xs font-bold uppercase">Lifetime</span>
          </div>
          <div className="text-2xl font-light">{stats?.totalBeads || 0} <span className="text-xs opacity-50">Beads</span></div>
        </div>
      </div>
    </main>
  );
}

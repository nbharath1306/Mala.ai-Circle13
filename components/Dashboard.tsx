"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Settings, Volume2 } from 'lucide-react';
import { ChantMode } from '@/hooks/useChantEngine';

interface DashboardProps {
    count: number;
    round: number;
    lifetimeChants: number;
    mode: ChantMode;
    isListening: boolean;
    onToggleMode: () => void;
    onIncrement: () => void; // For tap mode
}

const Dashboard: React.FC<DashboardProps> = ({
    count,
    round,
    lifetimeChants,
    mode,
    isListening,
    onToggleMode,
    onIncrement
}) => {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 sm:p-10">

            {/* Top Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-start pointer-events-auto"
            >
                <div className="flex flex-col">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Lifetime Chants</span>
                    <span className="text-xl font-bold text-glow text-neon-gold font-mono">{lifetimeChants.toLocaleString()}</span>
                </div>

                <button className="p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                </button>
            </motion.div>

            {/* Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <motion.div
                    key={count}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-2xl"
                >
                    {count}
                </motion.div>
                <span className="mt-2 text-sm font-mono text-gray-400 tracking-widest uppercase">
                    / 108 • Round {round + 1}
                </span>
            </div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-auto flex flex-col items-center gap-6"
            >
                {/* Interaction Area / Button */}
                <button
                    onClick={onIncrement}
                    className="w-24 h-24 rounded-full border border-neon-gold/30 bg-black/40 backdrop-blur-sm flex items-center justify-center
                     active:scale-95 transition-transform hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] group"
                    aria-label="Chant"
                >
                    <div className="w-20 h-20 rounded-full bg-neon-gold/10 group-hover:bg-neon-gold/20 transition-colors" />
                </button>

                <p className="text-xs text-gray-500 uppercase tracking-widest opacity-60">Tap or Speak</p>

                {/* Mode Toggle */}
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                    <button
                        onClick={onToggleMode}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${mode === 'voice' ? 'text-neon-gold' : 'text-gray-400'}`}
                    >
                        {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                        <span>Voice Mode</span>
                    </button>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <Volume2 className="w-4 h-4" />
                        <span>Haptics On</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;

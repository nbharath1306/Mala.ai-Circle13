'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';

interface StatsHUDProps {
    currentRound: number;
    currentCount: number;
    isSyncing?: boolean;
}

interface SessionStats {
    totalRounds: number;
    streak: number;
    todayRounds: number;
}

export default function StatsHUD({ currentRound, currentCount, isSyncing }: StatsHUDProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [stats, setStats] = useState<SessionStats>({
        totalRounds: 0,
        streak: 0,
        todayRounds: 0,
    });
    const lastTapTime = React.useRef(0);
    const hideTimeout = React.useRef<NodeJS.Timeout | null>(null);

    // Load stats from database
    useEffect(() => {
        const loadStats = async () => {
            const sessions = await db.sessions.toArray();
            const today = new Date().toISOString().split('T')[0];

            const totalRounds = sessions.reduce((acc, s) => acc + s.rounds_completed, 0);
            const todayRounds = sessions
                .filter(s => s.date.startsWith(today))
                .reduce((acc, s) => acc + s.rounds_completed, 0);

            // Calculate streak (consecutive days with at least 1 round)
            const dates = [...new Set(sessions.map(s => s.date.split('T')[0]))].sort().reverse();
            let streak = 0;
            const now = new Date();

            for (let i = 0; i < dates.length; i++) {
                const expectedDate = new Date(now);
                expectedDate.setDate(now.getDate() - i);
                const expectedStr = expectedDate.toISOString().split('T')[0];

                if (dates.includes(expectedStr)) {
                    streak++;
                } else {
                    break;
                }
            }

            setStats({ totalRounds: totalRounds + currentRound, streak, todayRounds: todayRounds + currentRound });
        };

        loadStats();
    }, [currentRound]);

    // Double-tap detection
    const handleTap = useCallback(() => {
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
            // Double tap detected
            setIsVisible(true);

            // Auto-hide after 3 seconds
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            hideTimeout.current = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        }
        lastTapTime.current = now;
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
        };
    }, []);

    return (
        <>
            {/* Invisible tap area */}
            <div
                className="absolute inset-0 z-30"
                style={{ pointerEvents: 'none' }}
                onTouchStart={(e) => {
                    // Only detect taps on the "void" areas, not on interactive elements
                    if ((e.target as HTMLElement).closest('[data-interactive]')) return;
                    e.currentTarget.style.pointerEvents = 'auto';
                }}
                onTouchEnd={handleTap}
                onClick={handleTap}
            />

            {/* Stats Overlay */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className="absolute inset-0 z-40 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsVisible(false)}
                        />

                        {/* Stats Card */}
                        <motion.div
                            className="relative z-10 p-8 rounded-2xl"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Title */}
                            <div className="text-center mb-6">
                                <span className="text-[10px] text-amber-500/60 font-mono tracking-[0.3em]">
                                    SESSION TELEMETRY
                                </span>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-8">
                                {/* Streak */}
                                <div className="text-center">
                                    <div className="text-3xl font-mono font-bold text-amber-400 tabular-nums">
                                        {stats.streak}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1">
                                        Day Streak
                                    </div>
                                </div>

                                {/* Today */}
                                <div className="text-center border-x border-white/5 px-6">
                                    <div className="text-3xl font-mono font-bold text-zinc-100 tabular-nums">
                                        {stats.todayRounds}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1">
                                        Today
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="text-center">
                                    <div className="text-3xl font-mono font-bold text-zinc-400 tabular-nums">
                                        {stats.totalRounds}
                                    </div>
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1">
                                        Total
                                    </div>
                                </div>
                            </div>

                            {/* Current Progress */}
                            <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                <span className="text-zinc-600 text-xs">Current: </span>
                                <span className="text-amber-500 font-mono">{currentCount}</span>
                                <span className="text-zinc-600 text-xs"> / 108</span>
                            </div>

                            {/* Sync Status */}
                            {isSyncing && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[10px] text-amber-500/80 font-mono">SYNCING</span>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

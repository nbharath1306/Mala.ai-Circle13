'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { useGitHubSync } from '@/hooks/useGitHubSync';
import { useAudio } from '@/hooks/useAudio';
import { useDeviceMotion } from '@/hooks/useDeviceMotion';
import { useHapticPattern } from '@/hooks/useHapticPattern';
import StardustParticles from './StardustParticles';
import GlassmorphismOrb from './GlassmorphismOrb';
import MagneticBead from './MagneticBead';
import StatsHUD from './StatsHUD';
import SettingsModal from './SettingsModal';

export default function LiquidStardustCounter() {
    const [count, setCount] = useState(0);
    const [round, setRound] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [showRoundFlash, setShowRoundFlash] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const { startAmbient, playClick, playBell } = useAudio();
    const { tiltX, tiltY, hasPermission, requestPermission } = useDeviceMotion();
    const { roundComplete: hapticRoundComplete } = useHapticPattern();
    const hasStartedAudio = useRef(false);

    const [pat, setPat] = useState<string | null>(null);
    const { sync, isSyncing } = useGitHubSync(pat, 'nbharath1306', 'Mala.ai-Circle13');

    useEffect(() => {
        const storedPat = localStorage.getItem('mala_github_pat');
        if (storedPat) setPat(storedPat);
    }, [showSettings]);

    // Request device motion permission on first interaction
    const handleFirstInteraction = useCallback(() => {
        if (!hasStartedAudio.current) {
            startAmbient();
            hasStartedAudio.current = true;
        }
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission, requestPermission, startAmbient]);

    const handleCount = useCallback(async () => {
        handleFirstInteraction();

        const newCount = count + 1;

        if (newCount >= 108) {
            // Round complete!
            setCount(0);
            setRound(r => r + 1);
            playBell();
            hapticRoundComplete();
            setShowRoundFlash(true);
            setIsPulsing(true);

            // Save to database
            await db.sessions.add({
                date: new Date().toISOString(),
                rounds_completed: 1,
                beads_counted: 108,
                duration_seconds: 0
            });
            sync();

            // Reset effects
            setTimeout(() => {
                setShowRoundFlash(false);
                setIsPulsing(false);
            }, 800);
        } else {
            setCount(newCount);
            // Brief pulse on count
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 100);
        }
    }, [count, handleFirstInteraction, hapticRoundComplete, playBell, sync]);

    const handleRoundComplete = useCallback(() => {
        // Additional round complete handling if needed
    }, []);

    const progress = count / 108;

    return (
        <div className="h-screen w-full bg-black overflow-hidden relative">

            {/* OLED Black Background */}
            <div className="absolute inset-0 bg-black" />

            {/* Stardust Particles */}
            <StardustParticles tiltX={tiltX} tiltY={tiltY} />

            {/* Round Complete Flash */}
            <AnimatePresence>
                {showRoundFlash && (
                    <motion.div
                        className="absolute inset-0 z-50 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                    >
                        <div
                            className="w-full h-full"
                            style={{
                                background: 'radial-gradient(circle at center, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center Orb */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <GlassmorphismOrb
                    progress={progress}
                    tiltX={tiltX}
                    tiltY={tiltY}
                    isPulsing={isPulsing}
                />
            </div>

            {/* Magnetic Bead Interaction Layer */}
            <MagneticBead
                onCount={handleCount}
                onRoundComplete={handleRoundComplete}
                playClick={playClick}
            />

            {/* Stats HUD (double-tap to reveal) */}
            <StatsHUD
                currentRound={round}
                currentCount={count}
                isSyncing={isSyncing}
            />

            {/* Minimal Settings Trigger */}
            <button
                data-interactive
                onClick={() => setShowSettings(true)}
                className="absolute top-6 left-6 z-50 w-10 h-10 rounded-full glass flex items-center justify-center hover:border-amber-500/30 transition-all"
            >
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>

            {/* Round Counter (minimal, top right) */}
            <div className="absolute top-6 right-6 z-50 text-right">
                <motion.div
                    key={round}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-mono font-bold text-amber-400 tabular-nums"
                >
                    {round.toString().padStart(2, '0')}
                </motion.div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-wider">Rounds</div>
            </div>

            {/* Sync indicator */}
            <AnimatePresence>
                {isSyncing && (
                    <motion.div
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] text-amber-500/80 font-mono">SYNCING</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </div>
    );
}

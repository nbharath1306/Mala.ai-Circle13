'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useHapticPattern } from '@/hooks/useHapticPattern';

interface MagneticBeadProps {
    onCount: () => void;
    onRoundComplete: () => void;
    playClick: () => void;
}

interface Shockwave {
    id: number;
    x: number;
    y: number;
}

export default function MagneticBead({ onCount, onRoundComplete, playClick }: MagneticBeadProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
    const shockwaveId = useRef(0);
    const lastHapticTime = useRef(0);

    const { tension, snap } = useHapticPattern();

    // Bead position
    const y = useMotionValue(0);
    const x = useMotionValue(0);

    // Spring-smoothed position for heavy feel
    const springY = useSpring(y, { stiffness: 200, damping: 25, mass: 1.5 });

    // Thread stretch effect
    const threadStretch = useTransform(springY, [0, 150], [0, 80]);
    const threadOpacity = useTransform(springY, [0, 50, 150], [0.3, 0.6, 0.9]);

    // Bead glow intensity
    const beadGlow = useTransform(springY, [0, 150], [0, 1]);

    const SNAP_THRESHOLD = 120;

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleDrag = useCallback((_: unknown, info: { point: { y: number }; offset: { y: number } }) => {
        const dragDistance = Math.max(0, info.offset.y);
        y.set(dragDistance);

        // Progressive haptic feedback (throttled)
        const now = Date.now();
        if (now - lastHapticTime.current > 50) {
            const intensity = Math.min(1, dragDistance / 150);
            if (intensity > 0.1) {
                tension(intensity);
            }
            lastHapticTime.current = now;
        }
    }, [y, tension]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        const currentY = y.get();

        if (currentY >= SNAP_THRESHOLD) {
            // Trigger count!
            snap();
            playClick();

            // Spawn shockwave at bead position
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const centerX = rect.width / 2;
                const shockY = currentY + 100; // Approximate bead position

                const newWave: Shockwave = {
                    id: shockwaveId.current++,
                    x: centerX,
                    y: shockY,
                };
                setShockwaves(prev => [...prev, newWave]);

                // Remove after animation
                setTimeout(() => {
                    setShockwaves(prev => prev.filter(w => w.id !== newWave.id));
                }, 600);
            }

            onCount();
        }

        // Reset position
        y.set(0);
        x.set(0);
    }, [y, x, snap, playClick, onCount]);

    const removeShockwave = useCallback((id: number) => {
        setShockwaves(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 flex flex-col items-center justify-center touch-none select-none"
            style={{ zIndex: 20 }}
        >
            {/* Vertical Thread */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
            >
                <defs>
                    <linearGradient id="threadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(251,191,36,0.1)" />
                        <stop offset="50%" stopColor="rgba(251,191,36,0.6)" />
                        <stop offset="100%" stopColor="rgba(251,191,36,0.1)" />
                    </linearGradient>
                    <filter id="threadGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main thread line */}
                <motion.line
                    x1="50%"
                    y1="30%"
                    x2="50%"
                    y2="70%"
                    stroke="url(#threadGradient)"
                    strokeWidth="2"
                    filter="url(#threadGlow)"
                    style={{ opacity: threadOpacity }}
                />

                {/* Elastic stretch indicator */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.line
                            x1="50%"
                            y1="50%"
                            x2="50%"
                            y2="50%"
                            stroke="rgba(251,191,36,0.8)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            filter="url(#threadGlow)"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                y2: springY
                            }}
                            exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>
            </svg>

            {/* Draggable Bead */}
            <motion.div
                className="relative cursor-grab active:cursor-grabbing"
                drag="y"
                dragConstraints={{ top: 0, bottom: 200 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{
                    y: springY,
                    zIndex: 10,
                }}
            >
                {/* Bead */}
                <motion.div
                    className="w-20 h-20 rounded-full relative"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, 
                            rgba(251,191,36,0.9) 0%, 
                            rgba(217,119,6,0.8) 50%, 
                            rgba(180,83,9,0.9) 100%)`,
                        boxShadow: `
                            inset 2px 2px 8px rgba(255,255,255,0.3),
                            inset -2px -2px 8px rgba(0,0,0,0.3),
                            0 4px 20px rgba(251,191,36,0.4)
                        `,
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Inner shine */}
                    <div
                        className="absolute top-2 left-3 w-6 h-4 rounded-full"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
                            filter: 'blur(2px)',
                        }}
                    />

                    {/* Dynamic glow based on drag distance */}
                    <motion.div
                        className="absolute inset-[-10px] rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
                            opacity: beadGlow,
                            filter: 'blur(10px)',
                        }}
                    />
                </motion.div>

                {/* Pull instruction */}
                <AnimatePresence>
                    {!isDragging && (
                        <motion.div
                            className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 0.4, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <span className="text-[10px] text-amber-500/60 font-mono tracking-widest">
                                PULL ↓
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Shockwaves */}
            <AnimatePresence>
                {shockwaves.map((wave) => (
                    <motion.div
                        key={wave.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: wave.x,
                            top: wave.y,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        onAnimationComplete={() => removeShockwave(wave.id)}
                    >
                        <div
                            className="w-20 h-20 rounded-full"
                            style={{
                                border: '2px solid rgba(251,191,36,0.8)',
                                boxShadow: '0 0 20px rgba(251,191,36,0.5)',
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

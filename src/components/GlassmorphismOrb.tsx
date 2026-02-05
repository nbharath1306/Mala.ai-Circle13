'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { getImage } from '@/lib/db';

interface GlassmorphismOrbProps {
    progress: number; // 0 to 1
    tiltX?: number;
    tiltY?: number;
    isPulsing?: boolean;
    children?: React.ReactNode;
}

export default function GlassmorphismOrb({
    progress,
    tiltX = 0,
    tiltY = 0,
    isPulsing = false,
    children
}: GlassmorphismOrbProps) {
    const [deityImage, setDeityImage] = useState<string | null>(null);
    const orbRef = useRef<HTMLDivElement>(null);

    // Spring-smoothed tilt values
    const smoothTiltX = useSpring(useMotionValue(tiltX), { stiffness: 100, damping: 20 });
    const smoothTiltY = useSpring(useMotionValue(tiltY), { stiffness: 100, damping: 20 });

    // Transform tilt to rotation
    const rotateY = useTransform(smoothTiltX, [-1, 1], [-15, 15]);
    const rotateX = useTransform(smoothTiltY, [-1, 1], [15, -15]);

    // Update spring targets
    useEffect(() => {
        smoothTiltX.set(tiltX);
        smoothTiltY.set(tiltY);
    }, [tiltX, tiltY, smoothTiltX, smoothTiltY]);

    // Load deity image
    useEffect(() => {
        getImage().then(r => r?.blob && setDeityImage(URL.createObjectURL(r.blob)));
    }, []);

    // Progress ring calculation
    const circumference = 2 * Math.PI * 140; // radius 140
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <motion.div
            ref={orbRef}
            className="relative"
            style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                perspective: '1000px',
            }}
        >
            {/* Outer Glow */}
            <motion.div
                className="absolute inset-[-30px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                }}
                animate={{
                    opacity: isPulsing ? [0.3, 0.6, 0.3] : 0.2,
                    scale: isPulsing ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    duration: 0.8,
                    repeat: isPulsing ? Infinity : 0,
                }}
            />

            {/* Progress Ring */}
            <svg
                className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)]"
                viewBox="0 0 300 300"
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Background track */}
                <circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="2"
                />
                {/* Progress fill */}
                <motion.circle
                    cx="150"
                    cy="150"
                    r="140"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))',
                    }}
                />
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Crystal Orb */}
            <div
                className="relative w-64 h-64 rounded-full overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: `
                        inset 0 2px 20px rgba(255,255,255,0.1),
                        inset 0 -2px 20px rgba(0,0,0,0.3),
                        0 8px 40px rgba(0,0,0,0.4)
                    `,
                }}
            >
                {/* Inner glass reflection */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    }}
                />

                {/* Deity Image */}
                {deityImage && (
                    <div className="absolute inset-4 rounded-full overflow-hidden">
                        <img
                            src={deityImage}
                            alt="Deity"
                            className="w-full h-full object-cover"
                            style={{
                                filter: 'brightness(0.9) contrast(1.1)',
                            }}
                        />
                        {/* Soft vignette over deity */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)',
                            }}
                        />
                    </div>
                )}

                {/* Children (e.g., count display) */}
                {children && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        {children}
                    </div>
                )}
            </div>

            {/* Bottom reflection/shadow */}
            <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full"
                style={{
                    background: 'radial-gradient(ellipse, rgba(251,191,36,0.1) 0%, transparent 70%)',
                    filter: 'blur(10px)',
                }}
            />
        </motion.div>
    );
}

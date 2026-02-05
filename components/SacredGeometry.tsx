"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SacredGeometryProps {
    count: number;
}

const SacredGeometry: React.FC<SacredGeometryProps> = ({ count }) => {
    // Reveal progress: 0 to 1
    const progress = Math.min(count / 108, 1);
    const opacity = 0.05 + (progress * 0.15); // Subtle start, gets clearer
    const rotation = count * 2; // Rotate based on count

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden mix-blend-overlay">
            <motion.div
                className="w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] opacity-10"
                animate={{ rotate: rotation, scale: 1 + (progress * 0.2) }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                style={{ opacity }}
            >
                {/* Simplified Sri Yantra Representation (Triangles) */}
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-neon-gold fill-none" strokeWidth="0.2">
                    <circle cx="50" cy="50" r="48" />
                    <circle cx="50" cy="50" r="40" />
                    {/* Downward Triangles (Shakti) */}
                    <path d="M10,20 L90,20 L50,90 Z" />
                    <path d="M20,30 L80,30 L50,85 Z" />
                    <path d="M30,40 L70,40 L50,80 Z" />
                    <path d="M15,25 L85,25 L50,75 Z" />

                    {/* Upward Triangles (Shiva) */}
                    <path d="M10,80 L90,80 L50,10 Z" />
                    <path d="M20,70 L80,70 L50,15 Z" />
                    <path d="M30,60 L70,60 L50,20 Z" />
                    <path d="M35,65 L65,65 L50,30 Z" />

                    {/* Center Bindu */}
                    <circle cx="50" cy="50" r="1" fill="currentColor" className="animate-pulse" />
                </svg>
            </motion.div>
        </div>
    );
};

export default SacredGeometry;

"use client";

import React from 'react';
import { motion } from 'framer-motion';

const CircleLogo = () => {
    return (
        <motion.div
            className="fixed bottom-6 left-6 z-20 pointer-events-none mix-blend-screen"
            animate={{
                opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-neon-gold opacity-50" />
                    <div className="absolute inset-1 rounded-full border border-neon-gold opacity-30" />
                    <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                </div>
                <span className="font-mono font-bold text-xs tracking-[0.2em] text-neon-gold opacity-80">
                    CIRCLE13
                </span>
            </div>
        </motion.div>
    );
};

export default CircleLogo;

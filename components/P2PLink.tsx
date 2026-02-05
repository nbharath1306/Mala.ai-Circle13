"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';
import { useMantraEngine } from '@/hooks/useMantraEngine';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_PARTICLES = 10;

interface PulseParticle {
    id: number;
    x: number;
    y: number;
}

const P2PLink = () => {
    const [sparks, setSparks] = useState<PulseParticle[]>([]);
    const { count } = useMantraEngine();
    const lastCount = useRef(count);
    const peerRef = useRef<Peer | null>(null);

    // Mock Global Activity for "Alive" feel
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                addSpark();
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Broadcast my chant
    useEffect(() => {
        if (count > lastCount.current) {
            addSpark(true);
            lastCount.current = count;
        }
    }, [count]);

    const addSpark = (isSelf = false) => {
        const id = Date.now() + Math.random();
        const x = Math.random() * 100; // %
        const y = Math.random() * 100; // %

        setSparks(prev => [...prev.slice(-MAX_PARTICLES), { id, x, y }]);

        // Remove after animation
        setTimeout(() => {
            setSparks(prev => prev.filter(p => p.id !== id));
        }, 2000);
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            <AnimatePresence>
                {sparks.map(spark => (
                    <motion.div
                        key={spark.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute w-2 h-2 rounded-full bg-neon-gold blur-[2px] shadow-[0_0_10px_#FFD700]"
                        style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
                    >
                        <div className="absolute inset-0 animate-ping bg-neon-gold rounded-full opacity-50"></div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default P2PLink;

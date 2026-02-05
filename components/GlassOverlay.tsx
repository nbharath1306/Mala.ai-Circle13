"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, Waves } from 'lucide-react';

interface GlassOverlayProps {
    count: number;
    round: number;
    isListening: boolean;
    onToggleListen: () => void;
}

const MagneticButton = ({ children, onClick, active }: { children: React.ReactNode, onClick: () => void, active?: boolean }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);
        setPosition({ x: x * 0.2, y: y * 0.2 });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`p-4 rounded-full backdrop-blur-xl border transition-all duration-300 ${active
                    ? 'bg-neon-gold/20 border-neon-gold/50 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
        >
            {children}
        </motion.button>
    );
};

const GlassOverlay: React.FC<GlassOverlayProps> = ({ count, round, isListening, onToggleListen }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-50">
            {/* Top Bar: Global Pulse & Stats */}
            <header className="flex justify-between items-start pointer-events-auto">
                <div className="flex items-center gap-2">
                    {/* Pulsing Orb */}
                    <div className="relative w-3 h-3">
                        <div className="absolute inset-0 bg-neon-gold rounded-full animate-ping opacity-75"></div>
                        <div className="relative w-3 h-3 bg-neon-gold rounded-full shadow-[0_0_10px_#FFD700]"></div>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-mono">
                        Global Field Active
                    </span>
                </div>

                <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.1em] text-white/40 mb-1">Round</div>
                    <div className="font-mono text-neon-gold text-xl">{round}</div>
                </div>
            </header>

            {/* Center: Morphing Count */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={count}
                        initial={{ opacity: 0, y: 20, scale: 0.8, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, scale: 1.2, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3, ease: 'backOut' }}
                        className="text-[8rem] font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        style={{ fontFamily: '"Outfit", sans-serif' }} // Assuming variable font available or fallback
                    >
                        {count}
                    </motion.div>
                </AnimatePresence>
                <div className="text-sm uppercase tracking-[0.3em] text-neon-gold/50 mt-4">Mantra Count</div>
            </div>

            {/* Bottom Controls */}
            <footer className="flex justify-center items-center gap-6 pointer-events-auto mb-8">
                <MagneticButton onClick={() => { }}>
                    <Settings size={20} className="text-white/60" />
                </MagneticButton>

                <MagneticButton onClick={onToggleListen} active={isListening}>
                    {isListening ? (
                        <Waves size={24} className="text-neon-gold animate-pulse" />
                    ) : (
                        <Mic size={24} className="text-white" />
                    )}
                </MagneticButton>
            </footer>

            {/* Vignette & Grain Overlay (CSS Only) */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/noise.png')] mix-blend-overlay"></div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/80"></div>
        </div>
    );
};

export default GlassOverlay;

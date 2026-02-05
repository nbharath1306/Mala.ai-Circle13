'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        // Sequence
        const t1 = setTimeout(() => setStage(1), 1000); // Reveal "M A L A"
        const t2 = setTimeout(() => setStage(2), 2500); // Reveal "ETHER EDITION"
        const t3 = setTimeout(() => {
            setStage(3); // Fade out
            setTimeout(onComplete, 1000);
        }, 4000);

        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none"
            initial={{ opacity: 1 }}
            animate={stage === 3 ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="text-center">
                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.5em" }}
                    animate={stage >= 1 ? { opacity: 1, scale: 1, letterSpacing: "1em" } : {}}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="text-4xl text-amber-500 font-cinzel font-bold tracking-[1em] mb-4 text-glow"
                >
                    MALA
                </motion.h1>

                {/* Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 1 }}
                    className="text-amber-500/40 text-xs font-outfit tracking-[0.6em] uppercase flex items-center justify-center space-x-4"
                >
                    <span className="w-8 h-[1px] bg-amber-500/30"></span>
                    <span>Ether Edition</span>
                    <span className="w-8 h-[1px] bg-amber-500/30"></span>
                </motion.div>

                {/* Loading Bar */}
                <div className="mt-12 w-64 h-1 bg-amber-900/20 mx-auto rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="h-full bg-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    />
                </div>
            </div>
        </motion.div>
    );
}

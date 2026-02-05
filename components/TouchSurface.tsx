import React, { useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';

interface TouchSurfaceProps {
    onIncrement: () => void;
}

const TouchSurface: React.FC<TouchSurfaceProps> = ({ onIncrement }) => {
    const controls = useAnimation();
    const beadRef = useRef<HTMLDivElement>(null);
    const dragThreshold = 50; // Distance to trigger count

    // Variable haptic pattern for dragging sensation
    const triggerDragHaptics = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // [5ms on, 10ms wait, 5ms on] - rapid tick-tock feel
            navigator.vibrate([5, 10, 5]);
        }
    };

    const handleDrag = (_: any, info: PanInfo) => {
        // Check Y axis drag
        // If we pass a certain threshold, trigger haptics to simulate "resistance" or "ridges"
        // This is hard to do continuously perfectly on web but we can try intervals.

        // Only simple trigger on drag end or specific points?
        // User requested: "triggers as the bead slides past the center point"

        // We can use info.offset.y
    };

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const isDragDown = info.offset.y > dragThreshold;
        const isDragUp = info.offset.y < -dragThreshold;

        if (isDragDown || isDragUp) {
            // Trigger the main action
            triggerDragHaptics();
            onIncrement();

            // Animate bead "snapping" to next position or looping
            // We simulate a loop by resetting instantly after animation
            await controls.start({ y: isDragDown ? 200 : -200, opacity: 0, transition: { duration: 0.1 } });
            controls.set({ y: 0, opacity: 1 });
        } else {
            // Reset if not dragged enough
            controls.start({ y: 0 });
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            {/* The Interactive Bead Area */}
            {/* We make a large hit area but visually it's the bead */}
            <motion.div
                className="relative w-full h-full pointer-events-auto flex items-center justify-center"
                style={{ touchAction: 'none' }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Invisible Drag Track cues/guides could go here */}
                </div>

                <motion.div
                    ref={beadRef}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2} // Feeling of resistance
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    className="w-32 h-32 rounded-full cursor-grab active:cursor-grabbing backdrop-blur-sm flex items-center justify-center group"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.2), rgba(0, 0, 0, 0))',
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.1), inset 0 0 20px rgba(255,255,255,0.05)'
                    }}
                >
                    {/* Visual Bead Representation - aligned with 3D or abstract */}
                    <div className="w-24 h-24 rounded-full border border-neon-gold/30 bg-black/40 shadow-[inset_0_0_15px_rgba(255,215,0,0.1)] group-active:scale-95 transition-transform duration-100" />
                </motion.div>

                <div className="absolute bottom-24 text-xs font-mono text-gray-600 uppercase tracking-[0.2em] pointer-events-none opacity-50">
                    Slide Bead
                </div>
            </motion.div>
        </div>
    );
};

export default TouchSurface;

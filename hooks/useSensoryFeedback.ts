"use client";

import { useRef, useCallback } from 'react';

export const useSensoryFeedback = () => {
    const lastTriggerPos = useRef(0);

    /**
     * Call this on every frame with current absolute position (e.g. rotation or scroll Y)
     * and current velocity.
     */
    const updateTexture = useCallback((position: number, velocity: number) => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        const velAbs = Math.abs(velocity);

        // Threshold for movement
        if (velAbs < 0.01) return;

        // Industrial Dial Density: Defined "Ticks"
        const tickSpacing = 0.2; // Radians. A distinct click every ~11 degrees.

        if (Math.abs(position - lastTriggerPos.current) > tickSpacing) {

            // Heavy Industrial Feedback
            // High velocity: Rapid machine-gun fire, but crisp
            // Low velocity: Heavy, deliberate clunk

            if (velAbs > 1.0) {
                navigator.vibrate(5); // Crisp tick
            } else {
                navigator.vibrate(12); // Slightly heavier clunk for precision
            }
            lastTriggerPos.current = position;
        }
    }, []);

    const triggerMilestone = useCallback((type: 'completion') => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        if (type === 'completion') {
            // The "Hydraulic Press" thud
            navigator.vibrate([80, 50, 80]); // Deep double thud
        }
    }, []);

    return { updateTexture, triggerMilestone };
};

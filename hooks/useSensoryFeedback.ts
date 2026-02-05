"use client";

import { useRef, useCallback } from 'react';
import { triggerHapticFeedback } from '@/lib/haptics';

export const useSensoryFeedback = () => {
    const lastTriggerPos = useRef(0);

    /**
     * Call this on every frame with current absolute position (e.g. rotation or scroll Y)
     * and current velocity.
     */
    const updateTexture = useCallback((position: number, velocity: number) => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        const velAbs = Math.abs(velocity);
        if (velAbs < 0.01) return; // No movement, no feel

        // Determine spacing based on velocity (simulating texture density)
        // Low velocity: frequent small ticks (rough wood)
        // High velocity: infrequent clicks (gears)

        const tickSpacing = velAbs > 2.0 ? 0.5 : 0.1; // Radians or units

        if (Math.abs(position - lastTriggerPos.current) > tickSpacing) {
            // Trigger Haptic
            if (velAbs > 2.0) {
                // Fast / clicky
                navigator.vibrate(5);
            } else {
                // Slow / rough
                navigator.vibrate(2);
            }
            lastTriggerPos.current = position;
        }
    }, []);

    const triggerMilestone = useCallback((type: 'completion') => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        if (type === 'completion') {
            // Massive Heartbeat
            navigator.vibrate([50, 100, 50, 100, 50]);
        }
    }, []);

    return { updateTexture, triggerMilestone };
};

'use client';

import { useCallback } from 'react';

interface HapticPatterns {
    tension: (intensity: number) => void;  // 0 to 1
    snap: () => void;
    roundComplete: () => void;
}

export function useHapticPattern(): HapticPatterns {
    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }, []);

    const tension = useCallback((intensity: number) => {
        // Soft vibration that increases with intensity (0-1)
        // Map intensity to vibration duration (8-25ms)
        const duration = Math.round(8 + intensity * 17);
        vibrate(duration);
    }, [vibrate]);

    const snap = useCallback(() => {
        // Sharp, crisp thud - short powerful pulse
        vibrate([20]);
    }, [vibrate]);

    const roundComplete = useCallback(() => {
        // Wave pattern: bzz-BZZ-bzz
        // Pattern: [vibrate, pause, vibrate, pause, vibrate]
        vibrate([50, 30, 100, 30, 50]);
    }, [vibrate]);

    return { tension, snap, roundComplete };
}

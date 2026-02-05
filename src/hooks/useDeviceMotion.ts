'use client';

import { useState, useEffect, useCallback } from 'react';

interface DeviceMotion {
    tiltX: number; // Left/Right tilt (-1 to 1)
    tiltY: number; // Forward/Back tilt (-1 to 1)
    hasPermission: boolean;
    requestPermission: () => Promise<void>;
}

export function useDeviceMotion(): DeviceMotion {
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
    const [hasPermission, setHasPermission] = useState(false);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // gamma: left-to-right tilt (-90 to 90)
        // beta: front-to-back tilt (-180 to 180)
        const gamma = event.gamma ?? 0;
        const beta = event.beta ?? 0;

        // Normalize to -1 to 1 range
        setTiltX(Math.max(-1, Math.min(1, gamma / 45)));
        setTiltY(Math.max(-1, Math.min(1, (beta - 45) / 45))); // Offset for typical phone holding angle
    }, []);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        // Fallback: use mouse position for desktop
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        setTiltX(x);
        setTiltY(y);
    }, []);

    const requestPermission = useCallback(async () => {
        // iOS 13+ requires explicit permission request
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const permission = await (DeviceOrientationEvent as any).requestPermission();
                if (permission === 'granted') {
                    setHasPermission(true);
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } catch {
                console.warn('Device orientation permission denied');
            }
        }
    }, [handleOrientation]);

    useEffect(() => {
        // Check if device orientation is available
        if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
            // Check if permission is needed (iOS 13+)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
                // Android or older iOS - no permission needed
                setHasPermission(true);
                window.addEventListener('deviceorientation', handleOrientation);
            }
        } else {
            // Fallback to mouse for desktop
            window.addEventListener('mousemove', handleMouseMove);
            setHasPermission(true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleOrientation, handleMouseMove]);

    return { tiltX, tiltY, hasPermission, requestPermission };
}

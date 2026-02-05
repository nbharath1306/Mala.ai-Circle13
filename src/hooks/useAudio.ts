'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

export function useAudio() {
    const ambientRef = useRef<Howl | null>(null);
    const clickRef = useRef<Howl | null>(null);
    const bellRef = useRef<Howl | null>(null);

    useEffect(() => {
        // Initialize Audio
        // Note: We need actual files for this to work perfectly, 
        // but we set up the architecture now.

        // 1. Ambient Drone (432Hz Om or detailed texture)
        ambientRef.current = new Howl({
            src: ['/ambient_drone.mp3'], // Placeholder
            loop: true,
            volume: 0.0, // Start silent, fade in
            html5: true,
        });

        // 2. Click (Wood bead snap)
        clickRef.current = new Howl({
            src: ['/wood_click.mp3'],
            volume: 0.6,
        });

        // 3. Bell (Tibetan Bowl)
        bellRef.current = new Howl({
            src: ['/tibetan_bell.mp3'],
            volume: 0.8,
        });

        return () => {
            ambientRef.current?.unload();
            clickRef.current?.unload();
            bellRef.current?.unload();
        };
    }, []);

    const startAmbient = useCallback(() => {
        if (ambientRef.current && !ambientRef.current.playing()) {
            ambientRef.current.play();
            ambientRef.current.fade(0, 0.4, 5000); // 5s fade in
        }
    }, []);

    const playClick = useCallback(() => {
        // Slight pitch variation for realism
        const rate = 0.95 + Math.random() * 0.1;
        clickRef.current?.rate(rate);
        clickRef.current?.play();
    }, []);

    const playBell = useCallback(() => {
        bellRef.current?.play();
    }, []);

    return { startAmbient, playClick, playBell };
}

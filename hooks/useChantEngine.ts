"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerHapticFeedback, triggerMalaCompletion } from '@/lib/haptics';

// Type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export type ChantMode = 'tap' | 'voice';

export const useChantEngine = () => {
    const [count, setCount] = useState(0);
    const [round, setRound] = useState(0);
    const [lifetimeChants, setLifetimeChants] = useState(0);
    const [mode, setMode] = useState<ChantMode>('tap');
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<any>(null);

    // Load persistence
    useEffect(() => {
        const savedCount = localStorage.getItem('nitya_count');
        const savedRound = localStorage.getItem('nitya_round');
        const savedLifetime = localStorage.getItem('nitya_lifetime');

        if (savedCount) setCount(parseInt(savedCount));
        if (savedRound) setRound(parseInt(savedRound));
        if (savedLifetime) setLifetimeChants(parseInt(savedLifetime));
    }, []);

    // Update persistence
    useEffect(() => {
        localStorage.setItem('nitya_count', count.toString());
        localStorage.setItem('nitya_round', round.toString());
        localStorage.setItem('nitya_lifetime', lifetimeChants.toString());
    }, [count, round, lifetimeChants]);

    const increment = useCallback(() => {
        setCount(prev => {
            const newCount = prev + 1;

            // Haptic feedback
            if (newCount % 108 === 0) {
                triggerMalaCompletion();
                setRound(r => r + 1);
                return 0; // Reset count after 108
            } else {
                triggerHapticFeedback('soft');
                return newCount;
            }
        });

        setLifetimeChants(prev => prev + 1);
    }, []);

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;

        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const Recognition = SpeechRecognition || webkitSpeechRecognition;

        if (!Recognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default to English for broader keyword matching

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log("Heard:", transcript);

            // Simple keyword matching - expand this list as needed
            const keywords = ['rama', 'krishna', 'om', 'shiva', 'chant', 'hare', 'ram'];

            if (keywords.some(k => transcript.includes(k))) {
                increment();
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
        };

        recognition.onend = () => {
            // Auto-restart if still listening mode is active
            if (isListening) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [increment, isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const toggleMode = useCallback(() => {
        setMode(prev => {
            const newMode = prev === 'tap' ? 'voice' : 'tap';
            if (newMode === 'voice') {
                startListening();
            } else {
                stopListening();
            }
            return newMode;
        });
    }, [startListening, stopListening]);

    return {
        count,
        round,
        lifetimeChants,
        mode,
        isListening,
        increment,
        toggleMode,
        reset: () => {
            setCount(0);
            setRound(0); // Optional: keep/reset rounds
        }
    };
};

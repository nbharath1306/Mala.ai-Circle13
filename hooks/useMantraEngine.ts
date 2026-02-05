"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '@/lib/db';
import { validateChant, cleanBufferAfterMatch } from '@/lib/mantra-logic';
import { triggerHapticFeedback, triggerMalaCompletion } from '@/lib/haptics';
import { SpatialAudio } from '@/lib/SpatialAudio';

// Type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export const useMantraEngine = () => {
    // Persisted State (Lazy Init from localStorage for speed, Dexie for logs)
    const [count, setCount] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('nitya_count') || '0');
        return 0;
    });
    const [round, setRound] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('nitya_round') || '0');
        return 0;
    });

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const transcriptBuffer = useRef("");

    // --- Persistence Sync ---
    useEffect(() => {
        localStorage.setItem('nitya_count', count.toString());
        localStorage.setItem('nitya_round', round.toString());
    }, [count, round]);

    // --- Core Increment Logic ---
    const increment = useCallback((source: 'voice' | 'touch' | 'keyboard') => {
        const now = Date.now();

        // 1. Update UI & LocalStorage
        setCount(prev => {
            const newCount = prev + 1;

            // Audio/Haptic Hooks
            if (newCount % 108 === 0) {
                triggerMalaCompletion();
                SpatialAudio.playBell('deep');
                setRound(r => r + 1);

                // Save Milestone to Dexie
                db.milestones.add({
                    date: new Date().toISOString().split('T')[0],
                    total_count: newCount
                });

                return 0;
            } else if (newCount % 27 === 0) {
                SpatialAudio.playBell('medium');
                triggerHapticFeedback('medium');
                return newCount;
            } else {
                triggerHapticFeedback('soft');
                return newCount;
            }
        });

        // 2. Log Session to Dexie (Fire & Forget)
        db.sessions.add({
            timestamp: now,
            count: 1,
            duration: 0, // Individual chant duration hard to track precisely without start/end events per chant
            type: source
        });

    }, []);

    // --- Voice Engine (Regex Stream) ---
    const handleVoiceInput = useCallback((text: string) => {
        transcriptBuffer.current += " " + text;
        const buffer = transcriptBuffer.current;

        if (validateChant(buffer)) {
            // Match Found!
            increment('voice');

            // Clear buffer up to the match to avoid double counting
            transcriptBuffer.current = cleanBufferAfterMatch(buffer);

            // Success Signal
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([10, 30, 10, 30, 50]);
            }
        }

        // Safety: Prevent buffer overflow
        if (transcriptBuffer.current.length > 500) {
            transcriptBuffer.current = transcriptBuffer.current.slice(-200);
        }
    }, [increment]);

    const startListening = useCallback(() => {
        if (typeof window === 'undefined') return;
        const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
        const Recognition = SpeechRecognition || webkitSpeechRecognition;

        if (!Recognition) return;

        const recognition = new Recognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    handleVoiceInput(event.results[i][0].transcript);
                }
            }
        };

        recognition.onend = () => {
            if (isListening) recognition.start();
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [isListening, handleVoiceInput]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
    }, []);

    const toggleMode = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    // --- Keyboard Engine (Spacebar) ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent scroll
                increment('keyboard');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [increment]);

    return {
        count,
        round,
        isListening,
        toggleMode,
        increment: () => increment('touch') // Exposed manual trigger
    };
};

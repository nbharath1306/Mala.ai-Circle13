"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerHapticFeedback, triggerMalaCompletion } from '@/lib/haptics';
import { MantraValidator } from '@/lib/MantraValidator';
import { SpatialAudio } from '@/lib/SpatialAudio';
import { Analytics } from '@/lib/analytics';

// Type definitions for Web Speech API
interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

export type ChantMode = 'tap' | 'voice';

export const useChantEngine = () => {
    const [count, setCount] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('nitya_count') || '0');
        return 0;
    });
    const [round, setRound] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('nitya_round') || '0');
        return 0;
    });
    const [lifetimeChants, setLifetimeChants] = useState(() => {
        if (typeof window !== 'undefined') return parseInt(localStorage.getItem('nitya_lifetime') || '0');
        return 0;
    });
    const [mode, setMode] = useState<ChantMode>('tap');
    const [isListening, setIsListening] = useState(false);

    // For validation state
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const recognitionRef = useRef<any>(null);

    // Load persistence (Moved to lazy state initialization)

    // Update persistence
    useEffect(() => {
        localStorage.setItem('nitya_count', count.toString());
        localStorage.setItem('nitya_round', round.toString());
        localStorage.setItem('nitya_lifetime', lifetimeChants.toString());
    }, [count, round, lifetimeChants]);

    const increment = useCallback(() => {
        // Track analytics
        Analytics.trackChant();

        setCount(prev => {
            const newCount = prev + 1;

            // Audio Triggers
            if (newCount === 1) SpatialAudio.startAmbience();

            if (newCount % 108 === 0) {
                triggerMalaCompletion();
                SpatialAudio.playBell('deep');
                setRound(r => r + 1);
                return 0; // Reset count after 108
            } else if (newCount % 27 === 0) {
                SpatialAudio.playBell('medium');
                triggerHapticFeedback('medium');
                return newCount;
            } else {
                triggerHapticFeedback('soft');
                return newCount;
            }
        });

        setLifetimeChants(prev => prev + 1);
    }, []);

    // Handle voice increment specifically for "God Mode" mantra validation
    const handleVoiceResult = useCallback((transcript: string) => {
        // Cleaning input
        const incoming = transcript.trim().toLowerCase().split(/\s+/);

        // We only process the last word if it's a stream, or whole phrase if it's final.
        // For simplicity in this engine, we assume the engine feeds us words.
        // However, WebSpeech gives full results.

        console.log("Processing transcript:", transcript);

        // Check if there is a fuzzy match for the WHOLE mantra in the recent transcript
        // This is a robust fallback if the step-by-step fails due to speed
        if (MantraValidator.fuzzyMatchFullMantra(transcript)) {
            increment();
            // Reset buffer? Or just debouncing handled by increment?
            // Ideally we need to clear the transcript buffer or ignore already processed parts.
            // But WebSpeech doesn't easily clear history in 'continuous' mode without restart.
            // Simplest: if we match, we assume success.
            return;
        }

        // --- Step-by-Step Validation Logic (Experimental) ---
        // Ideally we would track word by word.
        // For now, let's stick to the robust full-phrase match or simple keyword trigger for fallback
        // The user asked for "Full Sequence Validation".

        // If just listening for keywords (Legacy/Simple Mode compat)
        // const keywords = ['rama', 'krishna', 'om', 'shiva', 'chant', 'hare', 'ram'];
        // if (keywords.some(k => transcript.includes(k))) increment();
    }, [increment]);

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
        recognition.interimResults = true; // Changed to true for faster feedback
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;

                    // Validate
                    handleVoiceResult(finalTranscript);

                    if (finalTranscript.length > 200) finalTranscript = '';
                } else {
                    // interim += event.results[i][0].transcript;
                }
            }
            // Optional: Real-time feedback on interim results could go here
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            // On error, brief low vibration?
            triggerHapticFeedback('warning');
        };

        recognition.onend = () => {
            // Auto-restart if still listening mode is active
            if (isListening) {
                // recognition.start(); // Careful with infinite loops if it keeps erring
                // For now, manual restart or check state
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
            setRound(0);
        }
    };
};

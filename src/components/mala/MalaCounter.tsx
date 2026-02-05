"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

export default function MalaCounter() {
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio("https://raw.githubusercontent.com/nbharath1306/Mala.ai-Circle13/main/audio/mantra.mp3");
    audioRef.current.loop = true;
    audioRef.current.playbackRate = playbackRate;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Handle Mute/Play
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e: Error) => console.log("Audio play failed (interaction needed):", e));
      }
    }
  }, [isMuted]);

  // Handle Speed Change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Toggle Focus Mode (Fullscreen)
  const toggleFocusMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.error(e));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Listen for fullscreen change (ESC key)
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40); // "Wooden bead" feel
    }
  }, []);

  const handleBeadClick = () => {
    triggerHaptic();
    setCount((prev) => {
      const newCount = prev + 1;
      // 108 beads per round
      if (newCount > 108) {
        setRound((r) => r + 1);
        return 1;
      }
      return newCount;
    });
  };

  const resetRound = () => {
    if (confirm("Reset current round?")) {
      setCount(0);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full space-y-8 relative transition-colors duration-500 ${isFullscreen ? "bg-black text-[var(--accent)]" : ""}`}>
      {/* Round Indicator */}
      <div className="absolute top-4 left-4 text-sm font-medium opacity-50">
        ROUND {round} / 16
      </div>

      {/* Controls (Hidden in deep focus if needed, currently shown) */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {/* Speed Control */}
        {!isFullscreen && (
          <div className="flex items-center space-x-2 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-xs font-mono">x{playbackRate.toFixed(1)}</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Focus Toggle */}
        <button onClick={toggleFocusMode} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Main Counter Display */}
      <div className="text-center space-y-2">
        <motion.h1
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold tracking-tighter text-[var(--accent)]"
        >
          {count}
        </motion.h1>
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">Mantra Count</p>
      </div>

      {/* The Kinetic Bead (Interactive) */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-[var(--foreground)] opacity-10"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="var(--accent)"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - count / 108)}
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Tap Area */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBeadClick}
          className="w-48 h-48 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        >
          <span className="text-lg font-light">TAP</span>
        </motion.button>
      </div>

      {/* Footer / Reset */}
      <div className="absolute bottom-8 opacity-40 hover:opacity-100 transition-opacity">
        <button onClick={resetRound} className="flex items-center space-x-2 text-xs uppercase tracking-widest">
          <RotateCw size={14} />
          <span>Reset Round</span>
        </button>
      </div>
    </div>
  );
}

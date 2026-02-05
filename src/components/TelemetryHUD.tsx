'use client';

import { useEffect, useState } from 'react';

export default function TelemetryHUD({ count, isSyncing }: { count: number; isSyncing: boolean }) {
    const [bpm, setBpm] = useState(0);
    const [lastTime, setLastTime] = useState(Date.now());

    useEffect(() => {
        if (count > 0) {
            const now = Date.now();
            const diff = now - lastTime;
            if (diff > 100) {
                setBpm(Math.min(Math.floor(60000 / diff), 999));
            }
            setLastTime(now);
        }
    }, [count]);

    return (
        <footer className="absolute bottom-0 left-0 right-0 z-50 px-6 py-4 flex items-end justify-between border-t border-white/[0.04] bg-zinc-950/60 backdrop-blur-xl">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] text-zinc-500 font-mono">{isSyncing ? 'SYNC_ACTIVE' : 'READY'}</span>
                </div>
                <div className="h-3 w-px bg-zinc-800" />
                <span className="text-[10px] text-zinc-600 font-mono">ENGINE: WebGL2</span>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-right">
                    <div className="text-xs font-mono text-zinc-300 tabular-nums">{bpm}</div>
                    <div className="text-[9px] text-zinc-600 uppercase">BPM</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-mono text-zinc-500">v2.0.0</div>
                </div>
            </div>
        </footer>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [pat, setPat] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('mala_github_pat');
        if (stored) setPat(stored);
    }, []);

    const handleSave = () => {
        localStorage.setItem('mala_github_pat', pat);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm mx-4 p-6 bg-zinc-900 border border-white/[0.06] rounded-2xl shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-zinc-100">Settings</h2>
                            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs text-zinc-400 mb-2 font-medium">GitHub Token</label>
                                <input
                                    type="password"
                                    value={pat}
                                    onChange={(e) => setPat(e.target.value)}
                                    placeholder="ghp_..."
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-white/[0.06] rounded-xl text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                />
                                <p className="text-[10px] text-zinc-600 mt-2">Stored locally. Never sent to any server.</p>
                            </div>

                            <div>
                                <label className="block text-xs text-zinc-400 mb-2 font-medium">Deity Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            const { saveImage } = await import('@/lib/db');
                                            await saveImage(e.target.files[0]);
                                            setSaved(true);
                                            setTimeout(() => setSaved(false), 1000);
                                        }
                                    }}
                                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:transition-colors cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-xl transition-colors"
                            >
                                {saved ? '✓ Saved' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

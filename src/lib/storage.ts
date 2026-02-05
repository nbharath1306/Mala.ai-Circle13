export interface UserStats {
    totalBeads: number;
    totalRounds: number;
    streak: number;
    lastActive: string | null;
}

const STORAGE_KEY = "mala_stats";

const DEFAULT_STATS: UserStats = {
    totalBeads: 0,
    totalRounds: 0,
    streak: 0,
    lastActive: null,
};

export function getStats(): UserStats {
    if (typeof window === "undefined") return DEFAULT_STATS;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;

    try {
        return JSON.parse(stored);
    } catch {
        return DEFAULT_STATS;
    }
}

export function saveStats(stats: UserStats) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateStreak(stats: UserStats): UserStats {
    const now = new Date();
    const today = now.toDateString();

    if (!stats.lastActive) {
        return { ...stats, streak: 1, lastActive: today };
    }

    const lastActiveDate = new Date(stats.lastActive);
    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If last active was yesterday (diffDays approx 1, depends on implementation details but simple check for now)
    // For robustness, checking if it's the same day
    if (stats.lastActive === today) {
        return stats;
    }

    // Check if it was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (stats.lastActive === yesterday.toDateString()) {
        return { ...stats, streak: stats.streak + 1, lastActive: today };
    }

    // Broken streak
    return { ...stats, streak: 1, lastActive: today };
}

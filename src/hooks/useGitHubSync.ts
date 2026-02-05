import { useState, useEffect, useCallback } from 'react';
import { db, BeadSession } from '@/lib/db';
import { Octokit } from '@octokit/rest';

// Minimal implementation of a sync hook
// In a real app, you'd want robust error handling and probably a diff-patch system.
// For "Ether", we'll do a simple "pull-merge-push" strategy on session end.

export function useGitHubSync(pat: string | null, repoOwner: string, repoName: string) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getOctokit = useCallback(() => {
        if (!pat) return null;
        return new Octokit({ auth: pat });
    }, [pat]);

    const sync = useCallback(async () => {
        if (!pat || isSyncing) return;
        setIsSyncing(true);
        setError(null);

        try {
            const octokit = getOctokit();
            if (!octokit) throw new Error("No PAT provided");

            const FILE_PATH = 'data/mala_sessions.json';
            let sha: string | undefined;
            let remoteData: BeadSession[] = [];

            // 1. PULL
            try {
                const { data } = await octokit.repos.getContent({
                    owner: repoOwner,
                    repo: repoName,
                    path: FILE_PATH,
                });

                if (Array.isArray(data)) {
                    // Directory... shouldn't happen if path is file
                } else if ('content' in data) {
                    sha = data.sha;
                    const decoded = atob(data.content);
                    remoteData = JSON.parse(decoded);
                }
            } catch (e: any) {
                if (e.status === 404) {
                    // File doesn't exist yet, we'll create it
                    console.log("Remote file not found, creating new.");
                } else {
                    throw e; // RETHROW other errors
                }
            }

            // 2. MERGE (Local Wins for simplicity in this MVP, or Union by ID)
            // Get all local sessions
            const localSessions = await db.sessions.toArray();

            // Simple ID-based merge. 
            // Ideally we use a proper distributed ID (UUID), but Dexie uses auto-increment numbers by default.
            // For this pivot, let's assume we just append new local ones that aren't in remote.
            // A collision detection strategy is needed for production.
            // We'll use 'date' as a pseudo-unique key for now if IDs conflict.

            const merged = [...remoteData];
            let hasChanges = false;

            localSessions.forEach(local => {
                const exists = merged.find(r => r.date === local.date); // Using date as unique constraint for now
                if (!exists) {
                    merged.push(local);
                    hasChanges = true;
                }
            });

            // 3. PUSH (Only if changes or new file)
            if (hasChanges || !sha) {
                const content = btoa(JSON.stringify(merged, null, 2));
                await octokit.repos.createOrUpdateFileContents({
                    owner: repoOwner,
                    repo: repoName,
                    path: FILE_PATH,
                    message: `Sync: ${new Date().toISOString()}`,
                    content: content,
                    sha: sha, // Undefined if creating new
                });
            }

            setLastSyncTime(new Date());

        } catch (err: any) {
            console.error("Sync failed:", err);
            setError(err.message || "Sync failed");
        } finally {
            setIsSyncing(false);
        }
    }, [pat, repoOwner, repoName, isSyncing, getOctokit]);

    return { sync, isSyncing, lastSyncTime, error };
}

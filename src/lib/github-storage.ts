
export const GITHUB_REPO_OWNER = "nbharath1306";
export const GITHUB_REPO_NAME = "Mala.ai-Circle13";
export const GITHUB_BRANCH = "main"; // or appropriate branch

/**
 * Constructs the raw URL for a file stored in the GitHub repository.
 * This is used to play audio directly without a backend proxy if the repo is public.
 */
export function getGitHubRawUrl(filePath: string) {
    // Clean path to ensure no double slashes
    const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    return `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${cleanPath}`;
}

/**
 * Fetches the list of audio files from a specific directory in the repo via GitHub API.
 * Note: Requires GITHUB_TOKEN if private or to avoid rate limits, but for public read-only
 * of a directory, unauthenticated API might suffice for low volume.
 */
export async function listAudioFiles(path = "audio") {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${path}`
        );
        if (!response.ok) throw new Error("Failed to fetch audio list");
        const data = await response.json();
        return data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((file: any) => file.name.endsWith(".mp3") || file.name.endsWith(".wav"))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((file: any) => ({
                name: file.name,
                path: file.path,
                url: file.download_url, // API returns download_url which is the raw link
            }));
    } catch (error) {
        console.error("Error fetching audio files:", error);
        return [];
    }
}

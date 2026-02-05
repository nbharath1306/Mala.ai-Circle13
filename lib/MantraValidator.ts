export class MantraValidator {
    private static readonly MANTRA_WORDS = [
        "hare", "krishna", "hare", "krishna",
        "krishna", "krishna", "hare", "hare",
        "hare", "rama", "hare", "rama",
        "rama", "rama", "hare", "hare"
    ];

    private static readonly TOTAL_WORDS = 16;
    // Threshold for Levenshtein distance (allow minor mispronunciations)
    private static readonly DISTANCE_THRESHOLD = 2;

    /**
     * Calculate Levenshtein distance between two strings
     */
    private static levenshtein(a: string, b: string): number {
        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    /**
     * Validate a sequence of words against the mantra
     * Returns validation result and the index of the last matched word
     */
    public static validateSequence(
        inputWords: string[],
        currentIndex: number
    ): { isValid: boolean; nextIndex: number; isComplete: boolean } {

        // We only care about the latest word added to the input or the buffer
        // But for a robust stream, we might receive partials.
        // Let's assume input is the standard streaming transcript.
        // To simplify: we match word by word as they come in.

        if (inputWords.length === 0) return { isValid: false, nextIndex: currentIndex, isComplete: false };

        const targetWord = this.MANTRA_WORDS[currentIndex];
        const incomingWord = inputWords[inputWords.length - 1].toLowerCase();

        // Direct match or fuzzy match
        const distance = this.levenshtein(targetWord, incomingWord);

        if (distance <= this.DISTANCE_THRESHOLD || incomingWord.includes(targetWord)) {
            const newIndex = currentIndex + 1;

            if (newIndex >= this.TOTAL_WORDS) {
                return { isValid: true, nextIndex: 0, isComplete: true };
            }

            return { isValid: true, nextIndex: newIndex, isComplete: false };
        }

        // If it's not a match, we might want to be lenient or strict.
        // For "God Mode", strictness enforces discipline.
        // But speech API is flaky. Let's return invalid if it's completely off, 
        // but maybe the user said two words at once? 
        // For now, simple step-by-step.

        return { isValid: false, nextIndex: currentIndex, isComplete: false };
    }

    /**
     * Helper to check if a full string contains the mantra roughly
     */
    public static fuzzyMatchFullMantra(transcript: string): boolean {
        const cleanTranscript = transcript.toLowerCase().replace(/[^a-z ]/g, '');
        const words = cleanTranscript.split(/\s+/).filter(w => w.length > 0);

        // Look for the sequence in the array of words
        let matchCount = 0;
        let wordIdx = 0;

        for (const w of words) {
            if (wordIdx >= this.TOTAL_WORDS) break;

            const target = this.MANTRA_WORDS[wordIdx];
            if (this.levenshtein(target, w) <= this.DISTANCE_THRESHOLD || w.includes(target)) {
                matchCount++;
                wordIdx++;
            }
        }

        // If we matched all 16 words in order
        return matchCount === this.TOTAL_WORDS;
    }
}

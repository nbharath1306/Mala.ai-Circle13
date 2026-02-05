export class Analytics {
    private static STORAGE_KEY = 'nitya_analytics_v1';

    // Get data for the last 7 days
    public static getThisWeek(): number[] {
        if (typeof window === 'undefined') return Array(7).fill(0);

        const data = this.loadData();
        const result = [];

        // Last 7 days including today
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            result.push(data[key] || 0);
        }
        return result;
    }

    public static trackChant() {
        if (typeof window === 'undefined') return;

        const data = this.loadData();
        const today = new Date().toISOString().split('T')[0];

        data[today] = (data[today] || 0) + 1;

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    private static loadData(): Record<string, number> {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }
}

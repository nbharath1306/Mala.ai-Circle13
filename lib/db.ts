import Dexie, { type EntityTable } from 'dexie';

interface ChantSession {
    id: number;
    timestamp: number;
    count: number;
    duration: number; // in seconds
    type: 'voice' | 'touch' | 'keyboard';
}

interface Milestone {
    id: number;
    date: string; // ISO Date string YYYY-MM-DD
    total_count: number;
}

const db = new Dexie('NityaDB') as Dexie & {
    sessions: EntityTable<ChantSession, 'id'>;
    milestones: EntityTable<Milestone, 'id'>;
};

// Schema declaration:
db.version(1).stores({
    sessions: '++id, timestamp, type', // Primary key and indexed props
    milestones: '++id, date'
});

export { db };
export type { ChantSession, Milestone };

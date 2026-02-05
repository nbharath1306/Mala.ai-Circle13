import Dexie, { type EntityTable } from 'dexie';

export type BeadSession = {
    id?: number;
    date: string;
    rounds_completed: number;
    beads_counted: number;
    duration_seconds: number;
};

export type UserSettings = {
    id?: number;
    theme: "ether" | "dark" | "gold";
    use_haptics: boolean;
    use_sound: boolean;
};

export type StoredImage = {
    id: string;
    blob: Blob;
};

const db = new Dexie('MalaDatabase') as Dexie & {
    sessions: EntityTable<BeadSession, 'id'>;
    settings: EntityTable<UserSettings, 'id'>;
    images: EntityTable<StoredImage, 'id'>;
};

db.version(1).stores({
    sessions: '++id, date',
    settings: '++id',
    images: 'id'
});

export const saveImage = async (blob: Blob) => {
    await db.images.put({ id: 'deity', blob });
};

export const getImage = async () => {
    return await db.images.get('deity');
};

export { db };

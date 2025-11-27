import { Player, Tournament, Match, Sponsor, PastSeason } from '@/types/tournament';
import { BroadcastMessage, BroadcastTemplate } from '@/types/broadcast';
import { DirectorLogEntry } from '@/contexts/DirectorLogContext';
import { promises as fs } from 'fs';
import { join } from 'path';

interface StoredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface ThemeSettings {
  logoSize: number;
  heroBackgroundColor: string;
  navSectionBackgroundColor: string;
  navSectionOpacity: number;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  surfaceColor: string;
  buttonColor: string;
  playerCardBackgroundColor: string;
  tournamentCardBackgroundColor: string;
}

interface Database {
  players: Player[];
  tournaments: Tournament[];
  matches: Match[];
  sponsors: Sponsor[];
  pastSeasons: PastSeason[];
  broadcasts: BroadcastMessage[];
  customTemplates: BroadcastTemplate[];
  users: StoredUser[];
  theme: ThemeSettings;
  directorLogs: DirectorLogEntry[];
}

const DEFAULT_THEME: ThemeSettings = {
  logoSize: 168,
  heroBackgroundColor: '#F8FAFC',
  navSectionBackgroundColor: '#1E3A8A',
  navSectionOpacity: 0.5,
  primaryColor: '#1F2937',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  surfaceColor: '#FFFFFF',
  buttonColor: '#F8F8F8',
  playerCardBackgroundColor: '#C0C0C0',
  tournamentCardBackgroundColor: '#C0C0C0',
};

const ADMIN_USER: StoredUser = {
  id: 'admin-1',
  username: 'HRussell',
  email: 'hrussell007@gmail.com',
  password: 'foosen007',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const DB_FILE_PATH = join(process.cwd(), 'backend', 'database.json');

const DEFAULT_DATABASE: Database = {
  players: [],
  tournaments: [],
  matches: [],
  sponsors: [],
  pastSeasons: [],
  broadcasts: [],
  customTemplates: [],
  users: [ADMIN_USER],
  theme: DEFAULT_THEME,
  directorLogs: [],
};

let dbCache: Database | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

async function loadDatabase(): Promise<Database> {
  if (dbCache) {
    return dbCache;
  }

  try {
    const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
    dbCache = JSON.parse(data);
    console.log('📂 Database loaded from file');
    return dbCache!;
  } catch {
    console.log('📂 No existing database found, creating new one');
    dbCache = { ...DEFAULT_DATABASE };
    await saveDatabase();
    return dbCache;
  }
}

async function saveDatabase() {
  if (!dbCache) return;
  
  try {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(dbCache, null, 2), 'utf-8');
    console.log('💾 Database saved to file');
  } catch (error) {
    console.error('❌ Error saving database:', error);
  }
}

function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveDatabase();
  }, 500);
}

function createProxiedArray<T>(arr: T[]): T[] {
  return new Proxy(arr, {
    set(target, prop, value) {
      target[prop as any] = value;
      debouncedSave();
      return true;
    },
    get(target, prop) {
      const value = target[prop as any];
      if (typeof value === 'function') {
        return function (...args: any[]) {
          const result = (value as any).apply(target, args);
          if (['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].includes(prop as string)) {
            debouncedSave();
          }
          return result;
        };
      }
      return value;
    },
  });
}

const handler: ProxyHandler<Database> = {
  get(target, prop) {
    if (!dbCache) {
      throw new Error('Database not initialized. Call loadDatabase() first.');
    }
    const value = dbCache[prop as keyof Database];
    if (Array.isArray(value)) {
      return createProxiedArray(value as any);
    }
    return value;
  },
  set(target, prop, value) {
    if (!dbCache) {
      throw new Error('Database not initialized. Call loadDatabase() first.');
    }
    dbCache[prop as keyof Database] = value;
    debouncedSave();
    return true;
  },
};

const emptyDatabase: Database = { ...DEFAULT_DATABASE };
export const db = new Proxy(emptyDatabase, handler);

export async function initDatabase() {
  await loadDatabase();
  console.log('✅ Database initialized');
}

export async function saveDbNow() {
  await saveDatabase();
}

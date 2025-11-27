import { Player, Tournament, Match, Sponsor, PastSeason } from '@/types/tournament';
import { BroadcastMessage, BroadcastTemplate } from '@/types/broadcast';
import { DirectorLogEntry } from '@/contexts/DirectorLogContext';

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

let dbCache: Database = { ...DEFAULT_DATABASE };

export const db = new Proxy({} as Database, {
  get(target, prop) {
    return dbCache[prop as keyof Database];
  },
  set(target, prop, value) {
    dbCache[prop as keyof Database] = value;
    return true;
  },
});

export async function initDatabase() {
  console.log('✅ In-memory database initialized');
  return Promise.resolve();
}

export async function saveDbNow() {
  console.log('💾 Database saved (in-memory)');
  return Promise.resolve();
}

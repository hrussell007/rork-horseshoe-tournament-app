export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  hasPaidMembership: boolean;
  playerClass: 'A' | 'B';
  profilePicture?: string;
  customSeasonPoints?: number;
  createdAt: string;
}

export interface Team {
  id: string;
  player1Id: string;
  player2Id: string;
  name?: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location?: string;
  time?: string;
  imageUri?: string;
  entryFee: number;
  availablePits?: number;
  teams: Team[];
  status: 'setup' | 'active' | 'completed';
  payoutStructure: PayoutStructure;
  bracketState?: any;
  createdAt: string;
}

export interface PayoutStructure {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  team1Ringers: number;
  team2Ringers: number;
  winnerTeamId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  round: number;
  targetPoints?: number;
  pitNumber?: number;
  createdAt: string;
}

export interface TeamStats {
  teamId: string;
  wins: number;
  losses: number;
  totalPoints: number;
  totalRingers: number;
  matches: number;
}

export interface PlayerSeasonStats {
  playerId: string;
  points: number;
  tournamentsPlayed: number;
  firstPlaceFinishes: number;
  secondPlaceFinishes: number;
  thirdPlaceFinishes: number;
}

export interface Sponsor {
  id: string;
  name: string;
  imageUri?: string;
  websiteUrl?: string;
  createdAt: string;
}

export interface PastSeason {
  id: string;
  name: string;
  endDate: string;
  classAStandings: PlayerSeasonStats[];
  classBStandings: PlayerSeasonStats[];
  createdAt: string;
}

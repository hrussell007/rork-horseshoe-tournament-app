export interface BracketTeam {
  id: string;
  name: string;
  seed: number;
  losses?: number;
}

export interface BracketMatch {
  id: string;
  matchNumber: number;
  round: number;
  bracket: 'winners' | 'losers' | 'finals';
  team1?: BracketTeam;
  team2?: BracketTeam;
  team1Score: number;
  team2Score: number;
  winnerId?: string;
  loserId?: string;
  status: 'pending' | 'in_progress' | 'completed';
  feedsIntoMatchId?: string;
  loserFeedsIntoMatchId?: string;
  position: { round: number; index: number };
}

export interface BracketRound {
  round: number;
  bracket: 'winners' | 'losers' | 'finals';
  matches: BracketMatch[];
}

export interface DoublEliminationBracket {
  winnersRounds: BracketRound[];
  losersRounds: BracketRound[];
  finalsRounds: BracketRound[];
  allMatches: BracketMatch[];
}

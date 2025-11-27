import { BracketTeam, BracketMatch, DoublEliminationBracket, BracketRound } from '@/types/bracket';

type TenTeamBracketConfig = {
  winners: { round: number; matches: number }[];
  losers: { round: number; matches: number }[];
};

const TEN_TEAM_STRUCTURE: TenTeamBracketConfig = {
  winners: [
    { round: 1, matches: 2 },
    { round: 2, matches: 4 },
    { round: 3, matches: 2 },
    { round: 4, matches: 1 },
  ],
  losers: [
    { round: 1, matches: 2 },
    { round: 2, matches: 2 },
    { round: 3, matches: 2 },
    { round: 4, matches: 1 },
    { round: 5, matches: 1 },
  ],
};

export function generateDoubleEliminationBracket(teams: BracketTeam[]): DoublEliminationBracket {
  console.log(`🏆 Generating double-elimination bracket for ${teams.length} teams`);
  
  if (teams.length !== 10) {
    throw new Error('This bracket generator is specifically designed for 10 teams');
  }

  const seededTeams = teams.map((team, index) => ({
    ...team,
    seed: index + 1,
    losses: 0,
  }));

  console.log(`📊 10-Team Tournament Structure:`);
  console.log(`Winners: R1(2) → R2(4) → R3(2) → R4(1)`);
  console.log(`Losers: R1(2) → R2(2) → R3(2) → R4(1) → R5(1)`);
  console.log(`Finals: Grand Final + Reset Match (if needed)`);
  console.log(`Routing: M1 loser→M10, M2 loser→M11, M3 loser→M12, M4 loser→M10, M5 loser→M11, M6 loser→M13, M12→M14, M13→M15, M7 loser→M14, M8 loser→M15, M9 loser→M17`);

  const allMatches: BracketMatch[] = [];
  let matchIdCounter = 1;

  const winnersRounds: BracketRound[] = [];
  let teamIndexForWinnersR1 = 6;

  TEN_TEAM_STRUCTURE.winners.forEach((roundConfig) => {
    const roundMatches: BracketMatch[] = [];
    
    for (let i = 0; i < roundConfig.matches; i++) {
      const match: BracketMatch = {
        id: `W-R${roundConfig.round}-M${i + 1}`,
        matchNumber: matchIdCounter++,
        round: roundConfig.round,
        bracket: 'winners',
        team1Score: 0,
        team2Score: 0,
        status: 'pending',
        position: { round: roundConfig.round, index: i },
      };

      if (roundConfig.round === 1) {
        match.team1 = seededTeams[teamIndexForWinnersR1++];
        match.team2 = seededTeams[teamIndexForWinnersR1++];
      }

      roundMatches.push(match);
      allMatches.push(match);
    }
    
    winnersRounds.push({
      round: roundConfig.round,
      bracket: 'winners',
      matches: roundMatches,
    });
  });

  winnersRounds[0].matches.forEach((match, index) => {
    match.feedsIntoMatchId = `W-R2-M${index + 2}`;
  });

  const byeTeams = seededTeams.slice(0, 6);
  winnersRounds[1].matches.forEach((match, index) => {
    if (index === 0) {
      match.team1 = byeTeams[0];
      match.team2 = byeTeams[1];
    } else if (index === 1) {
      match.team1 = byeTeams[2];
    } else if (index === 2) {
      match.team1 = byeTeams[3];
    } else if (index === 3) {
      match.team1 = byeTeams[4];
      match.team2 = byeTeams[5];
    }
  });

  winnersRounds[1].matches.forEach((match, index) => {
    const nextMatchIndex = Math.floor(index / 2);
    match.feedsIntoMatchId = `W-R3-M${nextMatchIndex + 1}`;
  });

  winnersRounds[2].matches.forEach((match, index) => {
    if (index === 0) {
      match.feedsIntoMatchId = 'W-R4-M1';
    } else if (index === 1) {
      match.feedsIntoMatchId = 'W-R4-M1';
    }
  });

  const losersRounds: BracketRound[] = [];

  TEN_TEAM_STRUCTURE.losers.forEach((roundConfig) => {
    const roundMatches: BracketMatch[] = [];
    
    for (let i = 0; i < roundConfig.matches; i++) {
      const match: BracketMatch = {
        id: `L-R${roundConfig.round}-M${i + 1}`,
        matchNumber: matchIdCounter++,
        round: roundConfig.round,
        bracket: 'losers',
        team1Score: 0,
        team2Score: 0,
        status: 'pending',
        position: { round: roundConfig.round, index: i },
      };

      roundMatches.push(match);
      allMatches.push(match);
    }
    
    losersRounds.push({
      round: roundConfig.round,
      bracket: 'losers',
      matches: roundMatches,
    });
  });

  losersRounds[0].matches.forEach((match, index) => {
    match.feedsIntoMatchId = `L-R2-M${index + 1}`;
  });

  losersRounds[1].matches.forEach((match, index) => {
    if (index === 0) {
      match.feedsIntoMatchId = 'L-R3-M1';
    } else if (index === 1) {
      match.feedsIntoMatchId = 'L-R3-M2';
    }
  });

  losersRounds[2].matches.forEach((match, index) => {
    if (index === 0) {
      match.feedsIntoMatchId = 'L-R4-M1';
    } else if (index === 1) {
      match.feedsIntoMatchId = 'L-R4-M1';
    }
  });

  losersRounds[3].matches[0].feedsIntoMatchId = 'L-R5-M1';

  losersRounds[4].matches[0].feedsIntoMatchId = 'GRAND-FINAL';

  winnersRounds[0].matches.forEach((match, index) => {
    if (index === 0) {
      match.loserFeedsIntoMatchId = 'L-R1-M1';
    } else if (index === 1) {
      match.loserFeedsIntoMatchId = 'L-R1-M2';
    }
  });

  winnersRounds[1].matches.forEach((match, index) => {
    if (index === 0) {
      match.loserFeedsIntoMatchId = 'L-R2-M1';
    } else if (index === 1) {
      match.loserFeedsIntoMatchId = 'L-R1-M1';
    } else if (index === 2) {
      match.loserFeedsIntoMatchId = 'L-R1-M2';
    } else if (index === 3) {
      match.loserFeedsIntoMatchId = 'L-R2-M2';
    }
  });

  winnersRounds[2].matches.forEach((match, index) => {
    if (index === 0) {
      match.loserFeedsIntoMatchId = 'L-R3-M1';
    } else if (index === 1) {
      match.loserFeedsIntoMatchId = 'L-R3-M2';
    }
  });

  winnersRounds[3].matches[0].loserFeedsIntoMatchId = 'L-R5-M1';

  const grandFinal: BracketMatch = {
    id: 'GRAND-FINAL',
    matchNumber: matchIdCounter++,
    round: 1,
    bracket: 'finals',
    team1Score: 0,
    team2Score: 0,
    status: 'pending',
    position: { round: 1, index: 0 },
  };

  const resetMatch: BracketMatch = {
    id: 'RESET-MATCH',
    matchNumber: matchIdCounter++,
    round: 2,
    bracket: 'finals',
    team1Score: 0,
    team2Score: 0,
    status: 'pending',
    position: { round: 2, index: 0 },
  };

  allMatches.push(grandFinal);
  allMatches.push(resetMatch);

  const finalsRounds: BracketRound[] = [
    { round: 1, bracket: 'finals', matches: [grandFinal] },
    { round: 2, bracket: 'finals', matches: [resetMatch] },
  ];

  console.log(`✅ Bracket generated:`);
  console.log(`   Winners Rounds: ${winnersRounds.length} (2+4+2+1 matches)`);
  console.log(`   Losers Rounds: ${losersRounds.length} (2+2+2+1+1 matches)`);
  console.log(`   Total matches: ${allMatches.length}`);
  console.log(`   M12→W-R4-M1, M13→L-M15, M7 loser→L-M14, M8 loser→L-M15`);

  return {
    winnersRounds,
    losersRounds,
    finalsRounds,
    allMatches,
  };
}

export function advanceWinner(
  bracket: DoublEliminationBracket,
  matchId: string,
  winnerId: string,
  loserId: string,
  team1Score: number,
  team2Score: number
): DoublEliminationBracket {
  console.log(`🎯 Advancing winner from match ${matchId}`);
  
  const allMatches = bracket.allMatches.map(match => {
    if (match.id === matchId) {
      const updatedMatch = {
        ...match,
        winnerId,
        loserId,
        team1Score,
        team2Score,
        status: 'completed' as const,
      };
      console.log(`✅ Match ${matchId} completed: Winner=${winnerId}, Loser=${loserId}`);
      return updatedMatch;
    }
    return match;
  });

  const completedMatch = allMatches.find(m => m.id === matchId);
  if (!completedMatch) return bracket;

  const winnerTeam = completedMatch.team1?.id === winnerId 
    ? { ...completedMatch.team1 } 
    : completedMatch.team2 ? { ...completedMatch.team2 } : undefined;
  const loserTeam = completedMatch.team1?.id === loserId 
    ? { ...completedMatch.team1, losses: (completedMatch.team1.losses || 0) + 1 } 
    : completedMatch.team2 ? { ...completedMatch.team2, losses: (completedMatch.team2.losses || 0) + 1 } : undefined;

  console.log(`  → Winner ${winnerTeam?.name} has ${winnerTeam?.losses || 0} loss(es)`);
  console.log(`  → Loser ${loserTeam?.name} now has ${loserTeam?.losses || 0} loss(es)`);

  if (completedMatch.feedsIntoMatchId) {
    const nextMatch = allMatches.find(m => m.id === completedMatch.feedsIntoMatchId);
    if (nextMatch && winnerTeam) {
      if (!nextMatch.team1) {
        nextMatch.team1 = winnerTeam;
        console.log(`  → Winner advances to ${nextMatch.id} (Team 1)`);
      } else if (!nextMatch.team2) {
        nextMatch.team2 = winnerTeam;
        console.log(`  → Winner advances to ${nextMatch.id} (Team 2)`);
      }
    }
  }

  if (completedMatch.loserFeedsIntoMatchId) {
    const loserMatch = allMatches.find(m => m.id === completedMatch.loserFeedsIntoMatchId);
    if (loserMatch && loserTeam) {
      if (!loserMatch.team1) {
        loserMatch.team1 = loserTeam;
        console.log(`  → Loser drops to ${loserMatch.id} (Team 1)`);
      } else if (!loserMatch.team2) {
        loserMatch.team2 = loserTeam;
        console.log(`  → Loser drops to ${loserMatch.id} (Team 2)`);
      }
    }
  }

  if (completedMatch.bracket === 'winners' && completedMatch.round === bracket.winnersRounds.length) {
    const grandFinal = allMatches.find(m => m.id === 'GRAND-FINAL');
    if (grandFinal && winnerTeam && !grandFinal.team1) {
      grandFinal.team1 = winnerTeam;
      console.log(`  → Winners champion advances to Grand Final (Team 1)`);
    }
  }

  if (completedMatch.bracket === 'losers' && completedMatch.round === bracket.losersRounds.length) {
    const grandFinal = allMatches.find(m => m.id === 'GRAND-FINAL');
    if (grandFinal && winnerTeam && !grandFinal.team2) {
      grandFinal.team2 = winnerTeam;
      console.log(`  → Losers champion advances to Grand Final (Team 2)`);
    }
  }

  if (completedMatch.id === 'RESET-MATCH') {
    console.log(`  → Match 19 complete! Tournament Winner: ${winnerTeam?.name}`);
  }

  if (completedMatch.id === 'GRAND-FINAL') {
    const winnersChamp = completedMatch.team1;
    const losersChamp = completedMatch.team2;
    
    if (losersChamp?.id === winnerId) {
      const resetMatch = allMatches.find(m => m.id === 'RESET-MATCH');
      if (resetMatch) {
        resetMatch.team1 = winnersChamp;
        resetMatch.team2 = losersChamp;
        resetMatch.status = 'pending';
        console.log(`  → Reset match triggered! Both teams advance to RESET-MATCH`);
      }
    } else {
      const loserLosses = loserTeam?.losses || 0;
      console.log(`  → Grand Final winner: ${winnerTeam?.name}`);
      console.log(`  → Grand Final loser has ${loserLosses} loss(es)`);
      
      if (loserLosses === 1) {
        console.log(`  → Loser has only 1 loss! Creating Match 19 for rematch...`);
        const resetMatch = allMatches.find(m => m.id === 'RESET-MATCH');
        if (resetMatch && winnerTeam && loserTeam) {
          resetMatch.team1 = winnerTeam;
          resetMatch.team2 = loserTeam;
          resetMatch.status = 'pending';
          console.log(`  → Match 19 (RESET-MATCH) created with both teams`);
        }
      } else {
        console.log(`  → Tournament complete! Winner: ${winnerTeam?.name}`);
      }
    }
  }

  const updatedBracket = reconstructBracket(allMatches);
  return updatedBracket;
}

function reconstructBracket(allMatches: BracketMatch[]): DoublEliminationBracket {
  const winnersMatches = allMatches.filter(m => m.bracket === 'winners');
  const losersMatches = allMatches.filter(m => m.bracket === 'losers');
  const finalsMatches = allMatches.filter(m => m.bracket === 'finals');

  const winnersRounds: BracketRound[] = [];
  const winnersRoundMap = new Map<number, BracketMatch[]>();
  winnersMatches.forEach(match => {
    if (!winnersRoundMap.has(match.round)) {
      winnersRoundMap.set(match.round, []);
    }
    winnersRoundMap.get(match.round)!.push(match);
  });
  winnersRoundMap.forEach((matches, round) => {
    winnersRounds.push({ round, bracket: 'winners', matches });
  });
  winnersRounds.sort((a, b) => a.round - b.round);

  const losersRounds: BracketRound[] = [];
  const losersRoundMap = new Map<number, BracketMatch[]>();
  losersMatches.forEach(match => {
    if (!losersRoundMap.has(match.round)) {
      losersRoundMap.set(match.round, []);
    }
    losersRoundMap.get(match.round)!.push(match);
  });
  losersRoundMap.forEach((matches, round) => {
    losersRounds.push({ round, bracket: 'losers', matches });
  });
  losersRounds.sort((a, b) => a.round - b.round);

  const finalsRounds: BracketRound[] = [];
  const finalsRoundMap = new Map<number, BracketMatch[]>();
  finalsMatches.forEach(match => {
    if (!finalsRoundMap.has(match.round)) {
      finalsRoundMap.set(match.round, []);
    }
    finalsRoundMap.get(match.round)!.push(match);
  });
  finalsRoundMap.forEach((matches, round) => {
    finalsRounds.push({ round, bracket: 'finals', matches });
  });
  finalsRounds.sort((a, b) => a.round - b.round);

  return {
    winnersRounds,
    losersRounds,
    finalsRounds,
    allMatches,
  };
}

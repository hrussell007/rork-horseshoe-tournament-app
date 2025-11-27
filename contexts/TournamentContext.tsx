import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useMemo, useCallback } from 'react';
import { Player, Tournament, Match, TeamStats, PlayerSeasonStats, Sponsor } from '@/types/tournament';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from '@tanstack/react-query';

export const [TournamentContext, useTournamentData] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  const playersQuery = trpc.players.getAll.useQuery();
  const tournamentsQuery = trpc.tournaments.getAll.useQuery();
  const matchesQuery = trpc.matches.getAll.useQuery();
  const sponsorsQuery = trpc.sponsors.getAll.useQuery();
  const pastSeasonsQuery = trpc.pastSeasons.getAll.useQuery();
  
  const seedMutation = trpc.seed.init.useMutation({
    onSuccess: () => {
      console.log('✅ Seed complete, refetching data...');
      queryClient.invalidateQueries();
    },
  });

  const createPlayerMutation = trpc.players.create.useMutation({
    onSuccess: () => {
      console.log('✅ Player created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['players']] });
    },
  });
  
  const updatePlayerMutation = trpc.players.update.useMutation({
    onSuccess: () => {
      console.log('✅ Player updated, refetching...');
      queryClient.invalidateQueries({ queryKey: [['players']] });
    },
  });
  
  const deletePlayerMutation = trpc.players.delete.useMutation({
    onSuccess: () => {
      console.log('✅ Player deleted, refetching...');
      queryClient.invalidateQueries({ queryKey: [['players']] });
    },
  });

  const createTournamentMutation = trpc.tournaments.create.useMutation({
    onSuccess: () => {
      console.log('✅ Tournament created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['tournaments']] });
    },
  });
  
  const updateTournamentMutation = trpc.tournaments.update.useMutation({
    onSuccess: () => {
      console.log('✅ Tournament updated, refetching...');
      queryClient.invalidateQueries({ queryKey: [['tournaments']] });
    },
  });
  
  const deleteTournamentMutation = trpc.tournaments.delete.useMutation({
    onSuccess: () => {
      console.log('✅ Tournament deleted, refetching...');
      queryClient.invalidateQueries({ queryKey: [['tournaments']] });
      queryClient.invalidateQueries({ queryKey: [['matches']] });
    },
  });

  const createMatchMutation = trpc.matches.create.useMutation({
    onSuccess: () => {
      console.log('✅ Match created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['matches']] });
    },
  });
  
  const createBatchMatchesMutation = trpc.matches.createBatch.useMutation({
    onSuccess: () => {
      console.log('✅ Batch matches created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['matches']] });
    },
  });
  
  const updateMatchMutation = trpc.matches.update.useMutation({
    onSuccess: () => {
      console.log('✅ Match updated, refetching...');
      queryClient.invalidateQueries({ queryKey: [['matches']] });
    },
  });
  
  const deleteMatchMutation = trpc.matches.delete.useMutation({
    onSuccess: () => {
      console.log('✅ Match deleted, refetching...');
      queryClient.invalidateQueries({ queryKey: [['matches']] });
    },
  });

  const createSponsorMutation = trpc.sponsors.create.useMutation({
    onSuccess: () => {
      console.log('✅ Sponsor created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['sponsors']] });
    },
  });
  
  const updateSponsorMutation = trpc.sponsors.update.useMutation({
    onSuccess: () => {
      console.log('✅ Sponsor updated, refetching...');
      queryClient.invalidateQueries({ queryKey: [['sponsors']] });
    },
  });
  
  const deleteSponsorMutation = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      console.log('✅ Sponsor deleted, refetching...');
      queryClient.invalidateQueries({ queryKey: [['sponsors']] });
    },
  });

  const createPastSeasonMutation = trpc.pastSeasons.create.useMutation({
    onSuccess: () => {
      console.log('✅ Past season created, refetching...');
      queryClient.invalidateQueries({ queryKey: [['pastSeasons']] });
    },
  });

  const players = useMemo(() => playersQuery.data || [], [playersQuery.data]);
  const tournaments = useMemo(() => tournamentsQuery.data || [], [tournamentsQuery.data]);
  const matches = useMemo(() => matchesQuery.data || [], [matchesQuery.data]);
  const sponsors = useMemo(() => sponsorsQuery.data || [], [sponsorsQuery.data]);
  const pastSeasons = useMemo(() => pastSeasonsQuery.data || [], [pastSeasonsQuery.data]);
  
  const isLoading = playersQuery.isLoading || tournamentsQuery.isLoading || matchesQuery.isLoading;

  useEffect(() => {
    if (!isLoading && players.length === 0 && tournaments.length === 0) {
      console.log('🌱 No data found, seeding...');
      seedMutation.mutate();
    }
  }, [isLoading, players.length, tournaments.length, seedMutation]);

  const addPlayer = useCallback((player: Omit<Player, 'id' | 'createdAt'>) => {
    createPlayerMutation.mutate(player);
    return { id: 'temp-' + Date.now().toString(), ...player, createdAt: new Date().toISOString() };
  }, [createPlayerMutation]);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    updatePlayerMutation.mutate({ id, ...updates });
  }, [updatePlayerMutation]);

  const deletePlayer = useCallback((id: string) => {
    deletePlayerMutation.mutate({ id });
  }, [deletePlayerMutation]);

  const addTournament = useCallback((tournament: Omit<Tournament, 'id' | 'createdAt'>) => {
    createTournamentMutation.mutate(tournament);
    return { id: 'temp-' + Date.now().toString(), ...tournament, createdAt: new Date().toISOString() };
  }, [createTournamentMutation]);

  const updateTournament = useCallback((id: string, updates: Partial<Tournament>) => {
    updateTournamentMutation.mutate({ id, ...updates });
  }, [updateTournamentMutation]);

  const deleteTournament = useCallback((id: string) => {
    deleteTournamentMutation.mutate({ id });
  }, [deleteTournamentMutation]);

  const addMatch = useCallback((match: Omit<Match, 'id' | 'createdAt'>) => {
    createMatchMutation.mutate(match);
    return { id: 'temp-' + Date.now().toString(), ...match, createdAt: new Date().toISOString() };
  }, [createMatchMutation]);

  const updateMatch = useCallback((id: string, updates: Partial<Match>) => {
    updateMatchMutation.mutate({ id, ...updates });
    
    const match = matches.find(m => m.id === id);
    if (match && updates.status === 'completed' && match.pitNumber) {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [['matches']] });
      }, 100);
    }
  }, [updateMatchMutation, matches, queryClient]);

  const deleteMatch = useCallback((id: string) => {
    deleteMatchMutation.mutate({ id });
  }, [deleteMatchMutation]);

  const addSponsor = useCallback((sponsor: Omit<Sponsor, 'id' | 'createdAt'>) => {
    createSponsorMutation.mutate(sponsor);
    return { id: 'temp-' + Date.now().toString(), ...sponsor, createdAt: new Date().toISOString() };
  }, [createSponsorMutation]);

  const updateSponsor = useCallback((id: string, updates: Partial<Sponsor>) => {
    updateSponsorMutation.mutate({ id, ...updates });
  }, [updateSponsorMutation]);

  const deleteSponsor = useCallback((id: string) => {
    deleteSponsorMutation.mutate({ id });
  }, [deleteSponsorMutation]);

  const generateRoundRobinMatches = useCallback((tournamentId: string, forceRegenerate: boolean = false) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament || !tournament.teams || tournament.teams.length < 2) {
      console.log('Cannot generate matches: insufficient teams');
      return;
    }

    if (tournament.teams.length > 8) {
      console.log('Round robin only for tournaments with 8 or fewer teams');
      return;
    }

    const availablePits = tournament.availablePits || 0;
    console.log(`Available pits: ${availablePits || 'Not specified'}`);

    const existingMatches = matches.filter((m) => m.tournamentId === tournamentId);
    if (existingMatches.length > 0 && !forceRegenerate) {
      console.log('Matches already exist for this tournament. Use forceRegenerate=true to regenerate.');
      return;
    }

    if (forceRegenerate && existingMatches.length > 0) {
      console.log(`Deleting ${existingMatches.length} existing matches before regenerating...`);
      existingMatches.forEach(m => deleteMatchMutation.mutate({ id: m.id }));
    }

    const teams = [...tournament.teams];
    const n = teams.length;
    
    let isDoubleRoundRobin = false;
    let targetPoints = 30;
    let roundType = '';
    
    if (n === 4 || n === 5) {
      isDoubleRoundRobin = true;
      roundType = 'DOUBLE';
      targetPoints = n === 5 ? 21 : 30;
    } else if (n === 6 || n === 7) {
      isDoubleRoundRobin = false;
      roundType = 'STANDARD';
      targetPoints = 30;
    } else if (n === 8) {
      isDoubleRoundRobin = false;
      roundType = 'STANDARD';
      targetPoints = 21;
    }
    
    const rounds = isDoubleRoundRobin ? 2 : 1;
    
    console.log(`Generating ${roundType} round-robin schedule for ${n} teams (games to ${targetPoints} points)...`);

    const roundRobinMatches: Omit<Match, 'id' | 'createdAt'>[] = [];
    let globalRoundNumber = 0;
    let pitAssignmentCounter = 0;

    for (let cycle = 0; cycle < rounds; cycle++) {
      const cycleTeams = [...teams];
      
      if (n % 2 === 1) {
        cycleTeams.push({ id: 'BYE', player1Id: 'BYE', player2Id: 'BYE' });
      }

      const numRounds = cycleTeams.length - 1;
      const half = cycleTeams.length / 2;
      const teamsRotate = [...cycleTeams];

      for (let round = 0; round < numRounds; round++) {
        globalRoundNumber++;

        for (let i = 0; i < half; i++) {
          const team1 = teamsRotate[i];
          const team2 = teamsRotate[cycleTeams.length - 1 - i];

          if (team1.id !== 'BYE' && team2.id !== 'BYE') {
            const pitNumber = availablePits > 0 ? ((pitAssignmentCounter % availablePits) + 1) : undefined;
            if (pitNumber) {
              pitAssignmentCounter++;
            }
            
            const newMatch: Omit<Match, 'id' | 'createdAt'> = {
              tournamentId: tournament.id,
              team1Id: team1.id,
              team2Id: team2.id,
              team1Score: 0,
              team2Score: 0,
              team1Ringers: 0,
              team2Ringers: 0,
              status: 'pending',
              round: globalRoundNumber,
              targetPoints: targetPoints,
              pitNumber: pitNumber,
            };
            roundRobinMatches.push(newMatch);
          }
        }

        const lastTeam = teamsRotate.pop()!;
        teamsRotate.splice(1, 0, lastTeam);
      }
    }

    createBatchMatchesMutation.mutate({ matches: roundRobinMatches as any });
    console.log(`✓ SUCCESS: Generated ${roundRobinMatches.length} ${roundType} round-robin matches`);
    
    return roundRobinMatches;
  }, [tournaments, matches, deleteMatchMutation, createBatchMatchesMutation]);

  const reassignPitsForTournament = useCallback((tournamentId: string, allMatches: Match[]) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament || !tournament.availablePits) return;
    
    const tournamentMatches = allMatches.filter(m => m.tournamentId === tournamentId);
    const inProgressMatches = tournamentMatches.filter(m => m.status === 'in_progress');
    const pendingMatches = tournamentMatches.filter(m => m.status === 'pending');
    
    if (pendingMatches.length === 0) return;
    
    const usedPits = new Set(inProgressMatches.map(m => m.pitNumber).filter(p => p !== undefined));
    const availablePitNumbers: number[] = [];
    
    for (let i = 1; i <= tournament.availablePits; i++) {
      if (!usedPits.has(i)) {
        availablePitNumbers.push(i);
      }
    }
    
    if (availablePitNumbers.length === 0) return;
    
    console.log(`🔄 Reassigning pits - Available: [${availablePitNumbers.join(', ')}]`);
    
    const sortedPendingMatches = [...pendingMatches].sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.createdAt.localeCompare(b.createdAt);
    });
    
    let pitIndex = 0;
    sortedPendingMatches.forEach((match, matchIndex) => {
      if (matchIndex < availablePitNumbers.length) {
        const assignedPit = availablePitNumbers[pitIndex % availablePitNumbers.length];
        pitIndex++;
        updateMatchMutation.mutate({ id: match.id, pitNumber: assignedPit });
      } else {
        updateMatchMutation.mutate({ id: match.id, pitNumber: undefined });
      }
    });
  }, [tournaments, updateMatchMutation]);

  const calculateTeamStatsForTournament = useCallback((tournament: Tournament): TeamStats[] => {
    if (!tournament.teams) return [];

    const stats: Record<string, TeamStats> = {};

    tournament.teams.forEach((team) => {
      stats[team.id] = {
        teamId: team.id,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        totalRingers: 0,
        matches: 0,
      };
    });

    matches
      .filter((m) => m.tournamentId === tournament.id && m.status === 'completed')
      .forEach((match) => {
        if (stats[match.team1Id]) {
          stats[match.team1Id].totalPoints += match.team1Score;
          stats[match.team1Id].totalRingers += match.team1Ringers;
          stats[match.team1Id].matches += 1;
          if (match.winnerTeamId === match.team1Id) {
            stats[match.team1Id].wins += 1;
          } else {
            stats[match.team1Id].losses += 1;
          }
        }

        if (stats[match.team2Id]) {
          stats[match.team2Id].totalPoints += match.team2Score;
          stats[match.team2Id].totalRingers += match.team2Ringers;
          stats[match.team2Id].matches += 1;
          if (match.winnerTeamId === match.team2Id) {
            stats[match.team2Id].wins += 1;
          } else {
            stats[match.team2Id].losses += 1;
          }
        }
      });

    return Object.values(stats).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  }, [matches]);

  const calculateSeasonStandings = useCallback((filterByClass?: 'A' | 'B'): PlayerSeasonStats[] => {
    const stats: Record<string, PlayerSeasonStats> = {};

    players.forEach((player) => {
      stats[player.id] = {
        playerId: player.id,
        points: 0,
        tournamentsPlayed: 0,
        firstPlaceFinishes: 0,
        secondPlaceFinishes: 0,
        thirdPlaceFinishes: 0,
      };
    });

    tournaments
      .filter((t) => t.status === 'completed')
      .forEach((tournament) => {
        const isDoubleElimination = tournament.teams && tournament.teams.length >= 10;
        const tournamentTeamStats = calculateTeamStatsForTournament(tournament);
        const participatingPlayerIds = new Set<string>();

        tournament.teams?.forEach((team) => {
          participatingPlayerIds.add(team.player1Id);
          participatingPlayerIds.add(team.player2Id);
        });

        participatingPlayerIds.forEach((playerId) => {
          if (stats[playerId]) {
            stats[playerId].tournamentsPlayed += 1;
            stats[playerId].points += 1;
          }
        });

        let firstPlaceTeam, secondPlaceTeam, thirdPlaceTeam;

        if (isDoubleElimination) {
          const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id && m.status === 'completed');
          
          const eliminatedTeams = tournamentTeamStats
            .filter(stat => stat.losses >= 2)
            .map(stat => {
              const lossMatches = tournamentMatches
                .filter(m => 
                  ((m.team1Id === stat.teamId && m.winnerTeamId !== stat.teamId) ||
                   (m.team2Id === stat.teamId && m.winnerTeamId !== stat.teamId)))
                .sort((m1, m2) => m1.createdAt.localeCompare(m2.createdAt));
              const secondLossMatch = lossMatches.length >= 2 ? lossMatches[1] : lossMatches[0];
              return {
                ...stat,
                eliminationTime: secondLossMatch?.createdAt || ''
              };
            })
            .sort((a, b) => b.eliminationTime.localeCompare(a.eliminationTime));
          
          const activeTeams = tournamentTeamStats.filter(stat => stat.losses < 2);
          
          if (activeTeams.length === 1 && eliminatedTeams.length >= 2) {
            firstPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[0].teamId);
            secondPlaceTeam = tournament.teams?.find(t => t.id === eliminatedTeams[0].teamId);
            thirdPlaceTeam = tournament.teams?.find(t => t.id === eliminatedTeams[1].teamId);
          } else if (activeTeams.length === 2 && eliminatedTeams.length >= 1) {
            firstPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[0].teamId);
            secondPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[1].teamId);
            thirdPlaceTeam = tournament.teams?.find(t => t.id === eliminatedTeams[0].teamId);
          } else if (activeTeams.length >= 3) {
            firstPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[0].teamId);
            secondPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[1].teamId);
            thirdPlaceTeam = tournament.teams?.find(t => t.id === activeTeams[2].teamId);
          }
        } else {
          if (tournamentTeamStats.length > 0) {
            firstPlaceTeam = tournament.teams?.find((t) => t.id === tournamentTeamStats[0].teamId);
          }
          if (tournamentTeamStats.length > 1) {
            secondPlaceTeam = tournament.teams?.find((t) => t.id === tournamentTeamStats[1].teamId);
          }
          if (tournamentTeamStats.length > 2) {
            thirdPlaceTeam = tournament.teams?.find((t) => t.id === tournamentTeamStats[2].teamId);
          }
        }

        if (firstPlaceTeam) {
          if (stats[firstPlaceTeam.player1Id]) {
            stats[firstPlaceTeam.player1Id].points += 10;
            stats[firstPlaceTeam.player1Id].firstPlaceFinishes += 1;
          }
          
          if (stats[firstPlaceTeam.player2Id]) {
            stats[firstPlaceTeam.player2Id].points += 10;
            stats[firstPlaceTeam.player2Id].firstPlaceFinishes += 1;
          }
        }

        if (secondPlaceTeam) {
          if (stats[secondPlaceTeam.player1Id]) {
            stats[secondPlaceTeam.player1Id].points += 5;
            stats[secondPlaceTeam.player1Id].secondPlaceFinishes += 1;
          }
          
          if (stats[secondPlaceTeam.player2Id]) {
            stats[secondPlaceTeam.player2Id].points += 5;
            stats[secondPlaceTeam.player2Id].secondPlaceFinishes += 1;
          }
        }

        if (thirdPlaceTeam) {
          if (stats[thirdPlaceTeam.player1Id]) {
            stats[thirdPlaceTeam.player1Id].points += 3;
            stats[thirdPlaceTeam.player1Id].thirdPlaceFinishes += 1;
          }
          
          if (stats[thirdPlaceTeam.player2Id]) {
            stats[thirdPlaceTeam.player2Id].points += 3;
            stats[thirdPlaceTeam.player2Id].thirdPlaceFinishes += 1;
          }
        }
      });

    return Object.values(stats)
      .map((stat) => {
        const player = players.find((p) => p.id === stat.playerId);
        if (player?.customSeasonPoints !== undefined) {
          return { ...stat, points: stat.points + player.customSeasonPoints };
        }
        return stat;
      })
      .filter((s) => {
        const player = players.find((p) => p.id === s.playerId);
        if (s.tournamentsPlayed === 0 && player?.customSeasonPoints === undefined) return false;
        if (!filterByClass) return true;
        return player?.playerClass === filterByClass;
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.firstPlaceFinishes !== a.firstPlaceFinishes) return b.firstPlaceFinishes - a.firstPlaceFinishes;
        if (b.secondPlaceFinishes !== a.secondPlaceFinishes) return b.secondPlaceFinishes - a.secondPlaceFinishes;
        return b.thirdPlaceFinishes - a.thirdPlaceFinishes;
      });
  }, [players, tournaments, matches, calculateTeamStatsForTournament]);

  const forceReseedData = useCallback(async () => {
    try {
      console.log('💥 Force reseeding data...');
      await seedMutation.mutateAsync();
      console.log('✅ Data restoration complete!');
      return true;
    } catch (error) {
      console.error('❌ Error reseeding data:', error);
      return false;
    }
  }, [seedMutation]);

  const resetTournament = useCallback(async (tournamentId: string) => {
    try {
      console.log('🔄 Resetting tournament...');
      
      const tournamentToReset = tournaments.find(t => t.id === tournamentId);
      if (!tournamentToReset) {
        console.error('Tournament not found');
        return false;
      }
      
      const matchesToDelete = matches.filter(m => m.tournamentId === tournamentId);
      matchesToDelete.forEach(m => deleteMatchMutation.mutate({ id: m.id }));
      
      updateTournamentMutation.mutate({
        id: tournamentId,
        bracketState: undefined,
      });
      
      console.log('✅ Tournament reset complete');
      return true;
    } catch (error) {
      console.error('❌ Error resetting tournament:', error);
      return false;
    }
  }, [tournaments, matches, deleteMatchMutation, updateTournamentMutation]);

  const resetSeason = useCallback(async (seasonName: string) => {
    try {
      console.log('🔄 Resetting season...');
      
      const classAStandings = calculateSeasonStandings('A');
      const classBStandings = calculateSeasonStandings('B');
      
      await createPastSeasonMutation.mutateAsync({
        name: seasonName,
        endDate: new Date().toISOString(),
        classAStandings,
        classBStandings,
      });
      
      players.forEach(p => {
        if (p.customSeasonPoints !== undefined) {
          updatePlayerMutation.mutate({ id: p.id, customSeasonPoints: undefined });
        }
      });
      
      const completedTournaments = tournaments.filter(t => t.status === 'completed');
      completedTournaments.forEach(t => {
        deleteTournamentMutation.mutate({ id: t.id });
      });
      
      console.log('✅ Season reset complete');
      return true;
    } catch (error) {
      console.error('❌ Error resetting season:', error);
      return false;
    }
  }, [players, tournaments, calculateSeasonStandings, createPastSeasonMutation, updatePlayerMutation, deleteTournamentMutation]);

  const clearSeasonLeaderboard = useCallback(async () => {
    try {
      console.log('🗑️  Clearing season leaderboard...');
      
      players.forEach(p => {
        if (p.customSeasonPoints !== undefined) {
          updatePlayerMutation.mutate({ id: p.id, customSeasonPoints: undefined });
        }
      });
      
      const completedTournaments = tournaments.filter(t => t.status === 'completed');
      completedTournaments.forEach(t => {
        deleteTournamentMutation.mutate({ id: t.id });
      });
      
      console.log('✅ Season leaderboard cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing season leaderboard:', error);
      return false;
    }
  }, [players, tournaments, updatePlayerMutation, deleteTournamentMutation]);

  return {
    players,
    tournaments,
    matches,
    sponsors,
    pastSeasons,
    isLoading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addTournament,
    updateTournament,
    deleteTournament,
    addMatch,
    updateMatch,
    deleteMatch,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    generateRoundRobinMatches,
    calculateSeasonStandings,
    forceReseedData,
    resetSeason,
    resetTournament,
    reassignPitsForTournament,
    clearSeasonLeaderboard,
  };
});

export function useSeasonStandings() {
  const { calculateSeasonStandings } = useTournamentData();
  return useMemo(() => calculateSeasonStandings(), [calculateSeasonStandings]);
}

export function useTournamentMatches(tournamentId: string) {
  const { matches } = useTournamentData();
  return useMemo(
    () => matches.filter((m) => m.tournamentId === tournamentId),
    [matches, tournamentId]
  );
}

export function useTeamStats(tournamentId: string): TeamStats[] {
  const { matches, tournaments } = useTournamentData();
  const tournament = tournaments.find((t) => t.id === tournamentId);

  return useMemo(() => {
    if (!tournament || !tournament.teams) return [];

    const stats: Record<string, TeamStats> = {};

    tournament.teams.forEach((team) => {
      stats[team.id] = {
        teamId: team.id,
        wins: 0,
        losses: 0,
        totalPoints: 0,
        totalRingers: 0,
        matches: 0,
      };
    });

    matches
      .filter((m) => m.tournamentId === tournamentId && m.status === 'completed')
      .forEach((match) => {
        if (stats[match.team1Id]) {
          stats[match.team1Id].totalPoints += match.team1Score;
          stats[match.team1Id].totalRingers += match.team1Ringers;
          stats[match.team1Id].matches += 1;
          if (match.winnerTeamId === match.team1Id) {
            stats[match.team1Id].wins += 1;
          } else {
            stats[match.team1Id].losses += 1;
          }
        }

        if (stats[match.team2Id]) {
          stats[match.team2Id].totalPoints += match.team2Score;
          stats[match.team2Id].totalRingers += match.team2Ringers;
          stats[match.team2Id].matches += 1;
          if (match.winnerTeamId === match.team2Id) {
            stats[match.team2Id].wins += 1;
          } else {
            stats[match.team2Id].losses += 1;
          }
        }
      });

    return Object.values(stats).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
  }, [matches, tournament, tournamentId]);
}

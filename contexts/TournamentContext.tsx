import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo } from 'react';
import { Player, Tournament, Match, TeamStats, PlayerSeasonStats, Sponsor, PastSeason } from '@/types/tournament';
import { seedInitialData } from '@/utils/seedData';

const STORAGE_KEYS = {
  PLAYERS: 'horseshoe_players',
  TOURNAMENTS: 'horseshoe_tournaments',
  MATCHES: 'horseshoe_matches',
  SPONSORS: 'horseshoe_sponsors',
  PAST_SEASONS: 'horseshoe_past_seasons',
};

export const [TournamentContext, useTournamentData] = createContextHook(() => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [pastSeasons, setPastSeasons] = useState<PastSeason[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Loading data from AsyncStorage...');
      const [playersData, tournamentsData, matchesData, sponsorsData, pastSeasonsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PLAYERS),
        AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
        AsyncStorage.getItem(STORAGE_KEYS.SPONSORS),
        AsyncStorage.getItem(STORAGE_KEYS.PAST_SEASONS),
      ]);

      const parseJSON = (data: string | null, defaultValue: any[] = []) => {
        if (!data || data === 'null' || data === 'undefined') return defaultValue;
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('JSON parse error for data:', data?.substring(0, 50), e);
          return defaultValue;
        }
      };

      console.log('📦 Storage status:', {
        players: playersData && playersData !== 'null' ? `${parseJSON(playersData).length} found` : 'none',
        tournaments: tournamentsData && tournamentsData !== 'null' ? `${parseJSON(tournamentsData).length} found` : 'none',
        matches: matchesData && matchesData !== 'null' ? `${parseJSON(matchesData).length} found` : 'none',
        sponsors: sponsorsData && sponsorsData !== 'null' ? `${parseJSON(sponsorsData).length} found` : 'none',
        pastSeasons: pastSeasonsData && pastSeasonsData !== 'null' ? `${parseJSON(pastSeasonsData).length} found` : 'none',
      });

      if (!playersData || playersData === 'null' || !tournamentsData || tournamentsData === 'null') {
        console.log('⚠️  No data found, seeding initial data...');
        await seedInitialData();
        const [newPlayersData, newTournamentsData, newMatchesData, newSponsorsData, newPastSeasonsData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PLAYERS),
          AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.MATCHES),
          AsyncStorage.getItem(STORAGE_KEYS.SPONSORS),
          AsyncStorage.getItem(STORAGE_KEYS.PAST_SEASONS),
        ]);
        if (newPlayersData && newPlayersData !== 'null') {
          const parsedPlayers = parseJSON(newPlayersData, []);
          const playersWithMembership = parsedPlayers.map((p: Player) => ({
            ...p,
            hasPaidMembership: p.hasPaidMembership ?? false,
            playerClass: p.playerClass ?? 'B',
          }));
          setPlayers(playersWithMembership);
          console.log(`✅ Loaded ${playersWithMembership.length} players after seeding`);
        }
        if (newTournamentsData && newTournamentsData !== 'null') {
          const tournaments = parseJSON(newTournamentsData, []);
          setTournaments(tournaments);
          console.log(`✅ Loaded ${tournaments.length} tournaments after seeding`);
        }
        if (newMatchesData && newMatchesData !== 'null') {
          const matches = parseJSON(newMatchesData, []);
          setMatches(matches);
          console.log(`✅ Loaded ${matches.length} matches after seeding`);
        }
        if (newSponsorsData && newSponsorsData !== 'null') {
          const sponsors = parseJSON(newSponsorsData, []);
          setSponsors(sponsors);
          console.log(`✅ Loaded ${sponsors.length} sponsors after seeding`);
        }
        if (newPastSeasonsData && newPastSeasonsData !== 'null') {
          const pastSeasons = parseJSON(newPastSeasonsData, []);
          setPastSeasons(pastSeasons);
          console.log(`✅ Loaded ${pastSeasons.length} past seasons after seeding`);
        }
      } else {
        if (playersData && playersData !== 'null') {
          const parsedPlayers = parseJSON(playersData, []);
          const playersWithMembership = parsedPlayers.map((p: Player) => ({
            ...p,
            hasPaidMembership: p.hasPaidMembership ?? false,
            playerClass: p.playerClass ?? 'B',
          }));
          setPlayers(playersWithMembership);
          console.log(`✅ Loaded ${playersWithMembership.length} players from storage`);
        }
        if (tournamentsData && tournamentsData !== 'null') {
          const tournaments = parseJSON(tournamentsData, []);
          setTournaments(tournaments);
          console.log(`✅ Loaded ${tournaments.length} tournaments from storage`);
        }
        if (matchesData && matchesData !== 'null') {
          const matches = parseJSON(matchesData, []);
          setMatches(matches);
          console.log(`✅ Loaded ${matches.length} matches from storage`);
        }
        if (sponsorsData && sponsorsData !== 'null') {
          const sponsors = parseJSON(sponsorsData, []);
          setSponsors(sponsors);
          console.log(`✅ Loaded ${sponsors.length} sponsors from storage`);
        }
        if (pastSeasonsData && pastSeasonsData !== 'null') {
          const pastSeasons = parseJSON(pastSeasonsData, []);
          setPastSeasons(pastSeasons);
          console.log(`✅ Loaded ${pastSeasons.length} past seasons from storage`);
        }
      }
      console.log('✅ Data loading completed successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (
    newPlayers?: Player[],
    newTournaments?: Tournament[],
    newMatches?: Match[],
    newSponsors?: Sponsor[],
    newPastSeasons?: PastSeason[]
  ) => {
    try {
      const promises = [];
      if (newPlayers !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(newPlayers)));
      }
      if (newTournaments !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(newTournaments)));
      }
      if (newMatches !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(newMatches)));
      }
      if (newSponsors !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(newSponsors)));
      }
      if (newPastSeasons !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.PAST_SEASONS, JSON.stringify(newPastSeasons)));
      }
      await Promise.all(promises);
      console.log('Data saved successfully:', { 
        players: newPlayers !== undefined ? newPlayers.length : 'not updated',
        tournaments: newTournaments !== undefined ? newTournaments.length : 'not updated',
        matches: newMatches !== undefined ? newMatches.length : 'not updated',
        sponsors: newSponsors !== undefined ? newSponsors.length : 'not updated',
        pastSeasons: newPastSeasons !== undefined ? newPastSeasons.length : 'not updated'
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addPlayer = (player: Omit<Player, 'id' | 'createdAt'>) => {
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    saveData(updated, undefined, undefined);
    return newPlayer;
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    const updated = players.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPlayers(updated);
    saveData(updated, undefined, undefined);
  };

  const deletePlayer = (id: string) => {
    const updated = players.filter((p) => p.id !== id);
    setPlayers(updated);
    saveData(updated, undefined, undefined);
  };

  const addTournament = (tournament: Omit<Tournament, 'id' | 'createdAt'>) => {
    const newTournament: Tournament = {
      ...tournament,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...tournaments, newTournament];
    setTournaments(updated);
    saveData(undefined, updated, undefined);

    return newTournament;
  };

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
    const updated = tournaments.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTournaments(updated);
    saveData(undefined, updated, undefined);
  };

  const deleteTournament = (id: string) => {
    const updated = tournaments.filter((t) => t.id !== id);
    const updatedMatches = matches.filter((m) => m.tournamentId !== id);
    setTournaments(updated);
    setMatches(updatedMatches);
    saveData(undefined, updated, updatedMatches);
  };

  const addMatch = (match: Omit<Match, 'id' | 'createdAt'>) => {
    const newMatch: Match = {
      ...match,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...matches, newMatch];
    setMatches(updated);
    saveData(undefined, undefined, updated);
    return newMatch;
  };

  const updateMatch = (id: string, updates: Partial<Match>) => {
    const updated = matches.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setMatches(updated);
    saveData(undefined, undefined, updated);
    
    const match = matches.find(m => m.id === id);
    if (match && updates.status === 'completed' && match.pitNumber) {
      reassignPitsForTournament(match.tournamentId, updated);
    }
  };

  const deleteMatch = (id: string) => {
    const updated = matches.filter((m) => m.id !== id);
    setMatches(updated);
    saveData(undefined, undefined, updated);
  };

  const addSponsor = (sponsor: Omit<Sponsor, 'id' | 'createdAt'>) => {
    const newSponsor: Sponsor = {
      ...sponsor,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...sponsors, newSponsor];
    setSponsors(updated);
    saveData(undefined, undefined, undefined, updated);
    return newSponsor;
  };

  const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
    const updated = sponsors.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSponsors(updated);
    saveData(undefined, undefined, undefined, updated);
  };

  const deleteSponsor = (id: string) => {
    const updated = sponsors.filter((s) => s.id !== id);
    setSponsors(updated);
    saveData(undefined, undefined, undefined, updated);
  };



  const generateRoundRobinMatches = (tournamentId: string, forceRegenerate: boolean = false) => {
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
      const filteredMatches = matches.filter((m) => m.tournamentId !== tournamentId);
      setMatches(filteredMatches);
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
    if (isDoubleRoundRobin) {
      console.log(`Expected: ${2 * (n - 1)} rounds, ${n * (n - 1)} total matches, ${2 * (n - 1)} games per team`);
    } else {
      console.log(`Expected: ${n - 1} rounds, ${n * (n - 1) / 2} total matches, ${n - 1} games per team`);
    }

    const roundRobinMatches: Match[] = [];
    const baseTimestamp = Date.now();
    let matchCounter = 0;
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
        console.log(`\n=== Round ${globalRoundNumber} ${isDoubleRoundRobin ? `(Cycle ${cycle + 1})` : ''} ===`);
        let matchInRound = 0;

        for (let i = 0; i < half; i++) {
          const team1 = teamsRotate[i];
          const team2 = teamsRotate[cycleTeams.length - 1 - i];

          if (team1.id !== 'BYE' && team2.id !== 'BYE') {
            matchInRound++;
            
            const pitNumber = availablePits > 0 ? ((pitAssignmentCounter % availablePits) + 1) : undefined;
            if (pitNumber) {
              pitAssignmentCounter++;
            }
            
            const newMatch: Match = {
              id: `${baseTimestamp}-${matchCounter++}`,
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
              createdAt: new Date().toISOString(),
            };
            roundRobinMatches.push(newMatch);
            const pitInfo = pitNumber ? ` @ Pit ${pitNumber}` : '';
            console.log(`  Match ${matchInRound}: ${team1.id.substring(0, 8)} vs ${team2.id.substring(0, 8)} (to ${targetPoints} pts)${pitInfo}`);
          }
        }

        const lastTeam = teamsRotate.pop()!;
        teamsRotate.splice(1, 0, lastTeam);
      }
    }

    const updatedMatches = forceRegenerate 
      ? [...matches.filter((m) => m.tournamentId !== tournamentId), ...roundRobinMatches]
      : [...matches, ...roundRobinMatches];
      
    setMatches(updatedMatches);
    saveData(undefined, undefined, updatedMatches);

    console.log(`\n✓ SUCCESS: Generated ${roundRobinMatches.length} ${roundType} round-robin matches (to ${targetPoints} points)`);
    console.log(`✓ Total rounds: ${globalRoundNumber}`);
    console.log(`✓ Each team plays ${isDoubleRoundRobin ? 2 * (n - 1) : n - 1} games`);
    console.log(`✓ Total matches: ${roundRobinMatches.length}`);
    console.log(`✓ Expected matches: ${isDoubleRoundRobin ? n * (n - 1) : n * (n - 1) / 2}`);
    
    const matchCountByRound: Record<number, number> = {};
    roundRobinMatches.forEach(m => {
      matchCountByRound[m.round] = (matchCountByRound[m.round] || 0) + 1;
    });
    console.log('Matches per round:', matchCountByRound);
    
    return roundRobinMatches;
  };



  const reassignPitsForTournament = (tournamentId: string, allMatches: Match[]) => {
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
    
    console.log(`🔄 Reassigning pits - Available: [${availablePitNumbers.join(', ')}], In use: [${Array.from(usedPits).join(', ')}]`);
    
    const sortedPendingMatches = [...pendingMatches].sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.createdAt.localeCompare(b.createdAt);
    });
    
    let pitIndex = 0;
    const updatedMatches = allMatches.map(match => {
      if (match.tournamentId === tournamentId && match.status === 'pending') {
        const matchIndex = sortedPendingMatches.findIndex(m => m.id === match.id);
        if (matchIndex < availablePitNumbers.length) {
          const assignedPit = availablePitNumbers[pitIndex % availablePitNumbers.length];
          pitIndex++;
          console.log(`  → Assigning match ${match.id.substring(0, 8)} (Round ${match.round}) to Pit ${assignedPit}`);
          return { ...match, pitNumber: assignedPit };
        } else {
          return { ...match, pitNumber: undefined };
        }
      }
      return match;
    });
    
    setMatches(updatedMatches);
    saveData(undefined, undefined, updatedMatches);
  };

  const calculateTeamStatsForTournament = (tournament: Tournament): TeamStats[] => {
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
  };

  const calculateSeasonStandings = (filterByClass?: 'A' | 'B'): PlayerSeasonStats[] => {
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
  };

  const forceReseedData = async () => {
    try {
      console.log('💥 Force reseeding data...');
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PLAYERS),
        AsyncStorage.removeItem(STORAGE_KEYS.TOURNAMENTS),
        AsyncStorage.removeItem(STORAGE_KEYS.MATCHES),
        AsyncStorage.removeItem(STORAGE_KEYS.SPONSORS),
        AsyncStorage.removeItem(STORAGE_KEYS.PAST_SEASONS),
      ]);
      console.log('🗑️  Cleared all existing data');
      
      await seedInitialData();
      console.log('✅ Seeding complete, reloading data...');
      
      await loadData();
      console.log('✅ Data restoration complete!');
      return true;
    } catch (error) {
      console.error('❌ Error reseeding data:', error);
      return false;
    }
  };

  const resetTournament = async (tournamentId: string) => {
    try {
      console.log('🔄 Resetting tournament...');
      
      const tournamentToReset = tournaments.find(t => t.id === tournamentId);
      if (!tournamentToReset) {
        console.error('Tournament not found');
        return false;
      }
      
      const updatedMatches = matches.filter(m => m.tournamentId !== tournamentId);
      setMatches(updatedMatches);
      
      const updatedTournament = {
        ...tournamentToReset,
        bracketState: undefined,
      };
      const updatedTournaments = tournaments.map(t => 
        t.id === tournamentId ? updatedTournament : t
      );
      setTournaments(updatedTournaments);
      
      await saveData(undefined, updatedTournaments, updatedMatches);
      
      console.log('✅ Tournament reset complete');
      return true;
    } catch (error) {
      console.error('❌ Error resetting tournament:', error);
      return false;
    }
  };

  const resetSeason = async (seasonName: string) => {
    try {
      console.log('🔄 Resetting season...');
      
      const classAStandings = calculateSeasonStandings('A');
      const classBStandings = calculateSeasonStandings('B');
      
      const newPastSeason: PastSeason = {
        id: Date.now().toString(),
        name: seasonName,
        endDate: new Date().toISOString(),
        classAStandings,
        classBStandings,
        createdAt: new Date().toISOString(),
      };
      
      const updatedPastSeasons = [newPastSeason, ...pastSeasons];
      setPastSeasons(updatedPastSeasons);
      
      const updatedPlayers = players.map(p => ({
        ...p,
        customSeasonPoints: undefined,
      }));
      setPlayers(updatedPlayers);
      
      const completedTournaments = tournaments.filter(t => t.status === 'completed');
      const otherTournaments = tournaments.filter(t => t.status !== 'completed');
      setTournaments(otherTournaments);
      
      const completedTournamentIds = new Set(completedTournaments.map(t => t.id));
      const updatedMatches = matches.filter(m => !completedTournamentIds.has(m.tournamentId));
      setMatches(updatedMatches);
      
      await saveData(updatedPlayers, otherTournaments, updatedMatches, undefined, updatedPastSeasons);
      
      console.log('✅ Season reset complete');
      console.log(`📊 Saved ${classAStandings.length} Class A and ${classBStandings.length} Class B standings`);
      console.log(`🗑️  Removed ${completedTournaments.length} completed tournaments`);
      return true;
    } catch (error) {
      console.error('❌ Error resetting season:', error);
      return false;
    }
  };

  const clearSeasonLeaderboard = async () => {
    try {
      console.log('🗑️  Clearing season leaderboard...');
      
      const updatedPlayers = players.map(p => ({
        ...p,
        customSeasonPoints: undefined,
      }));
      setPlayers(updatedPlayers);
      
      const activeTournaments = tournaments.filter(t => t.status !== 'completed');
      setTournaments(activeTournaments);
      
      const activeTournamentIds = new Set(activeTournaments.map(t => t.id));
      const updatedMatches = matches.filter(m => activeTournamentIds.has(m.tournamentId));
      setMatches(updatedMatches);
      
      await saveData(updatedPlayers, activeTournaments, updatedMatches);
      
      console.log('✅ Season leaderboard cleared');
      console.log(`🗑️  Removed all completed tournaments and their matches`);
      return true;
    } catch (error) {
      console.error('❌ Error clearing season leaderboard:', error);
      return false;
    }
  };

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

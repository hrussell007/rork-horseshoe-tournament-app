import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Trophy, Plus, Medal, Users, Trash2, Edit2, CheckCircle, X, Tv } from 'lucide-react-native';
import { useTournamentData, useTournamentMatches, useTeamStats } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { Team } from '@/types/tournament';

interface SwipeableMatchRowProps {
  match: any;
  getTeamName: (teamId: string) => string;
  onPress: () => void;
  onDelete: () => void;
}

function SwipeableMatchRow({ match, getTeamName, onPress, onDelete }: SwipeableMatchRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isPending = match.status === 'pending';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isPending,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isPending && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          Animated.timing(translateX, {
            toValue: -80,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            onDelete();
          }}
        >
          <Trash2 size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.matchRowAnimated,
          {
            transform: [{ translateX }],
          },
        ]}
        {...(isPending ? panResponder.panHandlers : {})}
      >
        <TouchableOpacity
          style={styles.matchRow}
          onPress={onPress}
          testID={`match-${match.id}`}
        >
          <View style={styles.matchInfo}>
            <Text style={styles.matchPlayers}>
              {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
            </Text>
            <Text style={styles.matchScore}>
              {match.team1Score} - {match.team2Score}{match.targetPoints ? ` (to ${match.targetPoints})` : ''}{match.pitNumber ? ` • Pit ${match.pitNumber}` : ''}
            </Text>
          </View>
          <View
            style={[
              styles.matchStatus,
              match.status === 'completed' && styles.matchStatusCompleted,
              match.status === 'in_progress' && styles.matchStatusActive,
            ]}
          >
            <Text
              style={[
                styles.matchStatusText,
                match.status === 'completed' && styles.matchStatusTextCompleted,
                match.status === 'in_progress' && styles.matchStatusTextActive,
              ]}
            >
              {match.status === 'pending' && 'Pending'}
              {match.status === 'in_progress' && 'In Progress'}
              {match.status === 'completed' && 'Completed'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { tournaments, players, addMatch, updateTournament, deleteMatch, generateRoundRobinMatches, resetTournament } = useTournamentData();
  const matches = useTournamentMatches(id);
  const teamStats = useTeamStats(id);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showTeamSelector, setShowTeamSelector] = useState<boolean>(false);
  const [showTeamSetup, setShowTeamSetup] = useState<boolean>(false);
  const [numTeams, setNumTeams] = useState<string>('');
  const [setupTeams, setSetupTeams] = useState<Team[]>([]);
  const [selectingTeamIndex, setSelectingTeamIndex] = useState<number | null>(null);
  const [currentTeam, setCurrentTeam] = useState<{ player1Id: string; player2Id: string }>({ player1Id: '', player2Id: '' });
  const [setupStep, setSetupStep] = useState<'count' | 'assign'>('count');

  const tournament = tournaments.find((t) => t.id === id);

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Tournament not found</Text>
      </View>
    );
  }

  const prizePool = tournament.entryFee * (tournament.teams?.length || 0) * 2;

  const handleCreateMatch = () => {
    if (!tournament.teams || tournament.teams.length < 2) {
      Alert.alert('Error', 'Need at least 2 teams');
      return;
    }
    setSelectedTeams([]);
    setShowTeamSelector(true);
  };

  const handleTeamSelect = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter((id) => id !== teamId));
    } else if (selectedTeams.length < 2) {
      const newSelected = [...selectedTeams, teamId];
      setSelectedTeams(newSelected);
      
      if (newSelected.length === 2) {
        addMatch({
          tournamentId: tournament.id,
          team1Id: newSelected[0],
          team2Id: newSelected[1],
          team1Score: 0,
          team2Score: 0,
          team1Ringers: 0,
          team2Ringers: 0,
          status: 'pending',
          round: matches.length + 1,
        });
        setShowTeamSelector(false);
        setSelectedTeams([]);
        Alert.alert('Match Created', 'Match has been created successfully');
      }
    }
  };

  const handleViewMatch = (matchId: string) => {
    router.push(`/match/${matchId}` as any);
  };

  const handleCompleteTournament = () => {
    Alert.alert('Complete Tournament', 'Mark this tournament as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          updateTournament(tournament.id, { status: 'completed' });
          Alert.alert('Success', 'Tournament completed!');
        },
      },
    ]);
  };

  const handleResetTournament = () => {
    Alert.alert(
      'Reset Tournament',
      'This will delete all matches, clear all wins/losses, and reset the bracket. This cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetTournament(tournament.id);
            if (success) {
              Alert.alert('Success', 'Tournament has been reset!');
            } else {
              Alert.alert('Error', 'Failed to reset tournament');
            }
          },
        },
      ]
    );
  };

  const handleOpenTeamSetup = () => {
    setSetupTeams(tournament.teams || []);
    setNumTeams((tournament.teams?.length || 0).toString());
    setSetupStep(tournament.teams && tournament.teams.length > 0 ? 'assign' : 'count');
    setShowTeamSetup(true);
  };

  const createEmptyTeams = () => {
    const count = parseInt(numTeams);
    if (isNaN(count) || count < 2) {
      Alert.alert('Error', 'Enter at least 2 teams');
      return;
    }
    const paidPlayers = players.filter(p => p.hasPaidMembership);
    if (count > paidPlayers.length / 2) {
      Alert.alert('Error', `You need at least ${count * 2} players with paid membership for ${count} teams`);
      return;
    }
    const emptyTeams: Team[] = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      player1Id: '',
      player2Id: '',
      name: `Team ${i + 1}`,
    }));
    setSetupTeams(emptyTeams);
    setSetupStep('assign');
  };

  const handleSelectTeam = (index: number) => {
    setSelectingTeamIndex(index);
    setCurrentTeam({ 
      player1Id: setupTeams[index]?.player1Id || '', 
      player2Id: setupTeams[index]?.player2Id || '' 
    });
  };

  const handleConfirmTeam = () => {
    if (selectingTeamIndex === null) return;
    
    if (!currentTeam.player1Id || !currentTeam.player2Id) {
      Alert.alert('Error', 'Select both players for the team');
      return;
    }
    if (currentTeam.player1Id === currentTeam.player2Id) {
      Alert.alert('Error', 'Players must be different');
      return;
    }
    
    const player1 = players.find((p) => p.id === currentTeam.player1Id);
    const player2 = players.find((p) => p.id === currentTeam.player2Id);
    
    const updatedTeams = [...setupTeams];
    updatedTeams[selectingTeamIndex] = {
      ...updatedTeams[selectingTeamIndex],
      player1Id: currentTeam.player1Id,
      player2Id: currentTeam.player2Id,
      name: `${player1?.name || 'Unknown'} & ${player2?.name || 'Unknown'}`,
    };
    
    setSetupTeams(updatedTeams);
    setSelectingTeamIndex(null);
    setCurrentTeam({ player1Id: '', player2Id: '' });
  };

  const handleClearTeam = (index: number) => {
    const updatedTeams = [...setupTeams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      player1Id: '',
      player2Id: '',
      name: `Team ${index + 1}`,
    };
    setSetupTeams(updatedTeams);
  };

  const isPlayerInTeam = (playerId: string) => {
    return setupTeams.some((t, i) => {
      if (i === selectingTeamIndex) return false;
      return t.player1Id === playerId || t.player2Id === playerId;
    });
  };

  const getAvailablePlayers = () => {
    return players.filter((p) => !isPlayerInTeam(p.id));
  };

  const getPaidPlayers = () => {
    return getAvailablePlayers().filter((p) => p.hasPaidMembership);
  };

  const getClassAPlayers = () => {
    return getPaidPlayers().filter((p) => p.playerClass === 'A');
  };

  const getClassBPlayers = () => {
    return getPaidPlayers().filter((p) => p.playerClass === 'B');
  };

  // Removed unused getUnpaidPlayers function

  const isTeamComplete = (team: Team) => {
    return team.player1Id !== '' && team.player2Id !== '';
  };

  const handleSaveTeamSetup = () => {
    const allTeamsComplete = setupTeams.every((team) => isTeamComplete(team));
    
    if (!allTeamsComplete) {
      Alert.alert('Error', 'Please complete all team assignments before saving');
      return;
    }

    updateTournament(tournament.id, { teams: setupTeams });
    
    if (setupTeams.length <= 8) {
      const existingMatches = matches.filter(m => m.tournamentId === tournament.id);
      const isDoubleRoundRobin = setupTeams.length === 4 || setupTeams.length === 5;
      const expectedGames = isDoubleRoundRobin ? 2 * (setupTeams.length - 1) : setupTeams.length - 1;
      const formatType = isDoubleRoundRobin ? 'double round-robin' : 'single round-robin';
      const targetPoints = setupTeams.length === 5 || setupTeams.length === 8 ? 21 : 30;
      
      if (existingMatches.length === 0) {
        const generatedMatches = generateRoundRobinMatches(tournament.id, false);
        if (generatedMatches) {
          setShowTeamSetup(false);
          Alert.alert(
            'Success',
            `Teams saved and ${generatedMatches.length} ${formatType} matches generated!\n\n✓ ${setupTeams.length} teams\n✓ ${generatedMatches.length} total games\n✓ Each team plays ${expectedGames} games\n✓ Games to ${targetPoints} points`,
            [{ text: 'OK' }]
          );
        } else {
          setShowTeamSetup(false);
          Alert.alert('Success', 'Teams updated successfully!');
        }
      } else {
        setShowTeamSetup(false);
        Alert.alert(
          'Matches Already Exist',
          `Teams updated. ${existingMatches.length} matches already exist for this tournament.\n\nDo you want to regenerate the ${formatType} schedule?`,
          [
            { 
              text: 'Keep Existing', 
              style: 'cancel'
            },
            {
              text: 'Regenerate',
              style: 'destructive',
              onPress: () => {
                const generatedMatches = generateRoundRobinMatches(tournament.id, true);
                if (generatedMatches) {
                  Alert.alert(
                    'Success',
                    `${generatedMatches.length} ${formatType} matches regenerated!\n\n✓ ${setupTeams.length} teams\n✓ ${generatedMatches.length} total games\n✓ Each team plays ${expectedGames} games\n✓ Games to ${targetPoints} points`,
                    [{ text: 'OK' }]
                  );
                }
              }
            }
          ]
        );
      }
    } else if (setupTeams.length >= 10) {
      setShowTeamSetup(false);
      Alert.alert(
        'Success',
        `Teams saved! This tournament has ${setupTeams.length} teams.\n\nA double-elimination bracket has been generated.\nTap "View Bracket" to see the tournament structure.`,
        [{ text: 'OK' }]
      );
    } else {
      setShowTeamSetup(false);
      Alert.alert('Success', 'Teams updated successfully!\n\nNote: 10+ teams required for double-elimination bracket.\nYou can create matches manually or add more teams.');
    }
  };

  const getTeamName = (teamId: string) => {
    const team = tournament.teams?.find((t) => t.id === teamId);
    if (!team) return 'Unknown Team';
    const player1 = players.find((p) => p.id === team.player1Id);
    const player2 = players.find((p) => p.id === team.player2Id);
    return `${player1?.name || 'Unknown'} & ${player2?.name || 'Unknown'}`;
  };

  const calculatePayout = (place: number) => {
    if (place === 1) {
      return prizePool * 0.5;
    }
    if (place === 2) {
      return prizePool * 0.3;
    }
    if (place === 3) {
      return prizePool * 0.2;
    }
    return 0;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: tournament.name,
          headerBackTitle: 'Back',
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 16 }}>
              {tournament.status === 'active' && (
                <TouchableOpacity
                  onPress={() => router.push(`/scoreboard?id=${tournament.id}`)}
                  testID="view-scoreboard-button"
                >
                  <Tv size={22} color={Colors.light.tint} />
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity
                  onPress={handleOpenTeamSetup}
                  testID="edit-tournament-button"
                >
                  <Edit2 size={22} color={Colors.light.tint} />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {tournament.teams && tournament.teams.length >= 10 && (
            <View style={styles.bracketBanner}>
              <View style={styles.bracketBannerContent}>
                <Trophy size={32} color={Colors.light.tint} />
                <View style={styles.bracketBannerText}>
                  <Text style={styles.bracketBannerTitle}>Double Elimination Bracket</Text>
                  <Text style={styles.bracketBannerSubtitle}>
                    {tournament.teams.length} teams • Bracket generated
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewBracketButton}
                onPress={() => router.push(`/bracket/${tournament.id}` as any)}
                testID="view-bracket-button"
              >
                <Text style={styles.viewBracketButtonText}>View Bracket</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tournament Info</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Entry Fee:</Text>
                <Text style={styles.infoValue}>${tournament.entryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prize Pool:</Text>
                <Text style={styles.infoValue}>${prizePool.toFixed(2)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teams:</Text>
                <Text style={styles.infoValue}>{tournament.teams?.length || 0}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Format:</Text>
                <Text style={styles.infoValue}>
                  {tournament.teams && tournament.teams.length >= 10
                    ? 'Double Elimination'
                    : tournament.teams && tournament.teams.length >= 4 && tournament.teams.length <= 8
                    ? 'Round Robin'
                    : 'Custom'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Standings</Text>
              <View style={styles.sectionHeaderRight}>
                {isAdmin && matches.length > 0 && (
                  <TouchableOpacity
                    onPress={handleResetTournament}
                    style={styles.resetButton}
                    testID="reset-tournament-button"
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                )}
                <Trophy size={24} color={Colors.light.accent} />
              </View>
            </View>
            <View style={styles.standingsCard}>
              {teamStats.length === 0 ? (
                <Text style={styles.emptyText}>No matches played yet</Text>
              ) : (
                (() => {
                  const isDoubleElimination = tournament.teams && tournament.teams.length >= 10;
                  
                  if (isDoubleElimination) {
                    const eliminatedTeams = teamStats
                      .filter(stat => stat.losses >= 2)
                      .map(stat => {
                        const lossMatches = matches
                          .filter(m => m.status === 'completed' && 
                            ((m.team1Id === stat.teamId && m.winnerTeamId !== stat.teamId) ||
                             (m.team2Id === stat.teamId && m.winnerTeamId !== stat.teamId)))
                          .sort((m1, m2) => m1.createdAt.localeCompare(m2.createdAt));
                        const secondLossMatch = lossMatches.length >= 2 ? lossMatches[1] : lossMatches[0];
                        return {
                          ...stat,
                          eliminationTime: secondLossMatch?.createdAt || ''
                        };
                      })
                      .sort((a, b) => a.eliminationTime.localeCompare(b.eliminationTime));
                    
                    const activeTeams = teamStats.filter(stat => stat.losses < 2);
                    
                    const allTeamsSorted: (typeof teamStats[0] & { finalPlace?: number })[] = [];
                    
                    activeTeams.forEach(team => {
                      allTeamsSorted.push(team);
                    });
                    
                    eliminatedTeams.forEach((team, idx) => {
                      const place = tournament.teams!.length - idx;
                      allTeamsSorted.push({
                        ...team,
                        finalPlace: place
                      });
                    });
                    
                    allTeamsSorted.sort((a, b) => {
                      const rankA = a.losses >= 2 && 'finalPlace' in a ? a.finalPlace! : activeTeams.findIndex(t => t.teamId === a.teamId) + 1;
                      const rankB = b.losses >= 2 && 'finalPlace' in b ? b.finalPlace! : activeTeams.findIndex(t => t.teamId === b.teamId) + 1;
                      return rankA - rankB;
                    });
                    
                    return allTeamsSorted.map((stat, index) => {
                      const isEliminated = stat.losses >= 2;
                      const displayRank = isEliminated && 'finalPlace' in stat ? stat.finalPlace! : activeTeams.indexOf(stat) + 1;
                      const payoutPerTeam = calculatePayout(displayRank);
                      const payoutPerPlayer = payoutPerTeam / 2;
                      
                      return (
                        <View key={stat.teamId} style={styles.standingRow}>
                          <View style={styles.standingLeft}>
                            <View
                              style={[
                                styles.rankBadge,
                                displayRank === 1 && styles.rank1Badge,
                                displayRank === 2 && styles.rank2Badge,
                                displayRank === 3 && styles.rank3Badge,
                                isEliminated && styles.rankBadgeEliminated,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.rankText,
                                  displayRank <= 3 && !isEliminated && styles.rankTextHighlight,
                                  isEliminated && styles.rankTextEliminated,
                                ]}
                              >
                                {displayRank}
                              </Text>
                            </View>
                            <View style={styles.playerStandingInfo}>
                              <Text style={[
                                styles.playerStandingName,
                                isEliminated && styles.playerStandingNameEliminated,
                              ]}>
                                {getTeamName(stat.teamId)}
                              </Text>
                              <Text style={styles.playerStandingStats}>
                                {stat.wins}W-{stat.losses}L • {stat.totalPoints} pts {isEliminated && '• Eliminated'}
                              </Text>
                            </View>
                          </View>
                          {displayRank <= 3 && payoutPerTeam > 0 && !isEliminated && (
                            <View style={styles.payoutColumn}>
                              <View style={styles.payoutBadge}>
                                <Medal size={16} color={Colors.light.success} />
                                <Text style={styles.payoutText}>${payoutPerPlayer.toFixed(2)}/ea</Text>
                              </View>
                              <Text style={styles.payoutSubtext}>Team: ${payoutPerTeam.toFixed(2)}</Text>
                            </View>
                          )}
                        </View>
                      );
                    });
                  }
                  
                  let currentRank = 1;
                  return teamStats.map((stat, index) => {
                    const prevStat = index > 0 ? teamStats[index - 1] : null;
                    const isSameRank = prevStat && 
                      prevStat.wins === stat.wins && 
                      prevStat.losses === stat.losses;
                    
                    if (!isSameRank && index > 0) {
                      currentRank = index + 1;
                    }
                    
                    const displayRank = currentRank;
                    const payoutPerTeam = calculatePayout(displayRank);
                    const payoutPerPlayer = payoutPerTeam / 2;
                    
                    return (
                      <View key={stat.teamId} style={styles.standingRow}>
                        <View style={styles.standingLeft}>
                          <View
                            style={[
                              styles.rankBadge,
                              displayRank === 1 && styles.rank1Badge,
                              displayRank === 2 && styles.rank2Badge,
                              displayRank === 3 && styles.rank3Badge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.rankText,
                                displayRank <= 3 && styles.rankTextHighlight,
                              ]}
                            >
                              {displayRank}
                            </Text>
                          </View>
                          <View style={styles.playerStandingInfo}>
                            <Text style={styles.playerStandingName}>
                              {getTeamName(stat.teamId)}
                            </Text>
                            <Text style={styles.playerStandingStats}>
                              {stat.wins}W-{stat.losses}L • {stat.totalPoints} pts
                            </Text>
                          </View>
                        </View>
                        {displayRank <= 3 && payoutPerTeam > 0 && (
                          <View style={styles.payoutColumn}>
                            <View style={styles.payoutBadge}>
                              <Medal size={16} color={Colors.light.success} />
                              <Text style={styles.payoutText}>${payoutPerPlayer.toFixed(2)}/ea</Text>
                            </View>
                            <Text style={styles.payoutSubtext}>Team: ${payoutPerTeam.toFixed(2)}</Text>
                          </View>
                        )}
                      </View>
                    );
                  });
                })()
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matches</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleCreateMatch}
                  testID="create-match-button"
                >
                  <Plus size={20} color={Colors.light.tint} />
                  <Text style={styles.addButtonText}>New Match</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {showTeamSelector && (
              <View style={styles.teamSelectorCard}>
                <View style={styles.teamSelectorHeader}>
                  <Text style={styles.teamSelectorTitle}>
                    Select 2 teams to create a match
                  </Text>
                  <Text style={styles.teamSelectorSubtitle}>
                    Selected: {selectedTeams.length}/2
                  </Text>
                </View>
                <ScrollView style={styles.teamList}>
                  {tournament.teams?.map((team) => {
                    const isSelected = selectedTeams.includes(team.id);
                    return (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.teamSelectorItem,
                          isSelected && styles.teamSelectorItemSelected,
                        ]}
                        onPress={() => handleTeamSelect(team.id)}
                        testID={`team-selector-${team.id}`}
                      >
                        <Users 
                          size={24} 
                          color={isSelected ? Colors.light.tint : Colors.light.textSecondary} 
                        />
                        <Text style={[
                          styles.teamSelectorItemText,
                          isSelected && styles.teamSelectorItemTextSelected,
                        ]}>
                          {getTeamName(team.id)}
                        </Text>
                        {isSelected && (
                          <View style={styles.teamSelectedBadge}>
                            <Text style={styles.teamSelectedBadgeText}>
                              {selectedTeams.indexOf(team.id) + 1}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowTeamSelector(false);
                    setSelectedTeams([]);
                  }}
                  testID="cancel-team-selection"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.matchesCard}>
              {matches.length === 0 ? (
                <Text style={styles.emptyText}>No matches yet</Text>
              ) : (() => {
                const matchesByRound: Record<number, typeof matches> = {};
                matches.forEach((match) => {
                  if (!matchesByRound[match.round]) {
                    matchesByRound[match.round] = [];
                  }
                  matchesByRound[match.round].push(match);
                });
                const sortedRounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
                
                return sortedRounds.map((roundNum) => (
                  <View key={roundNum} style={styles.roundSection}>
                    <View style={styles.roundHeader}>
                      <Text style={styles.roundTitle}>Round {roundNum}</Text>
                      <Text style={styles.roundSubtitle}>
                        {matchesByRound[roundNum].length} {matchesByRound[roundNum].length === 1 ? 'match' : 'matches'}
                      </Text>
                    </View>
                    {matchesByRound[roundNum].map((match) => (
                      <SwipeableMatchRow
                        key={match.id}
                        match={match}
                        getTeamName={getTeamName}
                        onPress={() => handleViewMatch(match.id)}
                        onDelete={() => {
                          if (match.status === 'pending') {
                            Alert.alert(
                              'Delete Match',
                              'Are you sure you want to delete this match?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Delete',
                                  style: 'destructive',
                                  onPress: () => deleteMatch(match.id),
                                },
                              ]
                            );
                          }
                        }}
                      />
                    ))}
                  </View>
                ));
              })()}
            </View>
          </View>

          {tournament.status === 'active' && isAdmin && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTournament}
              testID="complete-tournament-button"
            >
              <Text style={styles.completeButtonText}>Complete Tournament</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <Modal
          visible={showTeamSetup}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTeamSetup(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tournament Setup</Text>
                <TouchableOpacity
                  onPress={() => setShowTeamSetup(false)}
                  testID="close-setup-modal"
                >
                  <X size={24} color={Colors.light.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {setupStep === 'count' ? (
                  <View style={styles.teamCountSection}>
                    <Text style={styles.setupLabel}>Number of Teams</Text>
                    <TextInput
                      style={styles.setupInput}
                      value={numTeams}
                      onChangeText={setNumTeams}
                      placeholder="Enter number of teams"
                      placeholderTextColor={Colors.light.tabIconDefault}
                      keyboardType="number-pad"
                      testID="setup-num-teams-input"
                    />
                    <Text style={styles.helperText}>
                      Available players: {players.filter(p => p.hasPaidMembership).length} (Max {Math.floor(players.filter(p => p.hasPaidMembership).length / 2)} teams)
                    </Text>
                    {players.filter(p => !p.hasPaidMembership).length > 0 && (
                      <Text style={styles.warningText}>
                        ⚠️ {players.filter(p => !p.hasPaidMembership).length} player(s) cannot join due to unpaid membership
                      </Text>
                    )}
                    <TouchableOpacity 
                      style={styles.createTeamsButton} 
                      onPress={createEmptyTeams}
                      testID="setup-create-teams-button"
                    >
                      <Text style={styles.createTeamsButtonText}>Create Team Boxes</Text>
                    </TouchableOpacity>
                  </View>
                ) : selectingTeamIndex === null ? (
                  <View style={styles.teamsSection}>
                    <View style={styles.teamsHeader}>
                      <Text style={styles.teamsListTitle}>Teams ({setupTeams.length})</Text>
                      <TouchableOpacity onPress={() => setSetupStep('count')}>
                        <Text style={styles.backText}>Change Count</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>Tap a team to assign players</Text>
                    <View style={styles.teamsList}>
                      {setupTeams.map((team, index) => (
                        <View key={team.id} style={styles.teamBoxContainer}>
                          <TouchableOpacity
                            style={[
                              styles.teamBox,
                              isTeamComplete(team) && styles.teamBoxComplete,
                            ]}
                            onPress={() => handleSelectTeam(index)}
                            testID={`setup-team-box-${index}`}
                          >
                            <View style={styles.teamBoxHeader}>
                              <Text style={styles.teamBoxNumber}>Team {index + 1}</Text>
                              {isTeamComplete(team) && (
                                <CheckCircle size={20} color={Colors.light.success} />
                              )}
                            </View>
                            <View style={styles.teamBoxPlayers}>
                              <Text style={styles.teamBoxPlayerText}>
                                {team.player1Id ? players.find((p) => p.id === team.player1Id)?.name : 'No player assigned'}
                              </Text>
                              <Text style={styles.teamBoxPlayerText}>
                                {team.player2Id ? players.find((p) => p.id === team.player2Id)?.name : 'No player assigned'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {isTeamComplete(team) && (
                            <TouchableOpacity 
                              style={styles.clearTeamButton}
                              onPress={() => handleClearTeam(index)}
                              testID={`setup-clear-team-${index}`}
                            >
                              <X size={16} color={Colors.light.error} />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.playerSelectionSection}>
                    <View style={styles.selectionHeader}>
                      <Text style={styles.selectionTitle}>Select Players for Team {selectingTeamIndex + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          setSelectingTeamIndex(null);
                          setCurrentTeam({ player1Id: '', player2Id: '' });
                        }}
                        testID="setup-cancel-selection"
                      >
                        <X size={24} color={Colors.light.text} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.playerPickerSection}>
                      <Text style={styles.pickerLabel}>Player 1 (Class A)</Text>
                      <ScrollView style={styles.playerScrollView} nestedScrollEnabled>
                        {getClassAPlayers().map((player) => (
                          <TouchableOpacity
                            key={player.id}
                            style={[
                              styles.pickerOption,
                              currentTeam.player1Id === player.id && styles.pickerOptionSelected,
                            ]}
                            onPress={() => setCurrentTeam((prev) => ({ ...prev, player1Id: player.id }))}
                            testID={`setup-player1-${player.id}`}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                currentTeam.player1Id === player.id && styles.pickerOptionTextSelected,
                              ]}
                            >
                              {player.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {getClassAPlayers().length === 0 && (
                          <View style={styles.emptyPlayerSection}>
                            <Text style={styles.emptyPlayerText}>No Class A players available</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>

                    <View style={styles.playerPickerSection}>
                      <Text style={styles.pickerLabel}>Player 2 (Class B)</Text>
                      <ScrollView style={styles.playerScrollView} nestedScrollEnabled>
                        {getClassBPlayers()
                          .filter((p) => p.id !== currentTeam.player1Id)
                          .map((player) => (
                            <TouchableOpacity
                              key={player.id}
                              style={[
                                styles.pickerOption,
                                currentTeam.player2Id === player.id && styles.pickerOptionSelected,
                              ]}
                              onPress={() => setCurrentTeam((prev) => ({ ...prev, player2Id: player.id }))}
                              testID={`setup-player2-${player.id}`}
                            >
                              <Text
                                style={[
                                  styles.pickerOptionText,
                                  currentTeam.player2Id === player.id && styles.pickerOptionTextSelected,
                                ]}
                              >
                                {player.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        {getClassBPlayers().length === 0 && (
                          <View style={styles.emptyPlayerSection}>
                            <Text style={styles.emptyPlayerText}>No Class B players available</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>

                    <TouchableOpacity 
                      style={styles.confirmTeamButton} 
                      onPress={handleConfirmTeam}
                      testID="setup-confirm-team"
                    >
                      <Text style={styles.confirmTeamButtonText}>Confirm Team</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => setShowTeamSetup(false)}
                >
                  <Text style={styles.buttonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleSaveTeamSetup}
                  testID="save-team-setup-button"
                >
                  <Text style={styles.buttonPrimaryText}>Save Teams</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  standingsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  standingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  standingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rank1Badge: {
    backgroundColor: '#FFD700',
  },
  rank2Badge: {
    backgroundColor: '#C0C0C0',
  },
  rank3Badge: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  rankTextHighlight: {
    color: '#FFFFFF',
  },
  playerStandingInfo: {
    flex: 1,
  },
  playerStandingName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  playerStandingStats: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  payoutText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  payoutColumn: {
    alignItems: 'flex-end',
  },
  payoutSubtext: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  matchesCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  matchInfo: {
    flex: 1,
  },
  matchPlayers: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  matchScore: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  matchStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.light.background,
  },
  matchStatusActive: {
    backgroundColor: Colors.light.tint + '20',
  },
  matchStatusCompleted: {
    backgroundColor: Colors.light.success + '20',
  },
  matchStatusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  matchStatusTextActive: {
    color: Colors.light.tint,
  },
  matchStatusTextCompleted: {
    color: Colors.light.success,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  teamSelectorCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    maxHeight: 400,
  },
  teamSelectorHeader: {
    marginBottom: 16,
  },
  teamSelectorTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  teamSelectorSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  teamList: {
    maxHeight: 250,
  },
  teamSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  teamSelectorItemSelected: {
    backgroundColor: Colors.light.tint + '10',
    borderColor: Colors.light.tint,
  },
  teamSelectorItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginLeft: 12,
  },
  teamSelectorItemTextSelected: {
    color: Colors.light.tint,
  },
  teamSelectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamSelectedBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  swipeableContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.error,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchRowAnimated: {
    backgroundColor: Colors.light.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  setupLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  setupInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  teamCountSection: {
    gap: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: Colors.light.warning,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  createTeamsButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createTeamsButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  teamsSection: {
    gap: 16,
  },
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamsListTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  teamsList: {
    gap: 8,
  },
  teamBoxContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  teamBox: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  teamBoxComplete: {
    borderColor: Colors.light.success,
    borderStyle: 'solid',
    backgroundColor: Colors.light.success + '10',
  },
  teamBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamBoxNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  teamBoxPlayers: {
    gap: 4,
  },
  teamBoxPlayerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  clearTeamButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  playerSelectionSection: {
    gap: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  playerPickerSection: {
    gap: 8,
  },
  playerScrollView: {
    maxHeight: 150,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  pickerOption: {
    padding: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.light.tint + '20',
    borderColor: Colors.light.tint,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  pickerOptionTextSelected: {
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  unpaidSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  unpaidHeader: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.error,
    marginBottom: 8,
  },
  pickerOptionDisabled: {
    padding: 10,
    backgroundColor: Colors.light.error + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.error + '40',
    marginBottom: 4,
  },
  pickerOptionTextDisabled: {
    fontSize: 14,
    color: Colors.light.error,
  },
  confirmTeamButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmTeamButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  roundSection: {
    marginBottom: 24,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.tint + '15',
    borderRadius: 8,
    marginBottom: 12,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.tint,
  },
  roundSubtitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  emptyPlayerSection: {
    padding: 16,
    alignItems: 'center',
  },
  emptyPlayerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic' as const,
  },
  bracketBanner: {
    backgroundColor: Colors.light.tint + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  bracketBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  bracketBannerText: {
    flex: 1,
  },
  bracketBannerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.tint,
    marginBottom: 4,
  },
  bracketBannerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.tint,
    opacity: 0.8,
  },
  viewBracketButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewBracketButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.error + '15',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  rankBadgeEliminated: {
    backgroundColor: Colors.light.textSecondary + '30',
  },
  rankTextEliminated: {
    color: Colors.light.textSecondary,
  },
  playerStandingNameEliminated: {
    color: Colors.light.textSecondary,
    opacity: 0.7,
  },
});

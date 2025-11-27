import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Plus, Minus, CheckCircle } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import Colors from '@/constants/colors';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { matches, players, tournaments, updateMatch } = useTournamentData();
  const { sendMatchStartNotification, sendMatchInProgressNotification, sendMatchCompletedNotification } = useNotifications();
  
  const match = matches.find((m) => m.id === id);
  
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);

  useEffect(() => {
    if (match) {
      setTeam1Score(match.team1Score);
      setTeam2Score(match.team2Score);
    }
  }, [match]);

  if (!match) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  const tournament = tournaments.find((t) => t.id === match.tournamentId);
  const team1 = tournament?.teams?.find((t) => t.id === match.team1Id);
  const team2 = tournament?.teams?.find((t) => t.id === match.team2Id);
  
  const team1Player1 = players.find((p) => p.id === team1?.player1Id);
  const team1Player2 = players.find((p) => p.id === team1?.player2Id);
  const team2Player1 = players.find((p) => p.id === team2?.player1Id);
  const team2Player2 = players.find((p) => p.id === team2?.player2Id);

  const handleStartMatch = () => {
    updateMatch(match.id, { status: 'in_progress' });
    void sendMatchStartNotification(match, team1Player1, team1Player2, team2Player1, team2Player2);
  };

  const handleSaveScore = () => {
    updateMatch(match.id, {
      team1Score,
      team2Score,
    });
    void sendMatchInProgressNotification(match, team1Player1, team1Player2, team2Player1, team2Player2);
    Alert.alert('Success', 'Score saved!');
  };

  const handleCompleteMatch = () => {
    if (team1Score === team2Score) {
      Alert.alert('Error', 'Match cannot end in a tie. Please adjust the scores.');
      return;
    }

    const winnerTeamId = team1Score > team2Score ? match.team1Id : match.team2Id;
    
    Alert.alert('Complete Match', 'Mark this match as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: () => {
          const updatedMatch = { ...match, team1Score, team2Score, winnerTeamId, status: 'completed' as const };
          updateMatch(match.id, {
            team1Score,
            team2Score,
            winnerTeamId,
            status: 'completed',
          });
          void sendMatchCompletedNotification(updatedMatch, team1Player1, team1Player2, team2Player1, team2Player2);
          Alert.alert('Success', 'Match completed!', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
      },
    ]);
  };

  const adjustScore = (team: 'team1' | 'team2', delta: number) => {
    if (team === 'team1') {
      const newScore = Math.max(0, team1Score + delta);
      setTeam1Score(newScore);
    } else {
      const newScore = Math.max(0, team2Score + delta);
      setTeam2Score(newScore);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: match.pitNumber 
            ? `Match - Pit ${match.pitNumber}` 
            : match.targetPoints 
              ? `Match (to ${match.targetPoints})` 
              : 'Match Scoring',
          headerBackTitle: 'Back',
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          {(match.targetPoints || match.pitNumber) && (
            <View style={styles.matchInfoContainer}>
              {match.targetPoints && (
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>Playing to {match.targetPoints} points</Text>
                </View>
              )}
              {match.pitNumber && (
                <View style={[styles.infoBadge, styles.pitBadge]}>
                  <Text style={[styles.infoBadgeText, styles.pitBadgeText]}>Pit {match.pitNumber}</Text>
                </View>
              )}
            </View>
          )}
          <View style={styles.vsContainer}>
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <View style={styles.teamAvatars}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {team1Player1?.name[0].toUpperCase() || 'T'}
                    </Text>
                  </View>
                  <View style={[styles.playerAvatar, styles.playerAvatarOverlap]}>
                    <Text style={styles.playerAvatarText}>
                      {team1Player2?.name[0].toUpperCase() || '1'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.playerName}>
                  {team1Player1?.name || 'Player 1'} & {team1Player2?.name || 'Player 2'}
                </Text>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreLabel}>Score</Text>
                <View style={styles.scoreControls}>
                  {isAdmin ? (
                    <>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => adjustScore('team1', -1)}
                        testID="team1-score-minus"
                      >
                        <Minus size={28} color={Colors.light.error} />
                      </TouchableOpacity>
                      <Text style={styles.scoreValue}>{team1Score}</Text>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => adjustScore('team1', 1)}
                        testID="team1-score-plus"
                      >
                        <Plus size={28} color={Colors.light.success} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.scoreValue}>{team1Score}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.divider}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <View style={styles.teamAvatars}>
                  <View style={[styles.playerAvatar, styles.playerAvatar2]}>
                    <Text style={styles.playerAvatarText}>
                      {team2Player1?.name[0].toUpperCase() || 'T'}
                    </Text>
                  </View>
                  <View style={[styles.playerAvatar, styles.playerAvatar2, styles.playerAvatarOverlap]}>
                    <Text style={styles.playerAvatarText}>
                      {team2Player2?.name[0].toUpperCase() || '2'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.playerName}>
                  {team2Player1?.name || 'Player 1'} & {team2Player2?.name || 'Player 2'}
                </Text>
              </View>
              
              <View style={styles.scoreSection}>
                <Text style={styles.scoreLabel}>Score</Text>
                <View style={styles.scoreControls}>
                  {isAdmin ? (
                    <>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => adjustScore('team2', -1)}
                        testID="team2-score-minus"
                      >
                        <Minus size={28} color={Colors.light.error} />
                      </TouchableOpacity>
                      <Text style={styles.scoreValue}>{team2Score}</Text>
                      <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => adjustScore('team2', 1)}
                        testID="team2-score-plus"
                      >
                        <Plus size={28} color={Colors.light.success} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.scoreValue}>{team2Score}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {isAdmin && (
          <View style={styles.actionButtons}>
            {match.status === 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartMatch}
                testID="start-match-button"
              >
                <Text style={styles.actionButtonText}>Start Match</Text>
              </TouchableOpacity>
            )}
            {match.status === 'in_progress' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveScore}
                  testID="save-score-button"
                >
                  <Text style={styles.actionButtonText}>Save Score</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={handleCompleteMatch}
                  testID="complete-match-button"
                >
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Complete Match</Text>
                </TouchableOpacity>
              </>
            )}
            {match.status === 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => {
                  Alert.alert(
                    'Edit Completed Match',
                    'Save changes to this completed match score?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Save',
                        onPress: () => {
                          if (team1Score === team2Score) {
                            Alert.alert('Error', 'Match cannot end in a tie. Please adjust the scores.');
                            return;
                          }
                          const winnerTeamId = team1Score > team2Score ? match.team1Id : match.team2Id;
                          updateMatch(match.id, {
                            team1Score,
                            team2Score,
                            winnerTeamId,
                          });
                          Alert.alert('Success', 'Match score updated');
                        },
                      },
                    ]
                  );
                }}
                testID="save-score-button"
              >
                <Text style={styles.actionButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {!isAdmin && match.status === 'completed' && (
          <View style={styles.completedBanner}>
            <CheckCircle size={24} color={Colors.light.success} />
            <Text style={styles.completedText}>Match Completed</Text>
          </View>
        )}
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
    flexGrow: 1,
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginTop: 40,
  },
  vsContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  playerSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerAvatar2: {
    backgroundColor: Colors.light.accent,
  },
  playerAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 0,
    width: '100%',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.light.text,
    minWidth: 80,
    textAlign: 'center',
  },

  divider: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  vsText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    letterSpacing: 3,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButton: {
    backgroundColor: Colors.light.tint,
  },
  saveButton: {
    backgroundColor: Colors.light.accent,
  },
  completeButton: {
    backgroundColor: Colors.light.success,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Colors.light.success + '20',
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  teamAvatars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  playerAvatarOverlap: {
    marginLeft: -12,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoBadge: {
    backgroundColor: Colors.light.tint + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.light.tint,
  },
  pitBadge: {
    backgroundColor: Colors.light.accent + '15',
  },
  pitBadgeText: {
    color: Colors.light.accent,
  },
});

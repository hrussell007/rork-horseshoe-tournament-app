import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Edit3, Save, CheckCircle } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { DoublEliminationBracket } from '@/types/bracket';
import { advanceWinner } from '@/utils/bracketGenerator';

interface MatchesTabProps {
  tournamentId: string;
  bracket: DoublEliminationBracket | null;
  onBracketUpdate: (bracket: DoublEliminationBracket) => void;
}

export default function MatchesTab({ tournamentId, bracket, onBracketUpdate }: MatchesTabProps) {
  const { tournaments, players } = useTournamentData();
  const { addLog } = useDirectorLog();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [team1Score, setTeam1Score] = useState<string>('');
  const [team2Score, setTeam2Score] = useState<string>('');

  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!bracket || !tournament) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bracket available</Text>
      </View>
    );
  }

  const playersMap = new Map(players.map((p) => [p.id, p.name]));

  const getTeamName = (teamId: string): string => {
    const team = tournament.teams?.find((t) => t.id === teamId);
    if (!team) return 'Unknown Team';
    const player1 = playersMap.get(team.player1Id) || 'Unknown';
    const player2 = playersMap.get(team.player2Id) || 'Unknown';
    return `${player1} & ${player2}`;
  };

  const handleEditMatch = (matchId: string, currentTeam1Score: number, currentTeam2Score: number) => {
    setEditingMatchId(matchId);
    setTeam1Score(currentTeam1Score.toString());
    setTeam2Score(currentTeam2Score.toString());
  };

  const handleSaveScore = (matchId: string) => {
    const match = bracket.allMatches.find((m) => m.id === matchId);
    if (!match || !match.team1 || !match.team2) return;

    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;

    if (score1 === score2) {
      Alert.alert('Invalid Score', 'Scores cannot be tied. One team must win.');
      return;
    }

    const winnerId = score1 > score2 ? match.team1.id : match.team2.id;
    const loserId = score1 > score2 ? match.team2.id : match.team1.id;

    try {
      const updatedBracket = advanceWinner(bracket, matchId, winnerId, loserId, score1, score2);
      onBracketUpdate(updatedBracket);
      
      addLog(
        'Match Score Updated',
        `Match ${match.matchNumber}: ${getTeamName(match.team1.id)} ${score1} - ${score2} ${getTeamName(match.team2.id)}`,
        tournamentId,
        matchId
      );

      setEditingMatchId(null);
      setTeam1Score('');
      setTeam2Score('');
      Alert.alert('Success', 'Match score updated successfully');
    } catch (error) {
      console.error('Error updating match:', error);
      Alert.alert('Error', 'Failed to update match score');
    }
  };

  const handleForceWin = (matchId: string, winnerTeamId: string) => {
    const match = bracket.allMatches.find((m) => m.id === matchId);
    if (!match || !match.team1 || !match.team2) return;

    const loserId = winnerTeamId === match.team1.id ? match.team2.id : match.team1.id;

    Alert.alert(
      'Force Winner',
      `Are you sure you want to force ${getTeamName(winnerTeamId)} to win this match?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            try {
              const updatedBracket = advanceWinner(bracket, matchId, winnerTeamId, loserId, 30, 0);
              onBracketUpdate(updatedBracket);
              
              addLog(
                'Match Winner Forced',
                `Match ${match.matchNumber}: Forced ${getTeamName(winnerTeamId)} to win`,
                tournamentId,
                matchId
              );

              Alert.alert('Success', 'Winner forced successfully');
            } catch (error) {
              console.error('Error forcing winner:', error);
              Alert.alert('Error', 'Failed to force winner');
            }
          },
        },
      ]
    );
  };

  const allMatches = bracket.allMatches.filter(
    (m) => m.status === 'completed' || (m.team1 && m.team2)
  );

  const winnerMatches = allMatches.filter((m) => m.bracket === 'winners');
  const loserMatches = allMatches.filter((m) => m.bracket === 'losers');
  const finalMatches = allMatches.filter((m) => m.bracket === 'finals');

  const renderMatch = (match: any) => {
    if (!match.team1 || !match.team2) return null;

    const isEditing = editingMatchId === match.id;
    const team1Name = getTeamName(match.team1.id);
    const team2Name = getTeamName(match.team2.id);

    return (
      <View key={match.id} style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchTitle}>Match {match.matchNumber}</Text>
          <Text style={styles.matchStatus}>
            {match.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
          </Text>
        </View>

        <View style={styles.matchTeams}>
          <View style={styles.teamRow}>
            <Text style={styles.teamName}>{team1Name}</Text>
            {isEditing ? (
              <TextInput
                style={styles.scoreInput}
                value={team1Score}
                onChangeText={setTeam1Score}
                keyboardType="number-pad"
                placeholder="0"
              />
            ) : (
              <Text style={styles.score}>{match.team1Score}</Text>
            )}
          </View>

          <View style={styles.teamRow}>
            <Text style={styles.teamName}>{team2Name}</Text>
            {isEditing ? (
              <TextInput
                style={styles.scoreInput}
                value={team2Score}
                onChangeText={setTeam2Score}
                keyboardType="number-pad"
                placeholder="0"
              />
            ) : (
              <Text style={styles.score}>{match.team2Score}</Text>
            )}
          </View>
        </View>

        <View style={styles.matchActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => handleSaveScore(match.id)}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Save Score</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setEditingMatchId(null);
                  setTeam1Score('');
                  setTeam2Score('');
                }}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditMatch(match.id, match.team1Score, match.team2Score)}
              >
                <Edit3 size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Edit Score</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.forceButton]}
                onPress={() => handleForceWin(match.id, match.team1.id)}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Force T1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.forceButton]}
                onPress={() => handleForceWin(match.id, match.team2.id)}
              >
                <CheckCircle size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Force T2</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {winnerMatches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Winners Bracket</Text>
          {winnerMatches.map(renderMatch)}
        </View>
      )}

      {loserMatches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚔️ Losers Bracket</Text>
          {loserMatches.map(renderMatch)}
        </View>
      )}

      {finalMatches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Finals</Text>
          {finalMatches.map(renderMatch)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  matchStatus: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  matchTeams: {
    marginBottom: 12,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    flex: 1,
  },
  score: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    minWidth: 40,
    textAlign: 'right',
  },
  scoreInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700' as const,
    width: 60,
    textAlign: 'center',
  },
  matchActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    minWidth: 100,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  forceButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700' as const,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Trash2, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { DoublEliminationBracket, BracketTeam } from '@/types/bracket';
import { generateDoubleEliminationBracket } from '@/utils/bracketGenerator';

interface ResetTabProps {
  tournamentId: string;
  bracket: DoublEliminationBracket | null;
  onBracketUpdate: (bracket: DoublEliminationBracket) => void;
}

export default function ResetTab({ tournamentId, bracket, onBracketUpdate }: ResetTabProps) {
  const { tournaments, players, updateTournament, deleteMatch, matches } = useTournamentData();
  const { addLog } = useDirectorLog();

  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Tournament not found</Text>
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

  const handleClearScores = () => {
    if (!bracket) return;

    Alert.alert(
      'Clear All Match Scores',
      'This will reset all match scores to 0-0 but keep the bracket structure. Matches will remain marked as completed. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Scores',
          style: 'destructive',
          onPress: () => {
            try {
              const updatedBracket = {
                ...bracket,
                allMatches: bracket.allMatches.map((match) => ({
                  ...match,
                  team1Score: 0,
                  team2Score: 0,
                })),
              };

              const updatedWinnersRounds = updatedBracket.winnersRounds.map((round) => ({
                ...round,
                matches: round.matches.map((match) => ({
                  ...match,
                  team1Score: 0,
                  team2Score: 0,
                })),
              }));

              const updatedLosersRounds = updatedBracket.losersRounds.map((round) => ({
                ...round,
                matches: round.matches.map((match) => ({
                  ...match,
                  team1Score: 0,
                  team2Score: 0,
                })),
              }));

              const updatedFinalsRounds = updatedBracket.finalsRounds.map((round) => ({
                ...round,
                matches: round.matches.map((match) => ({
                  ...match,
                  team1Score: 0,
                  team2Score: 0,
                })),
              }));

              const finalBracket = {
                ...updatedBracket,
                winnersRounds: updatedWinnersRounds,
                losersRounds: updatedLosersRounds,
                finalsRounds: updatedFinalsRounds,
              };

              onBracketUpdate(finalBracket);
              updateTournament(tournamentId, { bracketState: finalBracket });

              addLog('All Match Scores Cleared', 'Reset all match scores to 0-0', tournamentId);

              Alert.alert('Success', 'All match scores have been cleared');
            } catch (error) {
              console.error('Error clearing scores:', error);
              Alert.alert('Error', 'Failed to clear match scores');
            }
          },
        },
      ]
    );
  };

  const handleResetBracket = () => {
    Alert.alert(
      'Reset Entire Bracket',
      'This will completely reset the bracket to its initial state. All match results and progression will be lost. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            try {
              if (!tournament.teams || tournament.teams.length < 10) {
                Alert.alert('Error', 'Need at least 10 teams to reset bracket');
                return;
              }

              const bracketTeams: BracketTeam[] = tournament.teams.map((team, index) => ({
                id: team.id,
                name: getTeamName(team.id),
                seed: index + 1,
                losses: 0,
              }));

              const newBracket = generateDoubleEliminationBracket(bracketTeams);
              onBracketUpdate(newBracket);
              updateTournament(tournamentId, { bracketState: newBracket });

              const tournamentMatchesToDelete = matches.filter(
                (m) => m.tournamentId === tournamentId
              );
              tournamentMatchesToDelete.forEach((match) => {
                deleteMatch(match.id);
              });

              addLog(
                'Bracket Completely Reset',
                `Reset bracket to initial state with ${bracketTeams.length} teams`,
                tournamentId
              );

              Alert.alert('Success', 'Bracket has been completely reset');
            } catch (error) {
              console.error('Error resetting bracket:', error);
              Alert.alert('Error', 'Failed to reset bracket');
            }
          },
        },
      ]
    );
  };

  const handleRecalculateStandings = () => {
    Alert.alert(
      'Recalculate Standings',
      'This will recalculate all team standings based on current match results. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Recalculate',
          onPress: () => {
            if (bracket) {
              onBracketUpdate({ ...bracket });
              updateTournament(tournamentId, { bracketState: bracket });
            }

            addLog('Standings Recalculated', 'Recalculated all team standings', tournamentId);

            Alert.alert('Success', 'Standings have been recalculated');
          },
        },
      ]
    );
  };

  const completedMatches = bracket?.allMatches.filter((m) => m.status === 'completed').length || 0;
  const totalMatches = bracket?.allMatches.length || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reset & Rebuild Tools</Text>
        <Text style={styles.headerSubtitle}>
          {completedMatches} / {totalMatches} matches completed
        </Text>
      </View>

      <View style={styles.warningBox}>
        <AlertTriangle size={20} color="#DC2626" />
        <Text style={styles.warningText}>
          Warning: These actions are destructive and cannot be undone. Use with extreme caution.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Actions</Text>

        <TouchableOpacity
          style={[styles.actionCard, styles.clearScoresCard]}
          onPress={handleClearScores}
        >
          <View style={[styles.actionIconContainer, styles.clearScoresIcon]}>
            <RotateCcw size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Clear All Scores</Text>
            <Text style={styles.actionDescription}>
              Reset all match scores to 0-0 while keeping bracket structure
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.resetBracketCard]}
          onPress={handleResetBracket}
        >
          <View style={[styles.actionIconContainer, styles.resetBracketIcon]}>
            <Trash2 size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Reset Entire Bracket</Text>
            <Text style={styles.actionDescription}>
              Completely reset bracket to initial state, removing all results
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.recalculateCard]}
          onPress={handleRecalculateStandings}
        >
          <View style={[styles.actionIconContainer, styles.recalculateIcon]}>
            <CheckCircle size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Recalculate Standings</Text>
            <Text style={styles.actionDescription}>
              Recalculate team standings based on current match results
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>🎬 Director Notes</Text>
        <Text style={styles.infoText}>
          • Clear Scores: Use when you need to re-enter results but keep bracket progression
        </Text>
        <Text style={styles.infoText}>
          • Reset Bracket: Use when starting tournament over or fixing major errors
        </Text>
        <Text style={styles.infoText}>
          • Recalculate: Use after manual bracket changes to update team records
        </Text>
        <Text style={styles.infoText}>
          • All actions are logged in the Logs tab for audit purposes
        </Text>
      </View>
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  clearScoresCard: {
    borderColor: '#F59E0B',
  },
  resetBracketCard: {
    borderColor: '#DC2626',
  },
  recalculateCard: {
    borderColor: '#10B981',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearScoresIcon: {
    backgroundColor: '#F59E0B',
  },
  resetBracketIcon: {
    backgroundColor: '#DC2626',
  },
  recalculateIcon: {
    backgroundColor: '#10B981',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '500' as const,
    marginBottom: 6,
    lineHeight: 20,
  },
});

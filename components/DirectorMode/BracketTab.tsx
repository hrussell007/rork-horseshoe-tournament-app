import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { RefreshCw, AlertTriangle, Edit2, X } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { DoublEliminationBracket, BracketTeam } from '@/types/bracket';
import { generateDoubleEliminationBracket } from '@/utils/bracketGenerator';

interface BracketTabProps {
  tournamentId: string;
  bracket: DoublEliminationBracket | null;
  onBracketUpdate: (bracket: DoublEliminationBracket) => void;
}

export default function BracketTab({ tournamentId, bracket, onBracketUpdate }: BracketTabProps) {
  const { tournaments, players, updateTournament } = useTournamentData();
  const { addLog } = useDirectorLog();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showMatchEditor, setShowMatchEditor] = useState<boolean>(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

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

  const getTeamLosses = (teamId: string): number => {
    const completedMatches = bracket.allMatches.filter(
      (m) => m.status === 'completed' && m.loserId === teamId
    );
    return completedMatches.length;
  };

  const handleReseedBracket = () => {
    Alert.alert(
      'Reseed Bracket',
      'This will rebuild the bracket with new seeding. All current match results will be preserved where possible. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reseed',
          style: 'destructive',
          onPress: () => {
            try {
              if (!tournament.teams || tournament.teams.length < 10) {
                Alert.alert('Error', 'Need at least 10 teams to reseed bracket');
                return;
              }

              const bracketTeams: BracketTeam[] = tournament.teams.map((team, index) => ({
                id: team.id,
                name: getTeamName(team.id),
                seed: index + 1,
                losses: getTeamLosses(team.id),
              }));

              const newBracket = generateDoubleEliminationBracket(bracketTeams);
              onBracketUpdate(newBracket);
              updateTournament(tournamentId, { bracketState: newBracket });

              addLog(
                'Bracket Reseeded',
                `Bracket rebuilt with ${bracketTeams.length} teams`,
                tournamentId
              );

              Alert.alert('Success', 'Bracket has been reseeded successfully');
            } catch (error) {
              console.error('Error reseeding bracket:', error);
              Alert.alert('Error', 'Failed to reseed bracket');
            }
          },
        },
      ]
    );
  };

  const allTeams = tournament.teams || [];
  const activeMatches = bracket.allMatches.filter(
    (m) => m.status !== 'completed' && m.team1 && m.team2
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bracket Management</Text>
        <Text style={styles.headerSubtitle}>
          {allTeams.length} teams • {activeMatches.length} active matches
        </Text>
      </View>

      <View style={styles.warningBox}>
        <AlertTriangle size={20} color="#F59E0B" />
        <Text style={styles.warningText}>
          Manual bracket editing is advanced. Use with caution. Changes are immediately applied.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionCard, styles.reseedCard]}
          onPress={handleReseedBracket}
        >
          <View style={styles.actionIconContainer}>
            <RefreshCw size={24} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Reseed Bracket</Text>
            <Text style={styles.actionDescription}>
              Rebuild bracket structure while preserving match results
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tournament Teams</Text>
        <Text style={styles.sectionSubtitle}>
          View team status and bracket positions
        </Text>

        {allTeams.map((team, index) => {
          const losses = getTeamLosses(team.id);
          const isEliminated = losses >= 2;
          const isSelected = selectedTeamId === team.id;

          const currentMatches = bracket.allMatches.filter(
            (m) =>
              m.status !== 'completed' &&
              (m.team1?.id === team.id || m.team2?.id === team.id)
          );

          return (
            <TouchableOpacity
              key={team.id}
              style={[
                styles.teamCard,
                isEliminated && styles.teamCardEliminated,
                isSelected && styles.teamCardSelected,
              ]}
              onPress={() => setSelectedTeamId(isSelected ? null : team.id)}
              activeOpacity={0.7}
            >
              <View style={styles.teamHeader}>
                <View style={styles.teamInfo}>
                  <Text style={[styles.teamName, isEliminated && styles.teamNameEliminated]}>
                    #{index + 1} {getTeamName(team.id)}
                  </Text>
                  <View style={styles.teamBadges}>
                    {losses === 0 && (
                      <View style={[styles.badge, styles.badgeWinners]}>
                        <Text style={styles.badgeText}>Winners</Text>
                      </View>
                    )}
                    {losses === 1 && (
                      <View style={[styles.badge, styles.badgeLosers]}>
                        <Text style={styles.badgeText}>Losers</Text>
                      </View>
                    )}
                    {isEliminated && (
                      <View style={[styles.badge, styles.badgeEliminated]}>
                        <Text style={styles.badgeText}>Eliminated</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {currentMatches.length > 0 && (
                <View style={styles.teamMatches}>
                  <Text style={styles.teamMatchesLabel}>Active Matches:</Text>
                  {currentMatches.map((match) => (
                    <TouchableOpacity
                      key={match.id}
                      style={styles.matchRow}
                      onPress={() => {
                        setSelectedMatchId(match.id);
                        setShowMatchEditor(true);
                      }}
                    >
                      <Text style={styles.teamMatchText}>
                        • Match {match.matchNumber} ({match.bracket})
                      </Text>
                      <Edit2 size={14} color="#10B981" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {isEliminated && (
                <View style={styles.eliminatedNote}>
                  <Text style={styles.eliminatedText}>Team has been eliminated (2+ losses)</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          💡 Tap on a team&apos;s active matches to edit match details in the bracket
        </Text>
      </View>

      <Modal visible={showMatchEditor} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.matchEditorContainer}>
            <View style={styles.matchEditorHeader}>
              <Text style={styles.matchEditorTitle}>Edit Match Position</Text>
              <TouchableOpacity onPress={() => {
                setShowMatchEditor(false);
                setSelectedMatchId(null);
              }}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.matchEditorContent}>
              {selectedMatchId && bracket.allMatches.find(m => m.id === selectedMatchId) && (() => {
                const match = bracket.allMatches.find(m => m.id === selectedMatchId)!;
                const team1Name = match.team1 ? getTeamName(match.team1.id) : 'TBD';
                const team2Name = match.team2 ? getTeamName(match.team2.id) : 'TBD';
                
                return (
                  <View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchInfoLabel}>Match Details</Text>
                      <Text style={styles.matchInfoText}>Match #{match.matchNumber}</Text>
                      <Text style={styles.matchInfoText}>Bracket: {match.bracket}</Text>
                      <Text style={styles.matchInfoText}>Round: {match.round}</Text>
                    </View>
                    
                    <View style={styles.teamsContainer}>
                      <View style={styles.teamInfoBox}>
                        <Text style={styles.teamInfoLabel}>Team 1</Text>
                        <Text style={styles.teamInfoName}>{team1Name}</Text>
                      </View>
                      
                      <Text style={styles.versusText}>VS</Text>
                      
                      <View style={styles.teamInfoBox}>
                        <Text style={styles.teamInfoLabel}>Team 2</Text>
                        <Text style={styles.teamInfoName}>{team2Name}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.editorNote}>
                      <AlertTriangle size={16} color="#F59E0B" />
                      <Text style={styles.editorNoteText}>
                        To modify match scores and force winners, use the Matches tab in Director Mode.
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
            
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                setShowMatchEditor(false);
                setSelectedMatchId(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reseedCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
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
  teamCard: {
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
  teamCardEliminated: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  teamCardSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  teamNameEliminated: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  teamBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeWinners: {
    backgroundColor: '#D1FAE5',
  },
  badgeLosers: {
    backgroundColor: '#FED7AA',
  },
  badgeEliminated: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  teamMatches: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  teamMatchesLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 6,
  },
  teamMatchText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  eliminatedNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eliminatedText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600' as const,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  footerNote: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  matchEditorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
  },
  matchEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  matchEditorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  matchEditorContent: {
    padding: 20,
  },
  matchInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  matchInfoLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  matchInfoText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  teamsContainer: {
    marginBottom: 20,
  },
  teamInfoBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  teamInfoLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 6,
  },
  teamInfoName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
  },
  versusText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
    textAlign: 'center',
    marginVertical: 8,
  },
  editorNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  editorNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 20,
    marginTop: 0,
  },
  closeButton: {
    backgroundColor: '#10B981',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
});

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
import { Edit3, Save, X as XIcon, UserX } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { DoublEliminationBracket } from '@/types/bracket';

interface PlayersTabProps {
  tournamentId: string;
  bracket: DoublEliminationBracket | null;
}

export default function PlayersTab({ tournamentId, bracket }: PlayersTabProps) {
  const { tournaments, players, updatePlayer } = useTournamentData();
  const { addLog } = useDirectorLog();
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');

  const tournament = tournaments.find((t) => t.id === tournamentId);

  if (!tournament) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Tournament not found</Text>
      </View>
    );
  }

  const participatingPlayerIds = new Set<string>();
  tournament.teams?.forEach((team) => {
    participatingPlayerIds.add(team.player1Id);
    participatingPlayerIds.add(team.player2Id);
  });

  const participatingPlayers = players.filter((p) => participatingPlayerIds.has(p.id));

  const handleEditPlayer = (playerId: string, currentName: string) => {
    setEditingPlayerId(playerId);
    setEditedName(currentName);
  };

  const handleSavePlayerName = () => {
    if (!editingPlayerId) return;

    const trimmedName = editedName.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Player name cannot be empty');
      return;
    }

    const oldName = players.find((p) => p.id === editingPlayerId)?.name || 'Unknown';
    updatePlayer(editingPlayerId, { name: trimmedName });
    
    addLog(
      'Player Name Updated',
      `Changed "${oldName}" to "${trimmedName}"`,
      tournamentId,
      undefined,
      editingPlayerId
    );

    setEditingPlayerId(null);
    setEditedName('');
    Alert.alert('Success', 'Player name updated successfully');
  };

  const handleMarkNoShow = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    Alert.alert(
      'Mark No-Show',
      `Mark ${player.name} as no-show? This will be logged.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            addLog(
              'Player Marked No-Show',
              `${player.name} marked as no-show`,
              tournamentId,
              undefined,
              playerId
            );
            Alert.alert('Success', `${player.name} marked as no-show. Note: Team assignments not automatically changed.`);
          },
        },
      ]
    );
  };

  const getPlayerTeam = (playerId: string) => {
    const team = tournament.teams?.find(
      (t) => t.player1Id === playerId || t.player2Id === playerId
    );
    if (!team) return null;
    
    const partner = players.find(
      (p) => p.id === (team.player1Id === playerId ? team.player2Id : team.player1Id)
    );
    
    return {
      teamId: team.id,
      partnerName: partner?.name || 'Unknown',
    };
  };

  const getPlayerSeed = (playerId: string): number | null => {
    const team = tournament.teams?.find(
      (t) => t.player1Id === playerId || t.player2Id === playerId
    );
    if (!team) return null;
    
    const teamIndex = tournament.teams?.findIndex((t) => t.id === team.id);
    return teamIndex !== undefined && teamIndex !== -1 ? teamIndex + 1 : null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournament Players</Text>
        <Text style={styles.headerSubtitle}>{participatingPlayers.length} players</Text>
      </View>

      {participatingPlayers.map((player) => {
        const isEditing = editingPlayerId === player.id;
        const teamInfo = getPlayerTeam(player.id);
        const seed = getPlayerSeed(player.id);

        return (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <View style={styles.playerInfo}>
                {isEditing ? (
                  <TextInput
                    style={styles.nameInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Player name"
                    autoFocus
                  />
                ) : (
                  <View>
                    <Text style={styles.playerName}>{player.name}</Text>
                    {seed && <Text style={styles.playerSeed}>Seed #{seed}</Text>}
                  </View>
                )}
              </View>
              {!isEditing && (
                <View style={styles.playerBadges}>
                  <View style={[styles.badge, player.playerClass === 'A' ? styles.badgeA : styles.badgeB]}>
                    <Text style={styles.badgeText}>Class {player.playerClass}</Text>
                  </View>
                </View>
              )}
            </View>

            {teamInfo && !isEditing && (
              <View style={styles.teamInfo}>
                <Text style={styles.teamLabel}>Partner:</Text>
                <Text style={styles.teamValue}>{teamInfo.partnerName}</Text>
              </View>
            )}

            <View style={styles.playerActions}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSavePlayerName}
                  >
                    <Save size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      setEditingPlayerId(null);
                      setEditedName('');
                    }}
                  >
                    <XIcon size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditPlayer(player.id, player.name)}
                  >
                    <Edit3 size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Edit Name</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.noShowButton]}
                    onPress={() => handleMarkNoShow(player.id)}
                  >
                    <UserX size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>No-Show</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );
      })}

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          💡 Tip: Use the Bracket tab to reassign players to different teams
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
  playerCard: {
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
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  playerSeed: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  nameInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  playerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeA: {
    backgroundColor: '#FCD34D',
  },
  badgeB: {
    backgroundColor: '#93C5FD',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  teamLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginRight: 8,
  },
  teamValue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#111827',
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
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
  noShowButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700' as const,
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
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,

} from 'react-native';
import { Send, X, AlertTriangle, Users, UserCheck, Target, MapPin, User } from 'lucide-react-native';
import { useBroadcast } from '@/contexts/BroadcastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { BroadcastAudience, BroadcastTemplate } from '@/types/broadcast';

interface BroadcastCenterTabProps {
  tournamentId: string;
}

export default function BroadcastCenterTab({ tournamentId }: BroadcastCenterTabProps) {
  const { currentUser } = useAuth();
  const { sendBroadcast, getAllTemplates, broadcasts, deleteBroadcast, addCustomTemplate } = useBroadcast();
  const { tournaments, matches, players } = useTournamentData();
  const { addLog } = useDirectorLog();
  const { sendBroadcastNotification } = useNotifications();

  const [message, setMessage] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<BroadcastAudience>('all_players');
  const [courtNumber, setCourtNumber] = useState<string>('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showTemplates, setShowTemplates] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showPlayerSelector, setShowPlayerSelector] = useState<boolean>(false);

  const tournament = tournaments.find((t) => t.id === tournamentId);
  const allTemplates = getAllTemplates();
  const tournamentBroadcasts = useMemo(() => {
    return broadcasts.filter((b) => b.tournamentId === tournamentId);
  }, [broadcasts, tournamentId]);

  const getRecipientCount = (): number => {
    if (!tournament) return 0;

    switch (selectedAudience) {
      case 'all_players': {
        const uniquePlayerIds = new Set<string>();
        tournament.teams?.forEach((team) => {
          uniquePlayerIds.add(team.player1Id);
          uniquePlayerIds.add(team.player2Id);
        });
        return uniquePlayerIds.size;
      }
      case 'checked_in': {
        const checkedInCount = tournament.teams?.length || 0;
        return checkedInCount * 2;
      }
      case 'next_round': {
        const pendingMatches = matches.filter(
          (m) => m.tournamentId === tournamentId && m.status === 'pending'
        );
        if (pendingMatches.length === 0) return 0;
        const nextRound = Math.min(...pendingMatches.map((m) => m.round));
        const nextRoundMatches = pendingMatches.filter((m) => m.round === nextRound);
        return nextRoundMatches.length * 4;
      }
      case 'specific_court': {
        const court = parseInt(courtNumber);
        if (isNaN(court)) return 0;
        const courtMatches = matches.filter(
          (m) => m.tournamentId === tournamentId && m.pitNumber === court && m.status !== 'completed'
        );
        return courtMatches.length * 4;
      }
      case 'specific_players':
        return selectedPlayerIds.length;
      case 'emergency':
        return tournament.teams ? tournament.teams.length * 2 : 0;
      default:
        return 0;
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and message.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to send broadcasts.');
      return;
    }

    if (selectedAudience === 'specific_court' && !courtNumber.trim()) {
      Alert.alert('Missing Information', 'Please enter a court number.');
      return;
    }

    if (selectedAudience === 'specific_players' && selectedPlayerIds.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one player.');
      return;
    }

    const recipientCount = getRecipientCount();

    if (recipientCount === 0) {
      Alert.alert('No Recipients', 'There are no players to receive this message.');
      return;
    }

    try {
      const audienceDetails: any = {};
      if (selectedAudience === 'specific_court') {
        audienceDetails.courtNumber = parseInt(courtNumber);
      }
      if (selectedAudience === 'specific_players') {
        audienceDetails.playerIds = selectedPlayerIds;
      }

      const broadcast = await sendBroadcast(
        title,
        message,
        selectedAudience,
        currentUser.username,
        currentUser.id,
        tournamentId,
        audienceDetails,
        undefined,
        recipientCount
      );

      await sendBroadcastNotification(broadcast);

      addLog(
        'Broadcast Sent',
        `"${title}" to ${selectedAudience} (${recipientCount} recipients)`,
        tournamentId
      );

      setTitle('');
      setMessage('');
      setCourtNumber('');
      setSelectedPlayerIds([]);
      setSelectedAudience('all_players');

      Alert.alert('Success', `Broadcast sent to ${recipientCount} players!`);
    } catch (error) {
      console.error('Error sending broadcast:', error);
      Alert.alert('Error', 'Failed to send broadcast. Please try again.');
    }
  };

  const handlePreview = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and message to preview.');
      return;
    }
    setShowPreview(true);
  };

  const handleUseTemplate = (template: BroadcastTemplate) => {
    setTitle(template.title);
    setMessage(template.message);
    setSelectedAudience(template.audience);
    setShowTemplates(false);
  };

  const handleSaveAsTemplate = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and message.');
      return;
    }

    Alert.prompt(
      'Save Template',
      'Enter a name for this template:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name?: string) => {
            if (name && name.trim()) {
              await addCustomTemplate({
                name: name.trim(),
                title,
                message,
                audience: selectedAudience,
              });
              Alert.alert('Success', 'Template saved!');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteBroadcast = (id: string) => {
    Alert.alert('Delete Broadcast', 'Are you sure you want to delete this broadcast?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBroadcast(id);
          addLog('Broadcast Deleted', `Broadcast ${id} removed from history`, tournamentId);
        },
      },
    ]);
  };

  const audienceOptions = [
    { value: 'all_players' as const, label: 'All Players', icon: Users },
    { value: 'checked_in' as const, label: 'Checked In', icon: UserCheck },
    { value: 'next_round' as const, label: 'Next Round', icon: Target },
    { value: 'specific_court' as const, label: 'Specific Court', icon: MapPin },
    { value: 'specific_players' as const, label: 'Specific Players', icon: User },
    { value: 'emergency' as const, label: 'Emergency Alert', icon: AlertTriangle },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📢 Broadcast Center</Text>
          <Text style={styles.headerSubtitle}>Send notifications to players</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter message title..."
            placeholderTextColor="#9CA3AF"
            testID="broadcast-title-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Message Body</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter your message..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="broadcast-message-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Audience ({getRecipientCount()} recipients)</Text>
          <View style={styles.audienceGrid}>
            {audienceOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedAudience === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.audienceButton, isSelected && styles.audienceButtonSelected]}
                  onPress={() => setSelectedAudience(option.value)}
                  testID={`audience-${option.value}`}
                >
                  <Icon size={20} color={isSelected ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.audienceLabel, isSelected && styles.audienceLabelSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedAudience === 'specific_court' && (
          <View style={styles.section}>
            <Text style={styles.label}>Court Number</Text>
            <TextInput
              style={styles.input}
              value={courtNumber}
              onChangeText={setCourtNumber}
              placeholder="Enter court number..."
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              testID="court-number-input"
            />
          </View>
        )}

        {selectedAudience === 'specific_players' && (
          <View style={styles.section}>
            <Text style={styles.label}>Selected Players ({selectedPlayerIds.length})</Text>
            <TouchableOpacity
              style={styles.selectPlayersButton}
              onPress={() => setShowPlayerSelector(true)}
              testID="select-players-button"
            >
              <User size={20} color="#10B981" />
              <Text style={styles.selectPlayersText}>
                {selectedPlayerIds.length === 0
                  ? 'Select Players'
                  : `${selectedPlayerIds.length} player${selectedPlayerIds.length > 1 ? 's' : ''} selected`}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setShowTemplates(true)}
            testID="show-templates-button"
          >
            <Text style={styles.buttonSecondaryText}>Templates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleSaveAsTemplate}
            testID="save-template-button"
          >
            <Text style={styles.buttonSecondaryText}>Save Template</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
            onPress={handlePreview}
            testID="preview-button"
          >
            <Text style={styles.buttonSecondaryText}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, { flex: 2 }]}
            onPress={handleSend}
            testID="send-broadcast-button"
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.buttonPrimaryText}>Send Broadcast</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
          testID="show-history-button"
        >
          <Text style={styles.historyButtonText}>View Broadcast History ({tournamentBroadcasts.length})</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPreview} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.previewNotification}>
              <Text style={styles.previewNotificationTitle}>{title}</Text>
              <Text style={styles.previewNotificationBody}>{message}</Text>
              <Text style={styles.previewNotificationMeta}>
                To: {selectedAudience.replace('_', ' ')} • {getRecipientCount()} recipients
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.buttonPrimaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTemplates} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.templatesContainer}>
            <View style={styles.templatesHeader}>
              <Text style={styles.templatesTitle}>Message Templates</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.templatesList}>
              {allTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateItem}
                  onPress={() => handleUseTemplate(template)}
                  testID={`template-${template.id}`}
                >
                  <View style={styles.templateContent}>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templatePreview}>{template.title}</Text>
                    <Text style={styles.templateMessage} numberOfLines={2}>
                      {template.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showPlayerSelector} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.playerSelectorContainer}>
            <View style={styles.playerSelectorHeader}>
              <Text style={styles.playerSelectorTitle}>Select Players</Text>
              <TouchableOpacity onPress={() => setShowPlayerSelector(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.playersList}>
              {tournament?.teams?.map((team) => {
                const player1 = players.find((p) => p.id === team.player1Id);
                const player2 = players.find((p) => p.id === team.player2Id);
                
                return (
                  <View key={team.id}>
                    <TouchableOpacity
                      style={[
                        styles.playerItem,
                        selectedPlayerIds.includes(team.player1Id) && styles.playerItemSelected
                      ]}
                      onPress={() => {
                        setSelectedPlayerIds(prev =>
                          prev.includes(team.player1Id)
                            ? prev.filter(id => id !== team.player1Id)
                            : [...prev, team.player1Id]
                        );
                      }}
                    >
                      <View style={[
                        styles.playerCheckbox,
                        selectedPlayerIds.includes(team.player1Id) && styles.playerCheckboxSelected
                      ]}>
                        {selectedPlayerIds.includes(team.player1Id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.playerName}>{player1?.name || 'Unknown'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.playerItem,
                        selectedPlayerIds.includes(team.player2Id) && styles.playerItemSelected
                      ]}
                      onPress={() => {
                        setSelectedPlayerIds(prev =>
                          prev.includes(team.player2Id)
                            ? prev.filter(id => id !== team.player2Id)
                            : [...prev, team.player2Id]
                        );
                      }}
                    >
                      <View style={[
                        styles.playerCheckbox,
                        selectedPlayerIds.includes(team.player2Id) && styles.playerCheckboxSelected
                      ]}>
                        {selectedPlayerIds.includes(team.player2Id) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={styles.playerName}>{player2?.name || 'Unknown'}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => setShowPlayerSelector(false)}
            >
              <Text style={styles.buttonPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showHistory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Broadcast History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.historyList}>
              {tournamentBroadcasts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No broadcasts sent yet</Text>
                </View>
              ) : (
                tournamentBroadcasts.map((broadcast) => (
                  <View key={broadcast.id} style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemTitle}>{broadcast.title}</Text>
                      <TouchableOpacity onPress={() => handleDeleteBroadcast(broadcast.id)}>
                        <X size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.historyItemMessage}>{broadcast.message}</Text>
                    <View style={styles.historyItemMeta}>
                      <Text style={styles.historyItemMetaText}>
                        {new Date(broadcast.sentAt).toLocaleString()}
                      </Text>
                      <Text style={styles.historyItemMetaText}>
                        {broadcast.recipientCount} recipients
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minWidth: '48%',
    flex: 1,
  },
  audienceButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  audienceLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  audienceLabelSelected: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#10B981',
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  historyButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginTop: 8,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  previewNotification: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewNotificationTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 8,
  },
  previewNotificationBody: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  previewNotificationMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  templatesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  templatesTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  templatesList: {
    flex: 1,
  },
  templateItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  templateContent: {
    gap: 4,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  templatePreview: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
    marginBottom: 4,
  },
  templateMessage: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  historyList: {
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  historyItemMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  historyItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItemMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  selectPlayersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  selectPlayersText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  playerSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  playerSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playerSelectorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  playerItemSelected: {
    backgroundColor: '#D1FAE5',
  },
  playerCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerCheckboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    flex: 1,
  },
});

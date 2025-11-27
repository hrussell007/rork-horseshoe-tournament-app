import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Bell, BellOff, AlertTriangle } from 'lucide-react-native';
import { useBroadcast } from '@/contexts/BroadcastContext';
import { useTournamentData } from '@/contexts/TournamentContext';
import { Stack } from 'expo-router';

export default function DirectorAlertsScreen() {
  const { broadcasts, muteSettings, setGlobalMute } = useBroadcast();
  const { tournaments } = useTournamentData();

  const sortedBroadcasts = useMemo(() => {
    return [...broadcasts].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }, [broadcasts]);

  const getAudienceDisplay = (audienceType: string): string => {
    switch (audienceType) {
      case 'all_players':
        return 'All Players';
      case 'checked_in':
        return 'Checked In';
      case 'next_round':
        return 'Next Round';
      case 'specific_court':
        return 'Specific Court';
      case 'specific_players':
        return 'Specific Players';
      case 'emergency':
        return 'Emergency Alert';
      default:
        return audienceType;
    }
  };

  const getTournamentName = (tournamentId?: string): string => {
    if (!tournamentId) return 'General';
    const tournament = tournaments.find((t) => t.id === tournamentId);
    return tournament?.name || 'Unknown Tournament';
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Director Alerts',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' as const },
        }}
      />
      <View style={styles.container}>
        <View style={styles.muteSection}>
          <View style={styles.muteSectionContent}>
            <View style={styles.muteSectionIcon}>
              {muteSettings.globalMute ? (
                <BellOff size={24} color="#EF4444" />
              ) : (
                <Bell size={24} color="#10B981" />
              )}
            </View>
            <View style={styles.muteSectionText}>
              <Text style={styles.muteSectionTitle}>
                {muteSettings.globalMute ? 'Notifications Muted' : 'Notifications Active'}
              </Text>
              <Text style={styles.muteSectionSubtitle}>
                {muteSettings.globalMute 
                  ? 'You will not receive push notifications' 
                  : 'You will receive push notifications'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.muteButton,
              muteSettings.globalMute && styles.muteButtonActive,
            ]}
            onPress={() => setGlobalMute(!muteSettings.globalMute)}
            testID="toggle-mute-button"
          >
            <Text
              style={[
                styles.muteButtonText,
                muteSettings.globalMute && styles.muteButtonTextActive,
              ]}
            >
              {muteSettings.globalMute ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {sortedBroadcasts.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No Alerts Yet</Text>
              <Text style={styles.emptyStateText}>
                Tournament directors will send updates and announcements here
              </Text>
            </View>
          ) : (
            sortedBroadcasts.map((broadcast) => (
              <View
                key={broadcast.id}
                style={[
                  styles.alertCard,
                  broadcast.isEmergency && styles.alertCardEmergency,
                ]}
                testID={`alert-${broadcast.id}`}
              >
                {broadcast.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <AlertTriangle size={16} color="#FFFFFF" />
                    <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                  </View>
                )}

                <View style={styles.alertHeader}>
                  <Text
                    style={[
                      styles.alertTitle,
                      broadcast.isEmergency && styles.alertTitleEmergency,
                    ]}
                  >
                    {broadcast.title}
                  </Text>
                  <Text style={styles.alertTime}>{formatTime(broadcast.sentAt)}</Text>
                </View>

                <Text style={styles.alertMessage}>{broadcast.message}</Text>

                <View style={styles.alertMeta}>
                  <Text style={styles.alertMetaText}>
                    From: {broadcast.senderName}
                  </Text>
                  <Text style={styles.alertMetaSeparator}>•</Text>
                  <Text style={styles.alertMetaText}>
                    {getAudienceDisplay(broadcast.audience)}
                  </Text>
                  <Text style={styles.alertMetaSeparator}>•</Text>
                  <Text style={styles.alertMetaText}>
                    {getTournamentName(broadcast.tournamentId)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  muteSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muteSectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  muteSectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteSectionText: {
    flex: 1,
  },
  muteSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  muteSectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  muteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  muteButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  muteButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  muteButtonTextActive: {
    color: '#EF4444',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertCardEmergency: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  emergencyBadgeText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    flex: 1,
  },
  alertTitleEmergency: {
    color: '#DC2626',
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
    flexShrink: 0,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  alertMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  alertMetaSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});

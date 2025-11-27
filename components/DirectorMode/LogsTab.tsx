import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Trash2, Clock } from 'lucide-react-native';
import { useDirectorLog } from '@/contexts/DirectorLogContext';

interface LogsTabProps {
  tournamentId: string;
}

export default function LogsTab({ tournamentId }: LogsTabProps) {
  const { logs, clearLogs } = useDirectorLog();

  const tournamentLogs = logs.filter((log) => log.tournamentId === tournamentId);
  const allLogs = logs;

  const handleClearLogs = () => {
    Alert.alert(
      'Clear All Logs',
      'This will permanently delete all director logs across all tournaments. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearLogs();
            Alert.alert('Success', 'All logs have been cleared');
          },
        },
      ]
    );
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getActionColor = (action: string): string => {
    if (action.includes('Forced') || action.includes('Reset') || action.includes('Cleared')) {
      return '#DC2626';
    }
    if (action.includes('Updated') || action.includes('Reseeded')) {
      return '#F59E0B';
    }
    if (action.includes('Accessed')) {
      return '#10B981';
    }
    return '#3B82F6';
  };

  const renderLog = (log: any, index: number) => {
    const actionColor = getActionColor(log.action);

    return (
      <View key={log.id} style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.logIndicator, { backgroundColor: actionColor }]} />
          <View style={styles.logHeaderText}>
            <Text style={styles.logAction}>{log.action}</Text>
            <View style={styles.logTimestamp}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.logDetails}>{log.details}</Text>
        {log.matchId && (
          <View style={styles.logMeta}>
            <Text style={styles.logMetaText}>Match ID: {log.matchId.substring(0, 12)}...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Director Change Log</Text>
          <Text style={styles.headerSubtitle}>
            {tournamentLogs.length} tournament logs • {allLogs.length} total logs
          </Text>
        </View>
        {allLogs.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {tournamentLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs for this tournament</Text>
            <Text style={styles.emptySubtext}>
              Director actions will be logged here for audit purposes
            </Text>
          </View>
        ) : (
          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>🎬 Tournament Actions</Text>
            {tournamentLogs.map((log, index) => renderLog(log, index))}
          </View>
        )}

        {allLogs.length > tournamentLogs.length && (
          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>📋 All System Actions</Text>
            {allLogs
              .filter((log) => log.tournamentId !== tournamentId)
              .slice(0, 20)
              .map((log, index) => renderLog(log, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  clearButton: {
    backgroundColor: '#DC2626',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  logsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  logIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    minHeight: 40,
  },
  logHeaderText: {
    flex: 1,
  },
  logAction: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 4,
  },
  logTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  logDetails: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500' as const,
    lineHeight: 20,
    paddingLeft: 16,
  },
  logMeta: {
    marginTop: 8,
    paddingTop: 8,
    paddingLeft: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logMetaText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
    fontFamily: 'monospace',
  },
});

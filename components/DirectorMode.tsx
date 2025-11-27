import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useDirectorLog } from '@/contexts/DirectorLogContext';
import { DoublEliminationBracket } from '@/types/bracket';
import MatchesTab from './DirectorMode/MatchesTab';
import PlayersTab from './DirectorMode/PlayersTab';
import BracketTab from './DirectorMode/BracketTab';
import ResetTab from './DirectorMode/ResetTab';
import LogsTab from './DirectorMode/LogsTab';
import BroadcastCenterTab from './DirectorMode/BroadcastCenterTab';

interface DirectorModeProps {
  visible: boolean;
  onClose: () => void;
  tournamentId: string;
  bracket: DoublEliminationBracket | null;
  onBracketUpdate: (bracket: DoublEliminationBracket) => void;
}

type TabType = 'matches' | 'players' | 'bracket' | 'reset' | 'logs' | 'broadcasts';

const DIRECTOR_PIN = '1234';

export default function DirectorMode({
  visible,
  onClose,
  tournamentId,
  bracket,
  onBracketUpdate,
}: DirectorModeProps) {
  const { isAdmin } = useAuth();
  const { addLog } = useDirectorLog();
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [pinEntry, setPinEntry] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const handlePinSubmit = () => {
    if (pinEntry === DIRECTOR_PIN) {
      setIsUnlocked(true);
      setPinEntry('');
      addLog('Director Mode Accessed', 'Via PIN entry');
    } else {
      Alert.alert('Invalid PIN', 'The PIN you entered is incorrect.');
      setPinEntry('');
    }
  };

  React.useEffect(() => {
    if (visible && isAdmin) {
      setIsUnlocked(true);
      addLog('Director Mode Accessed', 'Via admin login');
    }
  }, [visible, isAdmin, addLog]);

  React.useEffect(() => {
    if (!visible) {
      setIsUnlocked(false);
      setPinEntry('');
      setActiveTab('matches');
    }
  }, [visible]);

  if (!visible) return null;

  if (!isUnlocked && !isAdmin) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.pinContainer}>
            <View style={styles.pinHeader}>
              <Text style={styles.pinTitle}>Director Access</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.pinLabel}>Enter 4-digit PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pinEntry}
              onChangeText={setPinEntry}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor="#9CA3AF"
              testID="director-pin-input"
            />
            <TouchableOpacity
              style={[styles.pinButton, pinEntry.length !== 4 && styles.pinButtonDisabled]}
              onPress={handlePinSubmit}
              disabled={pinEntry.length !== 4}
              testID="director-pin-submit"
            >
              <Text style={styles.pinButtonText}>Unlock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎬 DIRECTOR DASHBOARD</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.tabActive]}
            onPress={() => setActiveTab('matches')}
            testID="tab-matches"
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}>
              Matches
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'players' && styles.tabActive]}
            onPress={() => setActiveTab('players')}
            testID="tab-players"
          >
            <Text style={[styles.tabText, activeTab === 'players' && styles.tabTextActive]}>
              Players
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bracket' && styles.tabActive]}
            onPress={() => setActiveTab('bracket')}
            testID="tab-bracket"
          >
            <Text style={[styles.tabText, activeTab === 'bracket' && styles.tabTextActive]}>
              Bracket
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reset' && styles.tabActive]}
            onPress={() => setActiveTab('reset')}
            testID="tab-reset"
          >
            <Text style={[styles.tabText, activeTab === 'reset' && styles.tabTextActive]}>
              Reset
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'logs' && styles.tabActive]}
            onPress={() => setActiveTab('logs')}
            testID="tab-logs"
          >
            <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
              Logs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'broadcasts' && styles.tabActive]}
            onPress={() => setActiveTab('broadcasts')}
            testID="tab-broadcasts"
          >
            <Text style={[styles.tabText, activeTab === 'broadcasts' && styles.tabTextActive]}>
              Broadcast
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'matches' && (
            <MatchesTab
              tournamentId={tournamentId}
              bracket={bracket}
              onBracketUpdate={onBracketUpdate}
            />
          )}
          {activeTab === 'players' && (
            <PlayersTab tournamentId={tournamentId} bracket={bracket} />
          )}
          {activeTab === 'bracket' && (
            <BracketTab
              tournamentId={tournamentId}
              bracket={bracket}
              onBracketUpdate={onBracketUpdate}
            />
          )}
          {activeTab === 'reset' && (
            <ResetTab
              tournamentId={tournamentId}
              bracket={bracket}
              onBracketUpdate={onBracketUpdate}
            />
          )}
          {activeTab === 'logs' && <LogsTab tournamentId={tournamentId} />}
          {activeTab === 'broadcasts' && (
            <BroadcastCenterTab tournamentId={tournamentId} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pinContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  pinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#111827',
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12,
  },
  pinInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 12,
    marginBottom: 20,
  },
  pinButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  pinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#10B981',
  },
  title: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
});

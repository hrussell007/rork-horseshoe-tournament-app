import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { BracketMatch } from '@/types/bracket';
import Colors from '@/constants/colors';
import { X } from 'lucide-react-native';

interface ScoreEntryModalProps {
  visible: boolean;
  match: BracketMatch | null;
  onClose: () => void;
  onSubmit: (matchId: string, team1Score: number, team2Score: number, winnerId: string) => void;
}

export default function ScoreEntryModal({
  visible,
  match,
  onClose,
  onSubmit,
}: ScoreEntryModalProps) {
  const [team1Score, setTeam1Score] = useState<string>('');
  const [team2Score, setTeam2Score] = useState<string>('');

  React.useEffect(() => {
    if (match) {
      setTeam1Score(match.team1Score > 0 ? match.team1Score.toString() : '');
      setTeam2Score(match.team2Score > 0 ? match.team2Score.toString() : '');
    }
  }, [match]);

  const handleSubmit = () => {
    if (!match) return;

    const score1 = parseInt(team1Score, 10);
    const score2 = parseInt(team2Score, 10);

    if (isNaN(score1) || isNaN(score2)) {
      Alert.alert('Invalid Score', 'Please enter valid scores for both teams.');
      return;
    }

    if (score1 < 0 || score2 < 0) {
      Alert.alert('Invalid Score', 'Scores cannot be negative.');
      return;
    }

    if (score1 === score2) {
      Alert.alert('Tie Not Allowed', 'There must be a winner. Scores cannot be tied.');
      return;
    }

    const winnerId = score1 > score2 ? match.team1!.id : match.team2!.id;

    onSubmit(match.id, score1, score2, winnerId);
    handleClose();
  };

  const handleClose = () => {
    setTeam1Score('');
    setTeam2Score('');
    onClose();
  };

  if (!match || !match.team1 || !match.team2) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID="score-entry-modal"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter Match Score</Text>
            <TouchableOpacity onPress={handleClose} testID="close-modal-button">
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.matchInfo}>
            <Text style={styles.matchLabel}>Match {match.matchNumber}</Text>
            <Text style={styles.bracketLabel}>
              {match.bracket === 'winners' && 'Winners Bracket'}
              {match.bracket === 'losers' && 'Losers Bracket'}
              {match.bracket === 'finals' && 'Finals'}
            </Text>
          </View>

          <View style={styles.scoreInputsContainer}>
            <View style={styles.teamScoreRow}>
              <View style={styles.teamInfo}>
                <Text style={styles.seedText}>#{match.team1.seed}</Text>
                <Text style={styles.teamName} numberOfLines={2}>
                  {match.team1.name}
                </Text>
              </View>
              <TextInput
                style={styles.scoreInput}
                value={team1Score}
                onChangeText={setTeam1Score}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Colors.light.textSecondary}
                maxLength={3}
                testID="team1-score-input"
              />
            </View>

            <View style={styles.vs}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamScoreRow}>
              <View style={styles.teamInfo}>
                <Text style={styles.seedText}>#{match.team2.seed}</Text>
                <Text style={styles.teamName} numberOfLines={2}>
                  {match.team2.name}
                </Text>
              </View>
              <TextInput
                style={styles.scoreInput}
                value={team2Score}
                onChangeText={setTeam2Score}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Colors.light.textSecondary}
                maxLength={3}
                testID="team2-score-input"
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              testID="cancel-button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              testID="submit-score-button"
            >
              <Text style={styles.submitButtonText}>Submit Score</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  matchLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  bracketLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  scoreInputsContainer: {
    marginBottom: 16,
  },
  teamScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  seedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginRight: 6,
    minWidth: 24,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    flex: 1,
  },
  scoreInput: {
    width: 60,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  vs: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});

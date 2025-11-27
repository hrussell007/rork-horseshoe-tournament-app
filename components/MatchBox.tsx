import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BracketMatch } from '@/types/bracket';
import Colors from '@/constants/colors';
import { CheckCircle } from 'lucide-react-native';

interface MatchBoxProps {
  match: BracketMatch;
  onPress?: (match: BracketMatch) => void;
  width?: number;
}

export default function MatchBox({ match, onPress, width = 200 }: MatchBoxProps) {
  const canStart = match.team1 && match.team2 && match.status === 'pending';
  const isComplete = match.status === 'completed';
  const isInProgress = match.status === 'in_progress';

  const handlePress = () => {
    if ((canStart || isInProgress) && onPress) {
      onPress(match);
    }
  };

  const getTeamStyle = (teamId?: string) => {
    if (!isComplete || !teamId) return {};
    if (teamId === match.winnerId) {
      return { backgroundColor: '#D4EDDA', borderColor: '#28A745', borderWidth: 2 };
    }
    return { opacity: 0.5 };
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      disabled={!canStart && !isInProgress}
      activeOpacity={0.7}
      testID={`match-box-${match.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.matchNumber}>Match {match.matchNumber}</Text>
        {isComplete && <CheckCircle size={14} color="#28A745" />}
        {isInProgress && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <View style={[styles.teamRow, getTeamStyle(match.team1?.id)]}>
        {match.team1 ? (
          <>
            <Text style={styles.seedText}>#{match.team1.seed}</Text>
            <Text style={styles.teamName} numberOfLines={1}>{match.team1.name}</Text>
            {isComplete && (
              <Text style={styles.scoreText}>{match.team1Score}</Text>
            )}
          </>
        ) : (
          <Text style={styles.tbd}>TBD</Text>
        )}
      </View>

      <View style={styles.divider} />

      <View style={[styles.teamRow, getTeamStyle(match.team2?.id)]}>
        {match.team2 ? (
          <>
            <Text style={styles.seedText}>#{match.team2.seed}</Text>
            <Text style={styles.teamName} numberOfLines={1}>{match.team2.name}</Text>
            {isComplete && (
              <Text style={styles.scoreText}>{match.team2Score}</Text>
            )}
          </>
        ) : (
          <Text style={styles.tbd}>TBD</Text>
        )}
      </View>

      {canStart && (
        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>Tap to Start</Text>
        </View>
      )}
      {isInProgress && (
        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>Tap to Score</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchNumber: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  liveIndicator: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  seedText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    width: 24,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.light.text,
    flex: 1,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginLeft: 8,
    minWidth: 24,
    textAlign: 'right',
  },
  tbd: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.light.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  actionHint: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'center',
  },
  actionHintText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
});

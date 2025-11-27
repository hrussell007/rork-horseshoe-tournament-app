import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTournamentData } from '@/contexts/TournamentContext';
import BracketManager from '@/components/BracketManager';
import DirectorMode from '@/components/DirectorMode';
import Colors from '@/constants/colors';

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, players, updateTournament } = useTournamentData();
  const [directorModeVisible, setDirectorModeVisible] = useState<boolean>(false);
  const tapCount = useRef<number>(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tournament = tournaments.find((t) => t.id === id);

  const handleLogoTap = () => {
    tapCount.current += 1;
    console.log(`🎬 Logo tap count: ${tapCount.current}`);

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    if (tapCount.current === 5) {
      console.log('🎬 Opening Director Mode via hidden gesture');
      setDirectorModeVisible(true);
      tapCount.current = 0;
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 2000);
    }
  };

  const handleBracketUpdate = (bracket: any) => {
    updateTournament(id, { bracketState: bracket });
  };

  const playersMap = React.useMemo(() => {
    const map = new Map<string, { name: string }>();
    players.forEach((player) => {
      map.set(player.id, { name: player.name });
    });
    return map;
  }, [players]);

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Bracket' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Tournament not found</Text>
        </View>
      </View>
    );
  }

  if (!tournament.teams || tournament.teams.length < 10) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: tournament.name }} />
        <ScrollView contentContainerStyle={styles.messageContainer}>
          <Text style={styles.messageTitle}>Not Enough Teams</Text>
          <Text style={styles.messageText}>
            Double-elimination brackets require at least 10 teams.
          </Text>
          <Text style={styles.messageText}>
            Current teams: {tournament.teams?.length || 0}
          </Text>
          <Text style={styles.messageText}>
            Please add {10 - (tournament.teams?.length || 0)} more teams to generate the bracket.
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `${tournament.name} - Bracket`,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleLogoTap}
              style={styles.logoTap}
              testID="director-mode-trigger"
            >
              <Text style={styles.logoEmoji}>🎬</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      <BracketManager tournamentId={id} teams={tournament.teams} playersMap={playersMap} />
      <DirectorMode
        visible={directorModeVisible}
        onClose={() => setDirectorModeVisible(false)}
        tournamentId={id}
        bracket={tournament.bracketState || null}
        onBracketUpdate={handleBracketUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  logoTap: {
    padding: 8,
    marginRight: 8,
  },
  logoEmoji: {
    fontSize: 24,
  },
});

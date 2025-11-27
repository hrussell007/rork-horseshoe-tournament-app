import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { BracketTeam, BracketMatch, DoublEliminationBracket } from '@/types/bracket';
import { generateDoubleEliminationBracket, advanceWinner } from '@/utils/bracketGenerator';
import DoubleEliminationBracketView from './DoubleEliminationBracketView';
import ScoreEntryModal from './ScoreEntryModal';
import { Team } from '@/types/tournament';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';

interface BracketManagerProps {
  tournamentId: string;
  teams: Team[];
  playersMap: Map<string, { name: string }>;
}

export default function BracketManager({ tournamentId, teams, playersMap }: BracketManagerProps) {
  const { tournaments, updateTournament, addMatch, matches, deleteMatch } = useTournamentData();
  const { isAdmin } = useAuth();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  const [bracket, setBracket] = useState<DoublEliminationBracket | null>(tournament?.bracketState || null);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const bracketTeams: BracketTeam[] = useMemo(() => {
    return teams.map((team, index) => {
      const player1 = playersMap.get(team.player1Id);
      const player2 = playersMap.get(team.player2Id);
      
      const teamName = team.name || 
        `${player1?.name || 'Unknown'} & ${player2?.name || 'Unknown'}`;
      
      return {
        id: team.id,
        name: teamName,
        seed: index + 1,
      };
    });
  }, [teams, playersMap]);

  React.useEffect(() => {
    if (tournament?.bracketState) {
      console.log('📥 Loading existing bracket state');
      setBracket(tournament.bracketState);
      return;
    }
    
    if (bracketTeams.length >= 10) {
      console.log('🏆 Generating bracket for', bracketTeams.length, 'teams');
      try {
        const generatedBracket = generateDoubleEliminationBracket(bracketTeams);
        setBracket(generatedBracket);
        updateTournament(tournamentId, { bracketState: generatedBracket });
        console.log('💾 Bracket state saved to tournament');
      } catch (error) {
        console.error('❌ Error generating bracket:', error);
        Alert.alert(
          'Bracket Generation Error',
          error instanceof Error ? error.message : 'Failed to generate bracket'
        );
      }
    } else {
      console.log(`⚠️  Need at least 10 teams for double-elimination (have ${bracketTeams.length})`);
      setBracket(null);
    }
  }, [bracketTeams, tournament?.bracketState, tournamentId, updateTournament]);

  const handleMatchPress = (match: BracketMatch) => {
    console.log('📋 Match selected:', match.id);
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const handleScoreSubmit = (
    matchId: string,
    team1Score: number,
    team2Score: number,
    winnerId: string
  ) => {
    if (!bracket) return;

    console.log('✅ Submitting score:', { matchId, team1Score, team2Score, winnerId });

    const match = bracket.allMatches.find(m => m.id === matchId);
    if (!match || !match.team1 || !match.team2) return;

    const loserId = match.team1.id === winnerId ? match.team2.id : match.team1.id;
    if (!loserId) return;

    try {
      const updatedBracket = advanceWinner(
        bracket,
        matchId,
        winnerId,
        loserId,
        team1Score,
        team2Score
      );
      setBracket(updatedBracket);
      updateTournament(tournamentId, { bracketState: updatedBracket });
      console.log('🎯 Bracket updated and saved');
      
      addMatch({
        tournamentId,
        team1Id: match.team1.id,
        team2Id: match.team2.id,
        team1Score,
        team2Score,
        team1Ringers: 0,
        team2Ringers: 0,
        winnerTeamId: winnerId,
        status: 'completed',
        round: match.round,
      });
      console.log('📊 Match result saved to tournament standings');
    } catch (error) {
      console.error('❌ Error updating bracket:', error);
      Alert.alert('Error', 'Failed to update bracket with score');
    }
  };

  const handleResetBracket = () => {
    Alert.alert(
      'Reset Bracket',
      'Are you sure you want to reset the bracket? This will clear all match results, reset team wins/losses, and reset the bracket to the beginning.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            console.log('🔄 Resetting bracket...');
            try {
              const freshBracket = generateDoubleEliminationBracket(bracketTeams);
              setBracket(freshBracket);
              updateTournament(tournamentId, { bracketState: freshBracket });
              
              const tournamentMatchesToDelete = matches.filter(
                (m) => m.tournamentId === tournamentId
              );
              
              tournamentMatchesToDelete.forEach((match) => {
                console.log(`🗑️  Deleting match ${match.id}`);
                deleteMatch(match.id);
              });
              
              console.log(`🗑️  Cleared ${tournamentMatchesToDelete.length} bracket matches from tournament data`);
              
              if (tournament?.teams) {
                tournament.teams.forEach((team) => {
                  console.log(`🔄 Resetting stats for team ${team.id}`);
                });
              }
              
              console.log('✅ Bracket reset successfully');
              Alert.alert('Success', 'Bracket has been reset to the start. All wins, losses, and match history have been cleared.');
            } catch (error) {
              console.error('❌ Error resetting bracket:', error);
              Alert.alert('Error', 'Failed to reset bracket');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!bracket || bracketTeams.length < 10) {
    return null;
  }

  return (
    <View style={styles.container}>
      {isAdmin && (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetBracket}
            testID="reset-bracket-button"
          >
            <Text style={styles.resetButtonText}>Reset Bracket</Text>
          </TouchableOpacity>
        </View>
      )}
      <DoubleEliminationBracketView
        bracket={bracket}
        onMatchPress={handleMatchPress}
      />
      <ScoreEntryModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => setModalVisible(false)}
        onSubmit={handleScoreSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

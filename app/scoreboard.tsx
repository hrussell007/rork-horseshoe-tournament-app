import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTournamentData } from '@/contexts/TournamentContext';
import { Clock, MapPin, Users, Trophy, Activity, Tv } from 'lucide-react-native';
import Colors from '@/constants/colors';
import DoubleEliminationBracketView from '@/components/DoubleEliminationBracketView';
import { Match } from '@/types/tournament';

type TabType = 'bracket' | 'pits' | 'feed' | 'leaderboard';

export default function PublicScoreboard() {
  const { id } = useLocalSearchParams();
  const tournamentId = Array.isArray(id) ? id[0] : id;
  const { tournaments, matches, players } = useTournamentData();
  const [selectedTab, setSelectedTab] = useState<TabType>('pits');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === tournamentId),
    [tournaments, tournamentId]
  );

  const tournamentMatches = useMemo(
    () => matches.filter((m) => m.tournamentId === tournamentId),
    [matches, tournamentId]
  );

  const isDoubleElimination = tournament && tournament.teams && tournament.teams.length >= 10;

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing scoreboard data...');
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (!tournament) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Scoreboard Not Found' }} />
        <Text style={styles.errorText}>Tournament not found</Text>
      </View>
    );
  }

  const renderTabBar = () => {
    const tabs: { key: TabType; label: string; icon: any }[] = [
      { key: 'bracket', label: 'Bracket', icon: Trophy },
      { key: 'pits', label: 'Pits', icon: MapPin },
      { key: 'feed', label: 'Live Feed', icon: Activity },
      { key: 'leaderboard', label: 'Rankings', icon: Users },
    ];

    return (
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key)}
              testID={`tab-${tab.key}`}
            >
              <Icon size={20} color={isActive ? '#FFFFFF' : Colors.light.textSecondary} />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderBracketTab = () => {
    if (!isDoubleElimination) {
      return (
        <View style={styles.emptyState}>
          <Trophy size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyStateTitle}>Round Robin Tournament</Text>
          <Text style={styles.emptyStateText}>
            This tournament is running in Round Robin format.{'\n'}
            Check Pits tab for live matches.
          </Text>
        </View>
      );
    }

    if (!tournament.bracketState) {
      return (
        <View style={styles.emptyState}>
          <Trophy size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyStateTitle}>Bracket Not Generated</Text>
          <Text style={styles.emptyStateText}>
            The tournament bracket has not been generated yet.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.bracketContainer}>
        <DoubleEliminationBracketView
          bracket={tournament.bracketState}
          onMatchPress={undefined}
        />
      </View>
    );
  };

  const renderPitsTab = () => {
    const getTeamName = (teamId: string): string => {
      const team = tournament.teams?.find((t) => t.id === teamId);
      if (!team) return 'Unknown';
      const player1 = players.find((p) => p.id === team.player1Id);
      const player2 = players.find((p) => p.id === team.player2Id);
      if (!player1 || !player2) return 'Team';
      return `${player1.name.split(' ')[0]} / ${player2.name.split(' ')[0]}`;
    };

    const inProgressMatches = tournamentMatches.filter(m => m.status === 'in_progress');
    const allPendingMatches = tournamentMatches.filter(m => m.status === 'pending');
    const pendingMatchesWithPit = allPendingMatches.filter(m => m.pitNumber);
    
    const maxPits = tournament.availablePits || 0;
    const pitsInUse = new Set(inProgressMatches.map(m => m.pitNumber).filter(p => p !== undefined));
    const allPitsInUse = pitsInUse.size >= maxPits && maxPits > 0;

    const nextMatch = (allPitsInUse && allPendingMatches.length > 0)
      ? allPendingMatches.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.createdAt.localeCompare(b.createdAt);
        })[0]
      : null;

    const pitMap = new Map<number, Match[]>();
    inProgressMatches.forEach((match) => {
      if (match.pitNumber) {
        const pitMatches = pitMap.get(match.pitNumber) || [];
        pitMatches.push(match);
        pitMap.set(match.pitNumber, pitMatches);
      }
    });

    pendingMatchesWithPit.forEach((match) => {
      if (match.pitNumber && !pitMap.has(match.pitNumber)) {
        const pitMatches = pitMap.get(match.pitNumber) || [];
        pitMatches.push(match);
        pitMap.set(match.pitNumber, pitMatches);
      }
    });

    const sortedPits = Array.from(pitMap.entries()).sort((a, b) => a[0] - b[0]);

    if (sortedPits.length === 0 && inProgressMatches.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MapPin size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Pit Assignments</Text>
          <Text style={styles.emptyStateText}>
            Pit assignments will appear here once matches begin.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.pitsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {nextMatch && (
          <View style={styles.onDeckCard}>
            <View style={styles.onDeckHeader}>
              <Text style={styles.onDeckBadge}>⏳ ON DECK</Text>
            </View>
            <View style={styles.matchCard}>
              <View style={styles.matchTeams}>
                <Text style={styles.teamNameSmall}>{getTeamName(nextMatch.team1Id)}</Text>
                <Text style={styles.vsText}>vs</Text>
                <Text style={styles.teamNameSmall}>{getTeamName(nextMatch.team2Id)}</Text>
              </View>
              <Text style={styles.matchMeta}>
                Round {nextMatch.round} • To {nextMatch.targetPoints || 30} • Pit {nextMatch.pitNumber}
              </Text>
            </View>
          </View>
        )}
        {sortedPits.map(([pitNumber, pitMatches]) => {
          const currentMatch = pitMatches.find((m) => m.status === 'in_progress');
          const upcomingMatch = pitMatches.find((m) => m.status === 'pending');

          if (!currentMatch && !upcomingMatch) {
            return null;
          }

          return (
            <View key={pitNumber} style={styles.pitCard}>
              <View style={styles.pitHeader}>
                <View style={styles.pitNumberBadge}>
                  <Text style={styles.pitNumberText}>Pit {pitNumber}</Text>
                </View>
                {currentMatch && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              {currentMatch && (
                <View style={styles.matchSection}>
                  <Text style={styles.matchSectionTitle}>Currently Playing</Text>
                  <View style={styles.matchCard}>
                    <View style={styles.matchTeams}>
                      <View style={styles.teamRow}>
                        <Text style={styles.teamName}>{getTeamName(currentMatch.team1Id)}</Text>
                        <Text style={styles.teamScore}>{currentMatch.team1Score}</Text>
                      </View>
                      <Text style={styles.vsText}>vs</Text>
                      <View style={styles.teamRow}>
                        <Text style={styles.teamName}>{getTeamName(currentMatch.team2Id)}</Text>
                        <Text style={styles.teamScore}>{currentMatch.team2Score}</Text>
                      </View>
                    </View>
                    <Text style={styles.matchMeta}>
                      Round {currentMatch.round} • Playing to {currentMatch.targetPoints || 30}
                    </Text>
                  </View>
                </View>
              )}

              {upcomingMatch && !currentMatch && (
                <View style={styles.matchSection}>
                  <Text style={styles.matchSectionTitle}>Next Up</Text>
                  <View style={styles.matchCard}>
                    <View style={styles.matchTeams}>
                      <Text style={styles.teamNameSmall}>{getTeamName(upcomingMatch.team1Id)}</Text>
                      <Text style={styles.vsText}>vs</Text>
                      <Text style={styles.teamNameSmall}>{getTeamName(upcomingMatch.team2Id)}</Text>
                    </View>
                    <Text style={styles.matchMeta}>
                      Round {upcomingMatch.round} • To {upcomingMatch.targetPoints || 30}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderFeedTab = () => {
    const completedMatches = tournamentMatches
      .filter((m) => m.status === 'completed')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50);

    const getTeamName = (teamId: string): string => {
      const team = tournament.teams?.find((t) => t.id === teamId);
      if (!team) return 'Unknown';
      const player1 = players.find((p) => p.id === team.player1Id);
      const player2 = players.find((p) => p.id === team.player2Id);
      if (!player1 || !player2) return 'Team';
      return `${player1.name.split(' ')[0]} / ${player2.name.split(' ')[0]}`;
    };

    const formatTime = (timestamp: string): string => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    };

    if (completedMatches.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Activity size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Activity Yet</Text>
          <Text style={styles.emptyStateText}>
            Match results will appear here as games are completed.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.feedContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {completedMatches.map((match) => {
          const winnerName = match.winnerTeamId ? getTeamName(match.winnerTeamId) : 'Unknown';
          const loserTeamId =
            match.winnerTeamId === match.team1Id ? match.team2Id : match.team1Id;
          const loserName = getTeamName(loserTeamId);
          const winnerScore = match.winnerTeamId === match.team1Id ? match.team1Score : match.team2Score;
          const loserScore = match.winnerTeamId === match.team1Id ? match.team2Score : match.team1Score;

          return (
            <View key={match.id} style={styles.feedCard}>
              <View style={styles.feedHeader}>
                <View style={styles.feedIcon}>
                  <Trophy size={16} color={Colors.light.tint} />
                </View>
                <Text style={styles.feedTime}>{formatTime(match.createdAt)}</Text>
              </View>
              <Text style={styles.feedText}>
                <Text style={styles.feedWinner}>{winnerName}</Text> defeated{' '}
                <Text style={styles.feedLoser}>{loserName}</Text>
              </Text>
              <Text style={styles.feedScore}>
                {winnerScore}–{loserScore}
              </Text>
              <Text style={styles.feedMeta}>
                Round {match.round}
                {match.pitNumber ? ` • Pit ${match.pitNumber}` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderLeaderboardTab = () => {
    const teamStats = tournament.teams?.map((team) => {
      const teamMatches = tournamentMatches.filter(
        (m) => (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'completed'
      );
      const wins = teamMatches.filter((m) => m.winnerTeamId === team.id).length;
      const losses = teamMatches.filter((m) => m.winnerTeamId !== team.id).length;
      let totalPoints = 0;

      teamMatches.forEach((m) => {
        if (m.team1Id === team.id) totalPoints += m.team1Score;
        if (m.team2Id === team.id) totalPoints += m.team2Score;
      });

      const player1 = players.find((p) => p.id === team.player1Id);
      const player2 = players.find((p) => p.id === team.player2Id);
      const teamName = player1 && player2 
        ? `${player1.name.split(' ')[0]} / ${player2.name.split(' ')[0]}`
        : 'Unknown Team';

      return {
        teamId: team.id,
        teamName,
        wins,
        losses,
        totalPoints,
        matches: wins + losses,
      };
    }) || [];

    const sortedStats = teamStats.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return b.totalPoints - a.totalPoints;
    });

    if (sortedStats.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Users size={64} color={Colors.light.textSecondary} />
          <Text style={styles.emptyStateTitle}>No Rankings Yet</Text>
          <Text style={styles.emptyStateText}>
            Team rankings will appear here as matches are completed.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.leaderboardContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.leaderboardTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Rank</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Team</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>W</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>L</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Pts</Text>
          </View>
          {sortedStats.map((stat, index) => (
            <View
              key={stat.teamId}
              style={[styles.tableRow, index < 3 && styles.tableRowHighlight]}
            >
              <View style={[styles.rankBadge, index < 3 && styles.rankBadgeTop]}>
                <Text style={[styles.rankText, index < 3 && styles.rankTextTop]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={1}>
                {stat.teamName}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                {stat.wins}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                {stat.losses}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}>
                {stat.totalPoints}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.liveIndicatorLarge}>
          <View style={styles.liveDotLarge} />
          <Text style={styles.liveTextLarge}>LIVE</Text>
        </View>
        <TouchableOpacity
          style={styles.autoRefreshToggle}
          onPress={() => setAutoRefresh(!autoRefresh)}
        >
          <Tv size={16} color={autoRefresh ? Colors.light.tint : Colors.light.textSecondary} />
          <Text
            style={[
              styles.autoRefreshText,
              { color: autoRefresh ? Colors.light.tint : Colors.light.textSecondary },
            ]}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.headerTitle}>{tournament.name}</Text>
      <View style={styles.headerMeta}>
        {tournament.date && (
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>
              {new Date(tournament.date).toLocaleDateString()}
            </Text>
          </View>
        )}
        {tournament.location && (
          <View style={styles.metaItem}>
            <MapPin size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{tournament.location}</Text>
          </View>
        )}
        {tournament.teams && (
          <View style={styles.metaItem}>
            <Users size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{tournament.teams.length} teams</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Live Scoreboard',
          headerStyle: { backgroundColor: Colors.light.tint },
          headerTintColor: '#FFFFFF',
        }}
      />
      {renderHeader()}
      {renderTabBar()}
      <View style={styles.content}>
        {selectedTab === 'bracket' && renderBracketTab()}
        {selectedTab === 'pits' && renderPitsTab()}
        {selectedTab === 'feed' && renderFeedTab()}
        {selectedTab === 'leaderboard' && renderLeaderboardTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicatorLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDotLarge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveTextLarge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  autoRefreshToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  autoRefreshText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
  },
  bracketContainer: {
    flex: 1,
  },
  pitsContainer: {
    flex: 1,
    padding: 16,
  },
  onDeckCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFB800',
  },
  onDeckHeader: {
    marginBottom: 12,
  },
  onDeckBadge: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFB800',
    letterSpacing: 1,
  },
  pitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pitNumberBadge: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pitNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  matchSection: {
    marginBottom: 12,
  },
  matchSectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.light.text,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  matchSectionTitleSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  matchCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  matchTeams: {
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    flex: 1,
  },
  teamNameSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.tint,
    marginLeft: 12,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  matchMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  completedMatchText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  pitStatusContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  pitStatusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.success,
  },
  feedContainer: {
    flex: 1,
    padding: 16,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.light.tint}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600' as const,
  },
  feedText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  feedWinner: {
    fontWeight: '700' as const,
    color: Colors.light.tint,
  },
  feedLoser: {
    fontWeight: '600' as const,
  },
  feedScore: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  feedMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  leaderboardContainer: {
    flex: 1,
    padding: 16,
  },
  leaderboardTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableRowHighlight: {
    backgroundColor: '#FFF9E6',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flex: 0.8,
  },
  rankBadgeTop: {
    backgroundColor: Colors.light.tint,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
  },
  rankTextTop: {
    color: '#FFFFFF',
  },
  tableCell: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  tableCellCenter: {
    textAlign: 'center',
  },
});

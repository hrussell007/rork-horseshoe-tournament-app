import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Trophy, Medal, Award, X, History, ChevronRight } from 'lucide-react-native';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';

export default function StandingsScreen() {
  const [selectedClass, setSelectedClass] = useState<'A' | 'B'>('A');

  const [pastSeasonModalVisible, setPastSeasonModalVisible] = useState<boolean>(false);
  const [selectedPastSeason, setSelectedPastSeason] = useState<string | null>(null);
  const { players, calculateSeasonStandings, pastSeasons } = useTournamentData();
  const { colors: themeColors } = useTheme();
  const Colors = themeColors;
  const classAStandings = calculateSeasonStandings('A');
  const classBStandings = calculateSeasonStandings('B');
  const seasonStandings = selectedClass === 'A' ? classAStandings : classBStandings;

  const getPlayerName = (playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    return player?.name || 'Unknown Player';
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy size={24} color="#FFD700" />;
    if (index === 1) return <Medal size={24} color="#C0C0C0" />;
    if (index === 2) return <Award size={24} color="#CD7F32" />;
    return null;
  };

  const renderStandingItem = ({ item, index }: { item: any; index: number }) => {
    const prevItem = index > 0 ? seasonStandings[index - 1] : null;
    const isSameRank = prevItem && prevItem.points === item.points;
    
    let displayRank = index + 1;
    if (isSameRank) {
      let rankIndex = index - 1;
      while (rankIndex >= 0 && seasonStandings[rankIndex].points === item.points) {
        rankIndex--;
      }
      displayRank = rankIndex + 2;
    }
    
    return (
    <View 
      style={[
        styles.standingCard,
        displayRank === 1 && styles.firstPlaceCard,
        displayRank === 2 && styles.secondPlaceCard,
        displayRank === 3 && styles.thirdPlaceCard,
      ]}
    >
      <View style={styles.standingLeft}>
        <View
          style={[
            styles.rankBadge,
            displayRank === 1 && styles.rank1Badge,
            displayRank === 2 && styles.rank2Badge,
            displayRank === 3 && styles.rank3Badge,
          ]}
        >
          {displayRank <= 3 ? (
            getMedalIcon(displayRank - 1)
          ) : (
            <Text style={styles.rankText}>{displayRank}</Text>
          )}
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{getPlayerName(item.playerId)}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{item.tournamentsPlayed} tournaments</Text>
            {item.firstPlaceFinishes > 0 && (
              <View style={styles.placementBadge}>
                <Trophy size={12} color="#FFD700" />
                <Text style={styles.placementText}>{item.firstPlaceFinishes}</Text>
              </View>
            )}
            {item.secondPlaceFinishes > 0 && (
              <View style={styles.placementBadge}>
                <Medal size={12} color="#C0C0C0" />
                <Text style={styles.placementText}>{item.secondPlaceFinishes}</Text>
              </View>
            )}
            {item.thirdPlaceFinishes > 0 && (
              <View style={styles.placementBadge}>
                <Award size={12} color="#CD7F32" />
                <Text style={styles.placementText}>{item.thirdPlaceFinishes}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsValue}>{item.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      {classAStandings.length === 0 && classBStandings.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>No Season Data</Text>
          <Text style={styles.emptyText}>
            Complete tournaments to see season standings
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Season Leaderboard</Text>
              {pastSeasons.length > 0 && (
                <TouchableOpacity
                  style={styles.pastSeasonsButton}
                  onPress={() => setPastSeasonModalVisible(true)}
                  testID="past-seasons-button"
                >
                  <History size={20} color={Colors.light.tint} />
                  <Text style={styles.pastSeasonsButtonText}>Past Seasons</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.classToggle}>
              <TouchableOpacity
                style={[
                  styles.classToggleButton,
                  selectedClass === 'A' && styles.classToggleButtonActive,
                ]}
                onPress={() => setSelectedClass('A')}
              >
                <Text
                  style={[
                    styles.classToggleText,
                    selectedClass === 'A' && styles.classToggleTextActive,
                  ]}
                >
                  Class A ({classAStandings.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.classToggleButton,
                  selectedClass === 'B' && styles.classToggleButtonActive,
                ]}
                onPress={() => setSelectedClass('B')}
              >
                <Text
                  style={[
                    styles.classToggleText,
                    selectedClass === 'B' && styles.classToggleTextActive,
                  ]}
                >
                  Class B ({classBStandings.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={seasonStandings}
            renderItem={renderStandingItem}
            keyExtractor={(item) => item.playerId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            testID="standings-list"
          />
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Points System</Text>
            <View style={styles.legendRow}>
              <Text style={styles.legendItem}>• Participation: 1 pt</Text>
              <Text style={styles.legendItem}>• 1st Place: 10 pts</Text>
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendItem}>• 2nd Place: 5 pts</Text>
              <Text style={styles.legendItem}>• 3rd Place: 3 pts</Text>
            </View>
          </View>



          <Modal
            visible={pastSeasonModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPastSeasonModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.pastSeasonModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Past Seasons</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setPastSeasonModalVisible(false);
                      setSelectedPastSeason(null);
                    }}
                    testID="close-past-season-modal"
                  >
                    <X size={24} color={Colors.light.text} />
                  </TouchableOpacity>
                </View>

                {selectedPastSeason ? (
                  <ScrollView style={styles.modalBody}>
                    {(() => {
                      const season = pastSeasons.find(s => s.id === selectedPastSeason);
                      if (!season) return null;

                      const standings = selectedClass === 'A' ? season.classAStandings : season.classBStandings;

                      return (
                        <View>
                          <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setSelectedPastSeason(null)}
                          >
                            <Text style={styles.backButtonText}>← Back to All Seasons</Text>
                          </TouchableOpacity>

                          <Text style={styles.pastSeasonDetailTitle}>{season.name}</Text>
                          <Text style={styles.pastSeasonDetailDate}>
                            Ended: {new Date(season.endDate).toLocaleDateString()}
                          </Text>

                          <View style={styles.classToggle}>
                            <TouchableOpacity
                              style={[
                                styles.classToggleButton,
                                selectedClass === 'A' && styles.classToggleButtonActive,
                              ]}
                              onPress={() => setSelectedClass('A')}
                            >
                              <Text
                                style={[
                                  styles.classToggleText,
                                  selectedClass === 'A' && styles.classToggleTextActive,
                                ]}
                              >
                                Class A ({season.classAStandings.length})
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.classToggleButton,
                                selectedClass === 'B' && styles.classToggleButtonActive,
                              ]}
                              onPress={() => setSelectedClass('B')}
                            >
                              <Text
                                style={[
                                  styles.classToggleText,
                                  selectedClass === 'B' && styles.classToggleTextActive,
                                ]}
                              >
                                Class B ({season.classBStandings.length})
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {standings.length === 0 ? (
                            <Text style={styles.emptyText}>No standings for this class</Text>
                          ) : (
                            standings.map((item, index) => {
                              const prevItem = index > 0 ? standings[index - 1] : null;
                              const isSameRank = prevItem && prevItem.points === item.points;
                              
                              let displayRank = index + 1;
                              if (isSameRank) {
                                let rankIndex = index - 1;
                                while (rankIndex >= 0 && standings[rankIndex].points === item.points) {
                                  rankIndex--;
                                }
                                displayRank = rankIndex + 2;
                              }
                              
                              return (
                                <View 
                                  key={item.playerId}
                                  style={[
                                    styles.standingCard,
                                    displayRank === 1 && styles.firstPlaceCard,
                                    displayRank === 2 && styles.secondPlaceCard,
                                    displayRank === 3 && styles.thirdPlaceCard,
                                  ]}
                                >
                                  <View style={styles.standingLeft}>
                                    <View
                                      style={[
                                        styles.rankBadge,
                                        displayRank === 1 && styles.rank1Badge,
                                        displayRank === 2 && styles.rank2Badge,
                                        displayRank === 3 && styles.rank3Badge,
                                      ]}
                                    >
                                      {displayRank <= 3 ? (
                                        getMedalIcon(displayRank - 1)
                                      ) : (
                                        <Text style={styles.rankText}>{displayRank}</Text>
                                      )}
                                    </View>
                                    <View style={styles.playerInfo}>
                                      <Text style={styles.playerName}>{getPlayerName(item.playerId)}</Text>
                                      <View style={styles.statsRow}>
                                        <Text style={styles.statText}>{item.tournamentsPlayed} tournaments</Text>
                                        {item.firstPlaceFinishes > 0 && (
                                          <View style={styles.placementBadge}>
                                            <Trophy size={12} color="#FFD700" />
                                            <Text style={styles.placementText}>{item.firstPlaceFinishes}</Text>
                                          </View>
                                        )}
                                        {item.secondPlaceFinishes > 0 && (
                                          <View style={styles.placementBadge}>
                                            <Medal size={12} color="#C0C0C0" />
                                            <Text style={styles.placementText}>{item.secondPlaceFinishes}</Text>
                                          </View>
                                        )}
                                        {item.thirdPlaceFinishes > 0 && (
                                          <View style={styles.placementBadge}>
                                            <Award size={12} color="#CD7F32" />
                                            <Text style={styles.placementText}>{item.thirdPlaceFinishes}</Text>
                                          </View>
                                        )}
                                      </View>
                                    </View>
                                  </View>
                                  <View style={styles.pointsContainer}>
                                    <Text style={styles.pointsValue}>{item.points}</Text>
                                    <Text style={styles.pointsLabel}>pts</Text>
                                  </View>
                                </View>
                              );
                            })
                          )}
                        </View>
                      );
                    })()}
                  </ScrollView>
                ) : (
                  <ScrollView style={styles.modalBody}>
                    {pastSeasons.map((season) => (
                      <TouchableOpacity
                        key={season.id}
                        style={styles.pastSeasonCard}
                        onPress={() => setSelectedPastSeason(season.id)}
                        testID={`past-season-${season.id}`}
                      >
                        <View style={styles.pastSeasonCardLeft}>
                          <Trophy size={24} color={Colors.light.tint} />
                          <View style={styles.pastSeasonInfo}>
                            <Text style={styles.pastSeasonName}>{season.name}</Text>
                            <Text style={styles.pastSeasonDate}>
                              Ended {new Date(season.endDate).toLocaleDateString()}
                            </Text>
                            <View style={styles.pastSeasonStats}>
                              <Text style={styles.pastSeasonStat}>
                                Class A: {season.classAStandings.length} players
                              </Text>
                              <Text style={styles.pastSeasonStat}>
                                Class B: {season.classBStandings.length} players
                              </Text>
                            </View>
                          </View>
                        </View>
                        <ChevronRight size={20} color={Colors.light.tabIconDefault} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  classToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  classToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  classToggleButtonActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  classToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  classToggleTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  standingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  firstPlaceCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFD70008',
  },
  secondPlaceCard: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
    backgroundColor: '#C0C0C008',
  },
  thirdPlaceCard: {
    borderWidth: 2,
    borderColor: '#CD7F32',
    backgroundColor: '#CD7F3208',
  },
  standingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  rank1Badge: {
    backgroundColor: '#FFD70020',
    borderColor: '#FFD700',
  },
  rank2Badge: {
    backgroundColor: '#C0C0C020',
    borderColor: '#C0C0C0',
  },
  rank3Badge: {
    backgroundColor: '#CD7F3220',
    borderColor: '#CD7F32',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  placementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  placementText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  pointsContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.tint,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600' as const,
  },
  legend: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  legendItem: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  pastSeasonsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pastSeasonsButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  pastSeasonModalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
  },
  pastSeasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pastSeasonCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pastSeasonInfo: {
    flex: 1,
  },
  pastSeasonName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  pastSeasonDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  pastSeasonStats: {
    flexDirection: 'row',
    gap: 12,
  },
  pastSeasonStat: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  pastSeasonDetailTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  pastSeasonDetailDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600' as const,
  },
});

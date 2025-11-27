import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  Image,
  ImageBackground,
} from 'react-native';
import { Trophy, Plus, Trash2, Play, CheckCircle, X, Users, MapPin, Calendar, Clock, Edit2, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';
import { Tournament, Team } from '@/types/tournament';

export default function TournamentsScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { colors } = useTheme();
  const { tournaments, players, addTournament, deleteTournament, updateTournament } =
    useTournamentData();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [entryFee, setEntryFee] = useState<string>('');
  const [firstPlace, setFirstPlace] = useState<string>('50');
  const [secondPlace, setSecondPlace] = useState<string>('30');
  const [thirdPlace, setThirdPlace] = useState<string>('20');
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<{ player1Id: string; player2Id: string }>({ player1Id: '', player2Id: '' });
  const [numTeams, setNumTeams] = useState<string>('');
  const [selectingTeamIndex, setSelectingTeamIndex] = useState<number | null>(null);
  const [teamCreationStep, setTeamCreationStep] = useState<'count' | 'assign'>('count');
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>('');
  const [availablePits, setAvailablePits] = useState<string>('');

  const handleAddTournament = () => {
    setName('');
    setLocation('');
    setDate('');
    setTime('');
    setEntryFee('');
    setFirstPlace('50');
    setSecondPlace('30');
    setThirdPlace('20');
    setTeams([]);
    setCurrentTeam({ player1Id: '', player2Id: '' });
    setNumTeams('');
    setSelectingTeamIndex(null);
    setTeamCreationStep('count');
    setImageUri('');
    setAvailablePits('');
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const createEmptyTeams = () => {
    const count = parseInt(numTeams);
    if (isNaN(count) || count < 2) {
      Alert.alert('Error', 'Enter at least 2 teams');
      return;
    }
    const paidPlayers = players.filter(p => p.hasPaidMembership);
    if (count > paidPlayers.length / 2) {
      Alert.alert('Error', `You need at least ${count * 2} players with paid membership for ${count} teams`);
      return;
    }
    const emptyTeams: Team[] = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      player1Id: '',
      player2Id: '',
      name: `Team ${i + 1}`,
    }));
    setTeams(emptyTeams);
    setTeamCreationStep('assign');
  };

  const handleSelectTeam = (index: number) => {
    setSelectingTeamIndex(index);
    setCurrentTeam({ 
      player1Id: teams[index]?.player1Id || '', 
      player2Id: teams[index]?.player2Id || '' 
    });
  };

  const handleConfirmTeam = () => {
    if (selectingTeamIndex === null) return;
    
    if (!currentTeam.player1Id || !currentTeam.player2Id) {
      Alert.alert('Error', 'Select both players for the team');
      return;
    }
    if (currentTeam.player1Id === currentTeam.player2Id) {
      Alert.alert('Error', 'Players must be different');
      return;
    }
    
    const player1 = players.find((p) => p.id === currentTeam.player1Id);
    const player2 = players.find((p) => p.id === currentTeam.player2Id);
    
    const updatedTeams = [...teams];
    updatedTeams[selectingTeamIndex] = {
      ...updatedTeams[selectingTeamIndex],
      player1Id: currentTeam.player1Id,
      player2Id: currentTeam.player2Id,
      name: `${player1?.name} & ${player2?.name}`,
    };
    
    setTeams(updatedTeams);
    setSelectingTeamIndex(null);
    setCurrentTeam({ player1Id: '', player2Id: '' });
  };

  const handleClearTeam = (index: number) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = {
      ...updatedTeams[index],
      player1Id: '',
      player2Id: '',
      name: `Team ${index + 1}`,
    };
    setTeams(updatedTeams);
  };

  const handleBackToCount = () => {
    setTeamCreationStep('count');
    setTeams([]);
    setSelectingTeamIndex(null);
  };

  const isPlayerInTeam = (playerId: string) => {
    return teams.some((t, i) => {
      if (i === selectingTeamIndex) return false;
      return t.player1Id === playerId || t.player2Id === playerId;
    });
  };

  const getAvailablePlayers = () => {
    return players.filter((p) => !isPlayerInTeam(p.id));
  };

  const getPaidPlayers = () => {
    return getAvailablePlayers().filter((p) => p.hasPaidMembership);
  };

  const getUnpaidPlayers = () => {
    const available = getAvailablePlayers();
    return available.filter((p) => !p.hasPaidMembership);
  };

  const isTeamComplete = (team: Team) => {
    return team.player1Id !== '' && team.player2Id !== '';
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Tournament name is required');
      return;
    }

    const fee = parseFloat(entryFee) || 0;
    const first = parseFloat(firstPlace) || 50;
    const second = parseFloat(secondPlace) || 30;
    const third = parseFloat(thirdPlace) || 20;
    const pits = parseInt(availablePits) || undefined;

    if (first + second + third !== 100) {
      Alert.alert('Error', 'Payout percentages must total 100%');
      return;
    }

    addTournament({
      name: name.trim(),
      date: date.trim() || new Date().toISOString(),
      location: location.trim(),
      time: time.trim(),
      imageUri: imageUri || undefined,
      entryFee: fee,
      availablePits: pits,
      teams: teams,
      status: 'setup',
      payoutStructure: {
        firstPlace: first,
        secondPlace: second,
        thirdPlace: third,
      },
    });

    setModalVisible(false);
  };

  const handleStartTournament = (tournament: Tournament) => {
    if (!tournament.teams || tournament.teams.length < 2) {
      Alert.alert('Error', 'Tournament needs at least 2 teams');
      return;
    }
    Alert.alert('Start Tournament', `Start ${tournament.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: () => {
          updateTournament(tournament.id, { status: 'active' });
          router.push(`/tournament/${tournament.id}`);
        },
      },
    ]);
  };

  const handleDelete = (tournament: Tournament) => {
    Alert.alert('Delete Tournament', `Delete ${tournament.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTournament(tournament.id),
      },
    ]);
  };

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'setup':
        return Colors.light.warning;
      case 'active':
        return Colors.light.tint;
      case 'completed':
        return Colors.light.textSecondary;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'setup':
        return 'Setup';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const sortedTournaments = useMemo(() => {
    const parseDate = (dateStr: string): Date => {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      return new Date();
    };

    const upcoming = tournaments.filter(t => t.status !== 'completed');
    const completed = tournaments.filter(t => t.status === 'completed');

    upcoming.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    completed.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return [...upcoming, ...completed];
  }, [tournaments]);

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity 
      style={styles.tournamentCard}
      onPress={() => router.push(`/tournament/${item.id}`)}
      testID={`tournament-card-${item.id}`}
    >
      {item.imageUri && (
        <ImageBackground
          source={{ uri: item.imageUri }}
          style={styles.tournamentCardBackground}
          imageStyle={styles.tournamentCardBackgroundImage}
        >
          <View style={styles.tournamentCardOverlay} />
        </ImageBackground>
      )}
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentName}>{item.name}</Text>
          <View style={styles.tournamentMetaRow}>
            {item.date && (
              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.light.textSecondary} />
                <Text style={styles.metaText}>
                  {item.date}
                </Text>
              </View>
            )}
            {item.time && (
              <View style={styles.metaItem}>
                <Clock size={14} color={Colors.light.textSecondary} />
                <Text style={styles.metaText}>{item.time}</Text>
              </View>
            )}
          </View>
          {item.location && (
            <TouchableOpacity 
              style={styles.metaItem}
              onPress={(e) => {
                e.stopPropagation();
                const url = Platform.select({
                  ios: `maps://maps.apple.com/?q=${encodeURIComponent(item.location || '')}`,
                  android: `geo:0,0?q=${encodeURIComponent(item.location || '')}`,
                  default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || '')}`,
                });
                if (Platform.OS === 'web') {
                  window.open(url, '_blank');
                } else {
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Error', 'Could not open maps');
                  });
                }
              }}
            >
              <MapPin size={14} color={Colors.light.tint} />
              <Text style={[styles.metaText, styles.metaTextLink]}>{item.location}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.tournamentDetails}>
        <Text style={styles.detailText}>{item.teams?.length || 0} teams • ${item.entryFee.toFixed(2)} entry</Text>
      </View>

      {isAdmin && (
        <View style={styles.tournamentActions}>
          {item.status === 'setup' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={(e) => {
                e.stopPropagation();
                handleStartTournament(item);
              }}
              testID={`start-tournament-${item.id}`}
            >
              <Play size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={(e) => {
              e.stopPropagation();
              setEditingTournament(item);
              setName(item.name);
              setDate(item.date);
              setLocation(item.location || '');
              setTime(item.time || '');
              setImageUri(item.imageUri || '');
              setAvailablePits(item.availablePits?.toString() || '');
              setEditModalVisible(true);
            }}
            testID={`edit-tournament-${item.id}`}
          >
            <Edit2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            testID={`delete-tournament-${item.id}`}
          >
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.light.tournamentCardBackground }]}>
      {tournaments.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>No Tournaments</Text>
          <Text style={styles.emptyText}>Create your first tournament to get started</Text>
        </View>
      ) : (
        <FlatList
          data={sortedTournaments}
          renderItem={renderTournament}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="tournaments-list"
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddTournament}
          testID="add-tournament-button"
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Tournament</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                testID="close-modal-button"
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Tournament Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Spring Championship"
                placeholderTextColor={Colors.light.tabIconDefault}
                testID="tournament-name-input"
              />

              <Text style={styles.label}>Date</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g., March 15, 2024 or 03/15/2024"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="tournament-date-input"
                />
              </View>

              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Silver State Arena"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="tournament-location-input"
                />
              </View>

              <Text style={styles.label}>Time</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g., 2:00 PM or 14:00"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="tournament-time-input"
                />
              </View>

              <Text style={styles.label}>Location Image</Text>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={pickImage}
                testID="upload-image-button"
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <ImageIcon size={32} color={Colors.light.tabIconDefault} />
                    <Text style={styles.imageUploadText}>Upload Location Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri('')}
                >
                  <X size={16} color={Colors.light.error} />
                  <Text style={styles.removeImageText}>Remove Image</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.label}>Entry Fee ($)</Text>
              <TextInput
                style={styles.input}
                value={entryFee}
                onChangeText={setEntryFee}
                placeholder="0.00"
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="decimal-pad"
                testID="entry-fee-input"
              />

              <Text style={styles.label}>Available Pits</Text>
              <Text style={styles.helperText}>Number of pits available at this location</Text>
              <TextInput
                style={styles.input}
                value={availablePits}
                onChangeText={setAvailablePits}
                placeholder="e.g., 3"
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="number-pad"
                testID="available-pits-input"
              />

              <Text style={styles.sectionTitle}>Payout Structure (%)</Text>
              <View style={styles.payoutRow}>
                <View style={styles.payoutInput}>
                  <Text style={styles.label}>1st Place</Text>
                  <TextInput
                    style={styles.input}
                    value={firstPlace}
                    onChangeText={setFirstPlace}
                    keyboardType="number-pad"
                    testID="first-place-input"
                  />
                </View>
                <View style={styles.payoutInput}>
                  <Text style={styles.label}>2nd Place</Text>
                  <TextInput
                    style={styles.input}
                    value={secondPlace}
                    onChangeText={setSecondPlace}
                    keyboardType="number-pad"
                    testID="second-place-input"
                  />
                </View>
                <View style={styles.payoutInput}>
                  <Text style={styles.label}>3rd Place</Text>
                  <TextInput
                    style={styles.input}
                    value={thirdPlace}
                    onChangeText={setThirdPlace}
                    keyboardType="number-pad"
                    testID="third-place-input"
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Create Teams *</Text>
              {players.length === 0 ? (
                <View style={styles.noPlayersBox}>
                  <Users size={32} color={Colors.light.tabIconDefault} />
                  <Text style={styles.noPlayersText}>No players available</Text>
                  <Text style={styles.noPlayersSubtext}>Add players first from the Players tab</Text>
                </View>
              ) : teamCreationStep === 'count' ? (
                <View style={styles.teamCountSection}>
                  <Text style={styles.label}>Number of Teams</Text>
                  <TextInput
                    style={styles.input}
                    value={numTeams}
                    onChangeText={setNumTeams}
                    placeholder="Enter number of teams"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    keyboardType="number-pad"
                    testID="num-teams-input"
                  />
                  <Text style={styles.helperText}>
                    Available players: {players.filter(p => p.hasPaidMembership).length} (Max {Math.floor(players.filter(p => p.hasPaidMembership).length / 2)} teams)
                  </Text>
                  {players.filter(p => !p.hasPaidMembership).length > 0 && (
                    <Text style={styles.warningText}>
                      ⚠️ {players.filter(p => !p.hasPaidMembership).length} player(s) cannot join due to unpaid membership
                    </Text>
                  )}
                  <TouchableOpacity 
                    style={styles.createTeamsButton} 
                    onPress={createEmptyTeams}
                    testID="create-teams-button"
                  >
                    <Text style={styles.createTeamsButtonText}>Create Team Boxes</Text>
                  </TouchableOpacity>
                </View>
              ) : selectingTeamIndex === null ? (
                <View style={styles.teamsSection}>
                  <View style={styles.teamsHeader}>
                    <Text style={styles.teamsListTitle}>Teams ({teams.length})</Text>
                    <TouchableOpacity onPress={handleBackToCount}>
                      <Text style={styles.backText}>Change Count</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>Tap a team to assign players</Text>
                  <View style={styles.teamsList}>
                    {teams.map((team, index) => (
                      <View key={team.id} style={styles.teamBoxContainer}>
                        <TouchableOpacity
                          style={[
                            styles.teamBox,
                            isTeamComplete(team) && styles.teamBoxComplete,
                          ]}
                          onPress={() => handleSelectTeam(index)}
                          testID={`team-box-${index}`}
                        >
                          <View style={styles.teamBoxHeader}>
                            <Text style={styles.teamBoxNumber}>Team {index + 1}</Text>
                            {isTeamComplete(team) && (
                              <CheckCircle size={20} color={Colors.light.success} />
                            )}
                          </View>
                          <View style={styles.teamBoxPlayers}>
                            <Text style={styles.teamBoxPlayerText}>
                              {team.player1Id ? players.find((p) => p.id === team.player1Id)?.name : 'No player assigned'}
                            </Text>
                            <Text style={styles.teamBoxPlayerText}>
                              {team.player2Id ? players.find((p) => p.id === team.player2Id)?.name : 'No player assigned'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {isTeamComplete(team) && (
                          <TouchableOpacity 
                            style={styles.clearTeamButton}
                            onPress={() => handleClearTeam(index)}
                            testID={`clear-team-${index}`}
                          >
                            <X size={16} color={Colors.light.error} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.playerSelectionSection}>
                  <View style={styles.selectionHeader}>
                    <Text style={styles.selectionTitle}>Select Players for Team {selectingTeamIndex + 1}</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectingTeamIndex(null);
                        setCurrentTeam({ player1Id: '', player2Id: '' });
                      }}
                      testID="cancel-selection-button"
                    >
                      <X size={24} color={Colors.light.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.playerPickerSection}>
                    <Text style={styles.pickerLabel}>Player 1 (Class A)</Text>
                    <ScrollView style={styles.playerScrollView} nestedScrollEnabled>
                      {getPaidPlayers().filter(p => p.playerClass === 'A').map((player) => (
                        <TouchableOpacity
                          key={player.id}
                          style={[
                            styles.pickerOption,
                            currentTeam.player1Id === player.id && styles.pickerOptionSelected,
                          ]}
                          onPress={() => setCurrentTeam((prev) => ({ ...prev, player1Id: player.id }))}
                          testID={`player1-${player.id}`}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              currentTeam.player1Id === player.id && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {player.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      {getUnpaidPlayers().length > 0 && (
                        <View style={styles.unpaidSection}>
                          <Text style={styles.unpaidHeader}>Cannot Add (Membership Unpaid)</Text>
                          {getUnpaidPlayers().map((player) => (
                            <View
                              key={player.id}
                              style={styles.pickerOptionDisabled}
                              testID={`player1-unpaid-${player.id}`}
                            >
                              <Text style={styles.pickerOptionTextDisabled}>
                                {player.name}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  <View style={styles.playerPickerSection}>
                    <Text style={styles.pickerLabel}>Player 2 (Class B)</Text>
                    <ScrollView style={styles.playerScrollView} nestedScrollEnabled>
                      {getPaidPlayers()
                        .filter((p) => p.id !== currentTeam.player1Id && p.playerClass === 'B')
                        .map((player) => (
                          <TouchableOpacity
                            key={player.id}
                            style={[
                              styles.pickerOption,
                              currentTeam.player2Id === player.id && styles.pickerOptionSelected,
                            ]}
                            onPress={() => setCurrentTeam((prev) => ({ ...prev, player2Id: player.id }))}
                            testID={`player2-${player.id}`}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                currentTeam.player2Id === player.id && styles.pickerOptionTextSelected,
                              ]}
                            >
                              {player.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      {getUnpaidPlayers().length > 0 && (
                        <View style={styles.unpaidSection}>
                          <Text style={styles.unpaidHeader}>Cannot Add (Membership Unpaid)</Text>
                          {getUnpaidPlayers()
                            .filter((p) => p.id !== currentTeam.player1Id)
                            .map((player) => (
                              <View
                                key={player.id}
                                style={styles.pickerOptionDisabled}
                                testID={`player2-unpaid-${player.id}`}
                              >
                                <Text style={styles.pickerOptionTextDisabled}>
                                  {player.name}
                                </Text>
                              </View>
                            ))}
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  <TouchableOpacity 
                    style={styles.confirmTeamButton} 
                    onPress={handleConfirmTeam}
                    testID="confirm-team-button"
                  >
                    <Text style={styles.confirmTeamButtonText}>Confirm Team</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSave}
                testID="save-tournament-button"
              >
                <Text style={styles.buttonPrimaryText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Tournament Info</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                testID="close-edit-modal-button"
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Tournament Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Spring Championship"
                placeholderTextColor={Colors.light.tabIconDefault}
                testID="edit-tournament-name-input"
              />

              <Text style={styles.label}>Date</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g., March 15, 2024 or 03/15/2024"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="edit-tournament-date-input"
                />
              </View>

              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Silver State Arena"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="edit-tournament-location-input"
                />
              </View>

              <Text style={styles.label}>Time</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={Colors.light.tabIconDefault} />
                <TextInput
                  style={styles.inputText}
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g., 2:00 PM or 14:00"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  testID="edit-tournament-time-input"
                />
              </View>

              <Text style={styles.label}>Location Image</Text>
              <TouchableOpacity
                style={styles.imageUploadButton}
                onPress={pickImage}
                testID="edit-upload-image-button"
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.imageUploadPlaceholder}>
                    <ImageIcon size={32} color={Colors.light.tabIconDefault} />
                    <Text style={styles.imageUploadText}>Upload Location Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri('')}
                >
                  <X size={16} color={Colors.light.error} />
                  <Text style={styles.removeImageText}>Remove Image</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={() => {
                  if (!name.trim()) {
                    Alert.alert('Error', 'Tournament name is required');
                    return;
                  }
                  if (editingTournament) {
                    const pits = parseInt(availablePits) || undefined;
                    updateTournament(editingTournament.id, {
                      name: name.trim(),
                      date: date.trim(),
                      location: location.trim(),
                      time: time.trim(),
                      imageUri: imageUri || undefined,
                      availablePits: pits,
                    });
                    setEditModalVisible(false);
                    Alert.alert('Success', 'Tournament info updated');
                  }
                }}
                testID="save-edit-tournament-button"
              >
                <Text style={styles.buttonPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
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
  tournamentCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  tournamentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  metaTextLink: {
    color: Colors.light.tint,
    textDecorationLine: 'underline' as const,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tournamentDetails: {
    paddingVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  tournamentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  startBtn: {
    backgroundColor: Colors.light.tint,
  },
  editBtn: {
    backgroundColor: Colors.light.accent,
    flex: 0,
    paddingHorizontal: 16,
  },
  viewBtn: {
    backgroundColor: Colors.light.accent,
  },
  deleteBtn: {
    backgroundColor: Colors.light.error,
    flex: 0,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  inputText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  payoutInput: {
    flex: 1,
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
  },
  playerItemSelected: {
    backgroundColor: Colors.light.tint + '10',
    borderColor: Colors.light.tint,
  },
  playerItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  playerItemTextSelected: {
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  noPlayersBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  noPlayersText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  noPlayersSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.tint,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  teamsSection: {
    gap: 16,
  },
  teamBuilder: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  teamBuilderLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  teamPickerRow: {
    gap: 12,
    marginBottom: 12,
  },
  teamPicker: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  pickerContainer: {
    maxHeight: 120,
    gap: 6,
  },
  teamCountSection: {
    gap: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  createTeamsButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createTeamsButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  teamsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  teamBoxContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  teamBox: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  teamBoxComplete: {
    borderColor: Colors.light.success,
    borderStyle: 'solid',
    backgroundColor: Colors.light.success + '10',
  },
  teamBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamBoxNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  teamBoxPlayers: {
    gap: 4,
  },
  teamBoxPlayerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  clearTeamButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  playerSelectionSection: {
    gap: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  playerPickerSection: {
    gap: 8,
  },
  playerScrollView: {
    maxHeight: 150,
  },
  confirmTeamButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmTeamButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  pickerOption: {
    padding: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.light.tint + '20',
    borderColor: Colors.light.tint,
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  pickerOptionTextSelected: {
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  addTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  addTeamButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  teamsList: {
    gap: 8,
  },
  teamsListTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  teamItemText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  unpaidSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  unpaidHeader: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.error,
    marginBottom: 8,
  },
  pickerOptionDisabled: {
    padding: 10,
    backgroundColor: Colors.light.error + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.error + '40',
    marginBottom: 4,
  },
  pickerOptionTextDisabled: {
    fontSize: 14,
    color: Colors.light.error,
  },
  warningText: {
    fontSize: 12,
    color: Colors.light.warning,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  tournamentCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tournamentCardBackgroundImage: {
    borderRadius: 12,
  },
  tournamentCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
  },
  imageUploadButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
    fontWeight: '600' as const,
  },
  uploadedImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover' as const,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  removeImageText: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '600' as const,
  },
});

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
  Image,
  Linking,
} from 'react-native';
import { Users, Plus, Trash2, X, Trophy, Medal, Award, Camera, ImageIcon, MessageCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';
import { Player } from '@/types/tournament';

export default function PlayersScreen() {
  const { isAdmin } = useAuth();
  const { colors } = useTheme();
  const { players, addPlayer, updatePlayer, deletePlayer, calculateSeasonStandings } = useTournamentData();
  const seasonStandings = calculateSeasonStandings();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [hasPaidMembership, setHasPaidMembership] = useState<boolean>(false);
  const [playerClass, setPlayerClass] = useState<'A' | 'B'>('B');
  const [profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setName('');
    setEmail('');
    setPhone('');
    setHasPaidMembership(false);
    setPlayerClass('B');
    setProfilePicture(undefined);
    setModalVisible(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setName(player.name);
    setEmail(player.email || '');
    setPhone(player.phone || '');
    setHasPaidMembership(player.hasPaidMembership);
    setPlayerClass(player.playerClass);
    setProfilePicture(player.profilePicture);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Player name is required');
      return;
    }

    if (editingPlayer) {
      updatePlayer(editingPlayer.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        hasPaidMembership,
        playerClass,
        profilePicture,
      });
    } else {
      addPlayer({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        hasPaidMembership,
        playerClass,
        profilePicture,
      });
    }

    setModalVisible(false);
    setName('');
    setEmail('');
    setPhone('');
    setHasPaidMembership(false);
    setPlayerClass('B');
    setProfilePicture(undefined);
    setEditingPlayer(null);
  };

  const handleDelete = (player: Player) => {
    Alert.alert('Delete Player', `Are you sure you want to delete ${player.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePlayer(player.id),
      },
    ]);
  };

  const getPlayerStats = (playerId: string) => {
    return seasonStandings.find(s => s.playerId === playerId);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleSendMessage = (player: Player) => {
    if (!player.phone) {
      return;
    }

    const phoneNumber = player.phone.replace(/\D/g, '');
    const smsUrl = Platform.select({
      ios: `sms:${phoneNumber}`,
      android: `sms:${phoneNumber}`,
      default: `sms:${phoneNumber}`,
    });

    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'Unable to open messaging app');
        }
      })
      .catch((err) => {
        console.error('Error opening messaging app:', err);
        Alert.alert('Error', 'Failed to open messaging app');
      });
  };

  const sortedPlayers = useMemo(() => {
    const admins = ['Heath Russell', 'Christy Russell'];
    
    return [...players].sort((a, b) => {
      const aIsAdmin = admins.includes(a.name);
      const bIsAdmin = admins.includes(b.name);
      
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
      
      if (aIsAdmin && bIsAdmin) {
        return admins.indexOf(a.name) - admins.indexOf(b.name);
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [players]);

  const renderPlayer = ({ item }: { item: Player }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => handleEditPlayer(item)}
      disabled={!isAdmin}
      testID={`player-card-${item.id}`}
    >
      <View style={styles.playerInfo}>
        {item.profilePicture ? (
          <Image source={{ uri: item.profilePicture }} style={styles.playerAvatarImage} />
        ) : (
          <View style={[styles.playerAvatar, !item.hasPaidMembership && styles.playerAvatarUnpaid]}>
            <Text style={styles.playerInitial}>{item.name[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.playerDetails}>
          <Text style={[styles.playerName, !item.hasPaidMembership && styles.playerNameUnpaid]}>
            {item.name}
          </Text>
          {item.email && <Text style={styles.playerContact}>{item.email}</Text>}
          {item.phone && <Text style={styles.playerContact}>{item.phone}</Text>}
          <View style={styles.playerBadges}>
            <View style={[styles.classBadge, item.playerClass === 'A' ? styles.classABadge : styles.classBBadge]}>
              <Text style={styles.classBadgeText}>Class {item.playerClass}</Text>
            </View>
            {!item.hasPaidMembership && (
              <Text style={styles.membershipStatus}>Membership Unpaid</Text>
            )}
          </View>
          {(() => {
            const stats = getPlayerStats(item.id);
            if (stats) {
              const totalWins = stats.firstPlaceFinishes + stats.secondPlaceFinishes + stats.thirdPlaceFinishes;
              const totalLosses = stats.tournamentsPlayed - totalWins;
              return (
                <View style={styles.statsContainer}>
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Record:</Text>
                    <Text style={styles.recordText}>{totalWins}W - {totalLosses}L</Text>
                  </View>
                  {(stats.firstPlaceFinishes > 0 || stats.secondPlaceFinishes > 0 || stats.thirdPlaceFinishes > 0) && (
                    <View style={styles.trophyRow}>
                      {stats.firstPlaceFinishes > 0 && (
                        <View style={styles.trophyItem}>
                          <Trophy size={16} color="#FFD700" />
                          <Text style={styles.trophyCount}>{stats.firstPlaceFinishes}</Text>
                        </View>
                      )}
                      {stats.secondPlaceFinishes > 0 && (
                        <View style={styles.trophyItem}>
                          <Medal size={16} color="#C0C0C0" />
                          <Text style={styles.trophyCount}>{stats.secondPlaceFinishes}</Text>
                        </View>
                      )}
                      {stats.thirdPlaceFinishes > 0 && (
                        <View style={styles.trophyItem}>
                          <Award size={16} color="#CD7F32" />
                          <Text style={styles.trophyCount}>{stats.thirdPlaceFinishes}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            }
            return null;
          })()}
        </View>
      </View>
      <View style={styles.playerActions}>
        {item.phone && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleSendMessage(item);
            }}
            testID={`message-player-${item.id}`}
          >
            <MessageCircle size={20} color={Colors.light.tint} />
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            testID={`delete-player-${item.id}`}
          >
            <Trash2 size={20} color={Colors.light.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.light.playerCardBackground }]}>
      {players.length === 0 ? (
        <View style={styles.emptyState}>
          <Users size={64} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyTitle}>No Players Yet</Text>
          <Text style={styles.emptyText}>Add players to start organizing tournaments</Text>
        </View>
      ) : (
        <FlatList
          data={sortedPlayers}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          testID="players-list"
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddPlayer}
          testID="add-player-button"
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
              <Text style={styles.modalTitle}>
                {editingPlayer ? 'Edit Player' : 'Add Player'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                testID="close-modal-button"
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.profilePictureSection}>
                <Text style={styles.label}>Profile Picture</Text>
                <View style={styles.profilePictureContainer}>
                  {profilePicture ? (
                    <TouchableOpacity onPress={showImageOptions} style={styles.profilePictureWrapper}>
                      <Image source={{ uri: profilePicture }} style={styles.profilePicturePreview} />
                      <View style={styles.changePictureOverlay}>
                        <Camera size={24} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.profilePicturePlaceholder}
                      onPress={showImageOptions}
                      testID="add-profile-picture"
                    >
                      <ImageIcon size={32} color={Colors.light.tabIconDefault} />
                      <Text style={styles.profilePicturePlaceholderText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter player name"
                placeholderTextColor={Colors.light.tabIconDefault}
                testID="player-name-input"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email address"
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="player-email-input"
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.light.tabIconDefault}
                keyboardType="phone-pad"
                testID="player-phone-input"
              />

              <View style={styles.classContainer}>
                <Text style={styles.label}>Player Class</Text>
                <Text style={styles.classNote}>
                  Class A players are paired with Class B players
                </Text>
                <View style={styles.classButtons}>
                  <TouchableOpacity
                    style={[
                      styles.classButton,
                      playerClass === 'A' && styles.classButtonActive,
                    ]}
                    onPress={() => setPlayerClass('A')}
                    testID="class-a-button"
                  >
                    <Text
                      style={[
                        styles.classButtonText,
                        playerClass === 'A' && styles.classButtonTextActive,
                      ]}
                    >
                      Class A
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.classButton,
                      playerClass === 'B' && styles.classButtonActive,
                    ]}
                    onPress={() => setPlayerClass('B')}
                    testID="class-b-button"
                  >
                    <Text
                      style={[
                        styles.classButtonText,
                        playerClass === 'B' && styles.classButtonTextActive,
                      ]}
                    >
                      Class B
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.membershipContainer}>
                <View style={styles.membershipInfo}>
                  <Text style={styles.label}>Membership Fee ($10/year)</Text>
                  <Text style={styles.membershipNote}>
                    Players must pay to join tournaments
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.membershipToggle,
                    hasPaidMembership && styles.membershipTogglePaid,
                  ]}
                  onPress={() => setHasPaidMembership(!hasPaidMembership)}
                  testID="membership-toggle"
                >
                  <Text
                    style={[
                      styles.membershipToggleText,
                      hasPaidMembership && styles.membershipToggleTextPaid,
                    ]}
                  >
                    {hasPaidMembership ? 'PAID' : 'UNPAID'}
                  </Text>
                </TouchableOpacity>
              </View>
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
                testID="save-player-button"
              >
                <Text style={styles.buttonPrimaryText}>Save</Text>
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
  playerCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  playerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  playerContact: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
    maxHeight: '80%',
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
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
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
  playerAvatarUnpaid: {
    backgroundColor: Colors.light.error,
  },
  playerNameUnpaid: {
    color: Colors.light.error,
  },
  membershipStatus: {
    fontSize: 12,
    color: Colors.light.error,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  membershipContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipInfo: {
    flex: 1,
  },
  membershipNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  membershipToggle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.error,
    minWidth: 100,
    alignItems: 'center',
  },
  membershipTogglePaid: {
    backgroundColor: Colors.light.success,
  },
  membershipToggleText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  membershipToggleTextPaid: {
    color: '#FFFFFF',
  },
  playerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statsContainer: {
    marginTop: 6,
    gap: 4,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  recordText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '700' as const,
  },
  trophyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  trophyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trophyCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  classBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classABadge: {
    backgroundColor: '#FF6B35',
  },
  classBBadge: {
    backgroundColor: '#4ECDC4',
  },
  classBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  classContainer: {
    marginTop: 20,
  },
  classNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  classButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  classButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  classButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  classButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  classButtonTextActive: {
    color: '#FFFFFF',
  },
  profilePictureSection: {
    marginBottom: 12,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  profilePictureWrapper: {
    position: 'relative',
  },
  profilePicturePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePictureOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.tint,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.light.surface,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  profilePicturePlaceholderText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    fontWeight: '600' as const,
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Palette,
  Award,
  Radio,
} from 'lucide-react-native';


import { useTournamentData } from '@/contexts/TournamentContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/colors';

import MatchesTab from '@/components/DirectorMode/MatchesTab';
import PlayersTab from '@/components/DirectorMode/PlayersTab';
import BracketTab from '@/components/DirectorMode/BracketTab';
import ResetTab from '@/components/DirectorMode/ResetTab';
import LogsTab from '@/components/DirectorMode/LogsTab';
import BroadcastCenterTab from '@/components/DirectorMode/BroadcastCenterTab';

type SectionType = 'season' | 'appearance' | 'leaderboard' | 'director';

export default function AdminScreen() {

  const { isAdmin } = useAuth();
  const { themeSettings, colors: themeColors, updateTheme, resetTheme } = useTheme();
  const {
    tournaments,
    players,
    addPlayer,
    updatePlayer,
    resetSeason,
    clearSeasonLeaderboard,
    calculateSeasonStandings,
  } = useTournamentData();

  const [selectedSection, setSelectedSection] = useState<SectionType>('season');
  const [selectedDirectorTab, setSelectedDirectorTab] = useState<'matches' | 'players' | 'bracket' | 'reset' | 'logs' | 'broadcast'>('broadcast');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<'A' | 'B'>('A');
  const [editingPoints, setEditingPoints] = useState<Record<string, string>>({});
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerClass, setNewPlayerClass] = useState<'A' | 'B'>('A');
  const [newPlayerPoints, setNewPlayerPoints] = useState<string>('');






  const [seasonName, setSeasonName] = useState<string>('');
  const [isResettingSeason, setIsResettingSeason] = useState<boolean>(false);

  const [logoSize, setLogoSize] = useState<string>(themeSettings.logoSize.toString());
  const [heroBackgroundColor, setHeroBackgroundColor] = useState<string>(themeSettings.heroBackgroundColor);
  const [navSectionBackgroundColor, setNavSectionBackgroundColor] = useState<string>(themeSettings.navSectionBackgroundColor);
  const [navSectionOpacity, setNavSectionOpacity] = useState<string>((themeSettings.navSectionOpacity * 100).toString());
  const [primaryColor, setPrimaryColor] = useState<string>(themeSettings.primaryColor);
  const [accentColor, setAccentColor] = useState<string>(themeSettings.accentColor);
  const [textColor, setTextColor] = useState<string>(themeSettings.textColor);
  const [surfaceColor, setSurfaceColor] = useState<string>(themeSettings.surfaceColor);
  const [buttonColor, setButtonColor] = useState<string>(themeSettings.buttonColor);
  const [playerCardBackgroundColor, setPlayerCardBackgroundColor] = useState<string>(themeSettings.playerCardBackgroundColor);
  const [tournamentCardBackgroundColor, setTournamentCardBackgroundColor] = useState<string>(themeSettings.tournamentCardBackgroundColor);

  React.useEffect(() => {
    setLogoSize(themeSettings.logoSize.toString());
    setHeroBackgroundColor(themeSettings.heroBackgroundColor);
    setNavSectionBackgroundColor(themeSettings.navSectionBackgroundColor);
    setNavSectionOpacity((themeSettings.navSectionOpacity * 100).toString());
    setPrimaryColor(themeSettings.primaryColor);
    setAccentColor(themeSettings.accentColor);
    setTextColor(themeSettings.textColor);
    setSurfaceColor(themeSettings.surfaceColor);
    setButtonColor(themeSettings.buttonColor);
    setPlayerCardBackgroundColor(themeSettings.playerCardBackgroundColor);
    setTournamentCardBackgroundColor(themeSettings.tournamentCardBackgroundColor);
  }, [themeSettings]);

  const AppColors = themeColors.light;

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Settings size={64} color={AppColors.tabIconDefault} />
        <Text style={[styles.unauthorizedTitle, { color: AppColors.text }]}>Admin Access Required</Text>
        <Text style={[styles.unauthorizedText, { color: AppColors.textSecondary }]}>You need administrator privileges to access this section</Text>
      </View>
    );
  }

















  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage all app content in one place</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionSelector} contentContainerStyle={styles.sectionSelectorContent}>
        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === 'season' && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection('season')}
        >
          <RotateCcw
            size={16}
            color={selectedSection === 'season' ? '#FFFFFF' : Colors.light.text}
          />
          <Text
            style={[
              styles.sectionButtonText,
              selectedSection === 'season' && styles.sectionButtonTextActive,
            ]}
          >
            Season
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === 'leaderboard' && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection('leaderboard')}
        >
          <Award
            size={16}
            color={selectedSection === 'leaderboard' ? '#FFFFFF' : Colors.light.text}
          />
          <Text
            style={[
              styles.sectionButtonText,
              selectedSection === 'leaderboard' && styles.sectionButtonTextActive,
            ]}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === 'appearance' && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection('appearance')}
        >
          <Palette
            size={16}
            color={selectedSection === 'appearance' ? '#FFFFFF' : Colors.light.text}
          />
          <Text
            style={[
              styles.sectionButtonText,
              selectedSection === 'appearance' && styles.sectionButtonTextActive,
            ]}
          >
            Appearance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sectionButton,
            selectedSection === 'director' && styles.sectionButtonActive,
          ]}
          onPress={() => setSelectedSection('director')}
        >
          <Radio
            size={16}
            color={selectedSection === 'director' ? '#FFFFFF' : Colors.light.text}
          />
          <Text
            style={[
              styles.sectionButtonText,
              selectedSection === 'director' && styles.sectionButtonTextActive,
            ]}
          >
            Director
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content}>
        {selectedSection === 'appearance' && (
          <View style={styles.section}>
            <View style={styles.appearanceCard}>
              <View style={styles.appearanceHeader}>
                <Palette size={32} color={Colors.light.tint} />
                <Text style={styles.appearanceTitle}>Customize Appearance</Text>
              </View>
              <Text style={styles.appearanceDescription}>
                Personalize the look and feel of your app
              </Text>

              <View style={styles.themeSection}>
                <Text style={styles.themeSectionTitle}>Logo & Hero Section</Text>
                
                <Text style={styles.label}>Logo Size (px)</Text>
                <TextInput
                  style={styles.input}
                  value={logoSize}
                  onChangeText={setLogoSize}
                  placeholder="168"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  keyboardType="number-pad"
                />

                <Text style={styles.label}>Hero Background Color</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={heroBackgroundColor}
                    onChangeText={setHeroBackgroundColor}
                    placeholder="#F8FAFC"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: heroBackgroundColor }]} />
                </View>
              </View>

              <View style={styles.themeSection}>
                <Text style={styles.themeSectionTitle}>Navigation Section</Text>
                
                <Text style={styles.label}>Background Color</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={navSectionBackgroundColor}
                    onChangeText={setNavSectionBackgroundColor}
                    placeholder="#1E3A8A"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: navSectionBackgroundColor }]} />
                </View>

                <Text style={styles.label}>Opacity (%)</Text>
                <TextInput
                  style={styles.input}
                  value={navSectionOpacity}
                  onChangeText={setNavSectionOpacity}
                  placeholder="50"
                  placeholderTextColor={Colors.light.tabIconDefault}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.themeSection}>
                <Text style={styles.themeSectionTitle}>App Colors</Text>
                
                <Text style={styles.label}>Primary Color (Buttons, Tint)</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={primaryColor}
                    onChangeText={setPrimaryColor}
                    placeholder="#1F2937"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                </View>

                <Text style={styles.label}>Accent Color</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={accentColor}
                    onChangeText={setAccentColor}
                    placeholder="#F59E0B"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: accentColor }]} />
                </View>

                <Text style={styles.label}>Text Color</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={textColor}
                    onChangeText={setTextColor}
                    placeholder="#1F2937"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: textColor }]} />
                </View>

                <Text style={styles.label}>Surface/Card Color</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={surfaceColor}
                    onChangeText={setSurfaceColor}
                    placeholder="#FFFFFF"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: surfaceColor }]} />
                </View>

                <Text style={styles.label}>App Buttons</Text>
                <Text style={styles.helperText}>Color for action buttons (Start, Save, +, Class buttons)</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={buttonColor}
                    onChangeText={setButtonColor}
                    placeholder="#F8F8F8"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: buttonColor }]} />
                </View>

                <Text style={styles.label}>Player Card Background</Text>
                <Text style={styles.helperText}>Background color behind player names on Players tab</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={playerCardBackgroundColor}
                    onChangeText={setPlayerCardBackgroundColor}
                    placeholder="#C0C0C0"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: playerCardBackgroundColor }]} />
                </View>

                <Text style={styles.label}>Tournament Card Background</Text>
                <Text style={styles.helperText}>Background color behind tournaments on Tournament tab</Text>
                <View style={styles.colorInputContainer}>
                  <TextInput
                    style={[styles.input, styles.colorInput]}
                    value={tournamentCardBackgroundColor}
                    onChangeText={setTournamentCardBackgroundColor}
                    placeholder="#C0C0C0"
                    placeholderTextColor={Colors.light.tabIconDefault}
                    autoCapitalize="none"
                  />
                  <View style={[styles.colorPreview, { backgroundColor: tournamentCardBackgroundColor }]} />
                </View>
              </View>

              <View style={styles.appearanceActions}>
                <TouchableOpacity
                  style={styles.resetThemeButton}
                  onPress={() => {
                    Alert.alert(
                      'Reset Theme',
                      'This will reset all appearance settings to defaults. Continue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: async () => {
                            await resetTheme();
                            setLogoSize('168');
                            setHeroBackgroundColor('#F8FAFC');
                            setNavSectionBackgroundColor('#1E3A8A');
                            setNavSectionOpacity('50');
                            setPrimaryColor('#1F2937');
                            setAccentColor('#F59E0B');
                            setTextColor('#1F2937');
                            setSurfaceColor('#FFFFFF');
                            setButtonColor('#F8F8F8');
                            setPlayerCardBackgroundColor('#C0C0C0');
                            setTournamentCardBackgroundColor('#C0C0C0');
                            Alert.alert('Success', 'Theme reset to defaults');
                          },
                        },
                      ]
                    );
                  }}
                >
                  <RotateCcw size={20} color={Colors.light.warning} />
                  <Text style={styles.resetThemeButtonText}>Reset to Defaults</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveThemeButton}
                  onPress={() => {
                    const size = parseInt(logoSize) || 168;
                    const opacity = parseFloat(navSectionOpacity) / 100 || 0.5;
                    
                    console.log('💾 Saving theme with button color:', buttonColor);
                    updateTheme({
                      logoSize: size,
                      heroBackgroundColor: heroBackgroundColor,
                      navSectionBackgroundColor: navSectionBackgroundColor,
                      navSectionOpacity: opacity,
                      primaryColor: primaryColor,
                      accentColor: accentColor,
                      textColor: textColor,
                      surfaceColor: surfaceColor,
                      buttonColor: buttonColor,
                      playerCardBackgroundColor: playerCardBackgroundColor,
                      tournamentCardBackgroundColor: tournamentCardBackgroundColor,
                    });
                    
                    Alert.alert('Success', 'Theme settings saved! Changes will apply throughout the app.');
                  }}
                >
                  <Text style={styles.saveThemeButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedSection === 'leaderboard' && (
          <View style={styles.section}>
            <View style={styles.leaderboardCard}>
              <View style={styles.leaderboardHeader}>
                <Award size={32} color={Colors.light.tint} />
                <Text style={styles.leaderboardTitle}>Edit Season Leaderboard</Text>
              </View>
              <Text style={styles.leaderboardDescription}>
                Manually adjust player points for the current season
              </Text>

              <View style={styles.classToggle}>
                <TouchableOpacity
                  style={[
                    styles.classButton,
                    selectedClass === 'A' && styles.classButtonActive,
                  ]}
                  onPress={() => setSelectedClass('A')}
                >
                  <Text
                    style={[
                      styles.classButtonText,
                      selectedClass === 'A' && styles.classButtonTextActive,
                    ]}
                  >
                    Class A
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.classButton,
                    selectedClass === 'B' && styles.classButtonActive,
                  ]}
                  onPress={() => setSelectedClass('B')}
                >
                  <Text
                    style={[
                      styles.classButtonText,
                      selectedClass === 'B' && styles.classButtonTextActive,
                    ]}
                  >
                    Class B
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playerListHeader}>
                <Text style={styles.playerListHeaderText}>Player</Text>
                <Text style={styles.playerListHeaderText}>Points</Text>
              </View>

              <View style={styles.addNewPlayerSection}>
                <Text style={styles.addNewPlayerTitle}>Add New Player</Text>
                <View style={styles.addNewPlayerClassButtons}>
                  <TouchableOpacity
                    style={[styles.newPlayerClassButton, newPlayerClass === 'A' && styles.newPlayerClassButtonActive]}
                    onPress={() => setNewPlayerClass('A')}
                  >
                    <Text style={[styles.newPlayerClassButtonText, newPlayerClass === 'A' && styles.newPlayerClassButtonTextActive]}>Class A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.newPlayerClassButton, newPlayerClass === 'B' && styles.newPlayerClassButtonActive]}
                    onPress={() => setNewPlayerClass('B')}
                  >
                    <Text style={[styles.newPlayerClassButtonText, newPlayerClass === 'B' && styles.newPlayerClassButtonTextActive]}>Class B</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.addNewPlayerForm}>
                  <TextInput
                    style={[styles.input, styles.addPlayerInput]}
                    value={newPlayerName}
                    onChangeText={setNewPlayerName}
                    placeholder="Player name"
                    placeholderTextColor={AppColors.tabIconDefault}
                  />
                  <TextInput
                    style={[styles.pointsInput, styles.addPlayerPointsInput]}
                    value={newPlayerPoints}
                    onChangeText={setNewPlayerPoints}
                    placeholder="Points"
                    placeholderTextColor={AppColors.tabIconDefault}
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity
                    style={styles.addPlayerButton}
                    onPress={() => {
                      if (!newPlayerName.trim()) {
                        Alert.alert('Error', 'Please enter a player name');
                        return;
                      }
                      const points = parseInt(newPlayerPoints) || 0;
                      if (points < 0) {
                        Alert.alert('Error', 'Points must be 0 or greater');
                        return;
                      }
                      const newPlayer = addPlayer({
                        name: newPlayerName.trim(),
                        playerClass: newPlayerClass,
                        hasPaidMembership: false,
                        customSeasonPoints: points,
                      });
                      setNewPlayerName('');
                      setNewPlayerPoints('');
                      Alert.alert('Success', `Added ${newPlayer.name} (Class ${newPlayerClass}) with ${points} points`);
                    }}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addPlayerButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {players
                .filter(p => p.playerClass === selectedClass)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((player) => {
                  const standings = calculateSeasonStandings(selectedClass);
                  const playerStat = standings.find(s => s.playerId === player.id);
                  const currentPoints = playerStat?.points || 0;
                  const editValue = editingPoints[player.id];

                  return (
                    <View key={player.id} style={styles.playerEditRow}>
                      <Text style={styles.playerEditName}>{player.name}</Text>
                      <View style={styles.playerEditActions}>
                        <TextInput
                          style={styles.pointsInput}
                          value={editValue !== undefined ? editValue : currentPoints.toString()}
                          onChangeText={(text) => {
                            setEditingPoints({ ...editingPoints, [player.id]: text });
                          }}
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor={AppColors.tabIconDefault}
                        />
                        <TouchableOpacity
                          style={styles.savePointsButton}
                          onPress={() => {
                            const points = parseInt(editValue || currentPoints.toString());
                            if (isNaN(points) || points < 0) {
                              Alert.alert('Error', 'Please enter a valid points value');
                              return;
                            }
                            updatePlayer(player.id, { customSeasonPoints: points });
                            const newEditingPoints = { ...editingPoints };
                            delete newEditingPoints[player.id];
                            setEditingPoints(newEditingPoints);
                            Alert.alert('Success', `Updated ${player.name} to ${points} points`);
                          }}
                        >
                          <Text style={styles.savePointsButtonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {selectedSection === 'season' && (
          <View style={styles.section}>
            <View style={styles.seasonResetCard}>
              <View style={styles.seasonResetHeader}>
                <RotateCcw size={32} color={Colors.light.warning} />
                <Text style={styles.seasonResetTitle}>Reset Season</Text>
              </View>
              <Text style={styles.seasonResetDescription}>
                Starting a new season will:
              </Text>
              <View style={styles.seasonResetList}>
                <Text style={styles.seasonResetItem}>• Save current standings to past seasons</Text>
                <Text style={styles.seasonResetItem}>• Reset all player points to 0</Text>
                <Text style={styles.seasonResetItem}>• Remove all completed tournaments</Text>
                <Text style={styles.seasonResetItem}>• Keep all player and sponsor data</Text>
              </View>
              <Text style={styles.seasonResetWarning}>
                ⚠️ This action cannot be undone!
              </Text>
              <View style={styles.seasonResetInputContainer}>
                <Text style={styles.label}>Season Name</Text>
                <TextInput
                  style={styles.input}
                  value={seasonName}
                  onChangeText={setSeasonName}
                  placeholder="e.g., Spring 2024"
                  placeholderTextColor={Colors.light.tabIconDefault}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.seasonResetButton,
                  (!seasonName.trim() || isResettingSeason) && styles.seasonResetButtonDisabled,
                ]}
                onPress={async () => {
                  if (!seasonName.trim() || isResettingSeason) return;
                  
                  Alert.alert(
                    'Reset Season',
                    `Are you sure you want to end the current season and start "${seasonName}"?\n\nCurrent standings will be saved to past seasons and all player points will be reset.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Reset Season',
                        style: 'destructive',
                        onPress: async () => {
                          setIsResettingSeason(true);
                          const success = await resetSeason(seasonName.trim());
                          setIsResettingSeason(false);
                          if (success) {
                            Alert.alert('Success', `Season "${seasonName}" has been started!`);
                            setSeasonName('');
                          } else {
                            Alert.alert('Error', 'Failed to reset season. Please try again.');
                          }
                        },
                      },
                    ]
                  );
                }}
                disabled={!seasonName.trim() || isResettingSeason}
              >
                <RotateCcw size={20} color="#FFFFFF" />
                <Text style={styles.seasonResetButtonText}>
                  {isResettingSeason ? 'Resetting...' : 'Reset Season'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerLine} />

              <View style={styles.clearLeaderboardSection}>
                <Text style={styles.clearLeaderboardTitle}>Clear Season Leaderboard</Text>
                <Text style={styles.clearLeaderboardDescription}>
                  This will remove all players from the season leaderboard and delete all completed tournaments WITHOUT saving them to past seasons.
                </Text>
                <Text style={styles.clearLeaderboardWarning}>
                  ⚠️ Use this to fix point issues or start fresh!
                </Text>
                <TouchableOpacity
                  style={styles.clearLeaderboardButton}
                  onPress={() => {
                    Alert.alert(
                      'Clear Season Leaderboard',
                      'Are you sure you want to clear the season leaderboard and remove all completed tournaments?\n\nThis will NOT save data to past seasons. This action cannot be undone.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Clear',
                          style: 'destructive',
                          onPress: async () => {
                            const success = await clearSeasonLeaderboard();
                            if (success) {
                              Alert.alert('Success', 'Season leaderboard has been cleared!');
                            } else {
                              Alert.alert('Error', 'Failed to clear leaderboard. Please try again.');
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Trash2 size={20} color="#FFFFFF" />
                  <Text style={styles.clearLeaderboardButtonText}>Clear Leaderboard</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedSection === 'director' && (
          <View style={styles.section}>
            <View style={styles.directorCard}>
              <View style={styles.directorHeader}>
                <Radio size={32} color={Colors.light.tint} />
                <Text style={styles.directorTitle}>🎬 Director Dashboard</Text>
              </View>
              <Text style={styles.directorDescription}>
                Manage tournaments, broadcast messages, and control all aspects of tournament operation
              </Text>

              <View style={styles.tournamentSelector}>
                <Text style={styles.label}>Select Tournament</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tournamentChips}>
                  {tournaments
                    .filter(t => t.status === 'active' || t.status === 'setup')
                    .map(tournament => (
                      <TouchableOpacity
                        key={tournament.id}
                        style={[
                          styles.tournamentChip,
                          selectedTournamentId === tournament.id && styles.tournamentChipSelected
                        ]}
                        onPress={() => setSelectedTournamentId(tournament.id)}
                      >
                        <Text
                          style={[
                            styles.tournamentChipText,
                            selectedTournamentId === tournament.id && styles.tournamentChipTextSelected
                          ]}
                        >
                          {tournament.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {selectedTournamentId ? (
                <>
                  <View style={styles.directorTabBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'broadcast' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('broadcast')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'broadcast' && styles.directorTabTextActive
                          ]}
                        >
                          Broadcast
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'matches' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('matches')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'matches' && styles.directorTabTextActive
                          ]}
                        >
                          Matches
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'players' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('players')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'players' && styles.directorTabTextActive
                          ]}
                        >
                          Players
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'bracket' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('bracket')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'bracket' && styles.directorTabTextActive
                          ]}
                        >
                          Bracket
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'reset' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('reset')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'reset' && styles.directorTabTextActive
                          ]}
                        >
                          Reset
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.directorTab,
                          selectedDirectorTab === 'logs' && styles.directorTabActive
                        ]}
                        onPress={() => setSelectedDirectorTab('logs')}
                      >
                        <Text
                          style={[
                            styles.directorTabText,
                            selectedDirectorTab === 'logs' && styles.directorTabTextActive
                          ]}
                        >
                          Logs
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  <View style={styles.directorContent}>
                    {selectedDirectorTab === 'broadcast' && (
                      <BroadcastCenterTab tournamentId={selectedTournamentId} />
                    )}
                    {selectedDirectorTab === 'matches' && (
                      <MatchesTab
                        tournamentId={selectedTournamentId}
                        bracket={null}
                        onBracketUpdate={() => {}}
                      />
                    )}
                    {selectedDirectorTab === 'players' && (
                      <PlayersTab tournamentId={selectedTournamentId} bracket={null} />
                    )}
                    {selectedDirectorTab === 'bracket' && (
                      <BracketTab
                        tournamentId={selectedTournamentId}
                        bracket={null}
                        onBracketUpdate={() => {}}
                      />
                    )}
                    {selectedDirectorTab === 'reset' && (
                      <ResetTab
                        tournamentId={selectedTournamentId}
                        bracket={null}
                        onBracketUpdate={() => {}}
                      />
                    )}
                    {selectedDirectorTab === 'logs' && (
                      <LogsTab tournamentId={selectedTournamentId} />
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.directorEmptyState}>
                  <Radio size={48} color={Colors.light.tabIconDefault} />
                  <Text style={styles.directorEmptyText}>Select a tournament to access Director tools</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>


    </View>
  );
}

const AppColors = Colors.light;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: Colors.light.background,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  unauthorizedText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  sectionSelector: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionSelectorContent: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    height: 32,
  },
  sectionButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  sectionButtonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  sectionButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  cardLink: {
    fontSize: 13,
    color: Colors.light.tint,
    textDecorationLine: 'underline' as const,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cardActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: Colors.light.tint,
  },
  editButton: {
    backgroundColor: Colors.light.accent,
    flex: 0,
    paddingHorizontal: 14,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
    flex: 0,
    paddingHorizontal: 14,
  },
  messageButton: {
    backgroundColor: Colors.light.tint,
    flex: 0,
    paddingHorizontal: 14,
  },
  linkButton: {
    backgroundColor: Colors.light.tint,
    flex: 0,
    paddingHorizontal: 14,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarUnpaid: {
    backgroundColor: Colors.light.error,
  },
  playerInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  playerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
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
  membershipUnpaid: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.error,
  },
  statusBadgeContainer: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusSetup: {
    backgroundColor: Colors.light.warning + '20',
  },
  statusActive: {
    backgroundColor: Colors.light.tint + '20',
  },
  statusCompleted: {
    backgroundColor: Colors.light.textSecondary + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.text,
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
    maxHeight: '85%',
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
    marginTop: 8,
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
  classContainer: {
    marginTop: 12,
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
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginTop: -4,
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
  seasonResetCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  seasonResetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  seasonResetTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  seasonResetDescription: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    fontWeight: '600' as const,
  },
  seasonResetList: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  seasonResetItem: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  seasonResetWarning: {
    fontSize: 14,
    color: Colors.light.warning,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 20,
  },
  seasonResetInputContainer: {
    marginBottom: 20,
  },
  seasonResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.warning,
    paddingVertical: 16,
    borderRadius: 12,
  },
  seasonResetButtonDisabled: {
    opacity: 0.5,
  },
  seasonResetButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  dividerLine: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 32,
  },
  clearLeaderboardSection: {
    backgroundColor: Colors.light.error + '10',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.error + '40',
  },
  clearLeaderboardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.error,
    marginBottom: 12,
  },
  clearLeaderboardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  clearLeaderboardWarning: {
    fontSize: 14,
    color: Colors.light.error,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 16,
  },
  clearLeaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.error,
    paddingVertical: 14,
    borderRadius: 10,
  },
  clearLeaderboardButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  appearanceCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appearanceHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appearanceTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  appearanceDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  themeSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  themeSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  colorInput: {
    flex: 1,
    marginBottom: 0,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  appearanceActions: {
    gap: 12,
    marginTop: 8,
  },
  resetThemeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.warning,
  },
  resetThemeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.warning,
  },
  saveThemeButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveThemeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  leaderboardCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  leaderboardDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  classToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  playerListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  playerListHeaderText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.light.textSecondary,
  },
  playerEditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  playerEditName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    flex: 1,
  },
  playerEditActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    color: Colors.light.text,
    minWidth: 60,
    textAlign: 'center',
  },
  savePointsButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  savePointsButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  addNewPlayerSection: {
    backgroundColor: AppColors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  addNewPlayerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  addNewPlayerForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addPlayerInput: {
    flex: 1,
    marginBottom: 0,
  },
  addPlayerPointsInput: {
    minWidth: 80,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addPlayerButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  addNewPlayerClassButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  newPlayerClassButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  newPlayerClassButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  newPlayerClassButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  newPlayerClassButtonTextActive: {
    color: '#FFFFFF',
  },
  directorCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  directorHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  directorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginTop: 12,
  },
  directorDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tournamentSelector: {
    marginBottom: 20,
  },
  tournamentChips: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tournamentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  tournamentChipSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  tournamentChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  tournamentChipTextSelected: {
    color: '#FFFFFF',
  },
  directorTabBar: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.border,
  },
  directorTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  directorTabActive: {
    borderBottomColor: Colors.light.tint,
  },
  directorTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  directorTabTextActive: {
    color: Colors.light.tint,
  },
  directorContent: {
    minHeight: 400,
  },
  directorEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  directorEmptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

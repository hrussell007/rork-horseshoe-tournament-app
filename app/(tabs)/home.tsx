import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Trophy, Users, Award, User, LogIn, RefreshCw, Handshake, Bell, Tv } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTournamentData } from '@/contexts/TournamentContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useBroadcast } from '@/contexts/BroadcastContext';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();
  const { tournaments, players, forceReseedData } = useTournamentData();
  const { themeSettings } = useTheme();
  const { broadcasts } = useBroadcast();
  const unreadBroadcasts = broadcasts.filter(b => new Date(b.sentAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length;
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const handleLoginPress = () => {
    router.push('/auth');
  };

  const handleRestoreData = () => {
    Alert.alert(
      'Restore Data',
      'This will reset all data to default sample data. All existing tournaments, players, matches, and sponsors will be replaced. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsRestoring(true);
            const success = await forceReseedData();
            setIsRestoring(false);
            if (success) {
              Alert.alert('Success', 'Data has been restored to default sample data');
            } else {
              Alert.alert('Error', 'Failed to restore data. Please check console for details.');
            }
          },
        },
      ]
    );
  };

  const activeTournament = tournaments.find((t) => t.status === 'active');

  const navCards = [
    {
      id: 'tournaments',
      title: 'Tournaments',
      description: 'View and manage all tournaments',
      icon: Trophy,
      color: '#059669',
      backgroundColor: '#D1FAE5',
      count: tournaments.length,
      route: '/(tabs)',
    },
    {
      id: 'players',
      title: 'Players',
      description: 'Browse player roster',
      icon: Users,
      color: '#2563EB',
      backgroundColor: '#DBEAFE',
      count: players.length,
      route: '/players',
    },
    {
      id: 'standings',
      title: 'Season Standings',
      description: 'View leaderboards by class',
      icon: Award,
      color: '#DC2626',
      backgroundColor: '#FEE2E2',
      count: null,
      route: '/standings',
    },
    {
      id: 'sponsors',
      title: 'Sponsors',
      description: 'View tournament sponsors',
      icon: Handshake,
      color: '#7C3AED',
      backgroundColor: '#EDE9FE',
      count: null,
      route: '/sponsors',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.heroSection, { backgroundColor: themeSettings.heroBackgroundColor }]}>
        <TouchableOpacity
          style={styles.alertsButton}
          onPress={() => router.push('/alerts')}
          testID="alerts-button"
        >
          <Bell size={24} color="#FFFFFF" />
          {unreadBroadcasts > 0 && (
            <View style={styles.alertsBadge}>
              <Text style={styles.alertsBadgeText}>{unreadBroadcasts > 9 ? '9+' : unreadBroadcasts}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Image
          source={{
            uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/p4o4pqs5culigzv3eaida',
          }}
          style={[styles.heroLogo, { width: themeSettings.logoSize, height: themeSettings.logoSize }]}
          resizeMode="contain"
        />

        <Text style={styles.heroSubtitle}>
          Track tournaments, players, and season standings
        </Text>

        {!currentUser ? (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLoginPress}
            testID="home-login-button"
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Admin Login</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.userWelcome}>
            <Text style={styles.welcomeText}>
              Welcome back, {currentUser.username}
            </Text>
            {isAdmin && (
              <View style={styles.adminBadgeHome}>
                <Text style={styles.adminBadgeHomeText}>Administrator</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {activeTournament && (
        <View style={styles.liveScoreboardSection}>
          <TouchableOpacity
            style={styles.liveScoreboardCard}
            onPress={() => router.push(`/scoreboard?id=${activeTournament.id}`)}
            testID="live-scoreboard-button"
          >
            <View style={styles.liveIndicatorTop}>
              <View style={styles.liveDotTop} />
              <Text style={styles.liveTextTop}>LIVE NOW</Text>
            </View>
            <View style={styles.liveScoreboardContent}>
              <View style={styles.liveScoreboardIcon}>
                <Tv size={40} color="#FFFFFF" />
              </View>
              <View style={styles.liveScoreboardInfo}>
                <Text style={styles.liveScoreboardTitle}>Public Scoreboard</Text>
                <Text style={styles.liveScoreboardTournament}>{activeTournament.name}</Text>
                <Text style={styles.liveScoreboardDescription}>
                  Watch live scores, brackets, and court updates
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={[
        styles.navSection,
        {
          backgroundColor: `${themeSettings.navSectionBackgroundColor}${Math.round(themeSettings.navSectionOpacity * 255).toString(16).padStart(2, '0')}`
        }
      ]}>
        <Text style={styles.sectionTitle}>Quick Navigation</Text>
        {navCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <TouchableOpacity
              key={card.id}
              style={styles.navCard}
              onPress={() => router.push(card.route as any)}
              testID={`nav-${card.id}`}
            >
              <View style={[styles.navIconContainer, { backgroundColor: card.backgroundColor }]}>
                <IconComponent size={32} color={card.color} />
              </View>
              <View style={styles.navContent}>
                <View style={styles.navHeader}>
                  <Text style={styles.navTitle}>{card.title}</Text>
                  {card.count !== null && (
                    <View style={[styles.navBadge, { backgroundColor: card.color }]}>
                      <Text style={styles.navBadgeText}>{card.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.navDescription}>{card.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {!currentUser && (
        <View style={styles.guestNote}>
          <User size={16} color={Colors.light.textSecondary} />
          <Text style={styles.guestNoteText}>
            Viewing as guest - Login for full access
          </Text>
        </View>
      )}

      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.adminSectionTitle}>Admin Tools</Text>
          <TouchableOpacity
            style={[styles.restoreButton, isRestoring && styles.restoreButtonDisabled]}
            onPress={handleRestoreData}
            disabled={isRestoring}
            testID="restore-data-button"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.restoreButtonText}>Restore Sample Data</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.restoreHelpText}>
            Use this if data is missing or corrupted. This will reset everything to default sample data.
          </Text>
        </View>
      )}

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.bottomLoginButton}
          onPress={() => router.push('/auth')}
          testID="bottom-login-button"
        >
          <LogIn size={18} color={Colors.light.tint} />
          <Text style={styles.bottomLoginText}>Login / Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 3,
    borderBottomColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  alertsButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  alertsBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  alertsBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  welcomeHeader: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.light.tint,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroLogo: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  userWelcome: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  adminBadgeHome: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  adminBadgeHomeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },

  navSection: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  navCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  navIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  navContent: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  navBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  navBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  navDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  guestNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
  },
  guestNoteText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  bottomLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    minWidth: 200,
  },
  bottomLoginText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.tint,
  },
  adminSection: {
    paddingHorizontal: 24,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  adminSectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.warning,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  restoreButtonDisabled: {
    opacity: 0.6,
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  restoreHelpText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  liveScoreboardSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  liveScoreboardCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  liveIndicatorTop: {
    position: 'absolute',
    top: 16,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  liveDotTop: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveTextTop: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  liveScoreboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  liveScoreboardIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveScoreboardInfo: {
    flex: 1,
  },
  liveScoreboardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  liveScoreboardTournament: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
    marginBottom: 6,
  },
  liveScoreboardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
});

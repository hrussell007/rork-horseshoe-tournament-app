import * as Notifications from 'expo-notifications';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Match, Player } from '@/types/tournament';
import { BroadcastMessage } from '@/types/broadcast';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const [NotificationContext, useNotifications] = createContextHook(() => {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    void registerForPushNotifications();

    const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📩 Notification received:', notification);
    });
    notificationListener.current = subscription1;

    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
    });
    responseListener.current = subscription2;

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      console.log('🔔 Registering for push notifications...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied');
        setPermissionStatus('denied');
        return false;
      }

      console.log('✅ Notification permission granted');
      setPermissionStatus('granted');

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('match-updates', {
          name: 'Match Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        
        await Notifications.setNotificationChannelAsync('broadcasts', {
          name: 'Director Broadcasts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 300, 200, 300],
          lightColor: '#10B981',
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return false;
    }
  };

  const sendMatchStartNotification = async (
    match: Match,
    team1Player1: Player | undefined,
    team1Player2: Player | undefined,
    team2Player1: Player | undefined,
    team2Player2: Player | undefined
  ) => {
    if (permissionStatus !== 'granted') {
      console.log('⚠️  Cannot send notification: permission not granted');
      return;
    }

    try {
      const team1Name = `${team1Player1?.name || 'Player'} & ${team1Player2?.name || 'Player'}`;
      const team2Name = `${team2Player1?.name || 'Player'} & ${team2Player2?.name || 'Player'}`;
      const pitInfo = match.pitNumber ? ` on Pit ${match.pitNumber}` : '';

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Match Starting!',
          body: `${team1Name} vs ${team2Name}${pitInfo}`,
          data: { 
            matchId: match.id, 
            tournamentId: match.tournamentId,
            type: 'match_start' 
          },
          sound: true,
        },
        trigger: null,
      });

      console.log(`📤 Match start notification sent for match ${match.id}`);
    } catch (error) {
      console.error('❌ Error sending match start notification:', error);
    }
  };

  const sendMatchInProgressNotification = async (
    match: Match,
    team1Player1: Player | undefined,
    team1Player2: Player | undefined,
    team2Player1: Player | undefined,
    team2Player2: Player | undefined
  ) => {
    if (permissionStatus !== 'granted') {
      console.log('⚠️  Cannot send notification: permission not granted');
      return;
    }

    try {
      const team1Name = `${team1Player1?.name || 'Player'} & ${team1Player2?.name || 'Player'}`;
      const team2Name = `${team2Player1?.name || 'Player'} & ${team2Player2?.name || 'Player'}`;
      const pitInfo = match.pitNumber ? ` on Pit ${match.pitNumber}` : '';
      const scoreInfo = ` (${match.team1Score}-${match.team2Score})`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚡ Match In Progress',
          body: `${team1Name} vs ${team2Name}${pitInfo}${scoreInfo}`,
          data: { 
            matchId: match.id, 
            tournamentId: match.tournamentId,
            type: 'match_progress' 
          },
          sound: true,
        },
        trigger: null,
      });

      console.log(`📤 Match progress notification sent for match ${match.id}`);
    } catch (error) {
      console.error('❌ Error sending match progress notification:', error);
    }
  };

  const sendMatchCompletedNotification = async (
    match: Match,
    team1Player1: Player | undefined,
    team1Player2: Player | undefined,
    team2Player1: Player | undefined,
    team2Player2: Player | undefined
  ) => {
    if (permissionStatus !== 'granted') {
      console.log('⚠️  Cannot send notification: permission not granted');
      return;
    }

    try {
      const team1Name = `${team1Player1?.name || 'Player'} & ${team1Player2?.name || 'Player'}`;
      const team2Name = `${team2Player1?.name || 'Player'} & ${team2Player2?.name || 'Player'}`;
      const winnerName = match.winnerTeamId === match.team1Id ? team1Name : team2Name;
      const finalScore = `${match.team1Score}-${match.team2Score}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Match Completed!',
          body: `${team1Name} vs ${team2Name}\nFinal Score: ${finalScore}\n${winnerName} wins!`,
          data: { 
            matchId: match.id, 
            tournamentId: match.tournamentId,
            type: 'match_complete',
            winnerTeamId: match.winnerTeamId 
          },
          sound: true,
        },
        trigger: null,
      });

      console.log(`📤 Match completed notification sent for match ${match.id}`);
    } catch (error) {
      console.error('❌ Error sending match completed notification:', error);
    }
  };

  const sendBroadcastNotification = async (broadcast: BroadcastMessage) => {
    if (permissionStatus !== 'granted') {
      console.log('⚠️  Cannot send notification: permission not granted');
      return;
    }

    try {
      const priority = broadcast.isEmergency 
        ? Notifications.AndroidImportance.MAX 
        : Notifications.AndroidImportance.HIGH;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: broadcast.isEmergency ? `🚨 ${broadcast.title}` : `📢 ${broadcast.title}`,
          body: broadcast.message,
          data: {
            broadcastId: broadcast.id,
            tournamentId: broadcast.tournamentId,
            type: 'director_broadcast',
            isEmergency: broadcast.isEmergency,
          },
          sound: true,
          priority: priority as any,
        },
        trigger: null,
      });

      console.log(`📤 Broadcast notification sent: "${broadcast.title}"`);
    } catch (error) {
      console.error('❌ Error sending broadcast notification:', error);
    }
  };

  const requestPermission = async () => {
    return await registerForPushNotifications();
  };

  return {
    permissionStatus,
    requestPermission,
    sendMatchStartNotification,
    sendMatchInProgressNotification,
    sendMatchCompletedNotification,
    sendBroadcastNotification,
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { BroadcastMessage, BroadcastAudience, BroadcastTemplate, DEFAULT_TEMPLATES } from '@/types/broadcast';

const STORAGE_KEYS = {
  BROADCASTS: 'horseshoe_broadcasts',
  CUSTOM_TEMPLATES: 'horseshoe_broadcast_templates',
  MUTE_SETTINGS: 'horseshoe_broadcast_mute',
};

interface MuteSettings {
  globalMute: boolean;
  mutedTournamentIds: string[];
}

export const [BroadcastContext, useBroadcast] = createContextHook(() => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [customTemplates, setCustomTemplates] = useState<BroadcastTemplate[]>([]);
  const [muteSettings, setMuteSettings] = useState<MuteSettings>({
    globalMute: false,
    mutedTournamentIds: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📢 Loading broadcast data...');
      const [broadcastsData, templatesData, muteData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BROADCASTS),
        AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_TEMPLATES),
        AsyncStorage.getItem(STORAGE_KEYS.MUTE_SETTINGS),
      ]);

      if (broadcastsData) {
        const parsed = JSON.parse(broadcastsData);
        setBroadcasts(parsed);
        console.log(`✅ Loaded ${parsed.length} broadcasts`);
      }

      if (templatesData) {
        const parsed = JSON.parse(templatesData);
        setCustomTemplates(parsed);
        console.log(`✅ Loaded ${parsed.length} custom templates`);
      }

      if (muteData) {
        const parsed = JSON.parse(muteData);
        setMuteSettings(parsed);
        console.log('✅ Loaded mute settings');
      }
    } catch (error) {
      console.error('❌ Error loading broadcast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (
    newBroadcasts?: BroadcastMessage[],
    newTemplates?: BroadcastTemplate[],
    newMuteSettings?: MuteSettings
  ) => {
    try {
      const promises = [];
      if (newBroadcasts !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.BROADCASTS, JSON.stringify(newBroadcasts)));
      }
      if (newTemplates !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, JSON.stringify(newTemplates)));
      }
      if (newMuteSettings !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.MUTE_SETTINGS, JSON.stringify(newMuteSettings)));
      }
      await Promise.all(promises);
      console.log('💾 Broadcast data saved');
    } catch (error) {
      console.error('❌ Error saving broadcast data:', error);
    }
  };

  const sendBroadcast = useCallback(
    async (
      title: string,
      message: string,
      audience: BroadcastAudience,
      senderName: string,
      senderId: string,
      tournamentId?: string,
      audienceDetails?: BroadcastMessage['audienceDetails'],
      imageUri?: string,
      recipientCount?: number
    ): Promise<BroadcastMessage> => {
      const isEmergency = audience === 'emergency';

      const newBroadcast: BroadcastMessage = {
        id: Date.now().toString(),
        title,
        message,
        audience,
        audienceDetails,
        senderName,
        senderId,
        sentAt: new Date().toISOString(),
        tournamentId,
        imageUri,
        isEmergency,
        recipientCount: recipientCount || 0,
        deliveryStatus: 'sent',
        createdAt: new Date().toISOString(),
      };

      const updated = [newBroadcast, ...broadcasts];
      setBroadcasts(updated);
      await saveData(updated, undefined, undefined);

      console.log(`📤 Broadcast sent: "${title}" to ${audience} (${recipientCount || 0} recipients)`);

      return newBroadcast;
    },
    [broadcasts]
  );

  const deleteBroadcast = useCallback(
    async (id: string) => {
      const updated = broadcasts.filter((b) => b.id !== id);
      setBroadcasts(updated);
      await saveData(updated, undefined, undefined);
      console.log(`🗑️  Broadcast deleted: ${id}`);
    },
    [broadcasts]
  );

  const addCustomTemplate = useCallback(
    async (template: Omit<BroadcastTemplate, 'id' | 'isCustom'>) => {
      const newTemplate: BroadcastTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        isCustom: true,
      };
      const updated = [...customTemplates, newTemplate];
      setCustomTemplates(updated);
      await saveData(undefined, updated, undefined);
      console.log(`➕ Custom template added: ${template.name}`);
      return newTemplate;
    },
    [customTemplates]
  );

  const deleteCustomTemplate = useCallback(
    async (id: string) => {
      const updated = customTemplates.filter((t) => t.id !== id);
      setCustomTemplates(updated);
      await saveData(undefined, updated, undefined);
      console.log(`🗑️  Custom template deleted: ${id}`);
    },
    [customTemplates]
  );

  const getAllTemplates = useCallback((): BroadcastTemplate[] => {
    return [...DEFAULT_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  const setGlobalMute = useCallback(
    async (muted: boolean) => {
      const updated = { ...muteSettings, globalMute: muted };
      setMuteSettings(updated);
      await saveData(undefined, undefined, updated);
      console.log(`🔇 Global mute: ${muted ? 'ON' : 'OFF'}`);
    },
    [muteSettings]
  );

  const toggleTournamentMute = useCallback(
    async (tournamentId: string) => {
      const mutedIds = muteSettings.mutedTournamentIds;
      const updated = {
        ...muteSettings,
        mutedTournamentIds: mutedIds.includes(tournamentId)
          ? mutedIds.filter((id) => id !== tournamentId)
          : [...mutedIds, tournamentId],
      };
      setMuteSettings(updated);
      await saveData(undefined, undefined, updated);
      console.log(`🔇 Tournament ${tournamentId} mute toggled`);
    },
    [muteSettings]
  );

  const isMuted = useCallback(
    (tournamentId?: string): boolean => {
      if (muteSettings.globalMute) return true;
      if (tournamentId && muteSettings.mutedTournamentIds.includes(tournamentId)) return true;
      return false;
    },
    [muteSettings]
  );

  const getBroadcastsForTournament = useCallback(
    (tournamentId: string): BroadcastMessage[] => {
      return broadcasts.filter((b) => b.tournamentId === tournamentId);
    },
    [broadcasts]
  );

  const clearOldBroadcasts = useCallback(
    async (daysToKeep: number = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffTime = cutoffDate.toISOString();

      const filtered = broadcasts.filter((b) => b.createdAt > cutoffTime);
      setBroadcasts(filtered);
      await saveData(filtered, undefined, undefined);
      console.log(`🗑️  Cleared broadcasts older than ${daysToKeep} days`);
    },
    [broadcasts]
  );

  return {
    broadcasts,
    customTemplates,
    muteSettings,
    isLoading,
    sendBroadcast,
    deleteBroadcast,
    addCustomTemplate,
    deleteCustomTemplate,
    getAllTemplates,
    setGlobalMute,
    toggleTournamentMute,
    isMuted,
    getBroadcastsForTournament,
    clearOldBroadcasts,
  };
});

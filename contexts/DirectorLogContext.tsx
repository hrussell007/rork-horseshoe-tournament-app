import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';

export interface DirectorLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  tournamentId?: string;
  matchId?: string;
  playerId?: string;
}

const STORAGE_KEY = 'horseshoe_director_logs';

export const [DirectorLogContext, useDirectorLog] = createContextHook(() => {
  const [logs, setLogs] = useState<DirectorLogEntry[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedLogs = JSON.parse(data);
        setLogs(parsedLogs);
        console.log(`📋 Loaded ${parsedLogs.length} director logs`);
      }
    } catch (error) {
      console.error('Error loading director logs:', error);
    }
  };

  const saveLogs = async (newLogs: DirectorLogEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
      console.log(`💾 Saved ${newLogs.length} director logs`);
    } catch (error) {
      console.error('Error saving director logs:', error);
    }
  };

  const addLog = useCallback((
    action: string,
    details: string,
    tournamentId?: string,
    matchId?: string,
    playerId?: string
  ) => {
    const newLog: DirectorLogEntry = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString(),
      tournamentId,
      matchId,
      playerId,
    };

    setLogs((prevLogs) => {
      const updatedLogs = [newLog, ...prevLogs];
      saveLogs(updatedLogs);
      console.log(`🎬 Director action logged: ${action}`);
      return updatedLogs;
    });
  }, []);

  const clearLogs = async () => {
    setLogs([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('🗑️  Director logs cleared');
  };

  return {
    logs,
    addLog,
    clearLogs,
  };
});

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@/types/trainer';

const SESSIONS_KEY = '@fitcoach:sessions';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const addSession = useCallback(async (session: Session) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  }, [sessions]);

  const clearSessions = useCallback(async () => {
    setSessions([]);
    await AsyncStorage.removeItem(SESSIONS_KEY);
  }, []);

  return { sessions, loading, addSession, clearSessions, reload: loadSessions };
}

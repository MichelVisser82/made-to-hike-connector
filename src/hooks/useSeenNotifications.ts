import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'madetohike_seen_';

/**
 * Generic hook for tracking "seen" notifications using localStorage
 * Works for any notification type by providing a unique key
 */
export function useSeenNotifications(key: string, userId?: string) {
  const storageKey = `${STORAGE_PREFIX}${key}_${userId || 'anonymous'}`;
  
  const [seenIds, setSeenIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist to localStorage whenever seenIds changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([...seenIds]));
    } catch {
      // Ignore storage errors
    }
  }, [seenIds, storageKey]);

  const markAsSeen = useCallback((id: string) => {
    setSeenIds(prev => new Set([...prev, id]));
  }, []);

  const markAllAsSeen = useCallback((ids: string[]) => {
    setSeenIds(prev => new Set([...prev, ...ids]));
  }, []);

  const isUnseen = useCallback((id: string) => {
    return !seenIds.has(id);
  }, [seenIds]);

  const getUnseenCount = useCallback((ids: string[]) => {
    return ids.filter(id => !seenIds.has(id)).length;
  }, [seenIds]);

  const clearSeen = useCallback(() => {
    setSeenIds(new Set());
  }, []);

  return {
    seenIds,
    markAsSeen,
    markAllAsSeen,
    isUnseen,
    getUnseenCount,
    clearSeen
  };
}

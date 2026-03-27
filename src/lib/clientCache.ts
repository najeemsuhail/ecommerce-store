'use client';

type CacheEnvelope<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

function readSessionCache<T>(key: string): CacheEnvelope<T> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeSessionCache<T>(key: string, entry: CacheEnvelope<T>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota and serialization issues.
  }
}

export function getClientCache<T>(key: string): T | null {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key) as CacheEnvelope<T> | undefined;
  if (memoryEntry && memoryEntry.expiresAt > now) {
    return memoryEntry.value;
  }

  if (memoryEntry) {
    memoryCache.delete(key);
  }

  const sessionEntry = readSessionCache<T>(key);
  if (!sessionEntry) {
    return null;
  }

  if (sessionEntry.expiresAt <= now) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key);
    }
    return null;
  }

  memoryCache.set(key, sessionEntry as CacheEnvelope<unknown>);
  return sessionEntry.value;
}

export function setClientCache<T>(key: string, value: T, ttlMs: number) {
  const entry: CacheEnvelope<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };

  memoryCache.set(key, entry as CacheEnvelope<unknown>);
  writeSessionCache(key, entry);
}

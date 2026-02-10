'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Character } from '@/lib/dnd-data';
import { getApiUrl } from '@/lib/asset-path';

type CharacterWithServerId = Character & { serverId?: string };

type CharacterDataContextValue = {
  character: CharacterWithServerId | null;
  loading: boolean;
  error: boolean;
  isOwner: boolean; // 是否为本人，否则为只读访问（公开链接访客）
  refetch: () => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => Promise<void>;
};

const CharacterDataContext = createContext<CharacterDataContextValue | null>(null);

export function CharacterDataProvider({
  serverId,
  children,
}: {
  serverId: string;
  children: React.ReactNode;
}) {
  const [character, setCharacter] = useState<CharacterWithServerId | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const fetchCharacter = useCallback(async () => {
    if (!serverId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(getApiUrl(`/api/characters/${serverId}`));
      if (!res.ok) {
        setError(true);
        setCharacter(null);
        return;
      }
      const data = await res.json();
      const char = data.character as Character;
      setIsOwner(data.isOwner !== false);
      setCharacter({ ...char, serverId });
    } catch {
      setError(true);
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const updateCharacter = useCallback(
    async (updates: Partial<Character>) => {
      if (!isOwner || !character || !serverId) return; // 访客只读，不发起更新
      const next = { ...character, ...updates, updatedAt: new Date().toISOString() };
      setCharacter(next);
      try {
        const res = await fetch(getApiUrl(`/api/characters/${serverId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (!res.ok) setError(true);
      } catch {
        setError(true);
      }
    },
    [character, serverId, isOwner]
  );

  const value: CharacterDataContextValue = {
    character,
    loading,
    error,
    isOwner,
    refetch: fetchCharacter,
    updateCharacter,
  };

  return (
    <CharacterDataContext.Provider value={value}>
      {children}
    </CharacterDataContext.Provider>
  );
}

export function useCharacterData(): CharacterDataContextValue {
  const ctx = useContext(CharacterDataContext);
  if (!ctx) {
    throw new Error('useCharacterData must be used within CharacterDataProvider');
  }
  return ctx;
}

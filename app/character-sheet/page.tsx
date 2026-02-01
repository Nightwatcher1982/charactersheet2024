'use client';

import { useEffect, useState } from 'react';
import { Character } from '@/lib/dnd-data';
import CharacterSheetTabs from '@/components/character-sheet/CharacterSheetTabs';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Partial<Character> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tempChar = localStorage.getItem('temp-character-for-sheet');
    if (tempChar) {
      setCharacter(JSON.parse(tempChar));
    }
  }, []);

  const handleUpdate = (updates: Partial<Character>) => {
    if (!character) return;
    const updatedCharacter = { ...character, ...updates, updatedAt: new Date().toISOString() };
    setCharacter(updatedCharacter);
    localStorage.setItem('temp-character-for-sheet', JSON.stringify(updatedCharacter));
  };

  if (!mounted || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">加载中...</div>
          <div className="text-gray-600">正在准备角色卡</div>
        </div>
      </div>
    );
  }

  return <CharacterSheetTabs character={character} onUpdate={handleUpdate} />;
}

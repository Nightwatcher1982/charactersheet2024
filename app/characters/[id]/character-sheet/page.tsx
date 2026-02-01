'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect } from 'react';
import { Character } from '@/lib/dnd-data';
import CharacterSheetTabs from '@/components/character-sheet/CharacterSheetTabs';

export default function CharacterSheetByCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { characters, currentCharacter, loadCharacter, updateCurrentCharacter, saveCharacter } = useCharacterStore();

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      loadCharacter(id);
    } else {
      router.push('/');
    }
  }, [id, characters, loadCharacter, router]);

  const character = currentCharacter?.id === id ? currentCharacter : characters.find((c) => c.id === id);

  const handleUpdate = (updates: Partial<Character>) => {
    if (!character) return;
    updateCurrentCharacter(updates);
    saveCharacter();
  };

  if (!character || character.id !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">加载角色卡中...</p>
        </div>
      </div>
    );
  }

  return <CharacterSheetTabs character={character} onUpdate={handleUpdate} />;
}

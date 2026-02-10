'use client';

import { useRouter } from 'next/navigation';
import { useCharacterData } from '@/lib/character-data-context';
import CharacterSheetTabs from '@/components/character-sheet/CharacterSheetTabs';

export default function CharacterSheetByCharacterPage() {
  const router = useRouter();
  const { character, loading, error, isOwner, updateCharacter } = useCharacterData();

  if (error) {
    router.push('/');
    return null;
  }

  if (loading || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">加载角色卡中...</p>
        </div>
      </div>
    );
  }

  return (
    <CharacterSheetTabs
      character={character}
      onUpdate={updateCharacter}
      readOnly={!isOwner}
    />
  );
}

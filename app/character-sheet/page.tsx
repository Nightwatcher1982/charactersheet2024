'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Character } from '@/lib/dnd-data';
import CharacterSheetTabs from '@/components/character-sheet/CharacterSheetTabs';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Partial<Character> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tempChar = localStorage.getItem('temp-character-for-sheet');
    if (tempChar) {
      try {
        setCharacter(JSON.parse(tempChar));
      } catch {
        console.error('角色卡数据解析失败');
        setLoadError(true);
      }
    }
  }, []);

  const handleUpdate = (updates: Partial<Character>) => {
    if (!character) return;
    setCharacter({ ...character, ...updates, updatedAt: new Date().toISOString() });
    // 不再做本地持久化；正常流程请使用 /characters/[id]/character-sheet（从服务器拉取并保存）
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">加载中...</div>
          <div className="text-gray-600">正在准备角色卡</div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light px-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-bold text-gray-900 mb-2">数据异常</p>
          <p className="text-gray-600 mb-6">角色卡数据无法加载，请返回首页查看或重新创建角色。</p>
          <Link href="/" className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!character) {
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

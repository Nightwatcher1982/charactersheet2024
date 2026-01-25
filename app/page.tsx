'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { Sword, Plus, Edit, Trash2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { characters, createNewCharacter, loadCharacter, deleteCharacter } = useCharacterStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateNew = () => {
    createNewCharacter();
    router.push('/create');
  };

  const handleEdit = (id: string) => {
    loadCharacter(id);
    router.push('/create');
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个角色吗？')) {
      deleteCharacter(id);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 头部 */}
      <header className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Sword className="w-12 h-12 text-red-600 mr-3" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            D&D 2024 角色卡
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          创建、管理和导出你的龙与地下城角色
        </p>
      </header>

      {/* 创建新角色按钮 */}
      <div className="flex justify-center mb-8">
        <button
          onClick={handleCreateNew}
          className="btn-primary flex items-center gap-2 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105"
        >
          <Plus className="w-6 h-6" />
          创建新角色
        </button>
      </div>

      {/* 角色列表 */}
      {characters.length > 0 ? (
        <div>
          <h2 className="section-title text-center mb-6">我的角色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="card hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {character.name || '未命名角色'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {character.level} 级 {character.class}
                    </p>
                    <p className="text-sm text-gray-500">
                      {character.species}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(character.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="编辑"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">背景：</span>
                    <span className="font-medium">{character.background}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">阵营：</span>
                    <span className="font-medium">{character.alignment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">生命值：</span>
                    <span className="font-medium">{character.hitPoints}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  更新于 {new Date(character.updatedAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Sword className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            还没有角色
          </h3>
          <p className="text-gray-500 mb-6">
            点击上方按钮创建你的第一个角色
          </p>
        </div>
      )}
    </div>
  );
}

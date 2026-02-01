'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { Sword, Plus, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
      {/* 背景装饰效果 - 淡淡的羊皮纸纹理 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* 头部 - 羊皮纸风格 */}
        <header className="text-center mb-16">
          <div className="relative inline-block mb-6">
            {/* 淡淡的装饰效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 blur-xl opacity-20"></div>
            <div className="relative flex items-center justify-center gap-4">
              <Sword className="w-16 h-16 text-amber-700 drop-shadow-lg" />
              <h1 className="text-5xl md:text-7xl font-bold text-leather-dark font-cinzel tracking-wider drop-shadow-md">
                龙与地下城
              </h1>
              <Sword className="w-16 h-16 text-purple-700 drop-shadow-lg" />
            </div>
          </div>
          <div className="inline-block px-6 py-2 bg-white/80 border-2 border-gold-dark/40 rounded-full backdrop-blur-sm shadow-md">
            <p className="text-leather-dark text-xl font-medieval tracking-wide">
              2024 版角色档案管理系统
            </p>
          </div>
          <p className="text-leather-base text-sm mt-4 font-medieval">
            ✨ 创建你的英雄传奇 · 书写你的冒险史诗 ✨
          </p>
        </header>

        {/* 创建新角色按钮 - 羊皮纸风格 */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleCreateNew}
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-xl text-white shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-purple-800"
          >
            <span className="relative flex items-center gap-3">
              <Plus className="w-7 h-7 drop-shadow-lg group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-cinzel tracking-wider">创建新角色</span>
            </span>
          </button>
        </div>

        {/* 角色列表 */}
        {characters.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-leather-dark font-cinzel">
              ⚔️ 我的冒险者 ⚔️
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {characters.map((character) => (
                <div 
                  key={character.id} 
                  className="group relative bg-white/90 backdrop-blur-sm border-2 border-gold-dark/30 rounded-2xl p-6 hover:border-purple-600/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* 卡片背景装饰 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-leather-dark mb-2 font-cinzel tracking-wide">
                          {character.name || '未命名角色'}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-sm text-purple-700 font-medium">
                            🎭 {character.level} 级 {character.class}
                          </p>
                          <p className="text-sm text-leather-base">
                            👤 {character.species}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(character.id)}
                          className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-all hover:scale-110"
                          title="编辑"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(character.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                          title="删除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* 属性信息 */}
                    <div className="space-y-2 text-sm mb-4 bg-amber-50/70 rounded-lg p-4 border border-gold-light/50">
                      <div className="flex justify-between items-center">
                        <span className="text-leather-base">📜 背景</span>
                        <span className="font-medium text-leather-dark">{character.background}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-leather-base">⚖️ 阵营</span>
                        <span className="font-medium text-leather-dark">{character.alignment}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-leather-base">❤️ 生命值</span>
                        <span className="font-medium text-red-600 text-lg">{character.hitPoints}</span>
                      </div>
                    </div>

                    {/* 查看按钮 */}
                    <div className="pt-4 border-t border-gold-light/40">
                      <Link
                        href={`/characters/${character.id}`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="font-medieval">查看角色档案</span>
                      </Link>
                    </div>

                    {/* 更新时间 */}
                    <div className="mt-3 text-xs text-leather-light text-center font-medieval">
                      🕐 更新于 {new Date(character.updatedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative bg-white/80 backdrop-blur-sm border-2 border-gold-dark/30 rounded-2xl p-16 text-center shadow-lg">
            {/* 空状态背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl"></div>
            <div className="relative z-10">
              <Sword className="w-24 h-24 text-leather-light/50 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-leather-dark mb-3 font-cinzel">
                还没有冒险者
              </h3>
              <p className="text-leather-base mb-8 font-medieval">
                开始你的传奇之旅，创建第一个角色吧！
              </p>
              <div className="text-leather-light text-sm font-medieval">
                ✨ 点击上方&quot;创建新角色&quot;按钮开始 ✨
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

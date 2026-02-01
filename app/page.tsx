'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { ALIGNMENTS } from '@/lib/dnd-data';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

function getAlignmentName(alignmentId: string | undefined): string {
  if (!alignmentId) return '';
  const a = ALIGNMENTS.find((x) => x.id === alignmentId);
  return a ? a.name : alignmentId;
}

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
    <div className="relative overflow-hidden">
      {/* 全屏固定背景层 - 漏出主题 */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/pic/home-bg.png)' }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-black/25 pointer-events-none" aria-hidden />

      {/* 第一屏：Logo + 标题 + 底部创建按钮，留出背景主题 */}
      <section className="min-h-screen flex flex-col relative z-10">
        <header className="text-center pt-12 md:pt-20 px-4">
          <h1 className="flex items-center justify-center gap-3 text-4xl md:text-6xl font-bold text-white drop-shadow-md font-cinzel tracking-wider">
            <img
              src="/pic/dnd-logo.png"
              alt="D&D"
              className="h-10 md:h-14 w-auto object-contain drop-shadow-md inline-block"
            />
            <span>5R 角色卡</span>
          </h1>
        </header>
        <div className="flex-1 min-h-[40vh]" />
        <div className="container mx-auto px-4 pb-16 flex justify-center">
          <button
            onClick={handleCreateNew}
            className="group px-10 py-5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xl text-white shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-cinzel tracking-wider">创建新角色</span>
          </button>
        </div>
      </section>

      {/* 第二屏：已创建角色卡 / 空状态 */}
      <section className="min-h-screen relative z-10 pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
        {characters.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-white font-cinzel">
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
                        <span className="font-medium text-leather-dark">{getAlignmentName(character.alignment)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-leather-base">❤️ 生命值</span>
                        <span className="font-medium text-red-600 text-lg">{character.hitPoints}</span>
                      </div>
                    </div>

                    {/* 查看按钮 */}
                    <div className="pt-4 border-t border-gold-light/40">
                      <Link
                        href={`/characters/${character.id}/character-sheet`}
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
          <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-16 text-center shadow-lg">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-3 font-cinzel">
                还没有冒险者
              </h3>
              <p className="text-gray-600 mb-8">
                开始你的传奇之旅，创建第一个角色吧！
              </p>
              <p className="text-gray-500 text-sm">
                ✨ 点击上方「创建新角色」按钮开始 ✨
              </p>
            </div>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}

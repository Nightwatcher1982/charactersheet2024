'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect, useState } from 'react';
import { Character } from '@/lib/dnd-data';
import { CLASSES, SPECIES, BACKGROUNDS } from '@/lib/dnd-data';
import { ArrowLeft, Edit, FileText, Scroll, Star, Image, TrendingUp, Share2, Printer } from 'lucide-react';
import Link from 'next/link';

export default function CharacterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { characters } = useCharacterStore();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found as Character);
    } else {
      // 角色不存在，返回首页
      router.push('/');
    }
  }, [id, characters, router]);

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载角色档案中...</p>
        </div>
      </div>
    );
  }

  const classData = CLASSES.find((c) => c.id === character.class || c.name === character.class);
  const speciesData = SPECIES.find((s) => s.id === character.species || s.name === character.species);
  const backgroundData = BACKGROUNDS.find((b) => b.id === character.background || b.name === character.background);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回角色列表</span>
          </Link>
          
          <div className="flex gap-2">
            <Link
              href={`/characters/${id}/sheet`}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              打印/分享
            </Link>
            <Link
              href={`/create?edit=${id}`}
              className="btn btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              编辑角色
            </Link>
          </div>
        </div>

        {/* 角色封面卡片 */}
        <div className="card mb-6 overflow-hidden">
          <div className="grid md:grid-cols-[300px_1fr] gap-6">
            {/* 左侧：立绘/头像 */}
            <div className="bg-gradient-to-b from-red-100 to-red-50 p-6 flex flex-col items-center justify-center">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-full h-64 object-cover rounded-lg shadow-lg mb-4"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <Link
                href={`/characters/${id}/portraits`}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <Image className="w-4 h-4" />
                查看画册
              </Link>
            </div>

            {/* 右侧：基本信息 */}
            <div className="p-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{character.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {classData?.name || character.class}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {speciesData?.name || character.species}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {backgroundData?.name || character.background}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  等级 {character.level}
                </span>
              </div>

              {/* 关键数值 */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {character.currentHitPoints ?? character.hitPoints}/{character.hitPoints}
                  </div>
                  <div className="text-xs text-gray-600">生命值</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{character.armorClass}</div>
                  <div className="text-xs text-gray-600">护甲等级</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{Math.floor(2 + (character.level - 1) / 4)}
                  </div>
                  <div className="text-xs text-gray-600">熟练加值</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.floor((character.abilities.dexterity - 10) / 2)}
                  </div>
                  <div className="text-xs text-gray-600">先攻</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 档案模块导航 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link
            href={`/characters/${id}/bio`}
            className="card hover:shadow-lg transition-shadow p-4 text-center group cursor-pointer"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">人物传记</h3>
            <p className="text-xs text-gray-600 mt-1">外观、性格、背景</p>
          </Link>

          <Link
            href={`/characters/${id}/journal`}
            className="card hover:shadow-lg transition-shadow p-4 text-center group cursor-pointer"
          >
            <Scroll className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">冒险日志</h3>
            <p className="text-xs text-gray-600 mt-1">
              {character.journal?.length || 0} 条记录
            </p>
          </Link>

          <Link
            href={`/characters/${id}/highlights`}
            className="card hover:shadow-lg transition-shadow p-4 text-center group cursor-pointer"
          >
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">高光时刻</h3>
            <p className="text-xs text-gray-600 mt-1">
              {character.highlights?.length || 0} 个时刻
            </p>
          </Link>

          <Link
            href={`/characters/${id}/level-up`}
            className="card hover:shadow-lg transition-shadow p-4 text-center group cursor-pointer"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">升级管理</h3>
            <p className="text-xs text-gray-600 mt-1">等级提升向导</p>
          </Link>
        </div>

        {/* 快速编辑区域 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 技能与法术 */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">技能与法术</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">熟练技能</h3>
                <div className="flex flex-wrap gap-2">
                  {character.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">法术</h3>
                <div className="flex flex-wrap gap-2">
                  {character.spells.length > 0 ? (
                    character.spells.slice(0, 6).map((spell, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                        {spell}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">无法术</span>
                  )}
                  {character.spells.length > 6 && (
                    <span className="px-2 py-1 text-gray-600 text-sm">
                      +{character.spells.length - 6} 个
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 装备 */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">装备</h2>
            <div className="space-y-2">
              {character.equipment.length > 0 ? (
                character.equipment.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">无装备</p>
              )}
              {character.equipment.length > 8 && (
                <p className="text-gray-600 text-sm">+{character.equipment.length - 8} 件</p>
              )}
            </div>
          </div>
        </div>

        {/* 备注区域 */}
        {character.notes && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">备注</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{character.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

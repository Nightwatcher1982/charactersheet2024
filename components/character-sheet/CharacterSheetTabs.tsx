'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Character, ALIGNMENTS } from '@/lib/dnd-data';
import { getClassIdFromName } from '@/lib/class-level-table';
import { getSubclassById } from '@/lib/subclass-data';
import { User, Shield, Sparkles, Book, Home, TrendingUp } from 'lucide-react';
import BasicInfoPage from './BasicInfoPage';
import FeaturesPage from './FeaturesPage';
import EquipmentPage from './EquipmentPage';
import SpellsPage from './SpellsPage';
import BiographyPage from './BiographyPage';

interface CharacterSheetTabsProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
  /** 访客通过公开链接查看时为 true，仅展示不可编辑 */
  readOnly?: boolean;
}

type TabId = 'basic' | 'features' | 'equipment' | 'spells' | 'biography';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export default function CharacterSheetTabs({ character, onUpdate, readOnly }: CharacterSheetTabsProps) {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const level = typeof character?.level === 'number' ? character.level : 1;
  const canLevelUp = id && level < 20;
  const subclassId = character?.subclass ?? (character?.classFeatureChoices as { subclass?: string } | undefined)?.subclass;
  const classId = character?.class ? getClassIdFromName(character.class) : null;
  const subclass = classId && subclassId ? getSubclassById(classId, subclassId) : null;

  const tabs: Tab[] = [
    {
      id: 'basic',
      name: '基础',
      icon: User,
      description: '角色基础属性、技能、战斗数据'
    },
    {
      id: 'features',
      name: '特性',
      icon: Shield,
      description: '职业特性、物种特性、背景信息'
    },
    {
      id: 'equipment',
      name: '装备',
      icon: Shield,
      description: '武器、护甲、物品'
    },
    {
      id: 'spells',
      name: '法术',
      icon: Sparkles,
      description: '戏法、一环法术、二环法术'
    },
    {
      id: 'biography',
      name: '传记',
      icon: Book,
      description: '个人传记、冒险日志'
    }
  ];

  // 获取阵营的中文名称
  const getAlignmentName = (alignmentId: string | undefined) => {
    if (!alignmentId) return '';
    const alignment = ALIGNMENTS.find(a => a.id === alignmentId);
    return alignment ? alignment.name : alignmentId;
  };

  return (
    <div className="min-h-screen bg-parchment-light">
      {readOnly && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-center py-2 px-4 text-sm">
          您正在以只读方式查看此角色卡，无法修改内容
        </div>
      )}
      {/* 顶部导航栏 - 移除 sticky 定位 */}
      <div className="bg-leather-dark shadow-dnd border-b-4 border-gold-dark">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-cinzel font-bold text-gold-light">
                {character.name || '未命名角色'}
              </h1>
              <p className="text-sm text-parchment-base">
                {character.level}级 {character.species} {character.class}
                {subclass && <span> · {subclass.name}</span>}
                <span> · {character.background}</span>
                {character.alignment && <span> · {getAlignmentName(character.alignment)}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canLevelUp && (
                <Link
                  href={`/characters/${id}/level-up`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white border border-green-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>升级</span>
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-parchment-light text-leather-dark border border-gold-dark rounded-lg text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>回到首页</span>
              </Link>
            </div>
          </div>

          {/* 页签导航 - 紧凑布局，移除滚动 */}
          <div className="flex gap-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-t-lg border-b-4 transition-all whitespace-nowrap text-xs sm:text-sm ${
                    isActive
                      ? 'bg-parchment-light border-gold-dark text-leather-dark font-bold'
                      : 'bg-leather-base border-transparent text-parchment-light hover:bg-leather-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 页签内容 */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'basic' && <BasicInfoPage character={character} onUpdate={onUpdate} />}
        {activeTab === 'features' && <FeaturesPage character={character} onUpdate={onUpdate} />}
        {activeTab === 'equipment' && <EquipmentPage character={character} onUpdate={onUpdate} />}
        {activeTab === 'spells' && <SpellsPage character={character} onUpdate={onUpdate} />}
        {activeTab === 'biography' && <BiographyPage character={character} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

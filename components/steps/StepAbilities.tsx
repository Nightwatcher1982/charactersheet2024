'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { getAbilityModifier, Ability } from '@/lib/dnd-data';
import ClickableAbilityScore from '@/components/ClickableAbilityScore';
import PointBuyAbilityScore from '@/components/PointBuyAbilityScore';
import { Dices, Calculator, Edit3 } from 'lucide-react';

export default function StepAbilities() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [method, setMethod] = useState<string>(() => currentCharacter?.abilityGenerationMethod || 'standard-array');

  if (!currentCharacter) return null;

  const abilities = (() => {
    const raw = currentCharacter.abilities;
    // 防御：避免出现 abilities 被写成 {} 导致后续全是空值
    if (
      !raw ||
      typeof raw !== 'object' ||
      !('strength' in raw) ||
      !('dexterity' in raw) ||
      !('constitution' in raw) ||
      !('intelligence' in raw) ||
      !('wisdom' in raw) ||
      !('charisma' in raw)
    ) {
      return {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      };
    }
    return raw as Ability;
  })();

  const handleScoresComplete = (scores: Record<string, number>) => {
    updateCurrentCharacter({
      abilities: scores as unknown as Ability,
    });
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    // 切换方法时不重置数值，让用户保持选择
    updateCurrentCharacter({
      abilityGenerationMethod: newMethod as 'standard-array' | 'point-buy' | 'manual',
    });
  };

  const handleAbilityChange = (ability: keyof Ability, value: number) => {
    updateCurrentCharacter({
      abilities: {
        ...abilities,
        [ability]: value,
      },
    });
  };

  const abilityList = [
    { key: 'strength', name: '力量', abbr: 'STR', description: '物理力量、运动能力' },
    { key: 'dexterity', name: '敏捷', abbr: 'DEX', description: '灵活性、反应速度、平衡' },
    { key: 'constitution', name: '体质', abbr: 'CON', description: '耐力、生命力、抵抗力' },
    { key: 'intelligence', name: '智力', abbr: 'INT', description: '推理能力、记忆力、分析力' },
    { key: 'wisdom', name: '感知', abbr: 'WIS', description: '察觉力、洞察力、直觉' },
    { key: 'charisma', name: '魅力', abbr: 'CHA', description: '说服力、领导力、个人魅力' },
  ];

  const isStandardArrayAbilities = (a: unknown): a is Ability => {
    if (!a || typeof a !== 'object') return false;
    const obj = a as Record<string, unknown>;
    const vals = [
      obj.strength,
      obj.dexterity,
      obj.constitution,
      obj.intelligence,
      obj.wisdom,
      obj.charisma,
    ];
    if (!vals.every((v) => typeof v === 'number')) return false;
    const sorted = (vals as number[]).slice().sort((x, y) => x - y);
    const expected = [8, 10, 12, 13, 14, 15];
    return sorted.length === expected.length && sorted.every((v, i) => v === expected[i]);
  };

  // 定义页签配置
  const tabs = [
    {
      id: 'standard-array',
      name: '标准数组',
      icon: Dices,
      description: '推荐新手使用'
    },
    {
      id: 'point-buy',
      name: '购点法',
      icon: Calculator,
      description: '自定义分配'
    },
    {
      id: 'manual',
      name: '手动输入',
      icon: Edit3,
      description: '完全自由'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 左上角标题 */}
      <h3 className="text-xl font-bold text-leather-dark font-cinzel">主属性分配</h3>

      {/* 页签式方法选择 - 无内层框体，直接放在页面内 */}
      {/* 页签头部 */}
      <div className="flex border-b-2 border-gold-light/30 bg-amber-50/50 rounded-t-xl overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = method === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleMethodChange(tab.id)}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                isActive
                  ? 'bg-white text-purple-600 font-bold'
                  : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
              <span className="text-sm font-medieval">{tab.name}</span>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-700"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 页签内容区 - 无额外框体 */}
      <div>
        {method === 'standard-array' ? (
          <ClickableAbilityScore
            onComplete={handleScoresComplete}
            initialScores={isStandardArrayAbilities(currentCharacter.abilities) ? currentCharacter.abilities : undefined}
          />
        ) : method === 'point-buy' ? (
          <PointBuyAbilityScore
            onComplete={handleScoresComplete}
            initialScores={currentCharacter.abilities || undefined}
          />
        ) : (
          <div className="space-y-3">
            {abilityList.map((ability) => {
              const value = abilities[ability.key as keyof Ability];
              const modifier = getAbilityModifier(value);
              const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

              return (
                <div
                  key={ability.key}
                  className="p-4 rounded-lg border-2 border-gold-dark/30 bg-white hover:border-purple-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label htmlFor={`ability-${ability.key}`} className="font-bold text-base text-leather-dark font-cinzel">
                        {ability.name} ({ability.abbr})
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        id={`ability-${ability.key}`}
                        name={`ability-${ability.key}`}
                        type="number"
                        min="3"
                        max="20"
                        value={value}
                        onChange={(e) =>
                          handleAbilityChange(
                            ability.key as keyof Ability,
                            parseInt(e.target.value) || 10
                          )
                        }
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-bold text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                      <div className="text-right w-16">
                        <div className="text-2xl font-bold text-purple-600">
                          {modifierStr}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">调整值</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

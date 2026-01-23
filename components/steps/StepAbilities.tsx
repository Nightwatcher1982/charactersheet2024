'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { ABILITY_GENERATION_METHODS, getAbilityModifier, Ability } from '@/lib/dnd-data';
import ClickableAbilityScore from '@/components/ClickableAbilityScore';
import PointBuyAbilityScore from '@/components/PointBuyAbilityScore';

export default function StepAbilities() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [method, setMethod] = useState<string>('standard-array');

  if (!currentCharacter) return null;

  const abilities = currentCharacter.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const handleScoresComplete = (scores: Record<string, number>) => {
    updateCurrentCharacter({
      abilities: scores as unknown as Ability,
    });
  };

  const handleMethodChange = (newMethod: string) => {
    setMethod(newMethod);
    // 切换方法时不重置数值，让用户保持选择
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">分配属性值</h2>
        <p className="text-gray-600 mb-6">
          六大属性值决定了你的角色在各方面的能力。属性值越高，相关检定越容易成功。
        </p>
      </div>

      {/* 背景属性加值提示 */}
      {currentCharacter.backgroundAbilityBonuses && Object.keys(currentCharacter.backgroundAbilityBonuses).length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <div className="font-bold text-orange-900 mb-1">背景属性加值</div>
          <div className="text-sm text-orange-800">
            来自背景：
            {Object.entries(currentCharacter.backgroundAbilityBonuses).map(([ability, bonus]) => (
              <span key={ability} className="ml-2 font-bold">
                {ability}+{bonus}
              </span>
            ))}
          </div>
          <p className="text-xs text-orange-700 mt-1">
            这些加值会在最终角色卡中自动添加到基础属性上
          </p>
        </div>
      )}

      {/* 分配方法选择 */}
      <div>
        <label className="label">选择分配方法</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ABILITY_GENERATION_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMethodChange(m.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                method === m.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="font-bold text-sm text-gray-900">{m.name}</div>
              <div className="text-xs text-gray-600 mt-1">{m.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="info-box">
        <div className="text-sm text-blue-800">
          <strong>属性说明：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>属性值</strong>范围通常是 8-15（初始）或更高</li>
            <li><strong>调整值</strong> = (属性值 - 10) ÷ 2（向下取整）</li>
            <li>调整值用于大部分检定、攻击和伤害计算</li>
            <li>建议优先提升职业主要属性</li>
          </ul>
        </div>
      </div>

      {/* 属性值分配 */}
      <div>
        {method === 'standard-array' ? (
          <ClickableAbilityScore 
            onComplete={handleScoresComplete}
            initialScores={abilities}
          />
        ) : method === 'point-buy' ? (
          <PointBuyAbilityScore
            onComplete={handleScoresComplete}
            initialScores={abilities}
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
                  className="p-3 rounded-lg border-2 border-gray-300 bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-sm text-gray-900">
                        {ability.name} ({ability.abbr})
                      </div>
                      <div className="text-xs text-gray-600">
                        {ability.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
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
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center font-bold"
                      />
                      <div className="text-right w-12">
                        <div className="text-xl font-bold text-red-600">
                          {modifierStr}
                        </div>
                        <div className="text-xs text-gray-500">调整</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="info-box">
        <p className="text-sm text-blue-800">
          💡 <strong>职业推荐：</strong>不同职业需要不同的主要属性。
          例如：战士需要高力量或敏捷，法师需要高智力，牧师需要高感知。
        </p>
      </div>
    </div>
  );
}

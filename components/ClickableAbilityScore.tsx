'use client';

import { useState, useEffect } from 'react';
import { getAbilityModifier, Ability } from '@/lib/dnd-data';
import { Check, X } from 'lucide-react';

interface ClickableAbilityScoreProps {
  onComplete: (scores: Record<string, number>) => void;
  initialScores?: Record<string, number> | Ability;
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const ABILITIES = [
  { key: 'strength', name: '力量', abbr: 'STR', description: '物理力量、近战攻击' },
  { key: 'dexterity', name: '敏捷', abbr: 'DEX', description: '灵活性、AC、先攻' },
  { key: 'constitution', name: '体质', abbr: 'CON', description: '生命值、耐力' },
  { key: 'intelligence', name: '智力', abbr: 'INT', description: '学识、推理' },
  { key: 'wisdom', name: '感知', abbr: 'WIS', description: '洞察、察觉' },
  { key: 'charisma', name: '魅力', abbr: 'CHA', description: '说服、领导' },
];

export default function ClickableAbilityScore({ onComplete, initialScores }: ClickableAbilityScoreProps) {
  const [assignedScores, setAssignedScores] = useState<Record<string, number | null>>(() => {
    // 关键修复：即使传入 initialScores 是 {}，也必须初始化 6 项为 null，避免被判定为“已完成”
    const normalized: Record<string, number | null> = {
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    };

    if (!initialScores) return normalized;

    // 只接受标准数组内的数值；并避免重复占用同一个数值
    const used = new Set<number>();
    for (const { key } of ABILITIES) {
      const raw = (initialScores as Record<string, unknown>)[key];
      if (typeof raw !== 'number') continue;
      if (!STANDARD_ARRAY.includes(raw)) continue;
      if (used.has(raw)) continue;
      normalized[key] = raw;
      used.add(raw);
    }
    return normalized;
  });

  const [availableScores, setAvailableScores] = useState<number[]>(() => {
    const usedScores = ABILITIES.map((a) => assignedScores[a.key]).filter((v): v is number => typeof v === 'number');
    return STANDARD_ARRAY.filter((score) => !usedScores.includes(score));
  });

  const [selectingAbility, setSelectingAbility] = useState<string | null>(null);

  // 每次分配变化时通知父组件
  useEffect(() => {
    const allAssigned = ABILITIES.every((a) => assignedScores[a.key] !== null);
    if (!allAssigned) return;
    onComplete(assignedScores as Record<string, number>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedScores]);

  // 点击选择数字
  const handleSelectScore = (abilityKey: string, score: number) => {
    const newAssigned = { ...assignedScores };
    const oldScore = newAssigned[abilityKey];

    // 如果这个属性已经有值，把旧值放回池子
    let newAvailable = [...availableScores];
    if (oldScore !== null) {
      newAvailable.push(oldScore);
    }

    // 从池子移除选中的分数
    newAvailable = newAvailable.filter(s => s !== score);

    // 分配新分数
    newAssigned[abilityKey] = score;

    setAssignedScores(newAssigned);
    setAvailableScores(newAvailable.sort((a, b) => b - a)); // 从大到小排序
    setSelectingAbility(null); // 关闭选择面板
  };

  // 取消已分配的分数
  const handleRemoveScore = (abilityKey: string) => {
    const score = assignedScores[abilityKey];
    if (score === null) return;

    const newAssigned = { ...assignedScores };
    newAssigned[abilityKey] = null;

    const newAvailable = [...availableScores, score].sort((a, b) => b - a);

    setAssignedScores(newAssigned);
    setAvailableScores(newAvailable);
  };

  const handleReset = () => {
    setAssignedScores({
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    });
    setAvailableScores([...STANDARD_ARRAY]);
    setSelectingAbility(null);
  };

  const isComplete = ABILITIES.every((a) => assignedScores[a.key] !== null);

  return (
    <div className="space-y-6">
      {/* 标准数组说明 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">标准数组分配</h3>
        <p className="text-sm text-blue-800 mb-2">
          点击属性卡片选择数值：<strong>15, 14, 13, 12, 10, 8</strong>
        </p>
        <p className="text-xs text-blue-700">
          💡 提示：点击属性，然后点击要分配的数值。已分配的属性可以再次点击修改。
        </p>
      </div>

      {/* 可用数值显示 */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
        <div className="text-sm font-bold text-gray-700 mb-3">可用数值</div>
        <div className="flex flex-wrap gap-3">
          {STANDARD_ARRAY.map((score) => {
            const isUsed = !availableScores.includes(score);
            return (
              <div
                key={score}
                className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold border-2 transition-all ${
                  isUsed
                    ? 'bg-gray-200 text-gray-400 border-gray-300 opacity-50'
                    : 'bg-white text-purple-600 border-purple-500 shadow-sm'
                }`}
              >
                {score}
                {isUsed && <div className="absolute ml-12 -mt-8 text-xs text-gray-500">已用</div>}
              </div>
            );
          })}
        </div>
        {availableScores.length === 0 && (
          <div className="text-center text-green-600 font-medium py-2 text-sm mt-2 bg-green-50 rounded">
            ✓ 所有数值已分配完成
          </div>
        )}
      </div>

      {/* 属性分配区域 - 点击选择模式 */}
      <div>
        <div className="text-sm font-bold text-gray-700 mb-3">属性分配（点击选择）</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ABILITIES.map((ability) => {
            const score = assignedScores[ability.key];
            const modifier = score !== null ? getAbilityModifier(score) : 0;
            const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            const isSelecting = selectingAbility === ability.key;

            return (
              <div key={ability.key} className="relative">
                <button
                  onClick={() => {
                    if (score !== null) {
                      // 如果已有值，点击可以修改
                      setSelectingAbility(ability.key);
                    } else if (availableScores.length > 0) {
                      // 如果没有值且有可用数值，打开选择
                      setSelectingAbility(ability.key);
                    }
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    score !== null
                      ? 'border-green-500 bg-green-50 hover:shadow-md'
                      : availableScores.length > 0
                      ? 'border-gray-300 border-dashed bg-white hover:border-purple-400 hover:bg-purple-50'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  disabled={score === null && availableScores.length === 0}
                >
                  <div className="text-center mb-2">
                    <div className="font-bold text-sm text-gray-900">{ability.name}</div>
                    <div className="text-xs text-gray-500">{ability.abbr}</div>
                  </div>

                  {score !== null ? (
                    <div className="bg-white rounded-lg p-2 border border-green-400 flex items-center justify-around">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">值</div>
                        <div className="text-2xl font-bold text-gray-900">{score}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">调整</div>
                        <div className="text-xl font-bold text-purple-600">{modifierStr}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3 border border-dashed border-gray-300 text-center text-xs text-gray-400">
                      点击选择
                    </div>
                  )}
                </button>

                {/* 选择面板 */}
                {isSelecting && (
                  <div className="absolute z-10 top-0 left-0 right-0 bg-white rounded-lg border-2 border-purple-500 shadow-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm text-purple-900">选择 {ability.name} 的值</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectingAbility(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {availableScores.map((availScore) => (
                        <button
                          key={availScore}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectScore(ability.key, availScore);
                          }}
                          className="py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded border-2 border-purple-300 hover:border-purple-500 transition-colors flex items-center justify-center"
                        >
                          {availScore}
                        </button>
                      ))}
                      {score !== null && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveScore(ability.key);
                            setSelectingAbility(null);
                          }}
                          className="col-span-3 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-900 text-sm rounded border border-red-300 flex items-center justify-center"
                        >
                          清除
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button onClick={handleReset} className="btn-secondary flex-1">
          重置所有
        </button>
      </div>

      {/* 完成提示 */}
      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold text-lg mb-1">✓ 属性分配完成！</div>
          <div className="text-green-600 text-sm">所有属性已分配完成，您可以继续下一步</div>
        </div>
      )}
    </div>
  );
}

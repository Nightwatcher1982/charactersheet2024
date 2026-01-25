'use client';

import { useState, useEffect } from 'react';
import { getAbilityModifier } from '@/lib/dnd-data';
import { Check } from 'lucide-react';

interface AbilityScore {
  name: string;
  key: string;
  value: number | null;
}

interface DraggableAbilityScoreProps {
  onComplete: (scores: Record<string, number>) => void;
  initialScores?: Record<string, number>;
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

export default function DraggableAbilityScore({ onComplete, initialScores }: DraggableAbilityScoreProps) {
  const [assignedScores, setAssignedScores] = useState<Record<string, number | null>>(() => {
    const normalized: Record<string, number | null> = {
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null,
    };

    if (!initialScores) return normalized;

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

  const [draggedScore, setDraggedScore] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

  const handleDragStart = (score: number, from: string = 'pool') => {
    setDraggedScore(score);
    setDraggedFrom(from);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnAbility = (abilityKey: string) => {
    if (draggedScore === null) return;

    const newAssigned = { ...assignedScores };
    const oldScore = newAssigned[abilityKey];

    // 如果这个属性已经有值，把旧值放回池子
    let newAvailable = [...availableScores];
    if (oldScore !== null) {
      newAvailable.push(oldScore);
    }

    // 从池子或其他属性移除这个分数
    if (draggedFrom === 'pool') {
      newAvailable = newAvailable.filter(s => s !== draggedScore);
    } else if (draggedFrom) {
      newAssigned[draggedFrom] = null;
    }

    newAssigned[abilityKey] = draggedScore;

    setAssignedScores(newAssigned);
    setAvailableScores(newAvailable.sort((a, b) => b - a));
    setDraggedScore(null);
    setDraggedFrom(null);

    // 检查是否全部分配完成
    if (Object.values(newAssigned).every(v => v !== null)) {
      onComplete(newAssigned as Record<string, number>);
    }
  };

  const handleDropOnPool = () => {
    if (draggedScore === null || draggedFrom === 'pool') return;

    const newAssigned = { ...assignedScores};
    if (draggedFrom) {
      newAssigned[draggedFrom] = null;
    }

    const newAvailable = [...availableScores, draggedScore].sort((a, b) => b - a);

    setAssignedScores(newAssigned);
    setAvailableScores(newAvailable);
    setDraggedScore(null);
    setDraggedFrom(null);
  };

  const isComplete = ABILITIES.every((a) => assignedScores[a.key] !== null);

  return (
    <div className="space-y-6">
      {/* 可用数值池 - 紧凑版 */}
      <div>
        <h3 className="text-md font-bold text-gray-900 mb-2">可用数值</h3>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDropOnPool}
          className={`flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border-2 border-dashed min-h-[60px] ${
            availableScores.length === 0 ? 'border-green-300 bg-green-50' : 'border-gray-300'
          }`}
        >
          {availableScores.length > 0 ? (
            availableScores.map((score, index) => (
              <div
                key={`${score}-${index}`}
                draggable
                onDragStart={() => handleDragStart(score, 'pool')}
                className="w-12 h-12 bg-white border-2 border-red-500 rounded-lg flex items-center justify-center text-xl font-bold text-red-600 cursor-move hover:shadow-lg transition-shadow"
              >
                {score}
              </div>
            ))
          ) : (
            <div className="w-full text-center text-green-600 font-medium py-2 text-sm">
              ✓ 所有数值已分配
            </div>
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1">
          💡 拖动数值到下方属性框
        </p>
      </div>

      {/* 属性分配区域 - 紧凑版 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ABILITIES.map((ability) => {
          const score = assignedScores[ability.key];
          const modifier = score !== null ? getAbilityModifier(score) : 0;
          const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

          return (
            <div
              key={ability.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnAbility(ability.key)}
              className={`p-3 rounded-lg border-2 transition-all ${
                score !== null ? 'border-green-500 bg-green-50' : 'border-gray-300 border-dashed bg-white'
              }`}
            >
              <div className="text-center mb-2">
                <div className="font-bold text-sm text-gray-900">{ability.name}</div>
                <div className="text-xs text-gray-500">{ability.abbr}</div>
              </div>

              {score !== null ? (
                <div
                  draggable
                  onDragStart={() => handleDragStart(score, ability.key)}
                  className="cursor-move"
                >
                  <div className="bg-white rounded-lg p-2 border border-green-400 flex items-center justify-around">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">值</div>
                      <div className="text-2xl font-bold text-gray-900">{score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">调整</div>
                      <div className="text-xl font-bold text-red-600">{modifierStr}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-3 border border-dashed border-gray-300 text-center text-xs text-gray-400">
                  拖入
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 完成提示 */}
      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold text-lg mb-1">✓ 属性分配完成！</div>
          <div className="text-green-600 text-sm">您可以继续下一步，或重新调整属性分配</div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getAbilityModifier, Ability } from '@/lib/dnd-data';
import { Plus, Minus } from 'lucide-react';

interface PointBuyAbilityScoreProps {
  onComplete: (scores: Record<string, number>) => void;
  initialScores?: Record<string, number> | Ability;
}

const ABILITIES = [
  { key: 'strength', name: '力量', abbr: 'STR' },
  { key: 'dexterity', name: '敏捷', abbr: 'DEX' },
  { key: 'constitution', name: '体质', abbr: 'CON' },
  { key: 'intelligence', name: '智力', abbr: 'INT' },
  { key: 'wisdom', name: '感知', abbr: 'WIS' },
  { key: 'charisma', name: '魅力', abbr: 'CHA' },
];

// 购点法成本表
const POINT_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export default function PointBuyAbilityScore({ onComplete, initialScores }: PointBuyAbilityScoreProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    // 如果有初始分数，尝试使用它们；否则全部从8开始
    if (!initialScores) {
      return {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      };
    }

    // 验证初始分数：如果总点数超过27，则重置为全8
    const validatedScores: Record<string, number> = {};
    let totalCost = 0;
    const scoresObj = initialScores as Record<string, number>;
    
    ABILITIES.forEach(ability => {
      const score = scoresObj[ability.key];
      if (score !== undefined && score >= 8 && score <= 15) {
        validatedScores[ability.key] = score;
        totalCost += POINT_COST[score] || 0;
      } else {
        validatedScores[ability.key] = 8;
      }
    });
    
    // 如果总成本超过27，重置为全8
    if (totalCost > 27) {
      return {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      };
    }
    
    return validatedScores;
  });

  const calculatePointsUsed = () => {
    try {
      return Object.values(scores).reduce((total, score) => {
        const cost = POINT_COST[score];
        if (cost === undefined) {
          console.warn('Invalid score:', score);
          return total;
        }
        return total + cost;
      }, 0);
    } catch (error) {
      console.error('Error calculating points:', error);
      return 0;
    }
  };

  const pointsUsed = calculatePointsUsed();
  const pointsRemaining = Math.max(0, 27 - pointsUsed);

  useEffect(() => {
    onComplete(scores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores]); // 移除 onComplete 依赖避免无限循环

  const canIncrement = (ability: string) => {
    try {
      const current = scores[ability];
      if (!current || current >= 15) return false;
      const currentCost = POINT_COST[current];
      const nextCost = POINT_COST[current + 1];
      if (currentCost === undefined || nextCost === undefined) return false;
      const costToIncrease = nextCost - currentCost;
      return pointsRemaining >= costToIncrease;
    } catch (error) {
      console.error('Error in canIncrement:', error);
      return false;
    }
  };

  const canDecrement = (ability: string) => {
    try {
      const current = scores[ability];
      return current && current > 8;
    } catch (error) {
      console.error('Error in canDecrement:', error);
      return false;
    }
  };

  const handleIncrement = (ability: string) => {
    try {
      if (canIncrement(ability)) {
        const current = scores[ability];
        if (current < 15) {
          setScores({ ...scores, [ability]: current + 1 });
        }
      }
    } catch (error) {
      console.error('Error in handleIncrement:', error);
    }
  };

  const handleDecrement = (ability: string) => {
    try {
      if (canDecrement(ability)) {
        const current = scores[ability];
        if (current > 8) {
          setScores({ ...scores, [ability]: current - 1 });
        }
      }
    } catch (error) {
      console.error('Error in handleDecrement:', error);
    }
  };

  const handleReset = () => {
    setScores({
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    });
  };

  return (
    <div className="space-y-4">
      {/* 点数进度 */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-purple-900">购点法分配</h3>
          <div className="text-right">
            <div className="text-sm text-purple-700">剩余点数</div>
            <div className="text-3xl font-bold text-purple-600">{pointsRemaining}</div>
          </div>
        </div>
        <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(pointsUsed / 27) * 100}%` }}
          />
        </div>
        <p className="text-xs text-purple-700 mt-2">
          已使用 <strong>{pointsUsed}</strong> / 27 点
        </p>
      </div>

      {/* 属性分配 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ABILITIES.map((ability) => {
          const score = scores[ability.key] || 8;
          const modifier = getAbilityModifier(score);
          const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          const currentCost = POINT_COST[score] || 0;
          const nextCost = score < 15 ? (POINT_COST[score + 1] || 0) : 0;
          const costForNext = score < 15 ? nextCost - currentCost : 0;

          return (
            <div
              key={ability.key}
              className="p-3 rounded-lg border-2 border-purple-300 bg-purple-50"
            >
              <div className="text-center mb-2">
                <div className="font-bold text-sm text-gray-900">{ability.name}</div>
                <div className="text-xs text-gray-500">{ability.abbr}</div>
              </div>

              <div className="bg-white rounded-lg p-2 mb-2 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-xs text-gray-500">值</div>
                  <div className="text-2xl font-bold text-gray-900">{score}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">调整</div>
                  <div className="text-xl font-bold text-purple-600">{modifierStr}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleDecrement(ability.key)}
                  disabled={!canDecrement(ability.key)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    canDecrement(ability.key)
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="text-xs text-center text-gray-600 flex-1">
                  {score < 15 ? (
                    <>
                      下个<br />
                      <strong className="text-purple-600">{costForNext}点</strong>
                    </>
                  ) : (
                    <span className="text-green-600">最大</span>
                  )}
                </div>

                <button
                  onClick={() => handleIncrement(ability.key)}
                  disabled={!canIncrement(ability.key)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    canIncrement(ability.key)
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 成本表说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="font-bold text-sm text-blue-900 mb-2">点数成本表</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-gray-700">8 = 0点</div>
          <div className="text-gray-700">9 = 1点</div>
          <div className="text-gray-700">10 = 2点</div>
          <div className="text-gray-700">11 = 3点</div>
          <div className="text-gray-700">12 = 4点</div>
          <div className="text-gray-700">13 = 5点</div>
          <div className="text-purple-700 font-bold">14 = 7点</div>
          <div className="text-purple-700 font-bold">15 = 9点</div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button onClick={handleReset} className="btn-secondary flex-1">
          重置所有
        </button>
      </div>

      {pointsRemaining === 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 点数分配完成！</div>
          <div className="text-green-600 text-sm mt-1">
            已使用全部 27 点
          </div>
        </div>
      )}
    </div>
  );
}

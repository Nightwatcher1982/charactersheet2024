'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface BackgroundAbilityBonusProps {
  availableAbilities: string[];
  onComplete: (bonuses: Record<string, number>) => void;
  initialBonuses?: Record<string, number>;
}

export default function BackgroundAbilityBonus({ 
  availableAbilities, 
  onComplete,
  initialBonuses = {}
}: BackgroundAbilityBonusProps) {
  const [bonuses, setBonuses] = useState<Record<string, number>>(initialBonuses);
  const [distributionMode, setDistributionMode] = useState<'2-1' | '1-1-1'>('2-1');
  const hasCalledRef = useRef(false);

  const totalAssigned = Object.values(bonuses).reduce((sum, val) => sum + val, 0);
  const isComplete = totalAssigned === 3;

  useEffect(() => {
    if (isComplete && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onComplete(bonuses);
    } else if (!isComplete) {
      hasCalledRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bonuses, isComplete]); // 移除 onComplete 依赖避免无限循环

  const handleIncrement = (ability: string) => {
    const current = bonuses[ability] || 0;
    const maxForAbility = distributionMode === '2-1' ? 2 : 1;
    
    if (current < maxForAbility && totalAssigned < 3) {
      setBonuses({ ...bonuses, [ability]: current + 1 });
    }
  };

  const handleDecrement = (ability: string) => {
    const current = bonuses[ability] || 0;
    if (current > 0) {
      const newBonuses = { ...bonuses };
      newBonuses[ability] = current - 1;
      if (newBonuses[ability] === 0) {
        delete newBonuses[ability];
      }
      setBonuses(newBonuses);
    }
  };

  const handleReset = () => {
    setBonuses({});
    hasCalledRef.current = false;
  };

  const handleModeChange = (mode: '2-1' | '1-1-1') => {
    setDistributionMode(mode);
    handleReset();
  };

  const abilityNameMap: Record<string, { abbr: string, full: string }> = {
    '力量': { abbr: 'STR', full: '力量' },
    '敏捷': { abbr: 'DEX', full: '敏捷' },
    '体质': { abbr: 'CON', full: '体质' },
    '智力': { abbr: 'INT', full: '智力' },
    '感知': { abbr: 'WIS', full: '感知' },
    '魅力': { abbr: 'CHA', full: '魅力' },
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-orange-900 mb-2">
          背景属性加值分配
        </h3>
        <p className="text-sm text-orange-800">
          总共 <strong>+3</strong> 点属性加值，可以从以下属性中选择分配
        </p>
      </div>

      {/* 分配模式选择 */}
      <div>
        <label className="label">选择分配方式</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleModeChange('2-1')}
            className={`p-4 rounded-lg border-2 transition-all ${
              distributionMode === '2-1'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <div className="font-bold text-gray-900">+2 / +1 模式</div>
            <div className="text-xs text-gray-600 mt-1">
              一个属性+2，另一个属性+1
            </div>
          </button>
          <button
            onClick={() => handleModeChange('1-1-1')}
            className={`p-4 rounded-lg border-2 transition-all ${
              distributionMode === '1-1-1'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <div className="font-bold text-gray-900">+1 / +1 / +1 模式</div>
            <div className="text-xs text-gray-600 mt-1">
              三个属性各+1
            </div>
          </button>
        </div>
      </div>

      {/* 进度显示 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">已分配：</span>
          <span className="text-2xl font-bold text-orange-600">
            {totalAssigned} / 3
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
            style={{ width: `${(totalAssigned / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* 属性选择 */}
      <div className="grid grid-cols-3 gap-3">
        {availableAbilities.map((ability) => {
          const bonus = bonuses[ability] || 0;
          const info = abilityNameMap[ability];
          const maxForAbility = distributionMode === '2-1' ? 2 : 1;
          const canIncrement = bonus < maxForAbility && totalAssigned < 3;

          return (
            <div
              key={ability}
              className={`p-4 rounded-lg border-2 transition-all ${
                bonus > 0
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="text-center mb-3">
                <div className="font-bold text-gray-900">{info.full}</div>
                <div className="text-xs text-gray-500">{info.abbr}</div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <button
                  onClick={() => handleDecrement(ability)}
                  disabled={bonus === 0}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    bonus === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  -
                </button>
                <div className="w-12 h-12 flex items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">
                    {bonus > 0 ? `+${bonus}` : '0'}
                  </span>
                </div>
                <button
                  onClick={() => handleIncrement(ability)}
                  disabled={!canIncrement}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    !canIncrement
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  +
                </button>
              </div>

              {bonus > 0 && (
                <div className="flex justify-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 规则提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>规则：</strong>
        {distributionMode === '2-1' ? (
          <span> 一个属性最多+2，另一个+1，总共+3</span>
        ) : (
          <span> 三个不同属性各+1，总共+3</span>
        )}
      </div>

      {/* 重置和完成 */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="btn-secondary flex-1"
          disabled={totalAssigned === 0}
        >
          重置
        </button>
      </div>

      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 属性加值分配完成！</div>
          <div className="text-green-600 text-sm mt-1">
            {Object.entries(bonuses).map(([ability, bonus]) => `${ability}+${bonus}`).join('、')}
          </div>
        </div>
      )}
    </div>
  );
}

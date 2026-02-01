'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface BackgroundAbilityBonusProps {
  availableAbilities: string[];
  onComplete: (bonuses: Record<string, number>) => void;
  initialBonuses?: Record<string, number>;
  backgroundName?: string;
  backgroundSummary?: string;
  backgroundSkills?: string[];
  backgroundTools?: string;
  backgroundFeat?: string;
  /** 为 true 时不渲染内部确认按钮，由父级（如弹窗底栏）统一提供 */
  hideConfirmButton?: boolean;
  /** 加值变化时回调，供父级同步状态并在底栏显示确认按钮 */
  onBonusesChange?: (bonuses: Record<string, number>, total: number) => void;
}

export default function BackgroundAbilityBonus({ 
  availableAbilities, 
  onComplete,
  initialBonuses = {},
  backgroundName,
  backgroundSummary,
  backgroundSkills,
  backgroundTools,
  backgroundFeat,
  hideConfirmButton = false,
  onBonusesChange
}: BackgroundAbilityBonusProps) {
  const [bonuses, setBonuses] = useState<Record<string, number>>(initialBonuses);
  const [distributionMode, setDistributionMode] = useState<'2-1' | '1-1-1'>('2-1');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const totalAssigned = Object.values(bonuses).reduce((sum, val) => sum + val, 0);
  const isComplete = totalAssigned === 3;

  useEffect(() => {
    onBonusesChange?.(bonuses, totalAssigned);
  }, [bonuses, totalAssigned, onBonusesChange]);

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

  const handleConfirm = () => {
    if (isComplete) {
      onComplete(bonuses);
    }
  };

  return (
    <div className="space-y-4">
      {/* 背景信息展示区 - 简化版 */}
      {backgroundName && (
        <div className="bg-white/90 border-2 border-gold-light/50 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-sm text-leather-dark flex-1">
              <strong className="block mb-2 text-base font-cinzel text-leather-dark">
                已选择：{backgroundName}
              </strong>
              
              {backgroundSummary && (
                <p className="text-leather-base mb-3 leading-relaxed text-xs">
                  {backgroundSummary}
                </p>
              )}

              {/* 背景功能详情 - 更紧凑 */}
              <div className="space-y-1.5 text-xs bg-amber-50/50 rounded-lg p-3 border border-gold-light/30">
                {/* 技能 */}
                {backgroundSkills && (
                  <div className="flex items-start">
                    <span className="font-bold text-amber-800 min-w-[60px]">技能：</span>
                    <span className="text-leather-dark">
                      {backgroundSkills.join('、')}
                    </span>
                  </div>
                )}

                {/* 工具 */}
                {backgroundTools && (
                  <div className="flex items-start">
                    <span className="font-bold text-amber-800 min-w-[60px]">工具：</span>
                    <span className="text-leather-dark">
                      {backgroundTools}
                    </span>
                  </div>
                )}

                {/* 专长 */}
                {backgroundFeat && (
                  <div className="flex items-start">
                    <span className="font-bold text-amber-800 min-w-[60px]">专长：</span>
                    <span className="text-purple-700 font-medium">
                      {backgroundFeat}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分配模式选择 - 更紧凑 */}
      <div>
        <label className="text-sm font-semibold text-leather-dark mb-2 block font-cinzel">选择分配方式</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            id="ability-bonus-mode-2-1"
            onClick={() => handleModeChange('2-1')}
            className={`p-3 rounded-lg border-2 transition-all ${
              distributionMode === '2-1'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <div className="font-bold text-gray-900 text-sm">+2 / +1 模式</div>
            <div className="text-xs text-gray-600 mt-0.5">
              一个属性+2，另一个属性+1
            </div>
          </button>
          <button
            type="button"
            id="ability-bonus-mode-1-1-1"
            onClick={() => handleModeChange('1-1-1')}
            className={`p-3 rounded-lg border-2 transition-all ${
              distributionMode === '1-1-1'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <div className="font-bold text-gray-900 text-sm">+1 / +1 / +1 模式</div>
            <div className="text-xs text-gray-600 mt-0.5">
              三个属性各+1
            </div>
          </button>
        </div>
      </div>

      {/* 进度显示 - 更紧凑 */}
      <div className="bg-amber-50/50 rounded-lg p-3 border border-gold-light/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-leather-dark">已分配：</span>
          <span className="text-xl font-bold text-purple-600">
            {totalAssigned} / 3
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(totalAssigned / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* 属性选择 - 更紧凑 */}
      <div className="grid grid-cols-3 gap-2">
        {availableAbilities.map((ability) => {
          const bonus = bonuses[ability] || 0;
          const info = abilityNameMap[ability];
          const maxForAbility = distributionMode === '2-1' ? 2 : 1;
          const canIncrement = bonus < maxForAbility && totalAssigned < 3;

          return (
            <div
              key={ability}
              className={`p-3 rounded-lg border-2 transition-all ${
                bonus > 0
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="text-center mb-2">
                <div className="font-bold text-gray-900 text-sm">{info.full}</div>
                <div className="text-xs text-gray-500">{info.abbr}</div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrement(ability)}
                  disabled={bonus === 0}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all text-sm ${
                    bonus === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                  aria-label={`${ability} 减一`}
                >
                  -
                </button>
                <div className="w-10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {bonus > 0 ? `+${bonus}` : '0'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleIncrement(ability)}
                  disabled={!canIncrement}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all text-sm ${
                    !canIncrement
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                  aria-label={`${ability} 加一`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 确认按钮（hideConfirmButton 时由弹窗底栏提供，此处不渲染） */}
      {!hideConfirmButton && isComplete && (
        <div className="pt-2">
          <button
            type="button"
            id="ability-bonus-confirm"
            onClick={handleConfirm}
            className="w-full py-2.5 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Check className="w-5 h-5" />
            <span>确认属性加值</span>
          </button>
        </div>
      )}
    </div>
  );
}

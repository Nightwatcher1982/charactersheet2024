'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Character, getAbilityModifier, getProficiencyBonus, SKILLS, CLASSES } from '@/lib/dnd-data';
import { computeArmorClass } from '@/lib/ac-calculator';
import { Heart, Shield, Dices, Edit3, Minus, Plus, X } from 'lucide-react';
import { calculateSpeciesHPBonus, calculateClassFeatureHPBonus } from '@/lib/species-traits-calculator';

interface BasicInfoPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

export default function BasicInfoPage({ character, onUpdate }: BasicInfoPageProps) {
  const [currentHP, setCurrentHP] = useState(character.hitPoints ?? 0);
  const [showHPModal, setShowHPModal] = useState(false);
  const [pendingHP, setPendingHP] = useState(0);

  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  // 应用背景属性加值
  const finalAbilities = { ...abilities };
  if (character.backgroundAbilityBonuses) {
    Object.entries(character.backgroundAbilityBonuses).forEach(([abilityName, bonus]) => {
      const abilityMap: Record<string, keyof typeof abilities> = {
        '力量': 'strength',
        '敏捷': 'dexterity',
        '体质': 'constitution',
        '智力': 'intelligence',
        '感知': 'wisdom',
        '魅力': 'charisma',
      };
      const key = abilityMap[abilityName];
      if (key) {
        finalAbilities[key] += bonus;
      }
    });
  }

  const profBonus = getProficiencyBonus(character.level || 1);

  // 计算生命值
  const classData = CLASSES.find(c => c.name === character.class);
  const constitutionMod = getAbilityModifier(finalAbilities.constitution);
  const hitDie = classData?.hitDie || 8;
  let maxHP = hitDie + constitutionMod;

  // 检查专长对生命值的影响
  if (character.feats?.includes('tough')) {
    const level = character.level || 1;
    maxHP += level * 2;
  }

  // 检查物种特性对生命值的影响
  const speciesHPBonus = calculateSpeciesHPBonus(character);
  maxHP += speciesHPBonus;

  // 检查职业特性对生命值的影响
  const classFeatureHPBonus = calculateClassFeatureHPBonus(character);
  maxHP += classFeatureHPBonus;

  // 如果当前HP未设置，初始化为最大值
  if (currentHP === 0 && maxHP > 0) {
    setCurrentHP(maxHP);
    onUpdate({ hitPoints: maxHP });
  }

  const openHPModal = () => {
    setPendingHP(Math.max(0, Math.min(maxHP, currentHP)));
    setShowHPModal(true);
  };

  const closeHPModal = () => {
    setShowHPModal(false);
  };

  const applyHPChange = (delta: number) => {
    setPendingHP((prev) => Math.max(0, Math.min(maxHP, prev + delta)));
  };

  const confirmHP = () => {
    const value = Math.max(0, Math.min(maxHP, pendingHP));
    setCurrentHP(value);
    onUpdate({ hitPoints: value });
    closeHPModal();
  };

  // 弹窗打开时禁止背景滚动
  useEffect(() => {
    if (showHPModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showHPModal]);

  // 计算先攻和被动感知
  const dexterityMod = getAbilityModifier(finalAbilities.dexterity);
  const initiativeBonus = dexterityMod;
  
  const wisdomMod = getAbilityModifier(finalAbilities.wisdom);
  const hasPerceptionProficiency = character.skills?.includes('察觉');
  const passivePerception = 10 + wisdomMod + (hasPerceptionProficiency ? profBonus : 0);

  // 护甲等级：装备护甲/盾牌 + 职业特性（防御战斗风格、无甲防御、龙裔体魄等）+ 专长
  const armorClass = computeArmorClass(character, finalAbilities);

  return (
    <div className="space-y-6">
      {/* 角色立绘 */}
      {character.avatar && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
          <div className="flex items-center justify-center">
            <img
              src={character.avatar}
              alt={character.name}
              className="max-w-md w-full h-auto rounded-lg shadow-lg border-4 border-gold-dark"
            />
          </div>
        </div>
      )}

      {/* 基础信息 + 战斗数据 - 突出核心数据 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-leather-dark mb-4 border-b-2 border-gold-light pb-2">
          战斗数据
        </h2>
        
        {/* 核心战斗数据 - 大字号突出显示 */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* 生命值 - 点击编辑打开 +/- 弹窗 */}
          <div className="flex flex-col bg-red-50 rounded-lg p-4 border-2 border-red-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col items-center gap-1 flex-1">
                <Heart className="w-7 h-7 text-red-600" />
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">生命值</span>
              </div>
              <button
                type="button"
                onClick={openHPModal}
                className="p-1 hover:bg-red-200 rounded transition-colors self-start"
                aria-label="调整生命值"
              >
                <Edit3 className="w-4 h-4 text-red-600" />
              </button>
            </div>
            <div>
              <div className="text-center text-3xl font-bold text-red-600 mb-2">
                {currentHP} <span className="text-xl text-gray-600">/ {maxHP}</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, (currentHP / maxHP) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 生命值调整弹窗 */}
          {showHPModal && typeof document !== 'undefined' && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6" onClick={(e) => e.target === e.currentTarget && closeHPModal()}>
              <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full flex flex-col border-2 border-red-200" onClick={(e) => e.stopPropagation()}>
                <div className="bg-red-600 text-white p-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
                  <h3 className="font-bold text-lg font-cinzel">调整生命值</h3>
                  <button type="button" onClick={closeHPModal} className="p-1 hover:bg-red-500 rounded transition-colors" aria-label="关闭">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 flex flex-col items-center gap-6 flex-shrink-0">
                  <div className="text-4xl font-bold text-red-600">
                    <span id="hp-modal-value">{pendingHP}</span>
                    <span className="text-2xl text-gray-500 font-normal"> / {maxHP}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => applyHPChange(-5)}
                      disabled={pendingHP <= 0}
                      className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-red-700 text-lg transition-colors"
                      aria-label="减 5"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHPChange(-1)}
                      disabled={pendingHP <= 0}
                      className="w-12 h-12 rounded-full bg-red-200 hover:bg-red-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-red-700 transition-colors"
                      aria-label="减 1"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHPChange(1)}
                      disabled={pendingHP >= maxHP}
                      className="w-12 h-12 rounded-full bg-green-200 hover:bg-green-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-green-700 transition-colors"
                      aria-label="加 1"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHPChange(5)}
                      disabled={pendingHP >= maxHP}
                      className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-green-700 text-lg transition-colors"
                      aria-label="加 5"
                    >
                      +5
                    </button>
                  </div>
                </div>
                <div className="p-4 border-t-2 border-gray-200 flex gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={closeHPModal}
                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors border border-gray-300"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={confirmHP}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    确认
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* 先攻 - 放大 */}
          <div className="flex flex-col bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300 items-center justify-center">
            <div className="flex flex-col items-center gap-1 mb-3">
              <span className="text-3xl">⚡</span>
              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">先攻</span>
            </div>
            <div className="text-4xl font-bold text-yellow-600">
              {initiativeBonus >= 0 ? '+' : ''}{initiativeBonus}
            </div>
          </div>

          {/* 护甲等级 - 放大（含装备护甲与盾牌） */}
          <div className="flex flex-col bg-blue-50 rounded-lg p-4 border-2 border-blue-300 items-center justify-center">
            <div className="flex flex-col items-center gap-1 mb-3">
              <Shield className="w-7 h-7 text-blue-600" />
              <span className="text-sm font-bold text-gray-700 whitespace-nowrap">护甲等级</span>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {armorClass}
            </div>
          </div>
        </div>

        {/* 次要信息 - 紧凑显示 */}
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">等级</div>
            <div className="text-lg font-bold text-leather-dark">{character.level}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">速度</div>
            <div className="text-lg font-bold text-green-600">30 尺</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">被动感知</div>
            <div className="text-lg font-bold text-purple-600">{passivePerception}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-0.5">生命骰</div>
            <div className="text-lg font-bold text-red-600">1d{hitDie}</div>
          </div>
        </div>
      </div>

      {/* 属性值 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-leather-dark mb-4 border-b-2 border-gold-light pb-2">
          属性值与豁免
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: '力量', key: 'strength' as const, icon: '💪', save: '力量豁免' },
            { name: '敏捷', key: 'dexterity' as const, icon: '🏃', save: '敏捷豁免' },
            { name: '体质', key: 'constitution' as const, icon: '❤️', save: '体质豁免' },
            { name: '智力', key: 'intelligence' as const, icon: '🧠', save: '智力豁免' },
            { name: '感知', key: 'wisdom' as const, icon: '👁️', save: '感知豁免' },
            { name: '魅力', key: 'charisma' as const, icon: '✨', save: '魅力豁免' }
          ].map(({ name, key, icon, save }) => {
            const value = finalAbilities[key];
            const modifier = getAbilityModifier(value);
            // 检查是否有该属性的豁免熟练（从职业数据中获取）
            const classData = CLASSES.find(c => c.name === character.class);
            const hasSaveProficiency = classData?.savingThrows?.includes(name) || false;
            const saveBonus = modifier + (hasSaveProficiency ? profBonus : 0);
            
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-600">{name}</div>
                    <div className="text-xl font-bold text-leather-dark">{value}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">调整</div>
                    <div className="text-lg font-bold text-purple-600">
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center justify-between pt-2 border-t ${hasSaveProficiency ? 'border-purple-300 bg-purple-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-1">
                    {hasSaveProficiency && (
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                    <span className="text-xs text-gray-600">{save}</span>
                  </div>
                  <span className="text-sm font-bold text-leather-dark">
                    {saveBonus >= 0 ? '+' : ''}{saveBonus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 技能 - 紧凑网格布局 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-leather-dark mb-4 border-b-2 border-gold-light pb-2">
          技能
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {SKILLS.map((skill) => {
            const isProficient = character.skills?.includes(skill.name);
            const abilityKey = skill.ability.toLowerCase() as keyof typeof abilities;
            const abilityValue = finalAbilities[abilityKey];
            const modifier = getAbilityModifier(abilityValue);
            const total = modifier + (isProficient ? profBonus : 0);

            return (
              <div
                key={skill.name}
                className={`flex items-center justify-between px-2 py-1.5 rounded ${
                  isProficient
                    ? 'bg-purple-50 border border-purple-300'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {isProficient && (
                    <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{skill.name}</span>
                </div>
                <span className="text-sm font-bold text-leather-dark ml-2">
                  {total >= 0 ? '+' : ''}{total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

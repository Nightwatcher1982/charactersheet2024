'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { BACKGROUNDS } from '@/lib/dnd-data';
import { getFeatById } from '@/lib/feats-data';
import { Check, ChevronDown, ChevronUp, Star, Scroll, ArrowRight } from 'lucide-react';
import EquipmentSelector from '@/components/EquipmentSelector';
import BackgroundAbilityBonus from '@/components/BackgroundAbilityBonus';

interface StepOriginBackgroundProps {
  onNextSubStep?: () => void;
}

export default function StepOriginBackground({ onNextSubStep }: StepOriginBackgroundProps) {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [expandedBackground, setExpandedBackground] = useState<string | null>(null);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [showAbilityBonus, setShowAbilityBonus] = useState(false);

  if (!currentCharacter) return null;

  const handleSelectBackground = (backgroundName: string) => {
    // 选择背景并获取专长和技能
    const bg = BACKGROUNDS.find(b => b.name === backgroundName);
    if (bg) {
      // 获取当前已有的技能（职业技能或物种技能）
      const currentSkills = currentCharacter.skills || [];
      // 移除旧的背景技能（如果有的话）
      const oldBg = BACKGROUNDS.find(b => b.name === currentCharacter.background);
      const skillsWithoutOldBg = oldBg 
        ? currentSkills.filter(skill => !oldBg.skills.includes(skill))
        : currentSkills;
      // 添加新背景的技能
      const newSkills = [...skillsWithoutOldBg, ...bg.skills];
      
      updateCurrentCharacter({ 
        background: backgroundName,
        // 自动添加背景提供的专长
        feats: [bg.featId as string],
        // 自动添加背景技能
        skills: newSkills
      });
      setShowEquipmentSelector(true);
      setShowAbilityBonus(false);
    }
  };

  const handleEquipmentComplete = (choice: 'A' | 'B') => {
    updateCurrentCharacter({
      backgroundEquipmentChoice: choice
    });
    // 装备选择完成后，直接显示属性加值选择（武器选择移到装备步骤）
    setShowAbilityBonus(true);
  };

  const handleAbilityBonusComplete = (bonuses: Record<string, number>) => {
    updateCurrentCharacter({
      backgroundAbilityBonuses: bonuses
    });
  };

  // 如果已选择背景，显示装备选择器或属性加值选择器
  if (currentCharacter.background && (showEquipmentSelector || showAbilityBonus)) {
    const background = BACKGROUNDS.find(b => b.name === currentCharacter.background);
    if (!background) return null;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="section-title">背景：{background.name}</h2>
          <button
            onClick={() => {
              setShowEquipmentSelector(false);
              setShowAbilityBonus(false);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
          >
            ← 重新选择背景
          </button>
        </div>

        {/* 步骤1：装备选择 */}
        {showEquipmentSelector && (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
              <div className="text-sm text-blue-800">
                <strong>步骤 1/3:</strong> 选择起始装备
              </div>
            </div>
            <EquipmentSelector
              backgroundId={background.id}
              backgroundName={background.name}
              initialChoice={currentCharacter.backgroundEquipmentChoice}
              onComplete={handleEquipmentComplete}
            />
          </>
        )}

        {/* 步骤2：属性加值选择 */}
        {showAbilityBonus && (
          <>
            {/* 步骤3：属性加值 */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg">
              <div className="text-sm text-orange-800">
                <strong>步骤 2/2:</strong> 分配背景属性加值
              </div>
            </div>
            <BackgroundAbilityBonus
              availableAbilities={background.abilityChoices || []}
              onComplete={handleAbilityBonusComplete}
              initialBonuses={currentCharacter.backgroundAbilityBonuses || {}}
            />
            {currentCharacter.backgroundAbilityBonuses && 
             Object.keys(currentCharacter.backgroundAbilityBonuses).length > 0 &&
             Object.values(currentCharacter.backgroundAbilityBonuses).reduce((a, b) => a + b, 0) === 3 && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <div className="text-green-700 font-bold">✓ 背景设置完成！</div>
                  <div className="text-green-600 text-sm mt-1">
                    你已完成装备选择和属性加值分配。
                  </div>
                </div>
                
                {/* 下一步按钮 */}
                {onNextSubStep && (
                  <button
                    onClick={onNextSubStep}
                    className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span>继续选择物种 (2.2)</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">步骤 2.1：选择背景</h2>
        <p className="text-gray-600 mb-6">
          背景代表你在成为冒险者前的经历和职业。它提供技能、工具、专长和属性加值。
        </p>
      </div>

      {/* 关键说明 */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
        <div className="font-bold text-green-900 mb-2">🎯 2024 版背景系统</div>
        <div className="text-sm text-green-800 space-y-1">
          <p>• <strong>属性加值</strong>：每个背景提供 +3 点加到指定的 3 个属性</p>
          <p>• <strong>专长</strong>：每个背景提供一个强大的起源专长</p>
          <p>• <strong>技能</strong>：2 个固定的技能熟练</p>
          <p>• <strong>工具</strong>：1 个工具熟练</p>
          <p>• <strong>装备</strong>：选择装备包或 50 金币</p>
        </div>
      </div>

      {/* 背景列表 */}
      <div className="space-y-3">
        {BACKGROUNDS.map((background) => {
          const isSelected = currentCharacter.background === background.name;
          const isExpanded = expandedBackground === background.id;
          const feat = getFeatById(background.featId as string);

          return (
            <div
              key={background.id}
              className={`rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              {/* 主卡片 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => handleSelectBackground(background.name)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {background.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({background.nameEn})
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{background.description}</p>
                  </button>

                  {isSelected && (
                    <div className="ml-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 快速信息 */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">技能：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {background.skills.join('、')}
                    </span>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">工具：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {background.toolProficiency}
                    </span>
                  </div>
                  <div className="text-xs bg-gray-50 rounded p-2">
                    <span className="text-gray-500">属性加值：</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {background.abilityChoices.join('/')} (+3)
                    </span>
                  </div>
                  <div className="text-xs bg-purple-50 rounded p-2 flex items-center gap-1">
                    <Star className="w-3 h-3 text-purple-600" />
                    <span className="text-gray-500">专长：</span>
                    <span className="font-medium text-purple-900 ml-1">
                      {feat?.name || background.featId}
                    </span>
                  </div>
                </div>

                {/* 查看详情 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedBackground(isExpanded ? null : background.id);
                  }}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 hover:bg-blue-50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      收起背景故事
                    </>
                  ) : (
                    <>
                      <Scroll className="w-4 h-4" />
                      阅读背景故事
                    </>
                  )}
                </button>
              </div>

              {/* 展开的背景故事和详情 */}
              {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-white p-4 space-y-4">
                  {/* 背景故事 */}
                  <div>
                    <div className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Scroll className="w-4 h-4 text-orange-600" />
                      背景故事
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed bg-orange-50 rounded p-3 border-l-4 border-orange-400">
                      {background.narrative}
                    </div>
                  </div>

                  {/* 专长详情 */}
                  {feat && (
                    <div>
                      <div className="font-bold text-sm text-gray-700 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-600" />
                        获得的专长
                      </div>
                      <div className="bg-purple-50 rounded p-3 border border-purple-300">
                        <div className="font-bold text-purple-900 mb-1">{feat.name}</div>
                        <div className="text-xs text-purple-800 mb-2">{feat.description}</div>
                        <div className="text-xs text-gray-700">
                          <strong>效果：</strong>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {feat.benefits.slice(0, 2).map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                            {feat.benefits.length > 2 && (
                              <li className="text-gray-500">...（还有 {feat.benefits.length - 2} 项效果）</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 帮助信息 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-bold mb-2">💡 如何选择背景？</div>
        <ul className="list-disc list-inside space-y-1">
          <li>考虑职业的主要属性：选择能提供对应属性加值的背景</li>
          <li>考虑技能组合：背景技能+职业技能应该互补</li>
          <li>考虑专长效果：某些专长与特定职业配合很好</li>
          <li>考虑角色故事：选择符合你角色背景的选项</li>
        </ul>
      </div>
    </div>
  );
}

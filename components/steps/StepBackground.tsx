'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { BACKGROUNDS, CLASSES } from '@/lib/dnd-data';
import { Check, Info } from 'lucide-react';
import BackgroundSkillSelector from '@/components/BackgroundSkillSelector';

// 背景简介（一句话）
const getBackgroundSummary = (backgroundName: string): string => {
  const summaryMap: Record<string, string> = {
    '侍僧': '在神殿中服侍的虔诚信徒，精通宗教仪式和神圣知识',
    '贤者': '致力于学术研究的学者，拥有渊博的知识',
    '骗子': '善于欺骗和伪装的骗术大师',
    '艺人': '娱乐大众的表演者，擅长魅力社交',
    '商人': '精明的贸易商人，熟谙商业之道',
    '贵族': '出身显赫的上流社会成员',
    '平民': '普通的劳动者，拥有生存技能',
    '士兵': '训练有素的战斗人员',
    '罪犯': '游走在法律边缘的不法之徒',
  };
  return summaryMap[backgroundName] || '一个独特的成长经历';
};

export default function StepBackground() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showSkillSelector, setShowSkillSelector] = useState(false);

  // 移除自动跳转逻辑，改为手动点击"下一步"按钮进入详情
  
  if (!currentCharacter) return null;

  const handleSelectBackground = (backgroundName: string) => {
    // 只更新选中的背景，不自动进入下一步
    updateCurrentCharacter({ background: backgroundName });
  };

  const handleSkillsComplete = (skills: string[]) => {
    const existingSkills = currentCharacter.skills || [];
    const classSkills = existingSkills.filter(skill => {
      const selectedClass = CLASSES.find(c => c.name === currentCharacter.class);
      return selectedClass?.availableSkills?.includes(skill);
    });
    
    updateCurrentCharacter({
      skills: [...classSkills, ...skills]
    });
  };

  const handleAbilityComplete = (bonuses: Record<string, number>) => {
    updateCurrentCharacter({
      backgroundAbilityBonuses: bonuses
    });
  };

  return (
    <div className="space-y-6">
      {!showSkillSelector ? (
        <>
          {/* 背景网格 - 3列布局 */}
          <div className="grid grid-cols-3 gap-4">
            {BACKGROUNDS.map((background) => (
              <button
                key={background.id}
                onClick={() => handleSelectBackground(background.name)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                  currentCharacter.background === background.name
                    ? 'border-gold-dark bg-gold-light/30 shadow-dnd ring-2 ring-gold-dark'
                    : 'border-leather-light bg-white hover:border-gold-base hover:shadow-md'
                }`}
              >
                {/* 背景图标占位（暂时只显示首字） */}
                <div className="w-20 h-20 rounded-lg bg-leather-light/50 flex items-center justify-center">
                  <span className="text-3xl font-bold text-leather-dark font-cinzel">
                    {background.name.charAt(0)}
                  </span>
                </div>
                
                {/* 背景名称 */}
                <div className="text-center">
                  <h3 className="font-bold text-leather-dark font-cinzel">
                    {background.name}
                  </h3>
                </div>

                {/* 选中标记 */}
                {currentCharacter.background === background.name && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gold-dark rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 底部提示 - 显示背景介绍 */}
          {currentCharacter.background && (
            <div className="bg-parchment-base border-2 border-gold-light rounded-lg p-4 shadow-dnd mt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
                <div className="text-sm text-leather-dark">
                  <strong className="block mb-1">已选择：{currentCharacter.background}</strong>
                  <p className="text-leather-base">
                    {getBackgroundSummary(currentCharacter.background)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <h2 className="section-title">背景：{currentCharacter.background}</h2>
            <button
              onClick={() => setShowSkillSelector(false)}
              className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
            >
              ← 重新选择背景
            </button>
          </div>

          <BackgroundSkillSelector
            selectedBackground={currentCharacter.background || ''}
            onSkillsComplete={handleSkillsComplete}
            onAbilityComplete={handleAbilityComplete}
            initialSkills={[]}
            initialBonuses={currentCharacter.backgroundAbilityBonuses}
          />
        </>
      )}
    </div>
  );
}

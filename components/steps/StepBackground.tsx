'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { BACKGROUNDS, CLASSES } from '@/lib/dnd-data';
import { Check } from 'lucide-react';
import BackgroundSkillSelector from '@/components/BackgroundSkillSelector';

export default function StepBackground() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showSkillSelector, setShowSkillSelector] = useState(false);

  useEffect(() => {
    if (currentCharacter?.background) {
      setShowSkillSelector(true);
    }
  }, [currentCharacter?.background]);

  if (!currentCharacter) return null;

  const handleSelectBackground = (backgroundName: string) => {
    updateCurrentCharacter({ background: backgroundName });
    setShowSkillSelector(true);
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
          <div>
            <h2 className="section-title">选择背景</h2>
            <p className="text-gray-600 mb-6">
              背景代表你的角色在成为冒险者之前的经历，在2024版规则中，背景提供技能、工具熟练、属性加值和起源专长。
            </p>
          </div>

          <div className="info-box">
            <p className="text-sm text-blue-800">
              💡 <strong>提示：</strong>2024版背景系统重新设计，每个背景都提供：2个技能熟练、1个工具熟练、+3属性加值和1个起源专长。
            </p>
          </div>

          <div className="space-y-4">
            {BACKGROUNDS.map((background) => (
              <button
                key={background.id}
                onClick={() => handleSelectBackground(background.name)}
                className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                  currentCharacter.background === background.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {background.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{background.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">技能熟练：</span>
                        <span className="font-medium ml-2">
                          {background.skills.join('、')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">工具熟练：</span>
                        <span className="font-medium ml-2">
                          {background.toolProficiency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">起源专长：</span>
                        <span className="font-medium ml-2">
                          {background.featId}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">属性加值：</span>
                        <span className="font-medium ml-2">
                          +{background.abilityBonus}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {currentCharacter.background === background.name && (
                    <div className="ml-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
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

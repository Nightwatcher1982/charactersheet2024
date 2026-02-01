'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import StepOriginBackground from './StepOriginBackground';
import StepSpecies from './StepSpecies';
import LanguageSelector from '@/components/LanguageSelector';
import { Check } from 'lucide-react';

import BackgroundAbilityBonus from '@/components/BackgroundAbilityBonus';
import { BACKGROUNDS } from '@/lib/dnd-data';

type OriginSubStep = 'background' | 'backgroundAbility' | 'species' | 'languages';

export default function StepOrigin() {
  const { currentCharacter, updateCurrentCharacter, nextStep, prevStep } = useCharacterStore();
  const [currentSubStep, setCurrentSubStep] = useState<OriginSubStep>('species');


  if (!currentCharacter) return null;

  // 检查每个子步骤是否完成
  const isBackgroundComplete = Boolean(
    currentCharacter.background && 
    currentCharacter.backgroundEquipmentChoice
  );
  const isBackgroundAbilityComplete = Boolean(
    currentCharacter.backgroundAbilityBonuses &&
    Object.keys(currentCharacter.backgroundAbilityBonuses).length > 0 &&
    Object.values(currentCharacter.backgroundAbilityBonuses).reduce((a: number, b: number) => a + b, 0) === 3
  );
  const isSpeciesComplete = Boolean(currentCharacter.species);
  const isLanguagesComplete = Boolean(
    currentCharacter.languages && 
    currentCharacter.languages.length >= 3
  );

  const handleLanguagesComplete = (languages: string[]) => {
    updateCurrentCharacter({ languages });
  };

  const handleAbilityBonusComplete = (bonuses: Record<string, number>) => {
    updateCurrentCharacter({
      backgroundAbilityBonuses: bonuses
    });
  };

  // 子步骤定义（先物种，再背景）
  const subSteps = [
    { id: 'species' as OriginSubStep, name: '物种', completed: isSpeciesComplete },
    { id: 'background' as OriginSubStep, name: '背景', completed: isBackgroundComplete },
    { id: 'backgroundAbility' as OriginSubStep, name: '属性加值', completed: isBackgroundAbilityComplete },
    { id: 'languages' as OriginSubStep, name: '语言', completed: isLanguagesComplete }
  ];

  // 监听主流程「下一步」：在起源步骤时由 create 页派发
  useEffect(() => {
    const handleOriginNext = () => {
      if (currentSubStep === 'species') {
        if (currentCharacter?.species) {
          window.dispatchEvent(new CustomEvent('triggerSpeciesConfiguration'));
        }
        return;
      }
      if (currentSubStep === 'background') {
        if (!currentCharacter?.background) return; // 未选背景，不响应
        if (isBackgroundComplete) {
          setCurrentSubStep('languages');
        } else {
          window.dispatchEvent(new CustomEvent('triggerBackgroundConfiguration'));
        }
        return;
      }
      if (currentSubStep === 'languages' && isLanguagesComplete) {
        nextStep();
      }
    };
    window.addEventListener('triggerOriginNext', handleOriginNext);
    return () => window.removeEventListener('triggerOriginNext', handleOriginNext);
  }, [currentSubStep, currentCharacter?.species, isBackgroundComplete, isLanguagesComplete, nextStep]);

  // 监听主流程「上一步」：在起源步骤时回到上一子步骤，物种子步骤才退回步骤1
  useEffect(() => {
    const handleOriginPrev = () => {
      if (currentSubStep === 'species') {
        prevStep();
        window.scrollTo(0, 0);
        return;
      }
      if (currentSubStep === 'background') {
        setCurrentSubStep('species');
        return;
      }
      if (currentSubStep === 'backgroundAbility') {
        setCurrentSubStep('background');
        return;
      }
      if (currentSubStep === 'languages') {
        setCurrentSubStep('background');
        return;
      }
    };
    window.addEventListener('triggerOriginPrev', handleOriginPrev);
    return () => window.removeEventListener('triggerOriginPrev', handleOriginPrev);
  }, [currentSubStep, prevStep]);

  return (
    <div className="space-y-6">
      {/* 当前子步骤内容 */}
      <div>
        {currentSubStep === 'background' && (
          <StepOriginBackground 
            onNextSubStep={() => {
              // 背景选择完成后，跳转到语言选择
              setCurrentSubStep('languages');
            }}
          />
        )}
        {currentSubStep === 'backgroundAbility' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">分配背景属性加值</h3>
              <p className="text-gray-600">
                根据你选择的背景，分配 +3 点属性加值到指定的属性上。
              </p>
            </div>
            {currentCharacter.background && (() => {
              const background = BACKGROUNDS.find(b => b.name === currentCharacter.background);
              if (!background) return null;
              return (
                <BackgroundAbilityBonus
                  availableAbilities={background.abilityChoices || []}
                  onComplete={handleAbilityBonusComplete}
                  initialBonuses={currentCharacter.backgroundAbilityBonuses || {}}
                />
              );
            })()}
          </div>
        )}
        {currentSubStep === 'species' && (
          <StepSpecies 
            onComplete={() => {
              // 物种选择完成后，进入背景选择
              setCurrentSubStep('background');
            }}
          />
        )}
        {currentSubStep === 'languages' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">选择语言</h3>
              <p className="text-gray-600">
                选择你的角色知晓的语言。这些语言可以帮助你与不同文化和生物交流。
              </p>
            </div>
            <LanguageSelector
              initialLanguages={currentCharacter.languages}
              requiredCount={2}
              onComplete={handleLanguagesComplete}
              showRareLanguages={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

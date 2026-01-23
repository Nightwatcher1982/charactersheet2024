'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import StepOriginBackground from './StepOriginBackground';
import StepSpecies from './StepSpecies';
import LanguageSelector from '@/components/LanguageSelector';
import { Check } from 'lucide-react';

type OriginSubStep = 'background' | 'species' | 'languages';

export default function StepOrigin() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [currentSubStep, setCurrentSubStep] = useState<OriginSubStep>('background');

  if (!currentCharacter) return null;

  // 检查每个子步骤是否完成
  const isBackgroundComplete = Boolean(
    currentCharacter.background && 
    currentCharacter.backgroundEquipmentChoice
  );
  const isSpeciesComplete = Boolean(currentCharacter.species);
  const isLanguagesComplete = Boolean(
    currentCharacter.languages && 
    currentCharacter.languages.length >= 3
  );

  const handleLanguagesComplete = (languages: string[]) => {
    updateCurrentCharacter({ languages });
  };

  // 子步骤定义
  const subSteps = [
    { id: 'background' as OriginSubStep, name: '背景', completed: isBackgroundComplete },
    { id: 'species' as OriginSubStep, name: '物种', completed: isSpeciesComplete },
    { id: 'languages' as OriginSubStep, name: '语言', completed: isLanguagesComplete }
  ];

  return (
    <div className="space-y-6">
      {/* 主标题 */}
      <div>
        <h2 className="section-title">步骤 2：确定起源</h2>
        <p className="text-gray-600">
          你的起源包括背景、物种和语言，它们共同塑造了你的角色在成为冒险者前的经历。
        </p>
      </div>

      {/* 子步骤导航 */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-2">
        <div className="grid grid-cols-3 gap-2">
          {subSteps.map((step, index) => {
            const isActive = currentSubStep === step.id;
            const isCompleted = step.completed;
            const isAccessible = index === 0 || subSteps[index - 1].completed;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && setCurrentSubStep(step.id)}
                disabled={!isAccessible}
                className={`relative py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : isAccessible
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCompleted && !isActive && (
                    <Check className="w-4 h-4" />
                  )}
                  <span>2.{index + 1} {step.name}</span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-orange-500"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 进度指示 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            起源组件完成度：
          </span>
          <span className="font-bold text-orange-600">
            {[isBackgroundComplete, isSpeciesComplete, isLanguagesComplete].filter(Boolean).length} / 3
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500"
            style={{
              width: `${([isBackgroundComplete, isSpeciesComplete, isLanguagesComplete].filter(Boolean).length / 3) * 100}%`
            }}
          />
        </div>
      </div>

      {/* 当前子步骤内容 */}
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
        {currentSubStep === 'background' && <StepOriginBackground />}
        {currentSubStep === 'species' && <StepSpecies />}
        {currentSubStep === 'languages' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">步骤 2.3：选择语言</h3>
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

      {/* 快速导航按钮 */}
      {currentSubStep !== 'background' && (
        <div className="flex justify-between">
          <button
            onClick={() => {
              const currentIndex = subSteps.findIndex(s => s.id === currentSubStep);
              if (currentIndex > 0) {
                setCurrentSubStep(subSteps[currentIndex - 1].id);
              }
            }}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
          >
            ← 上一个
          </button>
          
          {currentSubStep !== 'languages' && subSteps.find(s => s.id === currentSubStep)?.completed && (
            <button
              onClick={() => {
                const currentIndex = subSteps.findIndex(s => s.id === currentSubStep);
                if (currentIndex < subSteps.length - 1) {
                  setCurrentSubStep(subSteps[currentIndex + 1].id);
                }
              }}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              下一个 →
            </button>
          )}
        </div>
      )}

      {/* 完成提示 */}
      {isBackgroundComplete && isSpeciesComplete && isLanguagesComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-5 text-center">
          <div className="text-2xl font-bold text-green-700 mb-2">✓ 起源设置完成！</div>
          <div className="text-green-600">
            你已完成背景、物种和语言的选择。点击&ldquo;下一步&rdquo;继续分配属性值。
          </div>
        </div>
      )}
    </div>
  );
}

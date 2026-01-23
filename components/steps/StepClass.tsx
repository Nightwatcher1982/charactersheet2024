'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { CLASSES } from '@/lib/dnd-data';
import { Check } from 'lucide-react';
import ClassSkillSelector from '@/components/ClassSkillSelector';
import ClassFeatureSelector from '@/components/ClassFeatureSelector';

export default function StepClass() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [skillsCompleted, setSkillsCompleted] = useState(false);

  useEffect(() => {
    // 如果已经选择了职业，显示技能选择器
    if (currentCharacter?.class) {
      setShowSkillSelector(true);
    }
  }, [currentCharacter?.class]);

  if (!currentCharacter) return null;

  const handleSelectClass = (className: string, hitDie: number) => {
    updateCurrentCharacter({ 
      class: className,
      hitPoints: hitDie + Math.floor((currentCharacter.abilities?.constitution || 10 - 10) / 2),
      // 清空之前的技能选择
      skills: []
    });
    setShowSkillSelector(true);
  };

  const handleSkillsComplete = (skills: string[]) => {
    // 合并职业技能到角色技能列表
    const existingSkills = currentCharacter.skills || [];
    const backgroundSkills = existingSkills.filter(skill => {
      // 保留背景技能（如果有的话）
      const selectedClass = CLASSES.find(c => c.name === currentCharacter.class);
      return !selectedClass?.availableSkills?.includes(skill);
    });
    
    updateCurrentCharacter({
      skills: [...backgroundSkills, ...skills]
    });
    
    setSkillsCompleted(true);
    
    // 检查是否需要选择职业特性
    const classData = CLASSES.find(c => c.name === currentCharacter.class);
    if (classData && (classData as any).featureChoices && (classData as any).featureChoices.length > 0) {
      setShowFeatureSelector(true);
    }
  };

  const handleFeatureComplete = (featureId: string, selectedOption: string) => {
    const currentChoices = currentCharacter.classFeatureChoices || {};
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        [featureId]: selectedOption
      }
    });
  };

  return (
    <div className="space-y-6">
      {!showSkillSelector ? (
        <>
          <div>
            <h2 className="section-title">选择职业</h2>
            <p className="text-gray-600 mb-6">
              职业决定了你的角色在冒险中扮演的角色和拥有的能力。每个职业都有独特的战斗风格和技能。
            </p>
          </div>

          <div className="info-box">
            <p className="text-sm text-blue-800">
              💡 <strong>提示：</strong>第一次游戏建议选择战士、游侠或牧师，它们比较容易上手。
            </p>
          </div>

          <div className="space-y-4">
            {CLASSES.map((classOption) => (
              <button
                key={classOption.id}
                onClick={() => handleSelectClass(classOption.name, classOption.hitDie)}
                className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                  currentCharacter.class === classOption.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {classOption.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{classOption.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">生命骰：</span>
                        <span className="font-medium ml-2">d{classOption.hitDie}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">主要属性：</span>
                        <span className="font-medium ml-2">
                          {classOption.primaryAbility.join(' / ')}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500">豁免熟练：</span>
                        <span className="font-medium ml-2">
                          {classOption.savingThrows.join('、')}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-500">技能选择：</span>
                        <span className="font-medium ml-2">
                          从 {classOption.availableSkills.length} 项技能中选择 {classOption.skillChoices} 项
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {currentCharacter.class === classOption.name && (
                    <div className="ml-4">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 熟练项详情 */}
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">护甲熟练</div>
                    <div className="text-gray-600">
                      {classOption.proficiencies.armor.length > 0
                        ? classOption.proficiencies.armor.join('、')
                        : '无'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">武器熟练</div>
                    <div className="text-gray-600">
                      {classOption.proficiencies.weapons.join('、')}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">工具熟练</div>
                    <div className="text-gray-600">
                      {classOption.proficiencies.tools.length > 0 
                        ? classOption.proficiencies.tools.join('、')
                        : '无'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="section-title">职业：{currentCharacter.class}</h2>
            <button
              onClick={() => {
                setShowSkillSelector(false);
                setShowFeatureSelector(false);
                setSkillsCompleted(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
            >
              ← 重新选择职业
            </button>
          </div>

          {!skillsCompleted ? (
            <ClassSkillSelector
              selectedClass={currentCharacter.class || ''}
              onComplete={handleSkillsComplete}
              initialSkills={(currentCharacter.skills || []).filter(skill => {
                const selectedClass = CLASSES.find(c => c.name === currentCharacter.class);
                return selectedClass?.availableSkills?.includes(skill) || false;
              })}
            />
          ) : showFeatureSelector ? (
            <>
              {(() => {
                const classData = CLASSES.find(c => c.name === currentCharacter.class);
                const featureChoices = (classData as any)?.featureChoices || [];
                
                return featureChoices.map((feature: any) => (
                  <div key={feature.id} className="mb-6">
                    <ClassFeatureSelector
                      featureName={feature.name}
                      options={feature.options}
                      onComplete={(selectedId) => handleFeatureComplete(feature.id, selectedId)}
                      initialSelection={currentCharacter.classFeatureChoices?.[feature.id]}
                    />
                  </div>
                ));
              })()}
              
              <div className="mt-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <div className="text-green-700 font-bold">✓ 职业设置完成！</div>
                <div className="text-green-600 text-sm mt-1">可以继续下一步了</div>
              </div>
            </>
          ) : (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
              <div className="text-green-700 font-bold">✓ 职业设置完成！</div>
              <div className="text-green-600 text-sm mt-1">可以继续下一步了</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

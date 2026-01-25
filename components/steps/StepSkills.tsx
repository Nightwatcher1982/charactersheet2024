'use client';

import { useEffect, useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { SKILLS, CLASSES, BACKGROUNDS, SPECIES } from '@/lib/dnd-data';
import { Check, AlertCircle, Sparkles } from 'lucide-react';
import ClassSkillSelector from '@/components/ClassSkillSelector';
import ClassFeatureSelector from '@/components/ClassFeatureSelector';

export default function StepSkills() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [skillsInitialized, setSkillsInitialized] = useState(false);

  const skills = currentCharacter?.skills || [];
  
  // 获取职业、背景和物种数据
  const classData = CLASSES.find(c => c.name === currentCharacter?.class);
  const backgroundData = BACKGROUNDS.find(b => b.name === currentCharacter?.background);
  const speciesData = SPECIES.find(s => s.name === currentCharacter?.species);

  // 自动添加背景技能（只执行一次）
  // 注意：背景技能现在在选择背景时就已经添加了（StepOriginBackground）
  // 这里只是为了兼容性检查，确保背景技能存在
  useEffect(() => {
    if (!currentCharacter) return;
    if (!skillsInitialized && backgroundData && backgroundData.skills) {
      const currentSkills = currentCharacter.skills || [];
      const backgroundSkills = backgroundData.skills;
      
      // 检查是否已经有所有背景技能
      const hasAllBackgroundSkills = backgroundSkills.every(skill => currentSkills.includes(skill));
      
      if (!hasAllBackgroundSkills) {
        // 添加缺失的背景技能
        const missingSkills = backgroundSkills.filter(skill => !currentSkills.includes(skill));
        if (missingSkills.length > 0) {
          updateCurrentCharacter({
            skills: [...currentSkills, ...missingSkills]
          });
        }
      }
      
      setSkillsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsInitialized, backgroundData]);

  // 获取物种技能
  let speciesSkills: string[] = [];
  
  // 首先尝试从speciesChoices中获取
  if (currentCharacter?.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(currentCharacter.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.skill) {
        const skillMatch = speciesChoices.skill.match(/^([^（]+)/);
        if (skillMatch) {
          const skillName = skillMatch[1].trim();
          // 检查这个技能是否在已选技能中（确保它确实被添加了）
          if (skills.includes(skillName)) {
            speciesSkills = [skillName];
          }
        }
      }
    } catch (e) {
      // 解析失败，继续下面的推断逻辑
    }
  }
  
  // 如果从speciesChoices中没有找到，尝试从已选技能中推断
  // 物种技能 = 所有技能 - 职业技能 - 背景技能
  if (speciesSkills.length === 0) {
    const allSkills = currentCharacter?.skills || [];
    const possibleSpeciesSkills = allSkills.filter(skill =>
      !classData?.availableSkills?.includes(skill) &&
      !backgroundData?.skills?.includes(skill)
    );
    if (possibleSpeciesSkills.length > 0) {
      speciesSkills = possibleSpeciesSkills;
    }
  }
  
  // 分类技能 - 按照来源显示
  // 背景技能：显示所有来自背景数据的技能（固定列表）
  const backgroundSkills = backgroundData?.skills || [];
  
  // 职业技能：优先从classFeatureChoices中获取用户选择的职业技能
  // 如果没有保存，则从skills数组中推断（兼容旧数据）
  let classSkills: string[] = [];
  if (currentCharacter?.classFeatureChoices?.classSkills) {
    try {
      classSkills = JSON.parse(currentCharacter.classFeatureChoices.classSkills as string);
    } catch (e) {
      // 解析失败，使用推断逻辑
      classSkills = skills.filter(skill => 
        classData?.availableSkills?.includes(skill)
      );
    }
  } else {
    // 没有保存的职业技能，从skills数组中推断
    classSkills = skills.filter(skill => 
      classData?.availableSkills?.includes(skill)
    );
  }
  
  // 去重：如果技能数组中有重复的技能（比如"驯兽"出现了两次），只显示一次
  const uniqueClassSkills = Array.from(new Set(classSkills));
  
  const finalClassSkills = uniqueClassSkills;

  // 早期返回检查
  if (!currentCharacter) return null;

  // 按属性分组所有技能
  const skillsByAbility = SKILLS.reduce((acc, skill) => {
    if (!acc[skill.ability]) {
      acc[skill.ability] = [];
    }
    acc[skill.ability].push(skill);
    return acc;
  }, {} as Record<string, typeof SKILLS>);

  const abilityNames: Record<string, string> = {
    strength: '力量',
    dexterity: '敏捷',
    constitution: '体质',
    intelligence: '智力',
    wisdom: '感知',
    charisma: '魅力',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">技能总览</h2>
        <p className="text-gray-600 mb-6">
          这是您角色的所有技能熟练项总结，包括从职业、背景和物种获得的技能。
          技能选择已在之前的步骤中完成。
        </p>
      </div>

      {/* 技能总结 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-bold text-lg text-blue-900 mb-3">职业技能</h3>
            {classData && (
              <>
                <div className="text-sm text-gray-700 mb-2">
                  来自：<strong>{currentCharacter.class}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {finalClassSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {finalClassSkills.length === 0 && (
                    <span className="text-gray-500 text-sm">尚未选择职业技能</span>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg text-green-900 mb-3">背景技能</h3>
            {backgroundData && (
              <>
                <div className="text-sm text-gray-700 mb-2">
                  来自：<strong>{currentCharacter.background}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {backgroundSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {backgroundSkills.length === 0 && (
                    <span className="text-gray-500 text-sm">尚未选择背景技能</span>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg text-teal-900 mb-3">物种技能</h3>
            {speciesData && (
              <>
                <div className="text-sm text-gray-700 mb-2">
                  来自：<strong>{currentCharacter.species}</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  {speciesSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-teal-500 text-white rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {speciesSkills.length === 0 && (
                    <span className="text-gray-500 text-sm">该物种无技能选择</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {new Set(skills).size}
              </div>
              <div className="text-sm text-gray-600">
                技能熟练总数
              </div>
            </div>
        </div>
      </div>

      {/* 所有技能详细列表（按属性分组） */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">完整技能列表</h3>
        <div className="space-y-4">
          {Object.entries(skillsByAbility).map(([ability, abilitySkills]) => (
            <div key={ability}>
              <h4 className="text-md font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>{abilityNames[ability]} 技能</span>
                <span className="text-xs text-gray-500">
                  ({abilitySkills.filter(s => skills.includes(s.name)).length}/{abilitySkills.length} 熟练)
                </span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {abilitySkills.map((skill) => {
                  const isProficient = skills.includes(skill.name);
                  
                  return (
                    <div
                      key={skill.id}
                      className={`p-3 rounded-lg border-2 ${
                        isProficient
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isProficient ? 'text-green-900' : 'text-gray-600'
                        }`}>
                          {skill.name}
                        </span>
                        {isProficient && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>熟练的技能在进行相关检定时可以加上熟练加值。
          职业技能在选择职业时确定，背景技能由背景自动提供。
        </p>
      </div>

      {skills.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            ⚠️ <strong>注意：</strong>您还没有获得任何技能熟练。请返回前面的步骤选择职业和背景。
          </p>
        </div>
      )}
    </div>
  );
}

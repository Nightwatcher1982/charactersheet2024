'use client';

import { useEffect, useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { SKILLS, CLASSES, BACKGROUNDS, SPECIES, getAbilityModifier, getProficiencyBonus } from '@/lib/dnd-data';
import { AlertCircle, Sparkles } from 'lucide-react';
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

  // 与角色卡一致：最终属性（含背景加值）、熟练加值，用于显示技能 + 值
  const abilities = currentCharacter.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };
  const finalAbilities = { ...abilities };
  if (currentCharacter.backgroundAbilityBonuses) {
    const abilityMap: Record<string, keyof typeof abilities> = {
      '力量': 'strength',
      '敏捷': 'dexterity',
      '体质': 'constitution',
      '智力': 'intelligence',
      '感知': 'wisdom',
      '魅力': 'charisma',
    };
    Object.entries(currentCharacter.backgroundAbilityBonuses).forEach(([abilityName, bonus]) => {
      const key = abilityMap[abilityName];
      if (key) finalAbilities[key] += bonus;
    });
  }
  const profBonus = getProficiencyBonus(currentCharacter.level || 1);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="section-title">技能总览</h2>
        <p className="text-gray-600 text-sm mb-3">
          职业、背景与物种技能总结；选择已在前面步骤完成。
        </p>
      </div>

      {/* 技能总结 - 紧凑布局 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-bold text-sm text-blue-900 mb-1">
              职业技能{classData && <span className="text-gray-600 font-normal"> · {currentCharacter.class}</span>}
            </h3>
            {classData ? (
              <div className="flex flex-wrap gap-1.5">
                {finalClassSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {finalClassSkills.length === 0 && (
                  <span className="text-gray-500 text-xs">尚未选择</span>
                )}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="font-bold text-sm text-green-900 mb-1">
              背景技能{backgroundData && <span className="text-gray-600 font-normal"> · {currentCharacter.background}</span>}
            </h3>
            {backgroundData ? (
              <div className="flex flex-wrap gap-1.5">
                {backgroundSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {backgroundSkills.length === 0 && (
                  <span className="text-gray-500 text-xs">无</span>
                )}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="font-bold text-sm text-teal-900 mb-1">
              物种技能{speciesData && <span className="text-gray-600 font-normal"> · {currentCharacter.species}</span>}
            </h3>
            {speciesData ? (
              <div className="flex flex-wrap gap-1.5">
                {speciesSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-teal-500 text-white rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {speciesSkills.length === 0 && (
                  <span className="text-gray-500 text-xs">该物种无技能</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">技能熟练总数</span>
          <span className="text-xl font-bold text-gray-900">{new Set(skills).size}</span>
        </div>
      </div>

      {/* 完整技能列表 - 与角色卡技能展示一致：紧凑网格 + 显示 + 值 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">完整技能列表</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {SKILLS.map((skill) => {
            const isProficient = skills.includes(skill.name);
            const abilityKey = skill.ability.toLowerCase() as keyof typeof finalAbilities;
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

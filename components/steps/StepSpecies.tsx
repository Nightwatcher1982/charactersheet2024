'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { SPECIES, SKILLS } from '@/lib/dnd-data';
import { Check } from 'lucide-react';
import SpeciesTraitSelector from '@/components/SpeciesTraitSelector';
import FeatSelector from '@/components/FeatSelector';
import SkillSelectorModal from '@/components/SkillSelectorModal';

export default function StepSpecies() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showTraitSelector, setShowTraitSelector] = useState(false);
  const [showFeatSelector, setShowFeatSelector] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [traitsCompleted, setTraitsCompleted] = useState(false);
  const [pendingSkillChoice, setPendingSkillChoice] = useState<{choiceId: string, options: string[]} | null>(null);

  useEffect(() => {
    if (currentCharacter?.species) {
      setShowTraitSelector(true);
      
      // 检查是否是没有选择的物种，自动完成
      const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
      if (speciesData && (!((speciesData as any).choices) || (speciesData as any).choices.length === 0)) {
        if (!traitsCompleted) {
          // 自动完成没有特性选择的物种
          const currentChoices = currentCharacter.classFeatureChoices || {};
          updateCurrentCharacter({
            classFeatureChoices: {
              ...currentChoices,
              speciesChoices: JSON.stringify({})
            }
          });
          setTraitsCompleted(true);
          
          // 如果是人类，显示专长选择
          if (currentCharacter.species === '人类') {
            setShowFeatSelector(true);
          }
        }
      }
    }
  }, [currentCharacter?.species, traitsCompleted, currentCharacter, updateCurrentCharacter]);

  if (!currentCharacter) return null;

  const handleSelectSpecies = (speciesName: string) => {
    updateCurrentCharacter({ species: speciesName });
    setShowTraitSelector(true);
    setTraitsCompleted(false);
    setShowFeatSelector(false);
  };

  const handleTraitsComplete = (selections: Record<string, string>) => {
    const currentChoices = currentCharacter.classFeatureChoices || {};
    const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
    
    // 检查是否有技能选择项需要处理
    const skillChoice = speciesData?.choices?.find(c => c.id === 'skill');
    if (skillChoice && selections.skill) {
      // 先保存其他选择（不包括技能）
      const otherSelections = { ...selections };
      delete otherSelections.skill;
      
      updateCurrentCharacter({
        classFeatureChoices: {
          ...currentChoices,
          speciesChoices: JSON.stringify(otherSelections)
        }
      });
      
      // 显示技能选择弹窗，让用户从可用技能中选择
      setPendingSkillChoice({
        choiceId: 'skill',
        options: skillChoice.options
      });
      setShowSkillModal(true);
      return; // 等待技能选择完成
    }
    
    // 没有技能选择，直接完成
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        speciesChoices: JSON.stringify(selections)
      }
    });
    setTraitsCompleted(true);
    
    // 如果是人类，显示专长选择
    if (currentCharacter.species === '人类') {
      setShowFeatSelector(true);
    }
  };
  
  const handleSpeciesSkillComplete = (skills: string[]) => {
    const currentChoices = currentCharacter.classFeatureChoices || {};
    const currentSkills = currentCharacter.skills || [];
    const selections = currentChoices.speciesChoices ? JSON.parse(currentChoices.speciesChoices as string) : {};
    
    // 移除旧的物种技能（如果有的话）
    const oldSpeciesChoices = currentChoices.speciesChoices ? JSON.parse(currentChoices.speciesChoices as string) : {};
    let skillsWithoutOldSpecies = [...currentSkills];
    if (oldSpeciesChoices.skill) {
      const oldSkillMatch = oldSpeciesChoices.skill.match(/^([^（]+)/);
      if (oldSkillMatch) {
        skillsWithoutOldSpecies = skillsWithoutOldSpecies.filter(s => s !== oldSkillMatch[1].trim());
      }
    }
    
    // 添加新选择的物种技能
    const newSkills = [...skillsWithoutOldSpecies, ...skills];
    
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        speciesChoices: JSON.stringify(selections)
      },
      skills: newSkills
    });
    setShowSkillModal(false);
    setTraitsCompleted(true);
    
    // 如果是人类，显示专长选择
    if (currentCharacter.species === '人类') {
      setShowFeatSelector(true);
    }
  };

  const handleFeatComplete = (featId: string) => {
    // 添加人类的额外专长（保留背景专长）
    const currentFeats = currentCharacter.feats || [];
    if (!currentFeats.includes(featId)) {
      updateCurrentCharacter({
        feats: [...currentFeats, featId]
      });
    }
  };

  // 获取物种技能选择选项
  const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
  const skillChoice = speciesData?.choices?.find(c => c.id === 'skill');
  const currentSpeciesChoices = currentCharacter.classFeatureChoices?.speciesChoices 
    ? JSON.parse(currentCharacter.classFeatureChoices.speciesChoices as string) 
    : {};
  
  // 获取当前物种技能（从已选技能中提取）
  const currentSkills = currentCharacter.skills || [];
  const classData = CLASSES.find(c => c.name === currentCharacter.class);
  const backgroundData = BACKGROUNDS.find(b => b.name === currentCharacter.background);
  
  // 找出物种技能（不在职业和背景技能中的）
  let currentSpeciesSkills: string[] = [];
  if (currentSpeciesChoices.skill) {
    const skillMatch = currentSpeciesChoices.skill.match(/^([^（]+)/);
    if (skillMatch) {
      const skillName = skillMatch[1].trim();
      // 检查这个技能是否在已选技能中
      if (currentSkills.includes(skillName)) {
        currentSpeciesSkills = [skillName];
      }
    }
  }
  
  // 获取所有可用技能（从SKILLS数据中）
  const allAvailableSkills = SKILLS.map(s => s.name);
  
  // 如果是精灵，需要从特定技能中选择
  let speciesSkillOptions: string[] = [];
  if (speciesData?.name === '精灵') {
    speciesSkillOptions = ['洞悉', '察觉', '求生'];
  } else if (skillChoice) {
    // 从选项文本中提取技能名称
    speciesSkillOptions = skillChoice.options.map(opt => {
      const match = opt.match(/^([^（]+)/);
      return match ? match[1].trim() : '';
    }).filter(Boolean);
  }

  return (
    <>
      {/* 物种技能选择弹窗 */}
      {showSkillModal && pendingSkillChoice && speciesData && (
        <SkillSelectorModal
          isOpen={showSkillModal}
          onClose={() => {
            setShowSkillModal(false);
            setPendingSkillChoice(null);
          }}
          title={`选择${currentCharacter.species}技能`}
          description={speciesData.name === '精灵' 
            ? "根据精灵的敏锐感官特性，从以下技能中选择一项技能熟练"
            : "根据你的物种特性，选择一项技能熟练"}
          availableSkills={speciesSkillOptions.length > 0 ? speciesSkillOptions : allAvailableSkills}
          requiredCount={1}
          onComplete={handleSpeciesSkillComplete}
          initialSkills={currentSpeciesSkills}
        />
      )}
      
      <div className="space-y-6">
      {!showTraitSelector ? (
        <>
          <div>
            <h2 className="section-title">选择物种</h2>
            <p className="text-gray-600 mb-6">
              在 D&D 2024 版规则中，&ldquo;种族&rdquo;改为&ldquo;物种&rdquo;。每个物种都有独特的特质，不再提供固定属性加值。
            </p>
          </div>

          <div className="info-box">
            <p className="text-sm text-blue-800">
              💡 <strong>2024版变化：</strong>物种不再提供属性加值！属性加值现在来自背景（+3点）。
            </p>
          </div>

          <div className="space-y-4">
            {SPECIES.map((species) => (
              <button
                key={species.id}
                onClick={() => handleSelectSpecies(species.name)}
                className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                  currentCharacter.species === species.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {species.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{species.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">体型：</span>
                        <span className="font-medium ml-1">{species.size}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">速度：</span>
                        <span className="font-medium ml-1">{species.speed}尺</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">物种特质：</div>
                      <div className="space-y-1">
                        {species.traits.map((trait: any, index: number) => (
                          <div key={index} className="text-xs text-gray-600">
                            <strong className="text-gray-800">{trait.name}:</strong> {trait.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {currentCharacter.species === species.name && (
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
            <h2 className="section-title">物种：{currentCharacter.species}</h2>
            <button
              onClick={() => {
                setShowTraitSelector(false);
                setShowFeatSelector(false);
                setTraitsCompleted(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline mb-4"
            >
              ← 重新选择物种
            </button>
          </div>

          {/* 物种特性选择 */}
          {!showFeatSelector && (() => {
            const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
            if (!speciesData) return null;
            
            const hasChoices = (speciesData as any).choices && (speciesData as any).choices.length > 0;
            
            if (hasChoices) {
              return (
                <SpeciesTraitSelector
                  speciesName={speciesData.name}
                  choices={(speciesData as any).choices}
                  onComplete={handleTraitsComplete}
                  initialSelections={
                    currentCharacter.classFeatureChoices?.speciesChoices 
                      ? JSON.parse(currentCharacter.classFeatureChoices.speciesChoices)
                      : {}
                  }
                />
              );
            } else {
              // 没有特性选择的物种 - 显示完成状态
              return (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                  <div className="text-green-700 font-bold">✓ 物种设置完成！</div>
                  <div className="text-green-600 text-sm mt-1">
                    {speciesData.name} 不需要额外选择
                  </div>
                </div>
              );
            }
          })()}

          {/* 人类额外专长选择 */}
          {showFeatSelector && currentCharacter.species === '人类' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <h3 className="font-bold text-blue-900 mb-2">人类特质：多才多艺</h3>
                <p className="text-sm text-blue-800">
                  作为人类，你获得一个额外的起源专长。这个专长代表了人类的适应性和学习能力。
                </p>
              </div>

              <FeatSelector
                character={currentCharacter}
                initialFeat={currentCharacter.feats?.[1]} // 第二个专长（第一个来自背景）
                onComplete={handleFeatComplete}
                title="选择人类专长"
                description="推荐：技能专家（Skilled）- 获得3个额外技能熟练"
              />
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
}


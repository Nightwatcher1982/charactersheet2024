'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCharacterStore } from '@/lib/character-store';
import { SPECIES, SKILLS, CLASSES, BACKGROUNDS } from '@/lib/dnd-data';
import { getAssetPath } from '@/lib/asset-path';
import { Info } from 'lucide-react';
import SpeciesTraitSelector from '@/components/SpeciesTraitSelector';
import FeatSelector from '@/components/FeatSelector';
import SkillSelectorModal from '@/components/SkillSelectorModal';
import MagicInitiateSpellModal from '@/components/MagicInitiateSpellModal';
import { isMagicInitiateFeat } from '@/lib/feats-data';
import { getMagicInitiateSpellInfo } from '@/lib/spells-data';

// 物种图标映射
const getSpeciesIconPath = (speciesName: string): string => {
  const iconMap: Record<string, string> = {
    '人类': '/pic/races/人类.jpeg',
    '精灵': '/pic/races/精灵.jpeg',
    '矮人': '/pic/races/矮人.jpeg',
    '半身人': '/pic/races/半身人.jpeg',
    '兽人': '/pic/races/兽人.jpeg',
    '龙裔': '/pic/races/龙裔.jpeg',
    '侏儒': '/pic/races/侏儒.jpeg',
    '提夫林': '/pic/races/提夫林.jpeg',
    '阿斯莫': '/pic/races/阿斯莫.jpeg',
    '歌利亚': '/pic/races/歌利亚.jpeg',
  };
  return getAssetPath(iconMap[speciesName] || '');
};

// 物种简介
const getSpeciesSummary = (speciesName: string): string => {
  const summaryMap: Record<string, string> = {
    '人类': '适应力最强的种族，多才多艺且雄心勃勃',
    '精灵': '优雅而长寿的种族，拥有敏锐的感官和对魔法的亲和力',
    '矮人': '坚韧而忠诚的工匠，擅长战斗和工艺',
    '半身人': '勇敢幸运的小个子，善于潜行和社交',
    '兽人': '力量强大的战士，拥有不屈的意志',
    '龙裔': '龙族血脉的后裔，拥有强大的吐息武器',
    '侏儒': '聪明好奇的小型种族，精通魔法或工程',
    '提夫林': '恶魔血统的后裔，拥有黑暗魔法天赋',
    '阿斯莫': '天界血脉的守护者，拥有神圣的力量',
    '歌利亚': '大地的子民，强壮而坚韧的战士',
  };
  return summaryMap[speciesName] || '一个独特的种族';
};

interface StepSpeciesProps {
  onComplete?: () => void;
}

export default function StepSpecies({ onComplete }: StepSpeciesProps = {}) {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showTraitSelector, setShowTraitSelector] = useState(false);
  const [showFeatSelector, setShowFeatSelector] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [traitsCompleted, setTraitsCompleted] = useState(false);
  const [pendingSkillChoice, setPendingSkillChoice] = useState<{choiceId: string, options: string[]} | null>(null);
  const [skillModalCalled, setSkillModalCalled] = useState(false);
  /** 人类选择魔法学徒专长后，需先完成戏法/一环法术/施法属性选择 */
  const [pendingMagicInitiateFeatId, setPendingMagicInitiateFeatId] = useState<string | null>(null);

  useEffect(() => {
    // 移除自动跳转逻辑,仅当已经进入详情页时才处理物种特性
    if (currentCharacter?.species && showTraitSelector) {
      
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
      } else if (speciesData && (speciesData as any).choices) {
        // 人类、精灵：血统/体型+技能已在同一弹窗（SpeciesTraitSelector），不再单独弹技能窗
        const oneWindowSpecies = ['人类', '精灵'];
        if (oneWindowSpecies.includes(currentCharacter.species)) {
          return;
        }
        // 其他物种：有技能选择时，在特性选择完成后单独弹技能窗
        const skillChoice = (speciesData as any).choices.find((c: any) => c.id === 'skill');
        if (skillChoice && !skillModalCalled && !traitsCompleted) {
          const currentChoices = currentCharacter.classFeatureChoices?.speciesChoices;
          if (currentChoices) {
            try {
              const parsed = JSON.parse(currentChoices);
              if (parsed.skill) return;
            } catch (e) {
              // 解析失败，继续
            }
          }
          setTimeout(() => {
            if (!skillModalCalled) {
              setSkillModalCalled(true);
              setPendingSkillChoice({
                choiceId: 'skill',
                options: skillChoice.options
              });
              setShowSkillModal(true);
            }
          }, 100);
        }
      }
    }
  }, [currentCharacter?.species, showTraitSelector, traitsCompleted, currentCharacter, updateCurrentCharacter, skillModalCalled]);

  // 控制弹窗时的body滚动
  useEffect(() => {
    if (showTraitSelector || showFeatSelector || showSkillModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showTraitSelector, showFeatSelector, showSkillModal]);

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 监听「下一步」触发的物种配置
  useEffect(() => {
    const handleTrigger = () => {
      startSpeciesConfiguration();
    };
    window.addEventListener('triggerSpeciesConfiguration', handleTrigger);
    return () => window.removeEventListener('triggerSpeciesConfiguration', handleTrigger);
  }, [currentCharacter?.species]);

  if (!currentCharacter) return null;

  const handleSelectSpecies = (speciesName: string) => {
    // 只高亮选中，不弹窗；点「下一步」时再进入配置
    updateCurrentCharacter({ species: speciesName });
    setTraitsCompleted(false);
    setShowFeatSelector(false);
    setSkillModalCalled(false);
  };

  // 由「下一步」触发：打开物种配置弹窗或完成无选项物种
  const startSpeciesConfiguration = () => {
    if (!currentCharacter?.species) return;
    const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
    if (!speciesData) return;

    const hasChoices = (speciesData as any).choices && (speciesData as any).choices.length > 0;
    if (hasChoices) {
      const nonSkillChoices = (speciesData as any).choices?.filter((c: any) => c.id !== 'skill') || [];
      if (nonSkillChoices.length > 0) {
        setShowTraitSelector(true);
        return;
      }
      const skillChoice = (speciesData as any).choices?.find((c: any) => c.id === 'skill');
      if (skillChoice) {
        setPendingSkillChoice({ choiceId: 'skill', options: skillChoice.options });
        setShowSkillModal(true);
        setSkillModalCalled(true);
        return;
      }
    }

    // 无特性选择的物种：直接标记完成并进入下一步
    const currentChoices = currentCharacter.classFeatureChoices || {};
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        speciesChoices: JSON.stringify({})
      }
    });
    setTraitsCompleted(true);
    if (onComplete) onComplete();
  };

  const handleTraitsComplete = (selections: Record<string, string>) => {
    const currentChoices = currentCharacter.classFeatureChoices || {};
    const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
    const existingSelections = (() => {
      const raw = currentCharacter.classFeatureChoices?.speciesChoices;
      if (!raw) return {};
      try {
        return JSON.parse(raw as string) as Record<string, string>;
      } catch {
        return {};
      }
    })();
    const mergedSelections: Record<string, string> = { ...existingSelections, ...selections };

    // 技能已在同一窗口内选择（如人类：体型+技能合并）→ 直接更新技能并完成
    if (mergedSelections.skill) {
      const skillMatch = mergedSelections.skill.match(/^([^（]+)/);
      const skillName = skillMatch ? skillMatch[1].trim() : mergedSelections.skill;
      const currentSkills = currentCharacter.skills || [];
      const oldSpeciesChoices = currentChoices.speciesChoices ? JSON.parse(currentChoices.speciesChoices as string) : {};
      let skillsWithoutOldSpecies = [...currentSkills];
      if (oldSpeciesChoices.skill) {
        const oldMatch = oldSpeciesChoices.skill.match(/^([^（]+)/);
        if (oldMatch) {
          skillsWithoutOldSpecies = skillsWithoutOldSpecies.filter(s => s !== oldMatch[1].trim());
        }
      }
      const newSkills = [...skillsWithoutOldSpecies, skillName];
      updateCurrentCharacter({
        classFeatureChoices: {
          ...currentChoices,
          speciesChoices: JSON.stringify(mergedSelections)
        },
        skills: newSkills
      });
      setTraitsCompleted(true);
      setShowTraitSelector(false);
      if (currentCharacter.species === '人类') {
        setShowFeatSelector(true);
      } else {
        if (onComplete) onComplete();
      }
      return;
    }

    // 有技能选择但未在本窗口选（如精灵：先血统再另弹技能窗）
    const skillChoice = speciesData?.choices?.find(c => c.id === 'skill');
    if (skillChoice) {
      updateCurrentCharacter({
        classFeatureChoices: {
          ...currentChoices,
          speciesChoices: JSON.stringify(mergedSelections)
        }
      });
      if (!skillModalCalled) {
        setSkillModalCalled(true);
        setPendingSkillChoice({ choiceId: 'skill', options: skillChoice.options });
        setShowSkillModal(true);
        setShowTraitSelector(false);
      }
      return;
    }

    // 无技能选择，直接完成
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        speciesChoices: JSON.stringify(mergedSelections)
      }
    });
    setTraitsCompleted(true);
    setShowTraitSelector(false);
    if (currentCharacter.species === '人类') {
      setShowFeatSelector(true);
    } else {
      if (onComplete) onComplete();
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
        const oldSkillName = oldSkillMatch[1].trim();
        skillsWithoutOldSpecies = skillsWithoutOldSpecies.filter(s => s !== oldSkillName);
      }
    }
    
    // 添加新选择的物种技能
    const newSkills = [...skillsWithoutOldSpecies, ...skills];
    
    // 更新选择，添加技能选择（使用原始格式）
    const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
    const skillChoice = speciesData?.choices?.find(c => c.id === 'skill');
    let skillSelectionText = '';
    if (skillChoice && skills.length > 0) {
      // 找到匹配的选项文本
      const selectedSkill = skills[0];
      const matchingOption = skillChoice.options.find(opt => {
        const match = opt.match(/^([^（]+)/);
        return match && match[1].trim() === selectedSkill;
      });
      skillSelectionText = matchingOption || `${selectedSkill}（已选择）`;
    }
    
    // 确保保存完整的物种选择，包括技能
    const updatedSelections = {
      ...selections,
      skill: skillSelectionText
    };
    
    updateCurrentCharacter({
      classFeatureChoices: {
        ...currentChoices,
        speciesChoices: JSON.stringify(updatedSelections)
      },
      skills: newSkills
    });
    setShowSkillModal(false);
    setPendingSkillChoice(null);
    setSkillModalCalled(false);
    setTraitsCompleted(true);
    
    // 如果是人类，显示专长选择
    if (currentCharacter.species === '人类') {
      setShowFeatSelector(true);
    } else {
      // 技能选择完成，调用父组件回调进入语言选择
      if (onComplete) {
        onComplete();
      }
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
    if (isMagicInitiateFeat(featId)) {
      // 魔法学徒专长：先完成戏法/一环法术/施法属性选择，再关闭
      setPendingMagicInitiateFeatId(featId);
      return;
    }
    setShowFeatSelector(false);
    if (onComplete) onComplete();
  };

  const handleMagicInitiateComplete = (featId: string, choice: { cantrips: string[]; spell: string; ability: string }) => {
    const raw = currentCharacter.classFeatureChoices?.magicInitiateChoices;
    let choices: Record<string, { cantrips: string[]; spell: string; ability: string }> = {};
    if (raw) {
      try {
        choices = JSON.parse(raw) as Record<string, { cantrips: string[]; spell: string; ability: string }>;
      } catch {
        // ignore
      }
    }
    choices[featId] = choice;
    updateCurrentCharacter({
      classFeatureChoices: {
        ...(currentCharacter.classFeatureChoices || {}),
        magicInitiateChoices: JSON.stringify(choices)
      }
    });
    setPendingMagicInitiateFeatId(null);
    setShowFeatSelector(false);
    if (onComplete) onComplete();
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
            setSkillModalCalled(true);
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

      {/* 人类专长选择弹窗 - Portal 挂载到 body，确保在视口内且可滚动 */}
      {showFeatSelector && currentCharacter.species === '人类' && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* 标题栏 */}
            <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h3 className="font-bold text-xl font-cinzel">
                  人类 - 选择起源专长
                </h3>
              </div>
              <button
                onClick={() => setShowFeatSelector(false)}
                className="hover:bg-leather-base rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 说明信息 */}
            <div className="px-6 py-3 bg-purple-50 border-b-2 border-purple-100 flex-shrink-0">
              <p className="text-sm text-purple-800">
                根据人类的<strong>多才多艺</strong>特性，你可以选择一个起源专长。这将为你的角色提供额外的能力和优势。
              </p>
            </div>

            {/* 内容区 - 可滚动 */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <FeatSelector
                character={currentCharacter}
                onComplete={handleFeatComplete}
                onCancel={() => setShowFeatSelector(false)}
                title=""
                description=""
                originOnlyVersatile={true}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 人类选择魔法学徒专长后：戏法/一环法术/施法属性选择 */}
      {pendingMagicInitiateFeatId && typeof document !== 'undefined' && createPortal(
        (() => {
          const miInfo = getMagicInitiateSpellInfo(currentCharacter);
          const entry = miInfo.entries.find((e) => e.featId === pendingMagicInitiateFeatId);
          return (
            <MagicInitiateSpellModal
              isOpen={true}
              onClose={() => {
                setPendingMagicInitiateFeatId(null);
                setShowFeatSelector(false);
                if (onComplete) onComplete();
              }}
              featId={pendingMagicInitiateFeatId}
              onComplete={(choice) => handleMagicInitiateComplete(pendingMagicInitiateFeatId, choice)}
              initialCantrips={entry?.cantrips ?? []}
              initialSpell={entry?.level1Spell ?? ''}
              initialAbility={entry?.ability ?? ''}
            />
          );
        })(),
        document.body
      )}

      {/* 物种特性选择弹窗（人类：体型+技能同一窗口；精灵：血统+技能同一窗口；其他物种：仅非技能选项，技能另弹窗） */}
      {showTraitSelector && currentCharacter.species && (() => {
        const speciesData = SPECIES.find(s => s.name === currentCharacter.species);
        if (!speciesData) return null;
        const allChoices = (speciesData as any).choices || [];
        const nonSkillChoices = allChoices.filter((c: any) => c.id !== 'skill');
        const oneWindowSpecies = ['人类', '精灵'];
        const choicesToShow = oneWindowSpecies.includes(currentCharacter.species) ? allChoices : nonSkillChoices;
        if (choicesToShow.length === 0) return null;
        const initialParsed = currentCharacter.classFeatureChoices?.speciesChoices
          ? (() => {
              try {
                return JSON.parse(currentCharacter.classFeatureChoices.speciesChoices as string) as Record<string, string>;
              } catch {
                return {};
              }
            })()
          : {};
        return (
          <SpeciesTraitSelector
            isOpen={showTraitSelector}
            onClose={() => setShowTraitSelector(false)}
            speciesName={speciesData.name}
            choices={choicesToShow}
            onComplete={handleTraitsComplete}
            initialSelections={initialParsed}
          />
        );
      })()}
      
      {/* 物种选择网格 */}
      <div className="space-y-6">
        {/* 标题说明 */}
        <div>
          <h3 className="text-xl font-bold text-leather-dark font-cinzel">选择物种</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {SPECIES.map((species) => {
              const isSelected = currentCharacter.species === species.name;
              const iconPath = getSpeciesIconPath(species.name);

              return (
                <button
                  key={species.id}
                  onClick={() => handleSelectSpecies(species.name)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-leather-light bg-white hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {/* 物种图标 - 竖长方形全身展示 */}
                  <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 relative">
                    {iconPath ? (
                      <>
                        <img
                          src={iconPath}
                          alt={species.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            // 图片加载失败时显示备用内容
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-full h-full items-center justify-center"
                          style={{ display: 'none' }}
                        >
                          <span className="text-4xl font-bold text-leather-dark font-cinzel">
                            {species.name.charAt(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-leather-dark font-cinzel">
                          {species.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* 物种名称 */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-leather-dark font-cinzel">
                      {species.name}
                    </h3>
                  </div>

                </button>
              );
            })}
          </div>

          {/* 底部提示 - 显示物种介绍 */}
          {currentCharacter.species && (
            <div className="bg-parchment-base border-2 border-gold-light rounded-lg p-4 shadow-dnd mt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
                <div className="text-sm text-leather-dark">
                  <strong className="block mb-1">已选择：{currentCharacter.species}</strong>
                  <p className="text-leather-base">
                    {getSpeciesSummary(currentCharacter.species)}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  );
}
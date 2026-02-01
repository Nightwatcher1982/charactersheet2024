'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { CLASSES } from '@/lib/dnd-data';
import { getAssetPath } from '@/lib/asset-path';
import { Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ClassFeatureSelector from '@/components/ClassFeatureSelector';
import { getClassStartingEquipment } from '@/lib/class-starting-equipment-data';
import SkillSelectorModal from '@/components/SkillSelectorModal';
import WeaponSelectorModal from '@/components/WeaponSelectorModal';
import SpellSelectorModal from '@/components/SpellSelectorModal';
import ClassEquipmentSelectorModal from '@/components/ClassEquipmentSelectorModal';
import ClassFeatureSelectorModal from '@/components/ClassFeatureSelectorModal';
import { WEAPONS, getWeaponById, ARMORS, getArmorByName } from '@/lib/weapons-data';
import { hasSpellcasting } from '@/lib/spells-data';

// 职业图标映射
const getClassIconPath = (classNameEn: string): string => {
  const iconMap: Record<string, string> = {
    'Barbarian': '/pic/barbarian.jpeg',
    'Bard': '/pic/bard.jpeg',
    'Cleric': '/pic/cleric.jpeg',
    'Druid': '/pic/druid.jpeg',
    'Fighter': '/pic/fighter.jpeg',
    'Monk': '/pic/monk.jpeg',
    'Paladin': '/pic/paladin.jpeg',
    'Ranger': '/pic/ranger.jpeg',
    'Rogue': '/pic/rogue.jpeg',
    'Sorcerer': '/pic/sorcerer.jpeg',
    'Warlock': '/pic/walock.jpeg', // 注意文件名是 walock
    'Wizard': '/pic/wizard.jpeg',
  };
  return getAssetPath(iconMap[classNameEn] || '/pic/barbarian.jpeg');
};

// 职业简介
const getClassDescription = (classNameEn: string): string => {
  const descriptionMap: Record<string, string> = {
    'Barbarian': '凶猛的战士，在战斗中释放原始的狂怒力量',
    'Bard': '多才多艺的艺术家，用魔法和音乐激励盟友',
    'Cleric': '神圣的祭司，借助信仰之力治疗和保护',
    'Druid': '自然的守护者，可以变化形态并操控元素',
    'Fighter': '精通武器的战士，战场上的多面手',
    'Monk': '修炼气功的武者，以徒手战斗和超凡速度为特长',
    'Paladin': '神圣的骑士，用誓言和信仰对抗邪恶',
    'Ranger': '荒野的猎手，精通追踪和远程攻击',
    'Rogue': '灵巧的盗贼，擅长潜行和致命的偷袭',
    'Sorcerer': '天生的施法者，体内流淌着魔法血脉',
    'Warlock': '与至高存在缔结契约，通过秘传学识施展法术的魔契师',
    'Wizard': '博学的法师，通过研究掌握奥术魔法',
  };
  return descriptionMap[classNameEn] || '';
};

export default function StepClassSimple() {
  const { currentCharacter, updateCurrentCharacter, nextStep } = useCharacterStore();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [needsConfiguration, setNeedsConfiguration] = useState(false);
  const [pendingWeaponSelection, setPendingWeaponSelection] = useState<{
    weaponType: '简易武器' | '军用武器';
    requiredCount: number;
    selectedOption: any;
    equipmentOptionId: string;
  } | null>(null);

  const classData = currentCharacter?.class 
    ? CLASSES.find(c => c.name === currentCharacter.class)
    : undefined;
  const classFeatureChoices = (classData as any)?.featureChoices || [];
  const currentChoices = currentCharacter?.classFeatureChoices || {};

  // 处理没有装备选择的职业
  useEffect(() => {
    if (showEquipmentSelector && currentCharacter?.class && classData) {
      const startingEquipment = getClassStartingEquipment(classData.id || '');
      if (!startingEquipment || startingEquipment.options.length === 0) {
        // 没有装备选择，关闭装备选择器并检查法术
        setShowEquipmentSelector(false);
        checkAndShowSpellSelector();
      }
    }
  }, [showEquipmentSelector, currentCharacter?.class, classData]);

  if (!currentCharacter) return null;

  // 检查是否需要选择职业特性
  const needsClassFeatures = currentCharacter.class && 
    classFeatureChoices.length > 0 && 
    classFeatureChoices.some((feature: any) => !currentChoices[feature.id]);

  // 获取第一个未选择的职业特性
  const nextFeatureToChoose = classFeatureChoices.find((feature: any) => !currentChoices[feature.id]);

  const handleSelectClass = (className: string) => {
    // 只选择职业，不立即弹窗
    updateCurrentCharacter({ class: className });
    setNeedsConfiguration(true);
  };
  
  // 用于外部触发配置流程（从"下一步"按钮调用）
  const startClassConfiguration = () => {
    if (!currentCharacter?.class) return;
    if (needsConfiguration) {
      const classData = CLASSES.find(c => c.name === currentCharacter.class);
      if (classData) {
        setShowSkillModal(true);
        setNeedsConfiguration(false);
      }
      return;
    }
    // 配置已完成（例如从物种页返回但没换职业），直接进入下一步
    nextStep();
    window.scrollTo(0, 0);
  };
  
  // 监听外部触发事件
  useEffect(() => {
    const handleTrigger = () => {
      startClassConfiguration();
    };
    
    window.addEventListener('triggerClassConfiguration', handleTrigger);
    
    return () => {
      window.removeEventListener('triggerClassConfiguration', handleTrigger);
    };
  }, [currentCharacter.class, needsConfiguration]);
  
  // 当职业配置完成时，重置needsConfiguration标志
  useEffect(() => {
    if (currentCharacter?.class &&
        currentCharacter?.skills &&
        currentCharacter.skills.length > 0 &&
        currentCharacter?.classStartingEquipment) {
      setNeedsConfiguration(false);
    }
  }, [currentCharacter?.skills, currentCharacter?.classStartingEquipment]);
  
  const handleClassSkillsComplete = (skills: string[]) => {
    const currentSkills = currentCharacter.skills || [];
    // 移除旧的职业技能
    const classData = CLASSES.find(c => c.name === currentCharacter.class);
    const nonClassSkills = currentSkills.filter(skill => 
      !classData?.availableSkills?.includes(skill)
    );
    
    // 添加新选择的职业技能
    const finalSkills = [...nonClassSkills, ...skills];
    
    // 保存用户选择的职业技能到classFeatureChoices中
    const currentChoices = currentCharacter.classFeatureChoices || {};
    updateCurrentCharacter({
      skills: finalSkills,
      classFeatureChoices: {
        ...currentChoices,
        classSkills: JSON.stringify(skills)
      }
    });
    setShowSkillModal(false);
    
    // 检查是否有特性需要选择
    const featureChoices = (classData as any)?.featureChoices || [];
    
    if (featureChoices.length > 0) {
      setShowFeatureSelector(true);
    } else {
      // 没有特性选择，检查是否需要选择起始装备
      const startingEquipment = getClassStartingEquipment(classData?.id || '');
      
      if (startingEquipment && startingEquipment.options.length > 0) {
        setShowEquipmentSelector(true);
      } else {
        // 没有装备选择，检查是否需要选择法术
        checkAndShowSpellSelector();
      }
    }
  };

  const handleFeatureComplete = (featureId: string, selectedOptionId: string) => {
    const updatedChoices = {
      ...currentChoices,
      [featureId]: selectedOptionId
    };
    updateCurrentCharacter({
      classFeatureChoices: updatedChoices
    });
    // 检查是否还有其他特性需要选择
    const remainingFeatures = classFeatureChoices.filter((f: any) => 
      f.id !== featureId && !updatedChoices[f.id]
    );
    if (remainingFeatures.length === 0) {
      setShowFeatureSelector(false);
      // 所有特性选择完成，检查是否需要选择起始装备
      const startingEquipment = getClassStartingEquipment(classData?.id || '');
      if (startingEquipment && startingEquipment.options.length > 0) {
        // 显示装备选择页面
        setShowEquipmentSelector(true);
      } else {
        // 没有装备选择，检查是否需要选择法术
        checkAndShowSpellSelector();
      }
    }
  };
  
  const checkAndShowSpellSelector = () => {
    // 确保装备选择器已关闭
    setShowEquipmentSelector(false);
    
    if (currentCharacter.class && hasSpellcasting(currentCharacter.class)) {
      // 检查是否已经选择过法术（通过classFeatureChoices检查，更可靠）
      const hasSelectedCantrips = currentCharacter.classFeatureChoices?.selectedCantrips;
      const hasSelectedFirstLevelSpells = currentCharacter.classFeatureChoices?.selectedFirstLevelSpells;
      const hasSelectedSpells = hasSelectedCantrips || hasSelectedFirstLevelSpells;
      
      if (!hasSelectedSpells) {
        // 使用 setTimeout 确保状态更新后组件重新渲染
        setTimeout(() => {
          setShowSpellModal(true);
        }, 100);
      } else {
        // 已经选择过法术，直接进入下一步
        setTimeout(() => {
          nextStep();
        }, 500);
      }
    } else {
      // 不是施法职业，直接进入下一步
      setTimeout(() => {
        nextStep();
      }, 500);
    }
  };
  
  const handleSpellSelectionComplete = (cantrips: string[], firstLevelSpells: string[], preparedSpells?: string[]) => {
    // 保存选择的法术
    const allSpells = [...cantrips, ...(preparedSpells || firstLevelSpells)];
    const updatedChoices: Record<string, string> = {
      ...currentChoices,
      selectedCantrips: JSON.stringify(cantrips),
      selectedFirstLevelSpells: JSON.stringify(firstLevelSpells)
    };
    
    // 如果是法师，保存准备的法术
    if (preparedSpells && currentCharacter.class === '法师') {
      updatedChoices.selectedPreparedSpells = JSON.stringify(preparedSpells);
    }
    
    updateCurrentCharacter({
      spells: allSpells,
      classFeatureChoices: updatedChoices
    });
    setShowSpellModal(false);
    // 法术选择完成，进入下一步
    setTimeout(() => {
      nextStep();
    }, 500);
  };
  
  const handleEquipmentConfirm = (equipmentOptionId: string) => {
    // 确认装备选择后才进入下一步
    if (!equipmentOptionId) return;

    // 先保存选择
    updateCurrentCharacter({
      classStartingEquipment: equipmentOptionId
    });

    const classData = CLASSES.find(c => c.name === currentCharacter.class);
    const startingEquipment = getClassStartingEquipment(classData?.id || '');
    const selectedOption = startingEquipment?.options.find(opt => opt.id === equipmentOptionId);
    
    if (!selectedOption) {
      setShowEquipmentSelector(false);
      checkAndShowSpellSelector();
      return;
    }

    // 检查是否有"简易武器（任意）"或"军用武器（任意）"
    const hasSimpleWeaponAny = selectedOption.items?.some((item: string) => 
      item.includes('简易武器（任意）') || item.includes('简易武器(任意)')
    );
    const hasMartialWeaponAny = selectedOption.items?.some((item: string) => 
      item.includes('军用武器（任意）') || item.includes('军用武器(任意)')
    );

    // 检查是否有"军用武器（任二）"
    const hasMartialWeaponTwo = selectedOption.items?.some((item: string) => 
      item.includes('军用武器（任二）') || item.includes('军用武器(任二)')
    );

    if (hasSimpleWeaponAny || hasMartialWeaponAny || hasMartialWeaponTwo) {
      // 需要选择武器，显示武器选择器
      const weaponType = hasSimpleWeaponAny ? '简易武器' : '军用武器';
      const requiredCount = hasMartialWeaponTwo ? 2 : 1;
      
      setPendingWeaponSelection({
        weaponType,
        requiredCount,
        selectedOption,
        equipmentOptionId
      });
      setShowEquipmentSelector(false);
      setShowWeaponModal(true);
    } else {
      // 没有"任意"武器选项，直接处理装备
      processEquipmentSelection(selectedOption, equipmentOptionId, []);
    }
  };

  const processEquipmentSelection = (
    selectedOption: any,
    equipmentOptionId: string,
    additionalWeapons: string[] = []
  ) => {
    const currentEquipment = currentCharacter.equipment || [];
    const currentWeapons = currentCharacter.equippedWeapons || [];
    
    // 添加装备物品
    const newEquipment: string[] = [];
    
    // 添加所有物品
    // 但排除"任意"武器选项，因为已经用具体武器替换了
    selectedOption.items?.forEach((item: string) => {
      if (
        !item.includes('简易武器（任意）') &&
        !item.includes('简易武器(任意)') &&
        !item.includes('军用武器（任意）') &&
        !item.includes('军用武器(任意)') &&
        !item.includes('军用武器（任二）') &&
        !item.includes('军用武器(任二)') &&
        !currentEquipment.includes(item)
      ) {
        newEquipment.push(item);
      }
    });

    // 单独添加护甲/盾牌到物品栏（用于AC/盾牌检测）
    selectedOption.armor?.forEach((armorName: string) => {
      if (armorName && !currentEquipment.includes(armorName) && !newEquipment.includes(armorName)) {
        newEquipment.push(armorName);
      }
    });
    
    // 添加武器到equippedWeapons
    const newWeapons: string[] = [];
    
    // 添加预设的武器
    selectedOption.weapons?.forEach((weaponId: string) => {
      const weapon = getWeaponById(weaponId);
      if (weapon && !currentWeapons.includes(weaponId)) {
        newWeapons.push(weaponId);
      }
    });
    
    // 添加用户选择的"任意"武器
    additionalWeapons.forEach((weaponId: string) => {
      if (!currentWeapons.includes(weaponId)) {
        newWeapons.push(weaponId);
      }
    });
    
    // 更新角色数据，同时保存装备选择和装备的物品
    updateCurrentCharacter({
      classStartingEquipment: equipmentOptionId,
      equipment: [...currentEquipment, ...newEquipment],
      equippedWeapons: [...currentWeapons, ...newWeapons],
    });
    
    setShowEquipmentSelector(false);
    // 装备选择完成，检查是否需要选择法术
    checkAndShowSpellSelector();
  };

  const handleWeaponSelectionComplete = (weaponIds: string[]) => {
    if (pendingWeaponSelection) {
      processEquipmentSelection(
        pendingWeaponSelection.selectedOption,
        pendingWeaponSelection.equipmentOptionId,
        weaponIds
      );
      setPendingWeaponSelection(null);
      setShowWeaponModal(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case '低': return 'green';
      case '中等': return 'yellow';
      case '高': return 'red';
      default: return 'gray';
    }
  };

  const getComplexityText = (nameEn: string) => {
    // 根据官方表格
    const lowComplexity = ['Fighter', 'Rogue'];
    const highComplexity = ['Bard', 'Druid', 'Monk', 'Sorcerer', 'Warlock'];
    
    if (lowComplexity.includes(nameEn)) return '低';
    if (highComplexity.includes(nameEn)) return '高';
    return '中等';
  };

  // 职业技能选择弹窗
  const classDataForSkills = CLASSES.find(c => c.name === currentCharacter.class);
  const needsClassSkills = classDataForSkills && 
    classDataForSkills.skillChoices && 
    classDataForSkills.skillChoices > 0;
  
  const currentClassSkills = (currentCharacter.skills || []).filter(skill => 
    classDataForSkills?.availableSkills?.includes(skill)
  );

  if (showSkillModal && classDataForSkills && needsClassSkills) {
    return (
      <>
        <SkillSelectorModal
          isOpen={showSkillModal}
          onClose={() => setShowSkillModal(false)}
          title={`选择${classDataForSkills.name}职业技能`}
          description={`从以下技能中选择 ${classDataForSkills.skillChoices} 项技能熟练`}
          availableSkills={classDataForSkills.availableSkills}
          requiredCount={classDataForSkills.skillChoices}
          onComplete={handleClassSkillsComplete}
          initialSkills={currentClassSkills}
        />
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 武器选择模态框（必须在装备选择器之前检查，否则会被提前返回阻止）
  if (showWeaponModal && pendingWeaponSelection && currentCharacter.class) {
    return (
      <>
        <WeaponSelectorModal
          isOpen={showWeaponModal}
          onClose={() => {
            setShowWeaponModal(false);
            setPendingWeaponSelection(null);
          }}
          weaponType={pendingWeaponSelection.weaponType}
          requiredCount={pendingWeaponSelection.requiredCount}
          onComplete={handleWeaponSelectionComplete}
          selectedClass={currentCharacter.class}
        />
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 法术选择弹窗（必须在其他弹窗之前检查，确保显示在最上层）
  if (showSpellModal && currentCharacter.class) {
    const currentCantrips = currentCharacter.classFeatureChoices?.selectedCantrips 
      ? JSON.parse(currentCharacter.classFeatureChoices.selectedCantrips as string)
      : [];
    const currentFirstLevelSpells = currentCharacter.classFeatureChoices?.selectedFirstLevelSpells
      ? JSON.parse(currentCharacter.classFeatureChoices.selectedFirstLevelSpells as string)
      : [];
    
    return (
      <>
        <SpellSelectorModal
          isOpen={showSpellModal}
          onClose={() => setShowSpellModal(false)}
          selectedClass={currentCharacter.class}
          onComplete={handleSpellSelectionComplete}
          initialCantrips={currentCantrips}
          initialFirstLevelSpells={currentFirstLevelSpells}
        />
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 如果需要选择起始装备，显示装备选择器模态框
  if (showEquipmentSelector && currentCharacter.class && classData) {
    const startingEquipment = getClassStartingEquipment(classData.id || '');
    
    if (!startingEquipment || startingEquipment.options.length === 0) {
      // 没有装备选择，直接返回null并在useEffect中处理
      return null;
    }
    
    return (
      <>
        <ClassEquipmentSelectorModal
          isOpen={showEquipmentSelector}
          onClose={() => setShowEquipmentSelector(false)}
          className={currentCharacter.class}
          options={startingEquipment.options}
          onComplete={handleEquipmentConfirm}
          initialChoice={currentCharacter.classStartingEquipment}
        />
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 如果需要选择职业特性，显示特性选择器模态框
  if (needsClassFeatures && showFeatureSelector && nextFeatureToChoose) {
    return (
      <>
        <ClassFeatureSelectorModal
          isOpen={showFeatureSelector}
          onClose={() => setShowFeatureSelector(false)}
          className={currentCharacter.class || ''}
          feature={nextFeatureToChoose}
          onComplete={handleFeatureComplete}
          initialSelection={currentChoices[nextFeatureToChoose.id]}
        />
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-leather-dark font-cinzel">选择职业</h3>
      {/* 职业网格 - 3列布局，简洁版 */}
      <div className="grid grid-cols-3 gap-4">
        {CLASSES.map((classOption) => {
          const isSelected = currentCharacter.class === classOption.name;
          const classIconPath = getClassIconPath(classOption.nameEn);

          return (
            <button
              key={classOption.id}
              onClick={() => handleSelectClass(classOption.name)}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-leather-light bg-white hover:border-blue-400 hover:shadow-md'
              }`}
            >
              {/* 职业图标 */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={classIconPath} 
                  alt={classOption.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 图片加载失败时显示职业首字
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* 职业名称 - 只显示中文 */}
              <div className="text-center">
                <h3 className="font-bold text-leather-dark font-cinzel">
                  {classOption.name}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* 底部提示 - 显示职业介绍 */}
      {currentCharacter.class && (
        <div className="bg-parchment-base border-2 border-gold-light rounded-lg p-4 shadow-dnd mt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
            <div className="text-sm text-leather-dark">
              <strong className="block mb-1">已选择：{currentCharacter.class}</strong>
              <p className="text-leather-base">
                {getClassDescription(CLASSES.find(c => c.name === currentCharacter.class)?.nameEn || '')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

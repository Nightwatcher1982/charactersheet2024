'use client';

import { useState, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { CLASSES } from '@/lib/dnd-data';
import { Check, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ClassFeatureSelector from '@/components/ClassFeatureSelector';
import { getClassStartingEquipment } from '@/lib/class-starting-equipment-data';
import SkillSelectorModal from '@/components/SkillSelectorModal';
import WeaponSelectorModal from '@/components/WeaponSelectorModal';
import SpellSelectorModal from '@/components/SpellSelectorModal';
import { WEAPONS, getWeaponById, ARMORS, getArmorByName } from '@/lib/weapons-data';
import { hasSpellcasting } from '@/lib/spells-data';

export default function StepClassSimple() {
  const { currentCharacter, updateCurrentCharacter, nextStep } = useCharacterStore();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [showFeatureSelector, setShowFeatureSelector] = useState(false);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showSpellModal, setShowSpellModal] = useState(false);
  const [pendingWeaponSelection, setPendingWeaponSelection] = useState<{
    weaponType: '简易武器' | '军用武器';
    requiredCount: number;
    selectedOption: any;
    equipmentOptionId: string;
  } | null>(null);

  if (!currentCharacter) return null;

  const classData = CLASSES.find(c => c.name === currentCharacter.class);
  const classFeatureChoices = (classData as any)?.featureChoices || [];
  const currentChoices = currentCharacter.classFeatureChoices || {};

  // 检查是否需要选择职业特性
  const needsClassFeatures = currentCharacter.class && 
    classFeatureChoices.length > 0 && 
    classFeatureChoices.some((feature: any) => !currentChoices[feature.id]);

  // 获取第一个未选择的职业特性
  const nextFeatureToChoose = classFeatureChoices.find((feature: any) => !currentChoices[feature.id]);

  const handleSelectClass = (className: string) => {
    updateCurrentCharacter({ class: className });
    // 检查新选择的职业是否有特性需要选择
    const newClassData = CLASSES.find(c => c.name === className);
    const newFeatureChoices = (newClassData as any)?.featureChoices || [];
    
    // 检查是否需要选择职业技能
    if (newClassData && newClassData.skillChoices && newClassData.skillChoices > 0) {
      setShowSkillModal(true);
    } else {
      setShowFeatureSelector(newFeatureChoices.length > 0);
    }
  };
  
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
  
  const handleEquipmentComplete = (equipmentOptionId: string) => {
    // 获取选中的装备选项
    const classData = CLASSES.find(c => c.name === currentCharacter.class);
    const startingEquipment = getClassStartingEquipment(classData?.id || '');
    const selectedOption = startingEquipment?.options.find(opt => opt.id === equipmentOptionId);
    
    if (!selectedOption) {
      // 如果没有找到选项，只保存选择ID
      updateCurrentCharacter({
        classStartingEquipment: equipmentOptionId
      });
      setShowEquipmentSelector(false);
      // 检查是否需要选择法术
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
      // 隐藏装备选择器，让武器选择模态框显示
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
        {/* 显示背景内容，但被弹窗覆盖 */}
        <div className="opacity-0 pointer-events-none">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">步骤 1：选择职业</h2>
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
        {/* 显示背景内容，但被弹窗覆盖 */}
        <div className="opacity-0 pointer-events-none">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">步骤 1：选择职业</h2>
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
        {/* 显示背景内容，但被弹窗覆盖 */}
        <div className="opacity-0 pointer-events-none">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">步骤 1：选择职业</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 如果需要选择起始装备，显示装备选择器
  if (showEquipmentSelector && currentCharacter.class) {
    const startingEquipment = getClassStartingEquipment(classData?.id || '');
    
    if (!startingEquipment || startingEquipment.options.length === 0) {
      // 没有装备选择，直接进入下一步
      setShowEquipmentSelector(false);
      setTimeout(() => {
        nextStep();
      }, 100);
      return null;
    }
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="section-title">选择起始装备</h2>
          <p className="text-gray-600 mb-6">
            根据你的职业，选择一套起始装备。这些装备将在后续步骤中自动添加到你的物品栏。
          </p>
        </div>
        
        <div className="space-y-3">
          {startingEquipment.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleEquipmentComplete(option.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                currentCharacter.classStartingEquipment === option.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-bold text-gray-900 mb-2">{option.name}</div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mb-3">{option.description}</div>
                  )}
                  <div className="space-y-1">
                    {option.items && option.items.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">装备：</span>
                        <span className="text-gray-600 ml-2">{option.items.join('、')}</span>
                      </div>
                    )}
                    {typeof option.gold === 'number' && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">金币：</span>
                        <span className="text-gray-600 ml-2">{option.gold} GP</span>
                      </div>
                    )}
                    {option.weapons && option.weapons.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">武器：</span>
                        <span className="text-gray-600 ml-2">{option.weapons.length} 把</span>
                      </div>
                    )}
                    {option.armor && option.armor.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">护甲：</span>
                        <span className="text-gray-600 ml-2">{option.armor.join('、')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {currentCharacter.classStartingEquipment === option.id && (
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
      </div>
    );
  }

  // 如果需要选择职业特性，显示特性选择器
  if (needsClassFeatures && showFeatureSelector && nextFeatureToChoose) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="section-title">职业特性选择</h2>
          <p className="text-gray-600 mb-6">
            定制您的 <strong>{currentCharacter.class}</strong> 职业能力。
          </p>
        </div>

        {/* 显示已选择的特性 */}
        {Object.keys(currentChoices).length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">已选择的职业特性</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  {Object.entries(currentChoices)
                    .filter(([key]) => key !== 'speciesChoices')
                    .map(([featureId, optionId]) => {
                      const feature = classFeatureChoices.find((f: any) => f.id === featureId);
                      const option = feature?.options.find((o: any) => o.id === optionId);
                      return (
                        <div key={featureId}>
                          <strong>{feature?.name}:</strong> {option?.name}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        <ClassFeatureSelector
          featureName={nextFeatureToChoose.name}
          options={nextFeatureToChoose.options}
          onComplete={(selectedOptionId) => handleFeatureComplete(nextFeatureToChoose.id, selectedOptionId)}
          initialSelection={currentChoices[nextFeatureToChoose.id]}
        />

        <div className="info-box">
          <p className="text-sm text-blue-800">
            💡 <strong>提示：</strong>这些选择会影响你的角色玩法风格。仔细阅读每个选项的描述和能力。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">步骤 1：选择职业</h2>
        <p className="text-gray-600 mb-6">
          职业是最重要的决定，它定义了你的角色在冒险中的角色和能力。
          每个职业都有独特的战斗风格、技能和特性。
        </p>
      </div>

      {/* 重要说明 */}
      {!currentCharacter.class && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong className="block mb-1">选择你的职业</strong>
              <p>如果职业有特性选择（如牧师的圣约），你将在选择职业后立即进行选择。</p>
            </div>
          </div>
        </div>
      )}

      {/* 平衡队伍建议 */}
      <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
        <div className="font-bold text-purple-900 mb-2">🎭 经典队伍组合</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white rounded p-2 text-center">
            <div className="font-bold text-purple-700">牧师</div>
            <div className="text-xs text-gray-600">治疗 + 支援</div>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <div className="font-bold text-purple-700">战士</div>
            <div className="text-xs text-gray-600">前排 + 坦克</div>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <div className="font-bold text-purple-700">游侠</div>
            <div className="text-xs text-gray-600">侦查 + 控制</div>
          </div>
          <div className="bg-white rounded p-2 text-center">
            <div className="font-bold text-purple-700">法师</div>
            <div className="text-xs text-gray-600">法术 + 输出</div>
          </div>
        </div>
        <p className="text-xs text-purple-700 mt-2">
          💡 这是经典配置，但任何组合都可以有效！选择你喜欢的职业。
        </p>
      </div>

      {/* 职业列表 */}
      <div className="space-y-3">
        {CLASSES.map((classOption) => {
          const complexity = getComplexityText(classOption.nameEn);
          const complexityColor = getComplexityColor(complexity);
          const isSelected = currentCharacter.class === classOption.name;
          const isExpanded = expandedClass === classOption.id;

          return (
            <div key={classOption.id} className={`rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
            }`}>
              {/* 主卡片 */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <button
                    onClick={() => handleSelectClass(classOption.name)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {classOption.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({classOption.nameEn})
                      </span>
                      <span className={`text-xs px-2 py-1 bg-${complexityColor}-100 text-${complexityColor}-700 rounded-full`}>
                        {complexity}复杂度
                      </span>
                    </div>
                    <p className="text-gray-600">{classOption.description}</p>
                  </button>
                  
                  {isSelected && (
                    <div className="ml-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 关键信息 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">生命骰</div>
                    <div className="font-bold text-gray-900">d{classOption.hitDie}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">主要属性</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {classOption.primaryAbility.join('、')}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">技能数量</div>
                    <div className="font-bold text-gray-900">{classOption.skillChoices} 个</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">豁免熟练</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {classOption.savingThrows.join('、')}
                    </div>
                  </div>
                </div>

                {/* 查看详情按钮 */}
                <button
                  onClick={() => setExpandedClass(isExpanded ? null : classOption.id)}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 hover:bg-blue-50 rounded transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      收起详情
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      查看详情
                    </>
                  )}
                </button>
              </div>

              {/* 展开的详细信息 */}
              {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-gray-50 p-4 space-y-3">
                  {/* 熟练项 */}
                  <div>
                    <div className="font-bold text-sm text-gray-700 mb-2">熟练项：</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-500 mb-1">护甲</div>
                        <div className="text-gray-900">
                          {classOption.proficiencies.armor.length > 0 
                            ? classOption.proficiencies.armor.join('、')
                            : '无'}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-500 mb-1">武器</div>
                        <div className="text-gray-900">
                          {classOption.proficiencies.weapons.join('、')}
                        </div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-gray-500 mb-1">工具</div>
                        <div className="text-gray-900">
                          {classOption.proficiencies.tools.length > 0
                            ? classOption.proficiencies.tools.join('、')
                            : '无'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 可选技能 */}
                  <div>
                    <div className="font-bold text-sm text-gray-700 mb-2">
                      可选技能（从以下选择 {classOption.skillChoices} 个）：
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classOption.availableSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 职业特性（如果有） */}
                  {classOption.featureChoices && classOption.featureChoices.length > 0 && (
                    <div>
                      <div className="font-bold text-sm text-gray-700 mb-2">1级特性选择：</div>
                      <div className="space-y-2">
                        {classOption.featureChoices.map((feature) => (
                          <div key={feature.id} className="bg-white rounded p-2 text-xs">
                            <div className="font-bold text-gray-900">{feature.name}</div>
                            <div className="text-gray-600 mt-1">
                              {feature.options.length} 个选项可选（稍后选择）
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 提示 */}
                  <div className="bg-blue-50 border-l-2 border-blue-400 p-2 text-xs text-blue-800">
                    💡 这些详细选择将在&ldquo;填写细节&rdquo;步骤中进行
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-bold mb-2">📖 关于职业</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>复杂度</strong>指的是上手难度，不影响角色强度</li>
          <li><strong>主要属性</strong>是该职业最重要的属性，建议优先提升</li>
          <li><strong>生命骰</strong>决定你的生命值，d12最高，d6最低</li>
          <li>在3级时，你将选择一个<strong>子职业</strong>来进一步定制你的角色</li>
        </ul>
      </div>
    </div>
  );
}

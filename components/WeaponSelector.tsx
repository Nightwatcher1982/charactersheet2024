'use client';

import { useState, useEffect } from 'react';
import { WEAPONS, Weapon, getEquipmentPrice } from '@/lib/weapons-data';
import { CLASSES } from '@/lib/dnd-data';
import { Check, Sword } from 'lucide-react';
import { useCharacterStore } from '@/lib/character-store';

interface WeaponSelectorProps {
  selectedClass: string;
  onComplete: (weaponIds: string[]) => void;
  initialWeapons?: string[];
  startingGold?: number;
  onCostChange?: (cost: number) => void;
}

export default function WeaponSelector({
  selectedClass,
  onComplete,
  initialWeapons = [],
  startingGold = 0,
  onCostChange
}: WeaponSelectorProps) {
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>(initialWeapons);
  const { currentCharacter } = useCharacterStore();
  const classData = CLASSES.find(c => c.name === selectedClass);
  
  // 计算已选武器总价
  const totalWeaponCost = selectedWeapons.reduce((sum, weaponId) => {
    const weapon = WEAPONS.find(w => w.id === weaponId);
    if (weapon) {
      return sum + (weapon.price || getEquipmentPrice(weapon.name));
    }
    return sum;
  }, 0);
  
  // 通知父组件价格变化
  useEffect(() => {
    if (onCostChange) {
      onCostChange(totalWeaponCost);
    }
  }, [totalWeaponCost, onCostChange]);
  
  // 获取实际的武器熟练项（考虑职业特性选择）
  const getActualWeaponProficiencies = (): string[] => {
    if (!classData) return [];
    let weaponProfs = [...(classData.proficiencies.weapons || [])];
    
    // 检查职业特性选择（如守护者获得军用武器）
    if (currentCharacter?.classFeatureChoices) {
      const divineOrder = currentCharacter.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && selectedClass === '牧师') {
        // 守护者获得军用武器熟练
        if (!weaponProfs.includes('军用武器')) {
          weaponProfs.push('军用武器');
        }
      }
    }
    
    return weaponProfs;
  };

  // 初始化时，如果有初始武器，立即通知父组件
  useEffect(() => {
    if (initialWeapons.length > 0 && selectedWeapons.length === 0) {
      setSelectedWeapons(initialWeapons);
      onComplete(initialWeapons);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 初始化时，如果有初始武器，立即通知父组件
    if (initialWeapons.length > 0 && selectedWeapons.length === 0) {
      setSelectedWeapons(initialWeapons);
    }
    // 当选择变化时通知父组件
    if (selectedWeapons.length > 0) {
      onComplete(selectedWeapons);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeapons]);

  if (!classData) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
        <p className="text-red-800">错误：无法加载职业数据</p>
      </div>
    );
  }

  // 根据职业熟练项过滤可用武器
  const getAvailableWeapons = (): Weapon[] => {
    const weaponProfs = getActualWeaponProficiencies();
    const availableWeapons: Weapon[] = [];

    WEAPONS.forEach(weapon => {
      // 检查是否熟练
      let isProficient = false;

      // 检查"简易武器"或"军用武器"
      if (weaponProfs.includes('简易武器') && weapon.category.includes('简易')) {
        isProficient = true;
      }
      if (weaponProfs.includes('军用武器') && weapon.category.includes('军用')) {
        isProficient = true;
      }

      // 检查具体武器名称
      if (weaponProfs.some(w => weapon.category.includes(w) || weapon.name.includes(w))) {
        isProficient = true;
      }

      // 如果熟练，添加到可用列表
      if (isProficient) {
        availableWeapons.push(weapon);
      }
    });

    return availableWeapons;
  };

  const availableWeapons = getAvailableWeapons();

  // 按类型分组
  const weaponsByCategory = availableWeapons.reduce((acc, weapon) => {
    if (!acc[weapon.category]) {
      acc[weapon.category] = [];
    }
    acc[weapon.category].push(weapon);
    return acc;
  }, {} as Record<string, Weapon[]>);

  const toggleWeapon = (weaponId: string) => {
    if (selectedWeapons.includes(weaponId)) {
      setSelectedWeapons(selectedWeapons.filter(id => id !== weaponId));
    } else {
      // 检查是否有足够金币
      const weapon = WEAPONS.find(w => w.id === weaponId);
      if (weapon && startingGold > 0) {
        const weaponPrice = weapon.price || getEquipmentPrice(weapon.name);
        // 这里需要从父组件获取当前总花费，暂时允许选择
        // 实际限制在父组件的addEquipment中处理
      }
      setSelectedWeapons([...selectedWeapons, weaponId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">
          选择起始武器
        </h3>
        <p className="text-sm text-blue-800">
          根据你的职业熟练项，从以下武器中选择。你可以选择多把武器。
        </p>
        <p className="text-xs text-blue-700 mt-2">
          <strong>职业：</strong>{selectedClass} | 
          <strong> 熟练项：</strong>{classData.proficiencies.weapons.join('、')} | 
          <strong> 已选择：</strong>{selectedWeapons.length} 把武器
        </p>
      </div>

      {Object.entries(weaponsByCategory).map(([category, weapons]) => (
        <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sword className="w-5 h-5 text-gray-600" />
            {category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weapons.map((weapon) => {
              const isSelected = selectedWeapons.includes(weapon.id);
              const weaponPrice = weapon.price || getEquipmentPrice(weapon.name);

              return (
                <button
                  key={weapon.id}
                  onClick={() => toggleWeapon(weapon.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1">{weapon.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{weapon.nameEn}</div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-700">
                          <strong>伤害：</strong>{weapon.damage} {weapon.damageType}
                        </div>
                        {weapon.properties.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <strong>属性：</strong>{weapon.properties.join('、')}
                          </div>
                        )}
                        {weapon.mastery && (
                          <div className="text-xs text-purple-700 mt-1">
                            ✨ <strong>精通：</strong>{weapon.mastery}
                          </div>
                        )}
                        {startingGold > 0 && (
                          <div className="text-xs font-semibold text-green-600 mt-1">
                            {weaponPrice > 0 ? `${weaponPrice} GP` : '免费'}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedWeapons.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="text-green-700 font-bold mb-2">
            ✓ 已选择 {selectedWeapons.length} 把武器
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedWeapons.map(weaponId => {
              const weapon = WEAPONS.find(w => w.id === weaponId);
              return weapon ? (
                <span
                  key={weaponId}
                  className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium"
                >
                  {weapon.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-700">
        <div className="font-bold mb-2">💡 提示</div>
        <ul className="list-disc list-inside space-y-1">
          <li>你可以选择多把武器，建议至少选择一把近战和一把远程武器</li>
          <li>武器精通效果在战斗中使用，详细说明会在角色卡上显示</li>
          <li>如果选择50金币，你可以用这些金币购买武器和装备</li>
        </ul>
      </div>
    </div>
  );
}

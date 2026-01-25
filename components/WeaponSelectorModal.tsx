'use client';

import { useState, useEffect } from 'react';
import { X, Check, Sword } from 'lucide-react';
import { WEAPONS, Weapon } from '@/lib/weapons-data';
import { CLASSES } from '@/lib/dnd-data';
import { useCharacterStore } from '@/lib/character-store';

interface WeaponSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  weaponType: '简易武器' | '军用武器';
  requiredCount: number; // 需要选择的数量（1或2）
  onComplete: (weaponIds: string[]) => void;
  selectedClass: string;
}

export default function WeaponSelectorModal({
  isOpen,
  onClose,
  weaponType,
  requiredCount,
  onComplete,
  selectedClass
}: WeaponSelectorModalProps) {
  const { currentCharacter } = useCharacterStore();
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const classData = CLASSES.find(c => c.name === selectedClass);

  useEffect(() => {
    if (isOpen) {
      setSelectedWeapons([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 获取实际的武器熟练项（考虑职业特性选择）
  const getActualWeaponProficiencies = (): string[] => {
    if (!classData) return [];
    let weaponProfs = [...(classData.proficiencies.weapons || [])];
    
    if (currentCharacter?.classFeatureChoices) {
      const divineOrder = currentCharacter.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && selectedClass === '牧师') {
        if (!weaponProfs.includes('军用武器')) {
          weaponProfs.push('军用武器');
        }
      }
    }
    
    return weaponProfs;
  };

  // 根据武器类型过滤可用武器
  const getAvailableWeapons = (): Weapon[] => {
    const weaponProfs = getActualWeaponProficiencies();
    const availableWeapons: Weapon[] = [];

    WEAPONS.forEach(weapon => {
      // 检查是否匹配武器类型
      const isMatchingType = weaponType === '简易武器' 
        ? weapon.category.includes('简易')
        : weapon.category.includes('军用');

      // 检查是否熟练
      let isProficient = false;
      if (weaponType === '简易武器' && weaponProfs.includes('简易武器')) {
        isProficient = true;
      }
      if (weaponType === '军用武器' && weaponProfs.includes('军用武器')) {
        isProficient = true;
      }

      // 如果匹配类型且熟练，添加到可用列表
      if (isMatchingType && isProficient) {
        availableWeapons.push(weapon);
      }
    });

    return availableWeapons;
  };

  const availableWeapons = getAvailableWeapons();

  const toggleWeapon = (weaponId: string) => {
    if (selectedWeapons.includes(weaponId)) {
      setSelectedWeapons(selectedWeapons.filter(id => id !== weaponId));
    } else {
      if (selectedWeapons.length < requiredCount) {
        setSelectedWeapons([...selectedWeapons, weaponId]);
      }
    }
  };

  const isComplete = selectedWeapons.length === requiredCount;
  const remaining = requiredCount - selectedWeapons.length;

  const handleConfirm = () => {
    if (isComplete) {
      onComplete(selectedWeapons);
      onClose();
    }
  };

  // 按类型分组
  const weaponsByCategory = availableWeapons.reduce((acc, weapon) => {
    if (!acc[weapon.category]) {
      acc[weapon.category] = [];
    }
    acc[weapon.category].push(weapon);
    return acc;
  }, {} as Record<string, Weapon[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              选择{weaponType}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              请选择 {requiredCount} 把{weaponType}。已选择 {selectedWeapons.length} / {requiredCount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {availableWeapons.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <p className="text-yellow-800">
                警告：你的职业不熟练{weaponType}，无法选择此类武器。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(weaponsByCategory).map(([category, weapons]) => (
                <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sword className="w-5 h-5 text-gray-600" />
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {weapons.map((weapon) => {
                      const isSelected = selectedWeapons.includes(weapon.id);
                      const canSelect = selectedWeapons.length < requiredCount || isSelected;
                      
                      return (
                        <button
                          key={weapon.id}
                          onClick={() => toggleWeapon(weapon.id)}
                          disabled={!canSelect && !isSelected}
                          className={`
                            p-3 rounded-lg border-2 text-left transition-all
                            ${isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : canSelect
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {weapon.name}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {weapon.damage} {weapon.damageType} | {weapon.properties.join('、')}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {remaining > 0 ? (
              <span className="text-orange-600">还需选择 {remaining} 把武器</span>
            ) : (
              <span className="text-green-600">✓ 已选择 {requiredCount} 把武器</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isComplete}
              className={`
                px-6 py-2 rounded-lg font-semibold transition-colors
                ${isComplete
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

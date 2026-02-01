'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { Shield, Swords, Package, Check } from 'lucide-react';
import { ARMORS, getArmorByName } from '@/lib/weapons-data';
import { getWeaponById } from '@/lib/weapons-data';

export default function StepEquipmentCheck() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [equippedArmor, setEquippedArmor] = useState<string | null>(
    currentCharacter?.equippedArmor || null
  );
  const [equippedShield, setEquippedShield] = useState<boolean>(
    currentCharacter?.equippedShield || false
  );

  if (!currentCharacter) return null;

  const equipment = currentCharacter.equipment || [];
  const equippedWeapons = currentCharacter.equippedWeapons || [];

  // 获取护甲列表（从装备中筛选）
  const armorItems = equipment.filter(item => {
    const armor = getArmorByName(item);
    return armor && armor.category !== '盾牌';
  });

  // 检查是否有盾牌
  const hasShield = equipment.some(item => {
    const armor = getArmorByName(item);
    return armor && armor.category === '盾牌';
  });

  // 获取武器信息
  const weaponsList = equippedWeapons.map(weaponId => {
    const weapon = getWeaponById(weaponId);
    return weapon ? { ...weapon, weaponId } : null;
  }).filter(Boolean);

  const handleEquipArmor = (armorName: string) => {
    setEquippedArmor(armorName);
    updateCurrentCharacter({
      equippedArmor: armorName
    });
  };

  const handleToggleShield = () => {
    const newValue = !equippedShield;
    setEquippedShield(newValue);
    updateCurrentCharacter({
      equippedShield: newValue
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">装备检查</h2>
        <p className="text-gray-600 mb-6">
          查看你的起始装备，并选择要装备的护甲和武器。
        </p>
      </div>

      {/* 装备总览 */}
      <div className="bg-parchment-base border-2 border-gold-light rounded-lg p-4 shadow-dnd">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-gold-dark" />
          <h3 className="font-bold text-leather-dark font-cinzel">起始装备清单</h3>
        </div>
        {equipment.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {equipment.map((item, index) => (
              <div
                key={index}
                className="p-2 bg-white rounded border border-leather-light text-sm text-leather-dark"
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">暂无装备</p>
        )}
      </div>

      {/* 护甲装备 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-leather-dark" />
          <h3 className="text-lg font-bold text-leather-dark">装备护甲</h3>
        </div>
        
        {armorItems.length > 0 ? (
          <div className="space-y-2">
            {armorItems.map((armorName) => {
              const armor = getArmorByName(armorName);
              const isEquipped = equippedArmor === armorName;
              
              return (
                <button
                  key={armorName}
                  onClick={() => handleEquipArmor(armorName)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isEquipped
                      ? 'border-gold-dark bg-gold-light/30 shadow-dnd ring-2 ring-gold-dark'
                      : 'border-leather-light bg-white hover:border-gold-base hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-leather-dark">{armorName}</div>
                      {armor && (
                        <div className="text-sm text-leather-base mt-1">
                          AC: {armor.ac} | 类型: {armor.category}
                        </div>
                      )}
                    </div>
                    {isEquipped && (
                      <div className="w-8 h-8 bg-gold-dark rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">你没有可装备的护甲</p>
          </div>
        )}

        {/* 盾牌选项 */}
        {hasShield && (
          <div className="mt-4">
            <button
              onClick={handleToggleShield}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                equippedShield
                  ? 'border-gold-dark bg-gold-light/30 shadow-dnd ring-2 ring-gold-dark'
                  : 'border-leather-light bg-white hover:border-gold-base hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-leather-dark">盾牌</div>
                  <div className="text-sm text-leather-base mt-1">
                    AC +2
                  </div>
                </div>
                {equippedShield && (
                  <div className="w-8 h-8 bg-gold-dark rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 武器装备 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Swords className="w-5 h-5 text-leather-dark" />
          <h3 className="text-lg font-bold text-leather-dark">已装备武器</h3>
        </div>
        
        {weaponsList.length > 0 ? (
          <div className="space-y-2">
            {weaponsList.map((weapon: any) => (
              <div
                key={weapon.weaponId}
                className="p-4 bg-white rounded-lg border-2 border-leather-light"
              >
                <div className="font-bold text-leather-dark">{weapon.name}</div>
                <div className="text-sm text-leather-base mt-1">
                  伤害: {weapon.damage} | 类型: {weapon.damageType}
                </div>
                {weapon.properties && weapon.properties.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    属性: {weapon.properties.join('、')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">你没有装备武器</p>
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>你装备的护甲和盾牌会影响你的护甲等级(AC)，武器选择会影响你的战斗能力。
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { Plus, Trash2, Coins } from 'lucide-react';
import WeaponSelector from '@/components/WeaponSelector';
import { CLASSES, BACKGROUNDS } from '@/lib/dnd-data';
import { ARMORS, WEAPONS, getEquipmentPrice, getWeaponByName, getWeaponById } from '@/lib/weapons-data';
import { BACKGROUND_EQUIPMENT, getBackgroundEquipment } from '@/lib/equipment-packages-data';
import { getClassStartingEquipment } from '@/lib/class-starting-equipment-data';

const COMMON_EQUIPMENT = {
  weapons: ['长剑', '短剑', '战斧', '战锤', '长弓', '短弓', '弩', '匕首', '长矛', '木棍'],
  armor: ['皮甲', '镶钉皮甲', '链甲', '鳞甲', '板甲', '盾牌'],
  adventuringGear: [
    '背包', '睡袋', '绳索（50尺）', '火把（10支）', '口粮（10天）',
    '水袋', '盗贼工具', '医疗包', '撬棍', '铁钉（10个）'
  ],
};

export default function StepEquipment() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [customItem, setCustomItem] = useState('');
  const [showWeaponSelector, setShowWeaponSelector] = useState(false);

  if (!currentCharacter) return null;

  const classData = CLASSES.find(c => c.name === currentCharacter.class);
  
  // 获取实际的武器和护甲熟练项（考虑职业特性选择）
  const getActualWeaponProficiencies = (): string[] => {
    if (!classData) return [];
    let weaponProfs = [...(classData.proficiencies.weapons || [])];
    
    // 检查职业特性选择（如守护者获得军用武器）
    if (currentCharacter.classFeatureChoices) {
      const divineOrder = currentCharacter.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && currentCharacter.class === '牧师') {
        // 守护者获得军用武器熟练
        if (!weaponProfs.includes('军用武器')) {
          weaponProfs.push('军用武器');
        }
      }
    }
    
    return weaponProfs;
  };
  
  const getActualArmorProficiencies = (): string[] => {
    if (!classData) return [];
    let armorProfs = [...(classData.proficiencies.armor || [])];
    
    // 检查职业特性选择（如守护者获得重甲熟练）
    if (currentCharacter.classFeatureChoices) {
      const divineOrder = currentCharacter.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && currentCharacter.class === '牧师') {
        // 守护者获得重甲熟练
        if (!armorProfs.includes('重甲')) {
          armorProfs.push('重甲');
        }
      }
    }
    
    return armorProfs;
  };

  const equipment = currentCharacter.equipment || [];
  
  // 加载职业起始装备（如果已选择但未加载）
  useEffect(() => {
    if (currentCharacter.class && currentCharacter.classStartingEquipment) {
      const classData = CLASSES.find(c => c.name === currentCharacter.class);
      const startingEquipment = getClassStartingEquipment(classData?.id || '');
      const selectedOption = startingEquipment?.options.find(opt => opt.id === currentCharacter.classStartingEquipment);
      
      if (selectedOption) {
        const currentEquipment = currentCharacter.equipment || [];
        const currentWeapons = currentCharacter.equippedWeapons || [];
        
        // 添加装备物品
        const newEquipment: string[] = [];
        selectedOption.items?.forEach(item => {
          if (!currentEquipment.includes(item)) {
            newEquipment.push(item);
          }
        });
        
        // 添加护甲
        selectedOption.armor?.forEach(armor => {
          if (!currentEquipment.includes(armor)) {
            newEquipment.push(armor);
          }
        });
        
        // 添加武器
        const newWeapons: string[] = [];
        selectedOption.weapons?.forEach(weaponId => {
          // 尝试通过ID查找武器
          const weapon = getWeaponById(weaponId);
          if (weapon) {
            // 使用武器ID或名称
            const weaponIdentifier = weapon.id || weapon.name;
            if (!currentWeapons.includes(weaponIdentifier)) {
              newWeapons.push(weaponIdentifier);
            }
          }
        });
        
        if (newEquipment.length > 0 || newWeapons.length > 0) {
          updateCurrentCharacter({
            equipment: [...currentEquipment, ...newEquipment],
            equippedWeapons: [...currentWeapons, ...newWeapons],
          });
        }
      }
    }
  }, [currentCharacter.class, currentCharacter.classStartingEquipment]);
  
  // 获取起始金币
  const startingGold = useMemo(() => {
    if (!currentCharacter.background || !currentCharacter.backgroundEquipmentChoice) {
      return 0;
    }
    const backgroundData = BACKGROUNDS.find(b => b.name === currentCharacter.background);
    if (!backgroundData) return 0;
    
    const bgEquipment = getBackgroundEquipment(backgroundData.id);
    if (!bgEquipment) return 0;
    
    if (currentCharacter.backgroundEquipmentChoice === 'A') {
      return bgEquipment.optionA.gold;
    } else {
      return bgEquipment.optionB.gold;
    }
  }, [currentCharacter.background, currentCharacter.backgroundEquipmentChoice]);
  
  // 计算已选装备总价
  const totalCost = useMemo(() => {
    let cost = 0;
    // 计算装备价格
    equipment.forEach(item => {
      cost += getEquipmentPrice(item);
    });
    // 计算武器价格
    if (currentCharacter.equippedWeapons) {
      currentCharacter.equippedWeapons.forEach(weaponId => {
        const weapon = getWeaponByName(weaponId) || WEAPONS.find(w => w.id === weaponId);
        if (weapon) {
          cost += weapon.price || getEquipmentPrice(weapon.name);
        }
      });
    }
    return cost;
  }, [equipment, currentCharacter.equippedWeapons]);
  
  // 剩余金币
  const remainingGold = startingGold - totalCost;
  
  // 初始化剩余金币（如果还没有设置）
  useEffect(() => {
    if (currentCharacter.remainingGold === undefined && startingGold > 0) {
      updateCurrentCharacter({
        remainingGold: startingGold
      });
    }
  }, [startingGold, currentCharacter.remainingGold, updateCurrentCharacter]);
  
  // 更新剩余金币
  useEffect(() => {
    if (startingGold > 0) {
      updateCurrentCharacter({
        remainingGold: remainingGold
      });
    }
  }, [remainingGold, startingGold, updateCurrentCharacter]);

  const addEquipment = (item: string) => {
    const itemPrice = getEquipmentPrice(item);
    const currentEquipment = currentCharacter.equipment || [];
    
    // 检查是否已有该物品
    if (currentEquipment.includes(item)) {
      return;
    }
    
    // 检查是否有足够金币
    if (startingGold > 0 && totalCost + itemPrice > startingGold) {
      alert(`金币不足！该物品需要 ${itemPrice} GP，但您只有 ${remainingGold.toFixed(2)} GP。`);
      return;
    }
    
    updateCurrentCharacter({
      equipment: [...currentEquipment, item],
    });
  };

  const removeEquipment = (item: string) => {
    updateCurrentCharacter({
      equipment: equipment.filter((e) => e !== item),
    });
  };

  const addCustomItem = () => {
    if (customItem.trim() && !equipment.includes(customItem.trim())) {
      // 自定义物品默认价格为0（免费）
      addEquipment(customItem.trim());
      setCustomItem('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">选择装备</h2>
        <p className="text-gray-600 mb-6">
          使用你的起始金币购买装备。你可以选择你熟练使用的武器和护甲。
        </p>
      </div>

      {/* 金币显示 */}
      {startingGold > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-gray-900">金币管理</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">起始金币</div>
              <div className="text-2xl font-bold text-yellow-700">{startingGold} GP</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-yellow-300 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">已花费</div>
              <div className="text-lg font-semibold text-red-600">{totalCost.toFixed(2)} GP</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">剩余金币</div>
              <div className={`text-2xl font-bold ${remainingGold >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingGold.toFixed(2)} GP
              </div>
            </div>
          </div>
          {remainingGold < 0 && (
            <div className="mt-2 text-sm text-red-600 font-semibold">
              ⚠️ 警告：您已超出预算！
            </div>
          )}
        </div>
      )}

      <div className="info-box">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>你的职业决定了你可以熟练使用的武器和护甲。
          确保选择的装备符合你的职业熟练项。{startingGold > 0 && '每个物品下方显示价格。'}
        </p>
      </div>

      {/* 职业起始装备提示 */}
      {currentCharacter.classStartingEquipment && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mb-4">
          <div className="text-sm text-green-800">
            <strong>✓ 职业起始装备已加载：</strong>
            {(() => {
              const classData = CLASSES.find(c => c.name === currentCharacter.class);
              const startingEquipment = getClassStartingEquipment(classData?.id || '');
              const selectedOption = startingEquipment?.options.find(opt => opt.id === currentCharacter.classStartingEquipment);
              return selectedOption?.name || '已选择';
            })()}
          </div>
        </div>
      )}

      {/* 已选装备 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          已选装备 ({equipment.length})
        </h3>
        {equipment.length > 0 ? (
          <div className="space-y-2">
            {equipment.map((item, index) => {
              const itemPrice = getEquipmentPrice(item);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium">{item}</span>
                    {startingGold > 0 && itemPrice > 0 && (
                      <div className="text-xs text-gray-500 mt-1">{itemPrice} GP</div>
                    )}
                  </div>
                  <button
                    onClick={() => removeEquipment(item)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">还没有选择装备</p>
          </div>
        )}
      </div>

      {/* 添加自定义物品 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          添加自定义物品
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
            placeholder="输入物品名称..."
            className="input flex-1"
          />
          <button
            onClick={addCustomItem}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>

      {/* 武器选择 */}
      {classData && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">选择武器</h3>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg mb-4">
            <div className="text-sm text-purple-800">
              <strong>提示：</strong>根据你的职业熟练项选择武器。你可以选择你熟练的武器。
            </div>
          </div>
          <WeaponSelector
            selectedClass={currentCharacter.class}
            onComplete={(weaponIds) => {
              updateCurrentCharacter({
                equippedWeapons: weaponIds
              });
            }}
            initialWeapons={currentCharacter.equippedWeapons || []}
            startingGold={startingGold}
          />
        </div>
      )}

      {/* 护甲 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">护甲</h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-4">
          <div className="text-sm text-blue-800">
            <strong>提示：</strong>根据你的职业熟练项选择护甲。{getActualArmorProficiencies().length > 0 && `你可以熟练使用：${getActualArmorProficiencies().join('、')}`}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ARMORS.filter(armor => {
            // 过滤出用户熟练的护甲
            const armorProfs = getActualArmorProficiencies();
            if (armor.category === '盾牌') {
              return armorProfs.includes('盾牌');
            }
            if (armor.category === '轻甲') {
              return armorProfs.includes('轻甲');
            }
            if (armor.category === '中甲') {
              return armorProfs.includes('中甲');
            }
            if (armor.category === '重甲') {
              return armorProfs.includes('重甲');
            }
            return false;
          }).map((armor) => {
            const price = armor.price || getEquipmentPrice(armor.name);
            const canAfford = startingGold === 0 || (remainingGold >= price);
            const isSelected = equipment.includes(armor.name);
            
            return (
              <button
                key={armor.id}
                onClick={() => addEquipment(armor.name)}
                disabled={isSelected || !canAfford}
                className={`p-3 rounded-lg border transition-all text-sm text-left ${
                  isSelected
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : !canAfford
                    ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-red-500 hover:bg-red-50'
                }`}
              >
                <div className="font-medium">{armor.name}</div>
                <div className="text-xs text-gray-500 mt-1">AC: {armor.ac}</div>
                {startingGold > 0 && (
                  <div className={`text-xs font-semibold mt-1 ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {price > 0 ? `${price} GP` : '免费'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 冒险装备 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">冒险装备</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {COMMON_EQUIPMENT.adventuringGear.map((gear) => {
            const price = getEquipmentPrice(gear);
            const canAfford = startingGold === 0 || (remainingGold >= price);
            const isSelected = equipment.includes(gear);
            
            return (
              <button
                key={gear}
                onClick={() => addEquipment(gear)}
                disabled={isSelected || !canAfford}
                className={`p-3 rounded-lg border transition-all text-sm text-left ${
                  isSelected
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : !canAfford
                    ? 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-red-500 hover:bg-red-50'
                }`}
              >
                <div className="font-medium">{gear}</div>
                {startingGold > 0 && (
                  <div className={`text-xs font-semibold mt-1 ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {price > 0 ? `${price} GP` : '免费'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

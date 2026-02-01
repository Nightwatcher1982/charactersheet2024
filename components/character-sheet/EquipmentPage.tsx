'use client';

import { useState, useEffect } from 'react';
import { Character, getAbilityModifier, getProficiencyBonus } from '@/lib/dnd-data';
import { getWeaponById, getArmorByName, ARMORS } from '@/lib/weapons-data';
import { Sword, Shield as ShieldIcon, Package, Plus, Trash2 } from 'lucide-react';

interface EquipmentPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

type EquipmentTab = 'weapons' | 'armor' | 'items';

export default function EquipmentPage({ character, onUpdate }: EquipmentPageProps) {
  const [activeTab, setActiveTab] = useState<EquipmentTab>('weapons');
  const [newItem, setNewItem] = useState('');

  const equipment = character.equipment || [];
  const equippedWeaponIds = character.equippedWeapons || [];
  const ownedWeaponIds = character.ownedWeapons?.length ? character.ownedWeapons : equippedWeaponIds;
  const stowedWeaponIds = ownedWeaponIds.filter(id => !equippedWeaponIds.includes(id));

  // 首次进入装备页时，若未存过 ownedWeapons，用当前 equippedWeapons 初始化，便于卸下后仍可穿戴
  useEffect(() => {
    if (!character.ownedWeapons?.length && character.equippedWeapons?.length) {
      onUpdate({ ownedWeapons: character.equippedWeapons });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 计算战斗修正
  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  const finalAbilities = { ...abilities };
  if (character.backgroundAbilityBonuses) {
    Object.entries(character.backgroundAbilityBonuses).forEach(([abilityName, bonus]) => {
      const abilityMap: Record<string, keyof typeof abilities> = {
        '力量': 'strength',
        '敏捷': 'dexterity',
        '体质': 'constitution',
        '智力': 'intelligence',
        '感知': 'wisdom',
        '魅力': 'charisma',
      };
      const key = abilityMap[abilityName];
      if (key) {
        finalAbilities[key] += bonus;
      }
    });
  }

  const profBonus = getProficiencyBonus(character.level || 1);
  const strMod = getAbilityModifier(finalAbilities.strength);
  const dexMod = getAbilityModifier(finalAbilities.dexterity);

  // 从 equipment 中解析出：拥有的护甲名列表、是否拥有盾牌
  const ownedArmorNames: string[] = [];
  let hasOwnedShield = false;
  const otherItems: string[] = [];
  for (const item of equipment) {
    const armor = getArmorByName(item);
    if (armor) {
      if (armor.category === '盾牌') {
        hasOwnedShield = true;
      } else {
        if (!ownedArmorNames.includes(item)) ownedArmorNames.push(item);
      }
    } else {
      otherItems.push(item);
    }
  }

  // 当前装备的护甲与盾牌（优先用 equippedArmor / equippedShield，兼容旧数据用 equipment 推断）
  const equippedArmorName = character.equippedArmor ?? (ownedArmorNames[0] ?? undefined);
  const equippedShield = character.equippedShield ?? (hasOwnedShield && equipment.some(e => getArmorByName(e)?.category === '盾牌'));
  const equippedArmor = equippedArmorName ? getArmorByName(equippedArmorName) : null;
  const ownedButNotEquippedArmor = ownedArmorNames.filter(name => name !== equippedArmorName);

  const handleEquipArmor = (name: string) => {
    onUpdate({ equippedArmor: name });
  };
  const handleUnequipArmor = () => {
    onUpdate({ equippedArmor: undefined });
  };
  const handleEquipShield = () => {
    onUpdate({ equippedShield: true });
  };
  const handleUnequipShield = () => {
    onUpdate({ equippedShield: false });
  };

  const handleEquipWeapon = (weaponId: string) => {
    onUpdate({ equippedWeapons: [...equippedWeaponIds, weaponId] });
  };
  const handleUnequipWeapon = (weaponId: string) => {
    onUpdate({
      equippedWeapons: equippedWeaponIds.filter(id => id !== weaponId),
      ownedWeapons: character.ownedWeapons?.length ? character.ownedWeapons : equippedWeaponIds,
    });
  };

  // 添加物品
  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedEquipment = [...equipment, newItem.trim()];
      onUpdate({ equipment: updatedEquipment });
      setNewItem('');
    }
  };

  // 删除物品
  const handleRemoveItem = (index: number) => {
    const updatedEquipment = equipment.filter((_, i) => i !== index);
    onUpdate({ equipment: updatedEquipment });
  };

  return (
    <div className="space-y-6">
      {/* 页签导航 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light overflow-hidden">
        <div className="flex border-b-2 border-gold-light">
          <button
            onClick={() => setActiveTab('weapons')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'weapons'
                ? 'bg-red-50 text-red-700 border-b-4 border-red-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sword className="w-5 h-5" />
              武器
            </div>
          </button>
          <button
            onClick={() => setActiveTab('armor')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'armor'
                ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldIcon className="w-5 h-5" />
              护甲
            </div>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'items'
                ? 'bg-green-50 text-green-700 border-b-4 border-green-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              物品
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* 武器页签 */}
          {activeTab === 'weapons' && (
            <div className="space-y-4">
              <h2 className="text-xl font-cinzel font-bold text-leather-dark mb-4">
                武器
              </h2>
              {equippedWeaponIds.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-bold text-gray-700">已装备（卸下后放入下方背包）</h3>
                  <div className="space-y-3">
                    {equippedWeaponIds.map((weaponId) => {
                      const weapon = getWeaponById(weaponId);
                      if (!weapon) return null;
                      const isFinesse = weapon.properties?.includes('灵巧');
                      const abilityMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
                      const attackBonus = abilityMod + profBonus;
                      return (
                        <div
                          key={weaponId}
                          className="bg-red-50 rounded-lg p-4 border-2 border-red-200 flex items-start justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-red-900 text-lg mb-2">{weapon.name}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-gray-600">伤害：</span><span className="font-semibold">{weapon.damage}</span></div>
                              <div><span className="text-gray-600">类型：</span><span className="font-semibold">{weapon.damageType}</span></div>
                              <div><span className="text-gray-600">攻击加值：</span><span className="font-bold text-red-600">{attackBonus >= 0 ? '+' : ''}{attackBonus}</span></div>
                              <div><span className="text-gray-600">伤害加值：</span><span className="font-bold text-red-600">{abilityMod >= 0 ? '+' : ''}{abilityMod}</span></div>
                            </div>
                            {weapon.properties && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {weapon.properties.map((prop) => (
                                  <span key={prop} className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-xs">{prop}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnequipWeapon(weaponId)}
                            className="flex-shrink-0 px-3 py-1.5 border-2 border-red-400 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium"
                          >
                            卸下
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {stowedWeaponIds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-700">背包中的武器（可穿戴）</h3>
                  <div className="flex flex-wrap gap-2">
                    {stowedWeaponIds.map((weaponId) => {
                      const weapon = getWeaponById(weaponId);
                      if (!weapon) return null;
                      return (
                        <div
                          key={weaponId}
                          className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-gray-900">{weapon.name}</span>
                          <button
                            type="button"
                            onClick={() => handleEquipWeapon(weaponId)}
                            className="flex-shrink-0 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            穿戴
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {equippedWeaponIds.length === 0 && stowedWeaponIds.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Sword className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">暂无武器</p>
                </div>
              )}
            </div>
          )}

          {/* 护甲页签 */}
          {activeTab === 'armor' && (
            <div className="space-y-4">
              <h2 className="text-xl font-cinzel font-bold text-leather-dark mb-4">
                护甲与盾牌
              </h2>
              {/* 已装备护甲 */}
              {equippedArmor ? (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg mb-2">{equippedArmor.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">基础AC：</span><span className="font-semibold">{String(equippedArmor.ac)}</span></div>
                      <div><span className="text-gray-600">类别：</span><span className="font-semibold">{equippedArmor.category}</span></div>
                      {equippedArmor.stealthDisadvantage && (
                        <div className="col-span-2"><span className="text-red-600 text-sm">⚠️ 隐匿检定劣势</span></div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnequipArmor}
                    className="flex-shrink-0 px-3 py-1.5 border-2 border-blue-400 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
                  >
                    卸下
                  </button>
                </div>
              ) : null}
              {ownedButNotEquippedArmor.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-700">{equippedArmor ? '背包中的护甲（可穿戴）' : '可穿戴护甲'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {ownedButNotEquippedArmor.map((name) => {
                      const armor = getArmorByName(name);
                      if (!armor) return null;
                      return (
                        <div key={name} className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200 flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900">{armor.name}</span>
                          <button type="button" onClick={() => handleEquipArmor(name)} className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">穿戴</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!equippedArmor && ownedArmorNames.length === 0 && !hasOwnedShield && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <ShieldIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">暂无护甲或盾牌</p>
                </div>
              )}

              {/* 盾牌 */}
              {hasOwnedShield && (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg mb-1">盾牌</h3>
                    <p className="text-sm text-gray-700">AC +2</p>
                  </div>
                  {equippedShield ? (
                    <button type="button" onClick={handleUnequipShield} className="flex-shrink-0 px-3 py-1.5 border-2 border-blue-400 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">卸下</button>
                  ) : (
                    <button type="button" onClick={handleEquipShield} className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">穿戴</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 物品页签 */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <h2 className="text-xl font-cinzel font-bold text-leather-dark mb-4">
                背包物品
              </h2>
              
              {/* 添加新物品 */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder="输入物品名称..."
                  className="flex-1 px-4 py-2 border-2 border-green-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 transition-all"
                />
                <button
                  onClick={handleAddItem}
                  disabled={!newItem.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-bold"
                >
                  <Plus className="w-4 h-4" />
                  添加
                </button>
              </div>

              {otherItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {otherItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-lg p-3 border-2 border-green-200 flex items-center justify-between"
                    >
                      <p className="font-semibold text-green-900">{item}</p>
                      <button
                        onClick={() => handleRemoveItem(equipment.findIndex(e => e === item))}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">背包为空</p>
                  <p className="text-sm text-gray-400 mt-1">在上方输入框中添加物品</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

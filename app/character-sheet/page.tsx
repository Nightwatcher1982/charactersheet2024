'use client';

import { useEffect, useState } from 'react';
import { Character, getAbilityModifier, getProficiencyBonus, CLASSES, BACKGROUNDS, SPECIES, SKILLS, ALIGNMENTS } from '@/lib/dnd-data';
import { getFeatById } from '@/lib/feats-data';
import { getLanguageById } from '@/lib/languages-data';
import { getClassFeaturesByName } from '@/lib/class-features-data';
import { BACKGROUND_EQUIPMENT } from '@/lib/equipment-packages-data';
import { WEAPONS, getWeaponByName, getWeaponById, getEquipmentPrice, calculateWeaponAttackBonus, ARMORS, getArmorByName, calculateAC } from '@/lib/weapons-data';
import { calculateSpeciesHPBonus, getSpeciesBaseSpeed, calculateClassFeatureHPBonus } from '@/lib/species-traits-calculator';
import { getClassStartingEquipment } from '@/lib/class-starting-equipment-data';
import { 
  getSpellById, 
  hasSpellcasting, 
  getSpellcastingRules,
  CANTRIPS,
  FIRST_LEVEL_SPELLS
} from '@/lib/spells-data';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Partial<Character> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // 从localStorage读取临时角色数据
    const tempChar = localStorage.getItem('temp-character-for-sheet');
    if (tempChar) {
      const parsed = JSON.parse(tempChar);
      setCharacter(parsed);
      // 如果有头像数据，设置预览
      if (parsed.avatar) {
        setAvatarPreview(parsed.avatar);
      }
      setCharacter(JSON.parse(tempChar));
    }
  }, []);

  if (!mounted || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">加载中...</div>
          <div className="text-gray-600">正在准备角色卡</div>
        </div>
      </div>
    );
  }

  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  // 应用背景属性加值
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
  const classData = CLASSES.find(c => c.name === character.class);
  const backgroundData = BACKGROUNDS.find(b => b.name === character.background);
  const speciesData = SPECIES.find(s => s.name === character.species);

  const parseItemWithQuantity = (raw: string): { name: string; quantity: number } => {
    const trimmed = (raw || '').trim();
    if (!trimmed) return { name: '', quantity: 0 };

    // 形如：飞镖（10支）——只把“（数字支）”当成数量
    const parenQty = trimmed.match(/^(.+?)（(\d+)支）$/);
    if (parenQty) {
      return { name: parenQty[1].trim(), quantity: Number(parenQty[2]) || 1 };
    }

    // 形如：20支弩矢 / 20支箭
    const prefixQty = trimmed.match(/^(\d+)\s*支(.+)$/);
    if (prefixQty) {
      return { name: prefixQty[2].trim(), quantity: Number(prefixQty[1]) || 1 };
    }

    // 形如：物品×2 / 物品x2
    const timesQty = trimmed.match(/^(.+?)\s*[x×]\s*(\d+)$/i);
    if (timesQty) {
      return { name: timesQty[1].trim(), quantity: Number(timesQty[2]) || 1 };
    }

    return { name: trimmed, quantity: 1 };
  };

  const addCount = (map: Record<string, number>, name: string, qty: number) => {
    if (!name || qty <= 0) return;
    map[name] = (map[name] || 0) + qty;
  };

  // 计算战斗数据
  const constitutionMod = getAbilityModifier(finalAbilities.constitution);
  const hitDie = classData?.hitDie || 8;
  let maxHP = hitDie + constitutionMod;
  
  // 检查专长对生命值的影响
  if (character.feats?.includes('tough')) {
    const level = character.level || 1;
    const toughBonus = level * 2;
    maxHP += toughBonus;
  }
  
  // 检查物种特性对生命值的影响
  const speciesHPBonus = calculateSpeciesHPBonus(character);
  maxHP += speciesHPBonus;
  
  // 检查职业特性对生命值的影响
  const classFeatureHPBonus = calculateClassFeatureHPBonus(character);
  maxHP += classFeatureHPBonus;
  
  const dexterityMod = getAbilityModifier(finalAbilities.dexterity);
  
  // 计算AC，考虑护甲
  const equipment = character.equipment || [];
  
  // 查找装备中的护甲和盾牌
  let equippedArmor: typeof ARMORS[0] | null = null;
  let hasShield = false;
  
  for (const item of equipment) {
    const armor = getArmorByName(item);
    if (armor) {
      if (armor.category === '盾牌') {
        hasShield = true;
      } else if (!equippedArmor) {
        // 只使用第一个找到的护甲（不能同时穿多件护甲）
        equippedArmor = armor;
      }
    }
  }
  
  // 获取实际的护甲熟练项（考虑职业特性选择）
  const getActualArmorProficiencies = (): string[] => {
    if (!classData) return [];
    let armorProfs = [...(classData.proficiencies.armor || [])];
    
    // 检查职业特性选择（如守护者获得重甲熟练）
    if (character.classFeatureChoices) {
      const divineOrder = character.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && character.class === '牧师') {
        // 守护者获得重甲熟练
        if (!armorProfs.includes('重甲')) {
          armorProfs.push('重甲');
        }
      }
    }
    
    return armorProfs;
  };
  
  // 检查是否有护甲熟练
  const armorProficiencies = getActualArmorProficiencies();
  let isProficientWithArmor = false;
  
  if (equippedArmor) {
    // 检查是否熟练该护甲类别
    const armorCategory = equippedArmor.category;
    isProficientWithArmor = armorProficiencies.some(prof => {
      if (prof === '轻甲' && armorCategory === '轻甲') return true;
      if (prof === '中甲' && armorCategory === '中甲') return true;
      if (prof === '重甲' && armorCategory === '重甲') return true;
      if (prof === '盾牌' && armorCategory === '盾牌') return true;
      return false;
    });
  }
  
  // 检查职业特性对AC的影响
  let unarmoredDefenseBonus: number | undefined = undefined;
  let fightingStyleDefense = false;
  let featACBonus = 0;
  
  // 获取职业特性（提前获取，用于AC计算）
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;
  
  // 检查术士龙裔血统：未穿护甲时AC = 13 + 敏捷调整值
  let draconicResilience = false;
  if (character.class === '术士' && !equippedArmor && character.classFeatureChoices?.sorcerousOrigin === 'draconicBloodline') {
    draconicResilience = true;
  }
  
  // 检查无甲防御（野蛮人：体质调整值，武僧：感知调整值）
  if (classFeatures && !equippedArmor && !draconicResilience) {
    const unarmoredDefense = classFeatures.level1Features?.find(f => f.id === 'unarmored-defense');
    if (unarmoredDefense) {
      if (character.class === '野蛮人') {
        // 野蛮人：10 + 敏捷调整值 + 体质调整值（可以使用盾牌）
        unarmoredDefenseBonus = constitutionMod;
      } else if (character.class === '武僧') {
        // 武僧：10 + 敏捷调整值 + 感知调整值（不能使用盾牌）
        if (!hasShield) {
          const wisdomMod = getAbilityModifier(finalAbilities.wisdom);
          unarmoredDefenseBonus = wisdomMod;
        }
      }
    }
  }
  
  // 检查战士的防御战斗风格（穿着护甲时AC+1）
  if (character.class === '战士' && equippedArmor && character.classFeatureChoices?.fightingStyle === 'defense') {
    fightingStyleDefense = true;
  }
  
  // 检查专长对AC的影响（需要先获取equippedWeapons）
  let mediumArmorMaster = false;
  
  // 获取装备信息（提前获取，用于武器提取）
  const equipmentData = backgroundData ? BACKGROUND_EQUIPMENT.find(e => e.backgroundId === backgroundData.id) : null;
  const selectedEquipment = character.backgroundEquipmentChoice === 'A' ? equipmentData?.optionA : 
                            character.backgroundEquipmentChoice === 'B' ? equipmentData?.optionB : null;
  
  // 从装备中提取武器，或使用用户选择的武器（提前处理，用于AC计算）
  const equippedWeapons = [];
  
  // 优先使用用户选择的武器
  if (character.equippedWeapons && character.equippedWeapons.length > 0) {
    for (const weaponId of character.equippedWeapons) {
      const weapon = WEAPONS.find(w => w.id === weaponId);
      if (weapon) {
        equippedWeapons.push({ weapon, quantity: 1 });
      }
    }
  }
  // 如果没有用户选择的武器，从背景装备中提取
  else if (selectedEquipment && typeof selectedEquipment === 'object' && 'items' in selectedEquipment) {
    const items = (selectedEquipment as { items?: unknown }).items;
    if (Array.isArray(items)) {
      for (const rawItem of items) {
        if (!rawItem || typeof rawItem !== 'object') continue;
        const name = (rawItem as { name?: unknown }).name;
        const quantity = (rawItem as { quantity?: unknown }).quantity;
        if (typeof name !== 'string') continue;
        const weapon = getWeaponByName(name);
        if (weapon) {
          equippedWeapons.push({ weapon, quantity: typeof quantity === 'number' ? quantity : 1 });
        }
      }
    }
  }
  
  if (character.feats) {
    // 双持武器者：当双持武器时，AC+1
    if (character.feats.includes('dual-wielder') && equippedWeapons.length >= 2) {
      featACBonus += 1;
    }
    // 中甲大师：穿着中甲时，可以将最多3点（而非2点）的敏捷调整值加到AC
    if (character.feats.includes('medium-armor-master')) {
      mediumArmorMaster = true;
    }
    // 防御决斗者：使用反应将熟练加值加到AC上（这里只计算基础AC，反应时使用需要单独处理）
  }
  
  // 使用calculateAC函数计算最终AC
  const baseAC = calculateAC(
    10 + dexterityMod, 
    equippedArmor, 
    hasShield, 
    dexterityMod, 
    isProficientWithArmor,
    unarmoredDefenseBonus,
    fightingStyleDefense,
    featACBonus,
    mediumArmorMaster,
    draconicResilience
  );
  
  // 计算先攻，考虑专长影响
  let initiative = dexterityMod;
  if (character.feats?.includes('alert')) {
    // 警觉专长：在先攻检定中获得熟练加值的加值
    initiative += profBonus;
  }
  
  // 计算移动速度，考虑物种选择（如木精灵35尺）和专长
  let speed = getSpeciesBaseSpeed(character);
  
  // 检查专长对速度的影响
  if (character.feats?.includes('mobile')) {
    // 移动专长：你的速度增加10尺
    speed += 10;
  }
  
  // 获取物种子类型显示（如"精灵 - 木精灵"）
  let speciesDisplay = character.species || '未选择';
  if (character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.lineage) {
        const lineageMatch = speciesChoices.lineage.match(/^([^（]+)/);
        if (lineageMatch && lineageMatch[1].trim()) {
          // 只有当lineage匹配成功且不为空时才拼接
          speciesDisplay = `${character.species} - ${lineageMatch[1].trim()}`;
        }
      }
    } catch (e) {
      // 解析失败，使用基础物种名
    }
  }
  // 确保speciesDisplay不为空或无效字符串
  if (!speciesDisplay || speciesDisplay.trim() === '' || speciesDisplay.length < 2) {
    speciesDisplay = character.species || '未选择';
  }
  
  // 计算其他属性调整值（constitutionMod和dexterityMod已在前面计算）
  const strengthMod = getAbilityModifier(finalAbilities.strength);
  const intelligenceMod = getAbilityModifier(finalAbilities.intelligence);
  const wisdomMod = getAbilityModifier(finalAbilities.wisdom);
  const charismaMod = getAbilityModifier(finalAbilities.charisma);
  
  // 被动察觉 = 10 + 感知调整值 + (如果熟练察觉技能，则加上熟练加值)
  const passivePerception = 10 + wisdomMod + (character.skills?.includes('察觉') ? profBonus : 0);

  const skills = character.skills || [];
  
  // 获取实际的武器熟练项（考虑职业特性选择）
  const getActualWeaponProficiencies = (): string[] => {
    if (!classData) return [];
    let weaponProfs = [...(classData.proficiencies.weapons || [])];
    
    // 检查职业特性选择（如守护者获得军用武器）
    if (character.classFeatureChoices) {
      const divineOrder = character.classFeatureChoices.divineOrder;
      if (divineOrder === 'protector' && character.class === '牧师') {
        // 守护者获得军用武器熟练
        if (!weaponProfs.includes('军用武器')) {
          weaponProfs.push('军用武器');
        }
      }
    }
    
    return weaponProfs;
  };
  
  // 检查武器熟练（检查职业武器熟练）
  const isWeaponProficient = (weapon: { category: string; name: string }) => {
    if (!classData) return false;
    const weaponProfs = getActualWeaponProficiencies();
    
    // 首先检查具体武器名称（如法师的'匕首', '飞镖', '投石索', '木棍', '轻弩'）
    if (weaponProfs.includes(weapon.name)) {
      return true;
    }
    
    // 检查是否包含"简易武器"或"军用武器"（通用熟练）
    if (weaponProfs.includes('简易武器') && (weapon.category.includes('简易近战') || weapon.category.includes('简易远程'))) {
      return true;
    }
    if (weaponProfs.includes('军用武器') && (weapon.category.includes('军用近战') || weapon.category.includes('军用远程'))) {
      return true;
    }
    
    // 检查武器类别是否匹配（如果职业熟练项中有包含"简易"或"军用"的项）
    if (weapon.category.includes('简易') && weaponProfs.some(w => w.includes('简易') || w === '简易武器')) {
      return true;
    }
    if (weapon.category.includes('军用') && weaponProfs.some(w => w.includes('军用') || w === '军用武器')) {
      return true;
    }
    
    return false;
  };

  return (
    <>
      <div className="bg-white">
        {/* 第1页 */}
        <div className="w-full max-w-[210mm] mx-auto p-4 md:p-8 bg-white shadow-2xl page-break-after flex flex-col">
          {/* 页眉 */}
          <div className="border-b-4 border-red-600 pb-3 md:pb-4 mb-4 md:mb-6">
            <div className="flex justify-between gap-4">
              {/* 左侧：角色信息和详情 */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 break-words flex-1">{character.name || '未命名角色'}</h1>
                  <span className="text-lg md:text-2xl font-bold text-gray-700 flex-shrink-0">等级 {character.level || 1}</span>
                </div>
                <div className="space-y-1 text-xs md:text-sm text-gray-700">
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <span>
                      <span className="font-medium text-gray-600">职业：</span>
                      <span>{character.class || '未选择'}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span>
                      <span className="font-medium text-gray-600">种族：</span>
                      <span>{speciesDisplay}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <span>
                      <span className="font-medium text-gray-600">背景：</span>
                      <span>{character.background || '未选择'}</span>
                    </span>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <span>
                      <span className="font-medium text-gray-600">阵营：</span>
                      <span>{(() => {
                        if (!character.alignment) return '未选择阵营';
                        // 如果存储的是ID（如"ng"），查找对应的中文名称
                        const alignment = ALIGNMENTS.find(a => a.id === character.alignment || a.name === character.alignment);
                        return alignment ? alignment.name : character.alignment;
                      })()}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 右侧：头像框 */}
              <div className="flex-shrink-0 flex flex-col justify-between h-full">
                <label className="w-20 h-20 md:w-24 md:h-24 rounded-lg border-2 border-gray-300 bg-gray-50 overflow-hidden flex-shrink-0 cursor-pointer hover:border-red-400 transition-colors">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="角色头像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result as string;
                          setAvatarPreview(base64String);
                          // 更新角色数据
                          const updatedCharacter = { ...character, avatar: base64String };
                          setCharacter(updatedCharacter);
                          // 保存到localStorage
                          const tempChar = localStorage.getItem('temp-character-for-sheet');
                          if (tempChar) {
                            const parsed = JSON.parse(tempChar);
                            parsed.avatar = base64String;
                            localStorage.setItem('temp-character-for-sheet', JSON.stringify(parsed));
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 核心属性 - 响应式布局：手机2栏（左：属性+战斗 | 右：技能），桌面3栏 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 mb-2 md:mb-4">
            {/* 左栏：属性值和战斗数据 */}
            <div className="col-span-1 flex flex-col h-full">
              {/* 上半部分：属性值+熟练值+战斗数据 */}
              <div className="flex flex-col space-y-1.5 md:space-y-2">
                {/* 属性值 */}
                <div className="flex-shrink-0">
                  <h2 className="text-xs md:text-lg font-bold bg-red-100 text-red-900 px-1 md:px-3 py-0.5 md:py-2 rounded-t border-b-2 border-red-600">
                    属性值
                  </h2>
                  <div className="border-2 border-red-200 rounded-b p-0.5 md:p-2">
                    {/* 两列布局 */}
                    <div className="grid grid-cols-2 gap-1 md:gap-1.5">
                      {[
                        { key: 'strength', name: '力量', abbr: 'STR' },
                        { key: 'dexterity', name: '敏捷', abbr: 'DEX' },
                        { key: 'constitution', name: '体质', abbr: 'CON' },
                        { key: 'intelligence', name: '智力', abbr: 'INT' },
                        { key: 'wisdom', name: '感知', abbr: 'WIS' },
                        { key: 'charisma', name: '魅力', abbr: 'CHA' },
                      ].map((ability) => {
                        const score = finalAbilities[ability.key as keyof typeof finalAbilities];
                        const modifier = getAbilityModifier(score);
                        const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        
                        return (
                          <div key={ability.key} className="bg-gray-50 p-0.5 md:p-1 rounded flex flex-col items-center">
                            <div className="w-6 h-6 md:w-10 md:h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-lg mb-0.5 flex-shrink-0">
                              {modStr}
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-xs text-gray-900 leading-tight">{ability.name} {ability.abbr}</div>
                              <div className="text-xs text-gray-500 leading-tight">{score}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* 熟练加值 - 移到属性值下方 */}
                    <div className="mt-1 md:mt-2 pt-1 border-t-2 border-red-300">
                      <div className="text-center bg-red-50 rounded p-0.5 md:p-1.5">
                        <div className="text-xs text-red-700 mb-0 leading-tight">熟练加值</div>
                        <div className="text-sm md:text-xl font-bold text-red-600 leading-tight">+{profBonus}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 战斗数据 */}
                <div className="flex-shrink-0">
                  <h2 className="text-xs md:text-lg font-bold bg-blue-100 text-blue-900 px-1 md:px-3 py-0.5 md:py-2 rounded-t border-b-2 border-blue-600">
                    战斗数据
                  </h2>
                  <div className="border-2 border-blue-200 rounded-b p-0.5 md:p-1.5 space-y-0.5">
                    <div className="text-center bg-blue-50 rounded p-0.5 md:p-1.5">
                      <div className="text-xs text-blue-700 leading-tight">生命值</div>
                      <div className="text-sm md:text-xl font-bold text-blue-900 leading-tight">{maxHP}</div>
                      <div className="text-xs text-blue-600 leading-tight">HD: 1d{hitDie}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-0.5 md:gap-1">
                      <div className="text-center bg-gray-50 rounded p-0.5 md:p-1">
                        <div className="text-xs text-gray-600 leading-tight">AC</div>
                        <div className="text-xs md:text-lg font-bold text-gray-900 leading-tight">{baseAC}</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-0.5 md:p-1">
                        <div className="text-xs text-gray-600 leading-tight">先攻</div>
                        <div className="text-xs md:text-lg font-bold text-gray-900 leading-tight">
                          {initiative >= 0 ? '+' : ''}{initiative}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-0.5 md:gap-1">
                      <div className="text-center bg-gray-50 rounded p-0.5 md:p-1">
                        <div className="text-xs text-gray-600 leading-tight">速度</div>
                        <div className="text-xs md:text-sm font-bold text-gray-900 leading-tight">{speed} 尺</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-0.5 md:p-1">
                        <div className="text-xs text-gray-600 leading-tight">被动察觉</div>
                        <div className="text-xs md:text-sm font-bold text-gray-900 leading-tight">{passivePerception}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下半部分：豁免检定 */}
              <div className="flex-shrink-0 mt-1.5 md:mt-2">
                <h2 className="text-xs md:text-lg font-bold bg-green-100 text-green-900 px-1 md:px-3 py-0.5 md:py-2 rounded-t border-b-2 border-green-600">
                  豁免检定
                </h2>
                <div className="border-2 border-green-200 rounded-b p-0.5 md:p-1.5 space-y-0.5">
                  {[
                    { key: 'strength', name: '力量' },
                    { key: 'dexterity', name: '敏捷' },
                    { key: 'constitution', name: '体质' },
                    { key: 'intelligence', name: '智力' },
                    { key: 'wisdom', name: '感知' },
                    { key: 'charisma', name: '魅力' },
                  ].map((save) => {
                    const score = finalAbilities[save.key as keyof typeof finalAbilities];
                    const modifier = getAbilityModifier(score);
                    const isProficient = classData?.savingThrows?.includes(save.name) || false;
                    const totalBonus = modifier + (isProficient ? profBonus : 0);
                    const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
                    
                    return (
                      <div key={save.key} className={`flex items-center justify-between p-0.5 md:p-2 rounded text-xs ${
                        isProficient ? 'bg-green-50 font-bold' : 'bg-white'
                      }`}>
                        <div className="flex items-center gap-1 md:gap-2">
                          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                            isProficient ? 'bg-green-500' : 'border-2 border-gray-300'
                          }`}></div>
                          <span className="text-xs">{save.name}</span>
                        </div>
                        <span className={`text-xs flex-shrink-0 ${isProficient ? 'text-green-700' : 'text-gray-600'}`}>
                          {bonusStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右栏：技能、语言和熟练项 */}
            <div className="col-span-1 lg:col-span-1 flex flex-col h-full">
              {/* 上半部分：技能 */}
              <div className="flex-shrink-0">
                <h2 className="text-xs md:text-lg font-bold bg-purple-100 text-purple-900 px-1 md:px-3 py-0.5 md:py-2 rounded-t border-b-2 border-purple-600">
                  技能 ({skills.length} 项熟练)
                </h2>
                <div className="border-2 border-purple-200 rounded-b p-0.5 md:p-2 space-y-0.5 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {SKILLS.map((skill) => {
                    const isProficient = skills.includes(skill.name);
                    const abilityScore = finalAbilities[skill.ability as keyof typeof finalAbilities];
                    const abilityMod = getAbilityModifier(abilityScore);
                    const totalBonus = abilityMod + (isProficient ? profBonus : 0);
                    const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
                    
                    return (
                      <div key={skill.id} className={`flex items-center justify-between p-0.5 md:p-1.5 rounded text-xs ${
                        isProficient ? 'bg-purple-50 font-bold' : 'bg-white'
                      }`}>
                        <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                            isProficient ? 'bg-purple-500' : 'border-2 border-gray-300'
                          }`}></div>
                          <span className="truncate text-xs">{skill.name}</span>
                          <span className="text-gray-400 flex-shrink-0 text-xs hidden sm:inline">({skill.ability.substring(0, 3).toUpperCase()})</span>
                        </div>
                        <span className={`flex-shrink-0 ml-1 text-xs ${isProficient ? 'text-purple-700' : 'text-gray-500'}`}>
                          {bonusStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 下半部分：语言和熟练项 */}
              <div className="flex-shrink-0 flex flex-col space-y-1.5 md:space-y-2 mt-1.5 md:mt-2">
                {/* 语言 */}
                {character.languages && character.languages.length > 0 ? (
                  <div className="flex-shrink-0">
                    <h2 className="text-xs md:text-sm font-bold bg-blue-100 text-blue-900 px-1.5 md:px-3 py-1 md:py-2 rounded-t border-b-2 border-blue-600">
                      语言
                    </h2>
                    <div className="border-2 border-blue-200 rounded-b p-1 md:p-2">
                      <div className="flex flex-wrap gap-1 md:gap-1.5">
                        {character.languages.map((langId) => {
                          const lang = getLanguageById(langId);
                          return (
                            <span key={langId} className="px-1 md:px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded text-xs border border-blue-200">
                              {lang?.name || langId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <h2 className="text-xs md:text-sm font-bold bg-blue-100 text-blue-900 px-1.5 md:px-3 py-1 md:py-2 rounded-t border-b-2 border-blue-600">
                      语言
                    </h2>
                    <div className="border-2 border-blue-200 rounded-b p-1 md:p-2 text-xs text-gray-500 text-center">
                      无语言
                    </div>
                  </div>
                )}

                {/* 熟练项 */}
                <div className="flex-shrink-0">
                  <h2 className="text-xs md:text-sm font-bold bg-gray-100 text-gray-900 px-1.5 md:px-3 py-1 md:py-2 rounded-t border-b-2 border-gray-600">
                    熟练项
                  </h2>
                  <div className="border-2 border-gray-200 rounded-b p-1.5 md:p-2 space-y-1 text-xs">
                    {classData?.proficiencies ? (
                      <>
                        <div>
                          <span className="font-bold text-gray-700">护甲：</span>
                          <span className="text-gray-600">{classData.proficiencies.armor?.join(', ') || '无'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-700">武器：</span>
                          <span className="text-gray-600">{classData.proficiencies.weapons?.join(', ') || '无'}</span>
                        </div>
                        {backgroundData?.toolProficiency && (
                          <div>
                            <span className="font-bold text-gray-700">工具：</span>
                            <span className="text-gray-600">{backgroundData.toolProficiency}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 text-center">无熟练项</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 页脚 */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-2 mt-2">
            第 1 页 - D&D 2024 角色卡
          </div>
        </div>

        {/* 第2页 */}
        <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 md:p-8 bg-white shadow-2xl">
          {/* 页眉 */}
          <div className="border-b-2 border-gray-400 pb-2 md:pb-3 mb-3 md:mb-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{character.name || '未命名角色'}</h2>
                <div className="text-xs md:text-sm text-gray-600">{character.class} • {character.species}</div>
              </div>
              <div className="text-right text-xs text-gray-500 ml-2">
                第 2 页
              </div>
            </div>
          </div>

          {/* 1. 职业特性 */}
          {classFeatures ? (
            <div className="mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold bg-red-100 text-red-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-red-600">
                职业特性（1级）
              </h2>
              <div className="border-2 border-red-200 rounded-b p-3 md:p-4 space-y-2 md:space-y-3">
                {/* 武器精通（所有职业的默认特性） */}
                {classFeatures.weaponMastery && (
                  <div className="bg-red-50 rounded p-3 border border-red-300">
                    <div className="font-bold text-red-900 text-sm mb-1">
                      {classFeatures.weaponMastery.name} ({classFeatures.weaponMastery.nameEn})
                    </div>
                    <div className="text-xs text-red-800 mb-2">{classFeatures.weaponMastery.description}</div>
                    {classFeatures.weaponMastery.selectableWeapons && (
                      <div className="text-xs text-red-700 bg-white rounded px-2 py-1">
                        <strong>可选武器：</strong>{classFeatures.weaponMastery.selectableWeapons.join('、')}
                      </div>
                    )}
                  </div>
                )}
                
                {/* 所有1级职业特性（包括默认特性） */}
                {classFeatures.level1Features.map((feature) => {
                  // 检查是否是用户选择的特性（有选择选项的）
                  const featureChoices = classData ? ((classData as any)?.featureChoices || []) : [];
                  const isSelectableFeature = featureChoices.some((fc: any) => fc.id === feature.id);
                  const selectedOption = isSelectableFeature ? 
                    (character.classFeatureChoices?.[feature.id] as string) : null;
                  
                  return (
                    <div key={feature.id} className="bg-blue-50 rounded p-3 border border-blue-300">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-blue-900 text-sm">
                          {feature.name} ({feature.nameEn})
                        </div>
                        {selectedOption && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                            已选择：{(() => {
                              const fc = featureChoices.find((f: any) => f.id === feature.id);
                              const option = fc?.options.find((o: any) => o.id === selectedOption);
                              return option?.name || selectedOption;
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-800 mb-2">{feature.description}</div>
                      {feature.details && feature.details.length > 0 && (
                        <ul className="space-y-1 text-xs text-blue-700 pl-3">
                          {feature.details.map((detail, index) => (
                            <li key={index} className="list-disc">{detail}</li>
                          ))}
                        </ul>
                      )}
                      {/* 如果用户选择了选项，显示选择的详细信息 */}
                      {selectedOption && (() => {
                        const fc = featureChoices.find((f: any) => f.id === feature.id);
                        const option = fc?.options.find((o: any) => o.id === selectedOption);
                        if (option) {
                          return (
                            <div className="mt-2 pt-2 border-t border-blue-300">
                              <div className="text-xs font-semibold text-orange-800 mb-1">
                                {option.name}
                              </div>
                              {option.description && (
                                <div className="text-xs text-orange-700 mb-2">{option.description}</div>
                              )}
                              {option.benefits && option.benefits.length > 0 && (
                                <ul className="space-y-1 text-xs text-orange-700">
                                  {option.benefits.map((benefit: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-orange-600 mt-0.5">•</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-lg font-bold bg-red-100 text-red-900 px-3 py-2 rounded-t border-b-2 border-red-600">
                职业特性（1级）
              </h2>
              <div className="border-2 border-red-200 rounded-b p-4">
                <div className="text-sm text-gray-500 text-center py-4">
                  该职业的职业特性数据暂未完整，请参考D&D 2024规则书
                </div>
              </div>
            </div>
          )}

          {/* 2. 专长 */}
          {(() => {
            // 过滤掉背景专长和物种特性专长，只显示用户额外选择的专长
            const backgroundFeatId = backgroundData?.featId;
            // 检查是否是提供专长的物种（目前只有人类）
            const providesFeat = speciesData?.name === '人类';
            // 物种特性专长 = 所有专长 - 背景专长
            const speciesFeatIds = providesFeat 
              ? character.feats?.filter(featId => featId !== backgroundFeatId) || []
              : [];
            // 用户额外选择的专长 = 所有专长 - 背景专长 - 物种特性专长
            const userFeats = character.feats?.filter(featId => 
              featId !== backgroundFeatId && !speciesFeatIds.includes(featId)
            ) || [];
            
            return userFeats.length > 0 ? (
              <div className="mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-bold bg-purple-100 text-purple-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-purple-600">
                  专长
                </h2>
                <div className="border-2 border-purple-200 rounded-b p-3 md:p-4 space-y-2 md:space-y-3">
                  {userFeats.map((featId) => {
                    const feat = getFeatById(featId);
                    return feat ? (
                      <div key={featId} className="bg-purple-50 rounded p-3 border border-purple-300">
                        <div className="font-bold text-purple-900 text-sm mb-1">{feat.name} ({feat.nameEn})</div>
                        <div className="text-xs text-purple-800 mb-2">{feat.description}</div>
                        {feat.benefits && feat.benefits.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-semibold text-purple-800 mb-1">效果：</div>
                            <ul className="space-y-1 text-xs text-purple-700">
                              {feat.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-purple-600 mt-0.5">•</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feat.prerequisite && (
                          <div className="text-xs text-gray-600 mt-2 italic">
                            前置条件：{feat.prerequisite}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ) : null;
          })()}

          {/* 3. 物种特性 */}
          {speciesData && (
            <div className="mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold bg-green-100 text-green-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-green-600">
                物种特性
              </h2>
              <div className="border-2 border-green-200 rounded-b p-3 md:p-4 space-y-2 text-xs md:text-sm">
                <div className="font-bold text-green-900 mb-2">{speciesData.name}</div>
                {speciesData.traits && speciesData.traits.length > 0 && (
                  <div className="space-y-2">
                    {speciesData.traits.map((trait: any, index: number) => (
                      <div key={index} className="bg-green-50 rounded p-2 border border-green-300">
                        <div className="font-semibold text-green-800 text-sm">
                          {typeof trait === 'string' ? trait : trait.name}
                        </div>
                        {typeof trait === 'object' && trait.description && (
                          <div className="text-xs text-gray-700 mt-1">{trait.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {character.classFeatureChoices?.speciesChoices && (
                  <div className="mt-3 pt-3 border-t border-green-300 space-y-2">
                    {(() => {
                      try {
                        const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
                        // 显示选择的技能（如果有）
                        if (speciesChoices.skill) {
                          // 提取技能名称（去掉括号和后面的内容）
                          const skillMatch = speciesChoices.skill.match(/^([^（]+)/);
                          const skillName = skillMatch ? skillMatch[1].trim() : speciesChoices.skill;
                          return (
                            <div className="bg-green-50 rounded p-2 border border-green-300">
                              <span className="font-semibold text-green-800">技能熟练：</span>
                              <span className="text-gray-700 ml-2">{skillName}</span>
                            </div>
                          );
                        }
                        // 显示选择的血统（如果有）
                        if (speciesChoices.lineage) {
                          return (
                            <div className="bg-green-50 rounded p-2 border border-green-300">
                              <span className="font-semibold text-green-800">选择的血统：</span>
                              <span className="text-gray-700 ml-2">{speciesChoices.lineage}</span>
                            </div>
                          );
                        }
                        return null;
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                )}
                {/* 显示物种特性获得的专长（如人类的多才多艺） */}
                {(() => {
                  // 检查是否是提供专长的物种（目前只有人类）
                  const providesFeat = speciesData.name === '人类';
                  if (!providesFeat) return null;
                  
                  // 获取背景专长ID
                  const backgroundFeatId = backgroundData?.featId;
                  
                  // 找出物种特性获得的专长（排除背景专长）
                  const speciesFeats = character.feats?.filter(featId => featId !== backgroundFeatId) || [];
                  
                  if (speciesFeats.length === 0) return null;
                  
                  return (
                    <div className="mt-3 pt-3 border-t border-green-300 space-y-2">
                      {speciesFeats.map((featId) => {
                        const feat = getFeatById(featId);
                        if (!feat) return null;
                        return (
                          <div key={featId} className="bg-green-50 rounded p-3 border border-green-300">
                            <div className="font-semibold text-green-800 mb-1">
                              专长：{feat.name} ({feat.nameEn})
                            </div>
                            <div className="text-xs text-gray-700 mb-2">{feat.description}</div>
                            {feat.benefits && feat.benefits.length > 0 && (
                              <div className="mt-2">
                                <div className="text-xs font-semibold text-green-800 mb-1">效果：</div>
                                <ul className="space-y-1 text-xs text-gray-700">
                                  {feat.benefits.map((benefit: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-green-600 mt-0.5">•</span>
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {feat.prerequisite && (
                              <div className="text-xs text-gray-600 mt-2 italic">
                                前置条件：{feat.prerequisite}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 4. 背景信息 */}
          {backgroundData && (
            <div className="mb-3 md:mb-4">
              <h2 className="text-base md:text-lg font-bold bg-orange-100 text-orange-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-orange-600">
                背景信息
              </h2>
              <div className="border-2 border-orange-200 rounded-b p-3 md:p-4 space-y-2 text-xs md:text-sm">
                <div className="font-bold text-orange-900 mb-2">{backgroundData.name}</div>
                {(backgroundData as any).narrative && (
                  <div className="text-gray-700 mb-3 text-sm">{(backgroundData as any).narrative}</div>
                )}
                {backgroundData.skills && backgroundData.skills.length > 0 && (
                  <div className="bg-orange-50 rounded p-2 border border-orange-300">
                    <span className="font-semibold text-orange-800">技能熟练：</span>
                    <span className="text-gray-700 ml-2">{backgroundData.skills.join('、')}</span>
                  </div>
                )}
                {/* 显示背景提供的专长 */}
                {(() => {
                  const backgroundFeatId = (backgroundData as any).featId;
                  if (backgroundFeatId) {
                    const feat = getFeatById(backgroundFeatId);
                    if (feat) {
                      return (
                        <div className="bg-orange-50 rounded p-3 border border-orange-300 mt-2">
                          <div className="font-semibold text-orange-800 mb-1">
                            专长：{feat.name} ({feat.nameEn})
                          </div>
                          <div className="text-xs text-gray-700 mb-2">{feat.description}</div>
                          {feat.benefits && feat.benefits.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs font-semibold text-orange-800 mb-1">效果：</div>
                              <ul className="space-y-1 text-xs text-gray-700">
                                {feat.benefits.map((benefit: string, index: number) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-orange-600 mt-0.5">•</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feat.prerequisite && (
                            <div className="text-xs text-gray-600 mt-2 italic">
                              前置条件：{feat.prerequisite}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }
                  // 兼容旧的feats数组格式
                  if (backgroundData.feats && backgroundData.feats.length > 0) {
                    return (
                      <div className="space-y-2 mt-2">
                        {backgroundData.feats.map((featId: string) => {
                          const feat = getFeatById(featId);
                          if (!feat) return null;
                          return (
                            <div key={featId} className="bg-orange-50 rounded p-3 border border-orange-300">
                              <div className="font-semibold text-orange-800 mb-1">
                                专长：{feat.name} ({feat.nameEn})
                              </div>
                              <div className="text-xs text-gray-700 mb-2">{feat.description}</div>
                              {feat.benefits && feat.benefits.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-semibold text-orange-800 mb-1">效果：</div>
                                  <ul className="space-y-1 text-xs text-gray-700">
                                    {feat.benefits.map((benefit: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-orange-600 mt-0.5">•</span>
                                        <span>{benefit}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {feat.prerequisite && (
                                <div className="text-xs text-gray-600 mt-2 italic">
                                  前置条件：{feat.prerequisite}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* 5. 武器 */}
          {equippedWeapons.length > 0 ? (
            <div className="mb-3 md:mb-4">
              <h2 className="text-xs md:text-sm font-bold bg-purple-100 text-purple-900 px-2 py-1 rounded-t border-b border-purple-600">
                ⚔️ 武器
              </h2>
              <div className="border border-purple-200 rounded-b p-2 space-y-1.5">
                {equippedWeapons.map((item, index) => {
                  const { weapon, quantity } = item;
                  const isProficient = isWeaponProficient(weapon);
                  const attackBonus = calculateWeaponAttackBonus(
                    weapon,
                    strengthMod,
                    dexterityMod,
                    profBonus,
                    isProficient
                  );
                  
                  // 确定使用哪个属性调整值来计算伤害
                  let damageAbilityMod = strengthMod;
                  if (weapon.properties.includes('灵巧')) {
                    damageAbilityMod = Math.max(strengthMod, dexterityMod);
                  }
                  if (weapon.category.includes('远程')) {
                    damageAbilityMod = dexterityMod;
                  }
                  
                  const damageBonus = damageAbilityMod >= 0 ? `+${damageAbilityMod}` : `${damageAbilityMod}`;
                  const attackBonusStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
                  
                  return (
                    <div key={index} className="bg-white rounded border border-purple-300 p-1.5 md:p-2 text-xs">
                      {/* 紧凑布局：一行显示主要信息 */}
                      <div className="flex items-center justify-between gap-1.5 md:gap-2 mb-1">
                        <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
                          <div className="font-bold text-purple-900 text-xs md:text-sm truncate">
                            {weapon.name}
                            {quantity > 1 && <span className="text-xs ml-0.5 md:ml-1">×{quantity}</span>}
                          </div>
                          {!isProficient && (
                            <span className="text-xs bg-red-200 text-red-800 px-1 md:px-1.5 py-0.5 rounded flex-shrink-0">不熟练</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-xs text-purple-700">命中</div>
                            <div className="text-sm md:text-base font-bold text-purple-900">{attackBonusStr}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-red-700">伤害</div>
                            <div className="text-sm md:text-base font-bold text-red-900">{weapon.damage}{damageBonus}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* 第二行：类型、属性、精通（紧凑） */}
                      <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-600 flex-wrap">
                        <span className="truncate">{weapon.category}</span>
                        <span>•</span>
                        <span>{weapon.damageType}</span>
                        {weapon.properties.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500 truncate">{weapon.properties.join('、')}</span>
                          </>
                        )}
                        {weapon.mastery && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-700 font-medium truncate">
                              ✨ {weapon.mastery}: {weapon.masteryDescription}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-sm font-bold bg-purple-100 text-purple-900 px-2 py-1 rounded-t border-b border-purple-600">
                ⚔️ 武器
              </h2>
              <div className="border border-purple-200 rounded-b p-2">
                <div className="text-sm text-gray-500 text-center py-4">
                  当前没有装备武器
                  {selectedEquipment && character.backgroundEquipmentChoice === 'B' && (
                    <div className="text-xs text-gray-400 mt-2">
                      （选择了{(() => {
                        const gold =
                          selectedEquipment && 'gold' in selectedEquipment
                            ? Number((selectedEquipment as any).gold) || 0
                            : 0;
                        return gold;
                      })()}金币而非装备包）
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. 装备详情 */}
          <div className="mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-bold bg-yellow-100 text-yellow-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-yellow-600">
              装备详情
            </h2>
            <div className="border-2 border-yellow-200 rounded-b p-3 md:p-4">
              {(() => {
                // 背景金币（A=optionA.gold；B=optionB.gold）
                const backgroundGold =
                  selectedEquipment && 'gold' in selectedEquipment
                    ? Number((selectedEquipment as any).gold) || 0
                    : 0;

                // 背景装备明细（仅选项A有items）
                const backgroundItemCounts: Record<string, number> = {};
                const backgroundItemMeta: Record<string, { nameEn?: string }> = {};
                if (character.backgroundEquipmentChoice === 'A' && selectedEquipment && typeof selectedEquipment === 'object' && 'items' in selectedEquipment) {
                  const items = (selectedEquipment as { items?: unknown }).items;
                  if (Array.isArray(items)) {
                    for (const rawIt of items) {
                      if (!rawIt || typeof rawIt !== 'object') continue;
                      const name = (rawIt as { name?: unknown }).name;
                      const quantity = (rawIt as { quantity?: unknown }).quantity;
                      const nameEn = (rawIt as { nameEn?: unknown }).nameEn;
                      if (typeof name !== 'string') continue;
                      addCount(backgroundItemCounts, name, typeof quantity === 'number' ? quantity : 1);
                      backgroundItemMeta[name] = { nameEn: typeof nameEn === 'string' ? nameEn : undefined };
                    }
                  }
                }

                // 职业起始装备（从职业起始装备选项读取）
                const classItemCounts: Record<string, number> = {};
                const classStartingEquipment =
                  classData?.id && character.classStartingEquipment
                    ? getClassStartingEquipment(classData.id)
                    : undefined;
                const classStartingOption =
                  classStartingEquipment && character.classStartingEquipment
                    ? classStartingEquipment.options.find(opt => opt.id === character.classStartingEquipment)
                    : undefined;

                if (classStartingOption) {
                  // items（过滤“任意/任二”占位）
                  for (const raw of classStartingOption.items || []) {
                    const isWeaponPlaceholder =
                      raw.includes('简易武器（任意）') ||
                      raw.includes('简易武器(任意)') ||
                      raw.includes('军用武器（任意）') ||
                      raw.includes('军用武器(任意)') ||
                      raw.includes('军用武器（任二）') ||
                      raw.includes('军用武器(任二)');
                    if (isWeaponPlaceholder) {
                      continue;
                    }
                    const { name, quantity } = parseItemWithQuantity(raw);
                    addCount(classItemCounts, name, quantity);
                  }
                  // armor
                  for (const raw of classStartingOption.armor || []) {
                    const { name, quantity } = parseItemWithQuantity(raw);
                    addCount(classItemCounts, name, quantity);
                  }
                }

                // 角色物品栏中“额外添加/购买”的物品：只加入不属于起始装备的条目，避免重复计数
                const startingNames = new Set<string>();
                Object.keys(classItemCounts).forEach(n => startingNames.add(n));
                Object.keys(backgroundItemCounts).forEach(n => startingNames.add(n));

                const extraItemCounts: Record<string, number> = {};
                for (const raw of equipment || []) {
                  const { name, quantity } = parseItemWithQuantity(raw);
                  if (!name) continue;
                  if (startingNames.has(name)) continue;
                  addCount(extraItemCounts, name, quantity);
                }

                // 合并三类物品
                const mergedCounts: Record<string, number> = {};
                [classItemCounts, backgroundItemCounts, extraItemCounts].forEach((m) => {
                  Object.entries(m).forEach(([name, qty]) => addCount(mergedCounts, name, qty));
                });

                // 金额合计 = 职业起始装备金币 + 背景装备金币
                const classGold = classStartingOption?.gold ? Number(classStartingOption.gold) || 0 : 0;
                const totalAmount = classGold + backgroundGold;

                const mergedItems = Object.entries(mergedCounts)
                  .filter(([name, qty]) => !!name && qty > 0)
                  .sort(([a], [b]) => a.localeCompare(b, 'zh-CN'))
                  .map(([name, qty]) => ({
                    name,
                    quantity: qty,
                    nameEn: backgroundItemMeta[name]?.nameEn
                  }));

                if (!classStartingOption && !selectedEquipment && mergedItems.length === 0) {
                  return <div className="text-sm text-gray-500">尚未选择装备</div>;
                }

                return (
                  <div className="space-y-2">
                    <div className="font-bold text-yellow-900 mb-2">
                      物品栏（{mergedItems.length} 类）
                    </div>

                    {mergedItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {mergedItems.map((it) => {
                          const armor = getArmorByName(it.name);
                          return (
                            <div key={it.name} className="flex items-center gap-2 text-xs bg-white rounded p-2 border border-yellow-300">
                              <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {it.quantity}
                              </span>
                              {armor && <span className="text-yellow-600 text-xs flex-shrink-0">🛡️</span>}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-yellow-900 truncate">{it.name}</div>
                                {it.nameEn && (
                                  <div className="text-yellow-600 text-xs truncate">{it.nameEn}</div>
                                )}
                                {armor && (
                                  <div className="text-yellow-700 text-xs truncate">AC: {armor.ac}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">暂无物品</div>
                    )}

                    <div className="border-t border-yellow-300 pt-2 space-y-1">
                      {classStartingOption && (
                        <div className="text-xs text-yellow-800">
                          <strong>职业起始装备：</strong>{classData?.name || '—'} - {classStartingOption.name}
                          <span className="ml-2 text-yellow-700">（金币：{classGold} GP）</span>
                        </div>
                      )}
                      {selectedEquipment && character.backgroundEquipmentChoice && (
                        <div className="text-xs text-yellow-800">
                          <strong>背景起始装备：</strong>{backgroundData?.name || '—'} - 选项 {character.backgroundEquipmentChoice}
                          <span className="ml-2 text-yellow-700">（金额：{backgroundGold} GP）</span>
                        </div>
                      )}
                      {(classStartingOption || selectedEquipment) && (
                        <div className="text-xs text-yellow-900">
                          <strong>金额合计：</strong>{totalAmount.toFixed(2)} GP
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 页脚 */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-2 mt-4">
            第 2 页 - D&D 2024 角色卡 • 创建日期：{character.createdAt ? new Date(character.createdAt).toLocaleDateString('zh-CN') : ''}
          </div>
        </div>

        {/* 第3页 - 法术 */}
        {!!character.class && hasSpellcasting(character.class) && (
          <div className="w-full max-w-[210mm] min-h-[297mm] mx-auto p-4 md:p-8 bg-white shadow-2xl page-break-before">
            {/* 页眉 */}
            <div className="border-b-2 border-gray-400 pb-2 md:pb-3 mb-3 md:mb-4">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{character.name || '未命名角色'}</h2>
                  <div className="text-xs md:text-sm text-gray-600">{character.class} • {character.species}</div>
                </div>
                <div className="text-right text-xs text-gray-500 ml-2">
                  第 3 页
                </div>
              </div>
            </div>

            {/* 法术信息 */}
            <div className="space-y-4">
              {/* 施法规则摘要 */}
              {(() => {
                const spellcastingRules = getSpellcastingRules(
                  character.class,
                  character.level || 1,
                  character.classFeatureChoices
                );
                if (!spellcastingRules) return null;

                // 计算施法相关数值
                const spellcastingAbility = spellcastingRules.spellcastingAbility;
                const abilityKey = spellcastingAbility === '感知' ? 'wisdom' :
                                  spellcastingAbility === '智力' ? 'intelligence' :
                                  spellcastingAbility === '魅力' ? 'charisma' : 'intelligence';
                const abilityValue = finalAbilities[abilityKey as keyof typeof finalAbilities];
                const abilityMod = getAbilityModifier(abilityValue);
                const proficiencyBonus = getProficiencyBonus(character.level || 1);
                
                // 计算法术豁免难度（Spell Save DC）= 8 + 熟练加值 + 施法调整值
                const spellSaveDC = 8 + proficiencyBonus + abilityMod;
                
                // 计算法术命中加值（Spell Attack Bonus）= 熟练加值 + 施法调整值
                const spellAttackBonus = proficiencyBonus + abilityMod;

                return (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">施法规则</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <div className="text-purple-700 font-semibold">戏法数量</div>
                        <div className="text-purple-900 font-bold text-lg">{spellcastingRules.cantripsKnown}</div>
                      </div>
                      {character.class === '法师' && spellcastingRules.spellbookSpellsKnown !== undefined && (
                        <div>
                          <div className="text-purple-700 font-semibold">法术书法术</div>
                          <div className="text-purple-900 font-bold text-lg">{spellcastingRules.spellbookSpellsKnown}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-purple-700 font-semibold">准备法术</div>
                        <div className="text-purple-900 font-bold text-lg">{spellcastingRules.preparedSpells}</div>
                      </div>
                      {spellcastingRules.pactMagic ? (
                        <div>
                          <div className="text-purple-700 font-semibold">契约法术位</div>
                          <div className="text-purple-900 font-bold text-lg">
                            {spellcastingRules.pactMagic.slots}（{spellcastingRules.pactMagic.recoversOn}恢复，环阶{spellcastingRules.pactMagic.slotLevel}）
                          </div>
                        </div>
                      ) : spellcastingRules.spellSlots.level1 > 0 ? (
                        <div>
                          <div className="text-purple-700 font-semibold">1环法术位</div>
                          <div className="text-purple-900 font-bold text-lg">{spellcastingRules.spellSlots.level1}</div>
                        </div>
                      ) : null}
                      <div>
                        <div className="text-purple-700 font-semibold">施法属性</div>
                        <div className="text-purple-900 font-bold">{spellcastingRules.spellcastingAbility}</div>
                      </div>
                      <div>
                        <div className="text-purple-700 font-semibold">施法法器</div>
                        <div className="text-purple-900 font-bold">{spellcastingRules.spellcastingFocus}</div>
                      </div>
                    </div>
                    {/* 施法数值 */}
                    <div className="border-t border-purple-300 pt-3 mt-3">
                      <h4 className="text-base font-bold text-purple-900 mb-2">施法数值</h4>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-purple-700 font-semibold">施法调整值</div>
                          <div className="text-purple-900 font-bold text-lg">
                            {abilityMod >= 0 ? '+' : ''}{abilityMod}
                          </div>
                        </div>
                        <div>
                          <div className="text-purple-700 font-semibold">法术豁免难度</div>
                          <div className="text-purple-900 font-bold text-lg">{spellSaveDC}</div>
                        </div>
                        <div>
                          <div className="text-purple-700 font-semibold">法术命中加值</div>
                          <div className="text-purple-900 font-bold text-lg">
                            {spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 戏法列表 */}
              {(() => {
                const selectedCantrips = character.classFeatureChoices?.selectedCantrips
                  ? JSON.parse(character.classFeatureChoices.selectedCantrips as string)
                  : [];
                
                if (selectedCantrips.length === 0) return null;

                return (
                  <div className="mb-4">
                    <h2 className="text-base md:text-lg font-bold bg-purple-100 text-purple-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-purple-600">
                      戏法 ({selectedCantrips.length}个)
                    </h2>
                    <div className="border-2 border-purple-200 rounded-b p-3 md:p-4 space-y-3">
                      {selectedCantrips.map((spellId: string) => {
                        const spell = getSpellById(spellId);
                        if (!spell) return null;
                        return (
                          <div key={spellId} className="bg-purple-50 rounded p-3 border border-purple-300">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-bold text-purple-900 text-sm md:text-base">
                                  {spell.name} ({spell.nameEn})
                                </div>
                                <div className="text-xs text-purple-700 mt-1">
                                  {spell.school} · {spell.castingTime} · {spell.range} · {spell.duration}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-700 mt-2 whitespace-pre-line">
                              {spell.description}
                            </div>
                            {spell.higherLevel && (
                              <div className="text-xs text-purple-600 mt-2 italic whitespace-pre-line">
                                <strong>戏法强化：</strong>{spell.higherLevel}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* 一环法术列表 */}
              {(() => {
                const selectedFirstLevelSpells = character.classFeatureChoices?.selectedFirstLevelSpells
                  ? JSON.parse(character.classFeatureChoices.selectedFirstLevelSpells as string)
                  : [];
                const selectedPreparedSpells = character.class === '法师' && character.classFeatureChoices?.selectedPreparedSpells
                  ? JSON.parse(character.classFeatureChoices.selectedPreparedSpells as string)
                  : [];
                
                if (selectedFirstLevelSpells.length === 0) return null;

                // 对于法师，显示所有法术书中的法术，并标注哪些是已准备的
                const isWizard = character.class === '法师';
                // 法师显示所有法术书中的法术，其他职业显示所有选择的法术
                const displaySpells = isWizard ? selectedFirstLevelSpells : selectedFirstLevelSpells;

                return (
                  <div className="mb-4">
                    <h2 className="text-base md:text-lg font-bold bg-blue-100 text-blue-900 px-2 md:px-3 py-1.5 md:py-2 rounded-t border-b-2 border-blue-600">
                      {isWizard ? `一环法术 (法术书：${selectedFirstLevelSpells.length}个，已准备：${selectedPreparedSpells.length}个)` : `一环法术 (${selectedFirstLevelSpells.length}个)`}
                    </h2>
                    <div className="border-2 border-blue-200 rounded-b p-3 md:p-4 space-y-3">
                      {displaySpells.map((spellId: string) => {
                        const spell = getSpellById(spellId);
                        if (!spell) return null;
                        const isPrepared = isWizard && selectedPreparedSpells.includes(spellId);
                        return (
                          <div key={spellId} className={`rounded p-3 border ${isPrepared ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-300'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-bold text-blue-900 text-sm md:text-base">
                                    {spell.name} ({spell.nameEn})
                                  </div>
                                  {isWizard && isPrepared && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded font-semibold">已准备</span>
                                  )}
                                  {isWizard && !isPrepared && (
                                    <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded">未准备</span>
                                  )}
                                  {spell.ritual && (
                                    <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded">仪式</span>
                                  )}
                                </div>
                                <div className="text-xs text-blue-700 mt-1">
                                  {spell.school} · 一环 · {spell.castingTime} · {spell.range} · {spell.duration}
                                </div>
                                {spell.components && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    成分：{spell.components}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs md:text-sm text-gray-700 mt-2 whitespace-pre-line">
                              {spell.description}
                            </div>
                            {spell.higherLevel && (
                              <div className="text-xs text-blue-600 mt-2 italic whitespace-pre-line">
                                <strong>升环施法：</strong>{spell.higherLevel}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 页脚 */}
            <div className="mt-auto pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
              第 3 页 - D&D 2024 角色卡 • 创建日期：{character.createdAt ? new Date(character.createdAt).toLocaleDateString('zh-CN') : ''}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page-break-after {
            page-break-after: always;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
        @media screen and (max-width: 768px) {
          /* 手机端优化 */
          .character-sheet-page {
            padding: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}

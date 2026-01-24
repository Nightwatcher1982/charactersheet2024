'use client';

import { Character, getAbilityModifier, getProficiencyBonus, CLASSES, BACKGROUNDS, SPECIES, SKILLS } from '@/lib/dnd-data';
import { getFeatById } from '@/lib/feats-data';
import { getLanguageById } from '@/lib/languages-data';
import { getClassFeaturesByName } from '@/lib/class-features-data';
import { BACKGROUND_EQUIPMENT } from '@/lib/equipment-packages-data';
import { WEAPONS, getWeaponByName, calculateWeaponAttackBonus } from '@/lib/weapons-data';
import { User, Shield, Heart, Zap, Award, Globe, Package, Star, Swords, BookOpen, Sword } from 'lucide-react';

interface CharacterSheetSummaryProps {
  character: Partial<Character>;
}

export default function CharacterSheetSummary({ character }: CharacterSheetSummaryProps) {
  if (!character) return null;

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

  // 计算战斗数据
  const constitution = finalAbilities.constitution;
  const constitutionMod = getAbilityModifier(constitution);
  const hitDie = classData?.hitDie || 8;
  const maxHP = hitDie + constitutionMod;
  
  const dexterity = finalAbilities.dexterity;
  const dexterityMod = getAbilityModifier(dexterity);
  const baseAC = 10 + dexterityMod;
  
  const initiative = dexterityMod;
  
  // 计算移动速度，考虑物种选择（如木精灵35尺）
  let speed = (speciesData as any)?.speed || 30;
  if (character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.lineage && speciesChoices.lineage.includes('木精灵')) {
        speed = 35;
      }
    } catch (e) {
      // 解析失败，使用默认速度
    }
  }
  
  // 获取物种子类型显示（如"精灵 - 木精灵"）
  let speciesDisplay = character.species || '未选择';
  if (character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.lineage) {
        const lineageMatch = speciesChoices.lineage.match(/^([^（]+)/);
        if (lineageMatch) {
          speciesDisplay = `${character.species} - ${lineageMatch[1]}`;
        }
      }
    } catch (e) {
      // 解析失败，使用基础物种名
    }
  }

  // 获取技能熟练
  const skills = character.skills || [];

  // 获取职业特性
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;

  // 获取装备信息
  const equipmentData = backgroundData ? BACKGROUND_EQUIPMENT.find(e => e.backgroundId === backgroundData.id) : null;
  const selectedEquipment = character.backgroundEquipmentChoice === 'A' ? equipmentData?.optionA : 
                            character.backgroundEquipmentChoice === 'B' ? equipmentData?.optionB : null;

  // 从装备中提取武器，或使用用户选择的武器
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
  else if (selectedEquipment && 'items' in selectedEquipment) {
    for (const item of selectedEquipment.items) {
      const weapon = getWeaponByName(item.name);
      if (weapon) {
        equippedWeapons.push({ weapon, quantity: item.quantity });
      }
    }
  }
  
  // 计算属性调整值
  const strengthMod = getAbilityModifier(finalAbilities.strength);
  const wisdomMod = getAbilityModifier(finalAbilities.wisdom);
  
  // 检查武器熟练
  const isWeaponProficient = (weaponCategory: string) => {
    if (!classData) return false;
    const weaponProfs = classData.proficiencies.weapons;
    if (weaponProfs.includes('简易武器') && weaponCategory.includes('简易')) return true;
    if (weaponProfs.includes('军用武器') && weaponCategory.includes('军用')) return true;
    return weaponProfs.some(w => weaponCategory.includes(w));
  };

  return (
    <div className="space-y-6">
      {/* 角色头部信息 */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{character.name || '未命名角色'}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {character.level || 1} 级 {character.class || '未选择'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {speciesDisplay}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {character.background || '未选择'}
              </span>
              {character.alignment && (
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {character.alignment}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">熟练加值</div>
            <div className="text-4xl font-bold">+{profBonus}</div>
          </div>
        </div>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* HP */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
          <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <div className="text-xs text-red-700 font-medium">生命值</div>
          <div className="text-3xl font-bold text-red-900">{maxHP}</div>
          <div className="text-xs text-red-600 mt-1">HD: 1d{hitDie}</div>
        </div>

        {/* AC */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
          <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-xs text-blue-700 font-medium">护甲等级</div>
          <div className="text-3xl font-bold text-blue-900">{baseAC}</div>
          <div className="text-xs text-blue-600 mt-1">基础 AC</div>
        </div>

        {/* 先攻 */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-xs text-yellow-700 font-medium">先攻</div>
          <div className="text-3xl font-bold text-yellow-900">
            {initiative >= 0 ? '+' : ''}{initiative}
          </div>
          <div className="text-xs text-yellow-600 mt-1">敏捷调整</div>
        </div>

        {/* 速度 */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
          <Zap className="w-6 h-6 text-green-600 mx-auto mb-2 rotate-90" />
          <div className="text-xs text-green-700 font-medium">速度</div>
          <div className="text-3xl font-bold text-green-900">{speed}</div>
          <div className="text-xs text-green-600 mt-1">尺/轮</div>
        </div>
      </div>

      {/* 属性值 */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          属性值
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
              <div key={ability.key} className="bg-gradient-to-b from-purple-50 to-white border-2 border-purple-300 rounded-lg p-3 text-center">
                <div className="text-xs font-bold text-purple-900">{ability.abbr}</div>
                <div className="text-2xl font-bold text-gray-900 my-1">{score}</div>
                <div className="text-lg font-bold text-purple-600">{modStr}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 豁免检定 */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          豁免检定
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              <div key={save.key} className={`p-3 rounded-lg border-2 ${
                isProficient ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isProficient && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{save.name}</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    isProficient ? 'text-blue-600' : 'text-gray-600'
                  }`}>{bonusStr}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ● 表示熟练项（+{profBonus} 熟练加值）
        </p>
      </div>

      {/* 技能 */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          技能（{skills.length} 项熟练）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SKILLS.map((skill) => {
            const isProficient = skills.includes(skill.name);
            const abilityScore = finalAbilities[skill.ability as keyof typeof finalAbilities];
            const abilityMod = getAbilityModifier(abilityScore);
            const totalBonus = abilityMod + (isProficient ? profBonus : 0);
            const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
            
            return (
              <div key={skill.id} className={`p-2 rounded border ${
                isProficient ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isProficient && (
                      <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    )}
                    <div>
                      <span className={`text-sm font-medium ${
                        isProficient ? 'text-green-900' : 'text-gray-700'
                      }`}>
                        {skill.name}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">({skill.ability.substring(0, 3).toUpperCase()})</span>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${
                    isProficient ? 'text-green-600' : 'text-gray-500'
                  }`}>{bonusStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 语言、专长、特性 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 语言 */}
        {character.languages && character.languages.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              语言 ({character.languages.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {character.languages.map((langId) => {
                const lang = getLanguageById(langId);
                return (
                  <span key={langId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {lang?.name || langId}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 专长 */}
        {character.feats && character.feats.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              专长 ({character.feats.length})
            </h3>
            <div className="space-y-2">
              {character.feats.map((featId) => {
                const feat = getFeatById(featId);
                return feat ? (
                  <div key={featId} className="p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="font-medium text-purple-900">{feat.name}</div>
                    <div className="text-xs text-purple-700 mt-1">{feat.description}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* 装备详情 */}
      {selectedEquipment && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            装备详情（选项 {character.backgroundEquipmentChoice}）
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded p-4">
            {character.backgroundEquipmentChoice === 'A' && 'items' in selectedEquipment ? (
              <>
                <div className="space-y-2 mb-3">
                  {selectedEquipment.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <span className="font-medium text-orange-900">{item.name}</span>
                      <span className="text-orange-600 text-xs">({item.nameEn})</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-orange-300 pt-2">
                  <span className="text-sm text-orange-800">
                    <strong>起始金币：</strong>{selectedEquipment.gold} GP
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <span className="text-2xl font-bold text-orange-900">50 金币</span>
                <div className="text-sm text-orange-700 mt-1">可自由购买装备</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 武器 */}
      {equippedWeapons.length > 0 && (
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Swords className="w-4 h-4 text-purple-600" />
            武器
          </h3>
          <div className="space-y-1.5">
            {equippedWeapons.map((item, index) => {
              const { weapon, quantity } = item;
              const isProficient = isWeaponProficient(weapon.category);
              const attackBonus = calculateWeaponAttackBonus(
                weapon,
                strengthMod,
                dexterityMod,
                profBonus,
                isProficient
              );
              
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
                <div key={index} className="border-l-2 border-purple-400 rounded-r bg-purple-50 p-2 text-xs">
                  {/* 紧凑布局：一行显示主要信息 */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="font-bold text-purple-900 text-sm truncate">
                        {weapon.name}
                        {quantity > 1 && <span className="text-xs ml-1">×{quantity}</span>}
                      </div>
                      {!isProficient && (
                        <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded flex-shrink-0">不熟练</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-center">
                        <div className="text-xs text-purple-700">命中</div>
                        <div className="text-base font-bold text-purple-900">{attackBonusStr}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-red-700">伤害</div>
                        <div className="text-base font-bold text-red-900">{weapon.damage}{damageBonus}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 第二行：类型、属性、精通（紧凑） */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                    <span>{weapon.category}</span>
                    <span>•</span>
                    <span>{weapon.damageType}</span>
                    {weapon.properties.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-gray-500">{weapon.properties.join('、')}</span>
                      </>
                    )}
                    {weapon.mastery && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-700 font-medium">
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
      )}

      {/* 职业特性 */}
      {classFeatures && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sword className="w-5 h-5 text-red-600" />
            职业特性（1级）
          </h3>
          <div className="space-y-4">
            {/* 武器精通 */}
            {classFeatures.weaponMastery && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Swords className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-red-900">
                    {classFeatures.weaponMastery.name}
                  </h4>
                  <span className="text-xs text-red-600">
                    ({classFeatures.weaponMastery.nameEn})
                  </span>
                </div>
                <p className="text-sm text-red-800 mb-2">
                  {classFeatures.weaponMastery.description}
                </p>
                {classFeatures.weaponMastery.selectableWeapons && (
                  <div className="text-xs text-red-700 bg-white rounded px-2 py-1">
                    <strong>可选武器：</strong>{classFeatures.weaponMastery.selectableWeapons.join('、')}
                  </div>
                )}
              </div>
            )}

            {/* 所有1级职业特性（包括默认特性） */}
            {classFeatures.level1Features.map((feature) => {
              // 检查是否是用户选择的特性
              const featureChoices = classData ? ((classData as any)?.featureChoices || []) : [];
              const isSelectableFeature = featureChoices.some((fc: any) => fc.id === feature.id);
              const selectedOption = isSelectableFeature ? 
                (character.classFeatureChoices?.[feature.id] as string) : null;
              
              return (
                <div key={feature.id} className="bg-blue-50 border-l-4 border-blue-500 rounded-r p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-blue-900">{feature.name}</h4>
                      <span className="text-xs text-blue-600">({feature.nameEn})</span>
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
                  <p className="text-sm text-blue-800 mb-2">{feature.description}</p>
                  {feature.details && feature.details.length > 0 && (
                    <ul className="space-y-1 text-xs text-blue-700">
                      {feature.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

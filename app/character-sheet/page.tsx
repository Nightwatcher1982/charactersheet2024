'use client';

import { useEffect, useState } from 'react';
import { Character, getAbilityModifier, getProficiencyBonus, CLASSES, BACKGROUNDS, SPECIES, SKILLS } from '@/lib/dnd-data';
import { getFeatById } from '@/lib/feats-data';
import { getLanguageById } from '@/lib/languages-data';
import { getClassFeaturesByName } from '@/lib/class-features-data';
import { BACKGROUND_EQUIPMENT } from '@/lib/equipment-packages-data';
import { getWeaponByName, calculateWeaponAttackBonus } from '@/lib/weapons-data';
import { Printer } from 'lucide-react';

export default function CharacterSheetPage() {
  const [character, setCharacter] = useState<Partial<Character> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从localStorage读取临时角色数据
    const tempChar = localStorage.getItem('temp-character-for-sheet');
    if (tempChar) {
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

  // 计算战斗数据
  const constitutionMod = getAbilityModifier(finalAbilities.constitution);
  const hitDie = classData?.hitDie || 8;
  const maxHP = hitDie + constitutionMod;
  
  const dexterityMod = getAbilityModifier(finalAbilities.dexterity);
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
  
  const passivePerception = 10 + dexterityMod + (character.skills?.includes('察觉') ? profBonus : 0);

  const skills = character.skills || [];

  // 获取职业特性
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;

  // 获取装备信息
  const equipmentData = backgroundData ? BACKGROUND_EQUIPMENT.find(e => e.backgroundId === backgroundData.id) : null;
  const selectedEquipment = character.backgroundEquipmentChoice === 'A' ? equipmentData?.optionA : 
                            character.backgroundEquipmentChoice === 'B' ? equipmentData?.optionB : null;

  // 从装备中提取武器
  const equippedWeapons = [];
  if (selectedEquipment && 'items' in selectedEquipment) {
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
  
  // 检查武器熟练（简化版本：检查职业武器熟练）
  const isWeaponProficient = (weaponCategory: string) => {
    if (!classData) return false;
    const weaponProfs = classData.proficiencies.weapons;
    if (weaponProfs.includes('简易武器') && weaponCategory.includes('简易')) return true;
    if (weaponProfs.includes('军用武器') && weaponCategory.includes('军用')) return true;
    return weaponProfs.some(w => weaponCategory.includes(w));
  };

  return (
    <>
      {/* 打印按钮 - 仅在屏幕显示，打印时隐藏 */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 font-bold"
        >
          <Printer className="w-5 h-5" />
          打印角色卡
        </button>
      </div>

      <div className="bg-white">
        {/* 第1页 */}
        <div className="w-[210mm] min-h-[297mm] mx-auto p-8 bg-white shadow-2xl page-break-after">
          {/* 页眉 */}
          <div className="border-b-4 border-red-600 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{character.name || '未命名角色'}</h1>
                <div className="flex gap-3 text-sm text-gray-700">
                  <span className="font-medium">{character.class || '未选择'} {character.level || 1}</span>
                  <span>•</span>
                  <span>{speciesDisplay}</span>
                  <span>•</span>
                  <span>{character.background || '未选择'}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{character.alignment || '未选择阵营'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">熟练加值</div>
                <div className="text-4xl font-bold text-red-600">+{profBonus}</div>
                <div className="text-xs text-gray-400 mt-1">Proficiency Bonus</div>
              </div>
            </div>
          </div>

          {/* 核心属性 - 3栏布局 */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* 左栏：属性值 */}
            <div className="col-span-1">
              <h2 className="text-lg font-bold bg-red-100 text-red-900 px-3 py-2 rounded-t border-b-2 border-red-600">
                属性值
              </h2>
              <div className="border-2 border-red-200 rounded-b p-3 space-y-2">
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
                    <div key={ability.key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {modStr}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">{ability.name}</div>
                          <div className="text-xs text-gray-600">{ability.abbr}</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-700">{score}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 中栏：战斗数据和豁免 */}
            <div className="col-span-1 space-y-4">
              {/* 战斗数据 */}
              <div>
                <h2 className="text-lg font-bold bg-blue-100 text-blue-900 px-3 py-2 rounded-t border-b-2 border-blue-600">
                  战斗数据
                </h2>
                <div className="border-2 border-blue-200 rounded-b p-3 space-y-3">
                  <div className="text-center bg-blue-50 rounded p-3">
                    <div className="text-xs text-blue-700">生命值</div>
                    <div className="text-3xl font-bold text-blue-900">{maxHP}</div>
                    <div className="text-xs text-blue-600">HD: 1d{hitDie}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-600">AC</div>
                      <div className="text-2xl font-bold text-gray-900">{baseAC}</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded p-2">
                      <div className="text-xs text-gray-600">先攻</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {initiative >= 0 ? '+' : ''}{initiative}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">速度</div>
                    <div className="text-xl font-bold text-gray-900">{speed} 尺</div>
                  </div>

                  <div className="text-center bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-600">被动察觉</div>
                    <div className="text-xl font-bold text-gray-900">{passivePerception}</div>
                  </div>
                </div>
              </div>

              {/* 豁免检定 */}
              <div>
                <h2 className="text-lg font-bold bg-green-100 text-green-900 px-3 py-2 rounded-t border-b-2 border-green-600">
                  豁免检定
                </h2>
                <div className="border-2 border-green-200 rounded-b p-3 space-y-1">
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
                      <div key={save.key} className={`flex items-center justify-between p-2 rounded text-sm ${
                        isProficient ? 'bg-green-50 font-bold' : 'bg-white'
                      }`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            isProficient ? 'bg-green-500' : 'border-2 border-gray-300'
                          }`}></div>
                          <span>{save.name}</span>
                        </div>
                        <span className={isProficient ? 'text-green-700' : 'text-gray-600'}>
                          {bonusStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 右栏：技能 */}
            <div className="col-span-1">
              <h2 className="text-lg font-bold bg-purple-100 text-purple-900 px-3 py-2 rounded-t border-b-2 border-purple-600">
                技能 ({skills.length} 项熟练)
              </h2>
              <div className="border-2 border-purple-200 rounded-b p-3 space-y-1">
                {SKILLS.map((skill) => {
                  const isProficient = skills.includes(skill.name);
                  const abilityScore = finalAbilities[skill.ability as keyof typeof finalAbilities];
                  const abilityMod = getAbilityModifier(abilityScore);
                  const totalBonus = abilityMod + (isProficient ? profBonus : 0);
                  const bonusStr = totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`;
                  
                  return (
                    <div key={skill.id} className={`flex items-center justify-between p-1.5 rounded text-xs ${
                      isProficient ? 'bg-purple-50 font-bold' : 'bg-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          isProficient ? 'bg-purple-500' : 'border-2 border-gray-300'
                        }`}></div>
                        <span>{skill.name}</span>
                        <span className="text-gray-400">({skill.ability.substring(0, 3).toUpperCase()})</span>
                      </div>
                      <span className={isProficient ? 'text-purple-700' : 'text-gray-500'}>
                        {bonusStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 底部信息 - 2栏 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 语言和专长 */}
            <div className="space-y-4">
              {/* 语言 */}
              {character.languages && character.languages.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold bg-blue-100 text-blue-900 px-3 py-2 rounded-t border-b-2 border-blue-600">
                    语言
                  </h2>
                  <div className="border-2 border-blue-200 rounded-b p-3">
                    <div className="flex flex-wrap gap-2">
                      {character.languages.map((langId) => {
                        const lang = getLanguageById(langId);
                        return (
                          <span key={langId} className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs border border-blue-200">
                            {lang?.name || langId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 熟练项 */}
              <div>
                <h2 className="text-sm font-bold bg-gray-100 text-gray-900 px-3 py-2 rounded-t border-b-2 border-gray-600">
                  熟练项
                </h2>
                <div className="border-2 border-gray-200 rounded-b p-3 space-y-2 text-xs">
                  {classData?.proficiencies && (
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
                  )}
                </div>
              </div>
            </div>

            {/* 专长和特性 */}
            <div className="space-y-4">
              {/* 专长 */}
              {character.feats && character.feats.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold bg-purple-100 text-purple-900 px-3 py-2 rounded-t border-b-2 border-purple-600">
                    专长
                  </h2>
                  <div className="border-2 border-purple-200 rounded-b p-3 space-y-2">
                    {character.feats.map((featId) => {
                      const feat = getFeatById(featId);
                      return feat ? (
                        <div key={featId} className="text-xs">
                          <div className="font-bold text-purple-900">{feat.name}</div>
                          <div className="text-gray-700 mt-0.5">{feat.description}</div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* 职业特性 */}
              {character.classFeatureChoices && Object.keys(character.classFeatureChoices).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold bg-orange-100 text-orange-900 px-3 py-2 rounded-t border-b-2 border-orange-600">
                    职业特性选择
                  </h2>
                  <div className="border-2 border-orange-200 rounded-b p-3 space-y-2 text-xs">
                    {Object.entries(character.classFeatureChoices)
                      .filter(([key]) => key !== 'speciesChoices')
                      .map(([featureId, optionId]) => {
                        const featureChoices = (classData as any)?.featureChoices || [];
                        const feature = featureChoices.find((f: any) => f.id === featureId);
                        const option = feature?.options.find((o: any) => o.id === optionId);
                        return (
                          <div key={featureId}>
                            <div className="font-bold text-orange-900">{feature?.name}</div>
                            <div className="text-orange-700">{option?.name}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 页脚 */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-2 mt-4">
            第 1 页 - D&D 2024 角色卡
          </div>
        </div>

        {/* 第2页 */}
        <div className="w-[210mm] min-h-[297mm] mx-auto p-8 bg-white shadow-2xl">
          {/* 页眉 */}
          <div className="border-b-2 border-gray-400 pb-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{character.name || '未命名角色'}</h2>
                <div className="text-sm text-gray-600">{character.class} • {character.species}</div>
              </div>
              <div className="text-right text-xs text-gray-500">
                第 2 页
              </div>
            </div>
          </div>

          {/* 装备区域 */}
          <div className="mb-4">
            <h2 className="text-lg font-bold bg-yellow-100 text-yellow-900 px-3 py-2 rounded-t border-b-2 border-yellow-600">
              装备详情
            </h2>
            <div className="border-2 border-yellow-200 rounded-b p-4">
              {selectedEquipment ? (
                <div className="space-y-2">
                  <div className="font-bold text-yellow-900 mb-2">
                    背景装备 - 选项 {character.backgroundEquipmentChoice}
                  </div>
                  {character.backgroundEquipmentChoice === 'A' && 'items' in selectedEquipment ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {selectedEquipment.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs bg-white rounded p-2 border border-yellow-300">
                            <span className="w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.quantity}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-yellow-900 truncate">{item.name}</div>
                              <div className="text-yellow-600 text-xs truncate">{item.nameEn}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-yellow-300 pt-2">
                        <span className="text-sm text-yellow-800">
                          <strong>起始金币：</strong>{selectedEquipment.gold} GP
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3 bg-yellow-50 rounded">
                      <span className="text-2xl font-bold text-yellow-900">50 金币</span>
                      <div className="text-xs text-yellow-700 mt-1">可自由购买装备</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">尚未选择装备</div>
              )}
            </div>
          </div>

          {/* 武器 */}
          {equippedWeapons.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold bg-purple-100 text-purple-900 px-3 py-2 rounded-t border-b-2 border-purple-600 flex items-center gap-2">
                <span>⚔️</span> 武器
              </h2>
              <div className="border-2 border-purple-200 rounded-b p-4 space-y-3">
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
                    <div key={index} className="bg-white rounded-lg p-3 border-2 border-purple-300 shadow-sm">
                      {/* 武器标题 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-bold text-purple-900 text-base flex items-center gap-2">
                            {weapon.name}
                            {quantity > 1 && (
                              <span className="text-xs bg-purple-200 px-2 py-0.5 rounded-full">×{quantity}</span>
                            )}
                            {!isProficient && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full">不熟练</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">{weapon.category}</div>
                        </div>
                      </div>
                      
                      {/* 攻击和伤害 */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-purple-50 rounded p-2 border border-purple-200">
                          <div className="text-xs text-purple-700 mb-1">攻击命中</div>
                          <div className="text-xl font-bold text-purple-900">{attackBonusStr}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {isProficient ? `属性 + 熟练` : `仅属性`}
                          </div>
                        </div>
                        <div className="bg-red-50 rounded p-2 border border-red-200">
                          <div className="text-xs text-red-700 mb-1">伤害</div>
                          <div className="text-xl font-bold text-red-900">{weapon.damage}{damageBonus}</div>
                          <div className="text-xs text-gray-600 mt-1">{weapon.damageType}</div>
                        </div>
                      </div>
                      
                      {/* 武器属性 */}
                      {weapon.properties.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">属性：</div>
                          <div className="flex flex-wrap gap-1">
                            {weapon.properties.map((prop, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                                {prop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 武器精通 */}
                      {weapon.mastery && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded p-2 border border-yellow-300">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600 text-sm flex-shrink-0">✨</span>
                            <div className="flex-1">
                              <div className="text-xs font-bold text-yellow-900 mb-0.5">
                                武器精通：{weapon.mastery}
                              </div>
                              <div className="text-xs text-yellow-800">
                                {weapon.masteryDescription}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 职业特性 */}
          {classFeatures && (
            <div className="mb-4">
              <h2 className="text-lg font-bold bg-red-100 text-red-900 px-3 py-2 rounded-t border-b-2 border-red-600">
                职业特性（1级）
              </h2>
              <div className="border-2 border-red-200 rounded-b p-4 space-y-3">
                {/* 武器精通 */}
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
                
                {/* 其他职业特性 */}
                {classFeatures.level1Features.map((feature) => (
                  <div key={feature.id} className="bg-blue-50 rounded p-3 border border-blue-300">
                    <div className="font-bold text-blue-900 text-sm mb-1">
                      {feature.name} ({feature.nameEn})
                    </div>
                    <div className="text-xs text-blue-800 mb-2">{feature.description}</div>
                    {feature.details && feature.details.length > 0 && (
                      <ul className="space-y-1 text-xs text-blue-700 pl-3">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="list-disc">{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 物种特性 */}
          {speciesData && (
            <div className="mb-4">
              <h2 className="text-lg font-bold bg-green-100 text-green-900 px-3 py-2 rounded-t border-b-2 border-green-600">
                物种特性
              </h2>
              <div className="border-2 border-green-200 rounded-b p-4 space-y-2 text-sm">
                <div className="font-bold text-green-900">{speciesData.name}</div>
                <div className="text-gray-700 text-xs">{speciesData.description}</div>
                {(speciesData as any).traits && (
                  <div className="mt-2 space-y-1">
                    {(speciesData as any).traits.map((trait: any, index: number) => (
                      <div key={index} className="text-xs bg-green-50 rounded p-2">
                        <span className="font-bold text-green-800">{trait.name || trait}：</span>
                        <span className="text-gray-700">{trait.description || ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 背景信息 */}
          {backgroundData && (
            <div className="mb-4">
              <h2 className="text-lg font-bold bg-orange-100 text-orange-900 px-3 py-2 rounded-t border-b-2 border-orange-600">
                背景信息
              </h2>
              <div className="border-2 border-orange-200 rounded-b p-4 space-y-2 text-sm">
                <div className="font-bold text-orange-900">{backgroundData.name}</div>
                {(backgroundData as any).narrative && (
                  <div className="text-gray-700 text-xs">{(backgroundData as any).narrative}</div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>
                    <span className="font-bold text-gray-700">技能：</span>
                    <span className="text-gray-600">{backgroundData.skills?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">工具：</span>
                    <span className="text-gray-600">{backgroundData.toolProficiency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 页脚 */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-2 mt-4">
            第 2 页 - D&D 2024 角色卡 • 创建日期：{character.createdAt ? new Date(character.createdAt).toLocaleDateString('zh-CN') : ''}
          </div>
        </div>
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
      `}</style>
    </>
  );
}

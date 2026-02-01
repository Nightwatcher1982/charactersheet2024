/**
 * D&D 2024 护甲等级（AC）计算
 * 参考玩家手册：护甲、盾牌、职业特性（防御战斗风格、无甲防御、龙裔体魄等）、专长
 */

import type { Character } from './dnd-data';
import { CLASSES, getAbilityModifier } from './dnd-data';
import { getArmorByName, calculateAC } from './weapons-data';
import { getClassFeaturesByName } from './class-features-data';

export interface ACParams {
  armor: ReturnType<typeof getArmorByName>;
  shield: boolean;
  dexterityMod: number;
  isProficientWithArmor: boolean;
  unarmoredDefenseBonus?: number;
  fightingStyleDefense?: boolean;
  featACBonus?: number;
  mediumArmorMaster?: boolean;
  draconicResilience?: boolean;
}

/**
 * 从角色与最终属性解析当前装备的护甲与盾牌（兼容 equippedArmor/equippedShield 与 equipment 列表）
 */
export function getEquippedArmorAndShield(character: Partial<Character>): {
  armor: ReturnType<typeof getArmorByName>;
  shield: boolean;
} {
  const equipment = character.equipment || [];
  let equippedArmorName: string | undefined = character.equippedArmor;
  let equippedShield = character.equippedShield;

  if (equippedArmorName === undefined) {
    for (const item of equipment) {
      const armor = getArmorByName(item);
      if (armor && armor.category !== '盾牌') {
        equippedArmorName = item;
        break;
      }
    }
  }
  if (equippedShield === undefined) {
    equippedShield = equipment.some((item) => {
      const armor = getArmorByName(item);
      return armor?.category === '盾牌';
    });
  }

  const armor = equippedArmorName ? getArmorByName(equippedArmorName) : null;
  return { armor, shield: !!equippedShield };
}

/**
 * 获取实际护甲熟练（含牧师守护者圣职的重甲等）
 */
export function getActualArmorProficiencies(character: Partial<Character>): string[] {
  const classData = CLASSES.find((c) => c.name === character.class);
  if (!classData) return [];
  const list = [...(classData.proficiencies?.armor || [])];
  const divineOrder = character.classFeatureChoices?.divineOrder;
  if (divineOrder === 'protector' && character.class === '牧师') {
    if (!list.includes('重甲')) list.push('重甲');
  }
  return list;
}

/**
 * 收集 AC 计算所需参数：护甲、盾牌、熟练、以及职业/专长带来的加值
 */
export function getACParams(
  character: Partial<Character>,
  finalAbilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }
): ACParams {
  const { armor, shield } = getEquippedArmorAndShield(character);
  const dexterityMod = getAbilityModifier(finalAbilities.dexterity);
  const armorProficiencies = getActualArmorProficiencies(character);

  let isProficientWithArmor = true;
  if (armor) {
    const category = armor.category;
    isProficientWithArmor = armorProficiencies.some((prof) => {
      if (prof === '所有护甲') return ['轻甲', '中甲', '重甲'].includes(category);
      if (prof === '轻甲' && category === '轻甲') return true;
      if (prof === '中甲' && category === '中甲') return true;
      if (prof === '重甲' && category === '重甲') return true;
      if (prof === '盾牌' && category === '盾牌') return true;
      if (prof === '盾牌（非金属）' && category === '盾牌') return true;
      return false;
    });
  }

  const classData = CLASSES.find((c) => c.name === character.class);
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;

  let unarmoredDefenseBonus: number | undefined;
  let fightingStyleDefense = false;
  let featACBonus = 0;
  let mediumArmorMaster = false;
  let draconicResilience = false;

  // 术士龙裔血统：未穿护甲时 AC = 13 + 敏捷调整值（玩家手册 p44）
  if (
    character.class === '术士' &&
    !armor &&
    character.classFeatureChoices?.sorcerousOrigin === 'draconicBloodline'
  ) {
    draconicResilience = true;
  }

  // 无甲防御：野蛮人（体质）、武僧（感知，且不持盾时有效）
  if (classFeatures && !armor && !draconicResilience) {
    const unarmoredDefense = classFeatures.level1Features?.find((f) => f.id === 'unarmored-defense');
    if (unarmoredDefense) {
      if (character.class === '野蛮人') {
        unarmoredDefenseBonus = getAbilityModifier(finalAbilities.constitution);
      } else if (character.class === '武僧' && !shield) {
        unarmoredDefenseBonus = getAbilityModifier(finalAbilities.wisdom);
      }
    }
  }

  // 防御战斗风格：穿着护甲时 AC+1（战士、圣武士、游侠等可选）
  const hasDefenseStyle =
    character.classFeatureChoices?.fightingStyle === 'defense';
  if (armor && hasDefenseStyle) {
    const defenseClasses = ['战士', '圣武士', '游侠'];
    if (character.class && defenseClasses.includes(character.class)) {
      fightingStyleDefense = true;
    }
  }

  // 专长
  const feats = character.feats || [];
  if (feats.includes('medium-armor-master')) {
    mediumArmorMaster = true;
  }
  // 双持武器者：当双持武器时 AC+1
  const equippedWeapons = character.equippedWeapons || [];
  if (feats.includes('dual-wielder') && equippedWeapons.length >= 2) {
    featACBonus += 1;
  }

  return {
    armor,
    shield,
    dexterityMod,
    isProficientWithArmor,
    unarmoredDefenseBonus,
    fightingStyleDefense,
    featACBonus: featACBonus || undefined,
    mediumArmorMaster: mediumArmorMaster || undefined,
    draconicResilience: draconicResilience || undefined,
  };
}

/**
 * 计算角色护甲等级（AC）
 */
export function computeArmorClass(
  character: Partial<Character>,
  finalAbilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }
): number {
  const params = getACParams(character, finalAbilities);
  return calculateAC(
    10,
    params.armor,
    params.shield,
    params.dexterityMod,
    params.isProficientWithArmor,
    params.unarmoredDefenseBonus,
    params.fightingStyleDefense,
    params.featACBonus,
    params.mediumArmorMaster,
    params.draconicResilience
  );
}

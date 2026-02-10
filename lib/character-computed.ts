/**
 * 服务端/API 用：根据角色数据计算与界面一致的 AC、最大生命值、当前生命值。
 * 供 GET /api/characters/[id] 等返回「最终结果」给 DM 等服务使用。
 */

import type { Character } from './dnd-data';
import { getAbilityModifier, CLASSES } from './dnd-data';
import { computeArmorClass } from './ac-calculator';
import { calculateSpeciesHPBonus, calculateClassFeatureHPBonus } from './species-traits-calculator';

function getFinalAbilities(character: Partial<Character>): {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
} {
  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };
  const final = { ...abilities };
  if (character.backgroundAbilityBonuses) {
    const map: Record<string, keyof typeof final> = {
      '力量': 'strength',
      '敏捷': 'dexterity',
      '体质': 'constitution',
      '智力': 'intelligence',
      '感知': 'wisdom',
      '魅力': 'charisma',
    };
    for (const [name, bonus] of Object.entries(character.backgroundAbilityBonuses)) {
      const key = map[name];
      if (key && typeof bonus === 'number') final[key] += bonus;
    }
  }
  return final;
}

/**
 * 计算与角色卡界面一致的：护甲等级、最大生命值、当前生命值。
 */
export function getCharacterComputedStats(character: Partial<Character>): {
  armorClass: number;
  maxHp: number;
  currentHp: number;
} {
  const finalAbilities = getFinalAbilities(character);
  const armorClass = computeArmorClass(character, finalAbilities);

  const level = character.level ?? 1;
  const classData = CLASSES.find((c) => c.name === character.class);
  const constitutionMod = getAbilityModifier(finalAbilities.constitution);
  const hitDie = classData?.hitDie ?? 8;
  let maxHp = hitDie + constitutionMod;
  if (character.feats?.includes('tough')) {
    maxHp += level * 2;
  }
  maxHp += calculateSpeciesHPBonus(character);
  maxHp += calculateClassFeatureHPBonus(character);

  const currentHp =
    typeof character.currentHitPoints === 'number'
      ? character.currentHitPoints
      : typeof character.hitPoints === 'number'
        ? character.hitPoints
        : maxHp;
  const clampedCurrent = Math.max(0, Math.min(maxHp, currentHp));

  return {
    armorClass,
    maxHp,
    currentHp: clampedCurrent,
  };
}

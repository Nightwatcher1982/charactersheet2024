// 物种特性数值计算辅助函数

import { SPECIES } from './dnd-data';
import { Character } from './dnd-data';

/**
 * 计算物种特性对生命值的影响
 * @param character 角色数据
 * @returns 生命值加值
 */
export function calculateSpeciesHPBonus(character: Partial<Character>): number {
  if (!character.species) return 0;
  
  const speciesData = SPECIES.find(s => s.name === character.species);
  if (!speciesData) {
    return 0;
  }
  
  let hpBonus = 0;
  const level = character.level || 1;
  
  // 检查矮人坚韧：生命值最大值+1，每次升级再+1
  const hasDwarvenFortitude = speciesData.traits?.some(trait => 
    trait.name === '矮人坚韧' || trait.name === 'Dwarven Fortitude'
  );
  
  if (hasDwarvenFortitude) {
    // 基础+1，每级+1
    hpBonus = 1 + (level - 1); // 1级时+1，之后每级再+1
  }
  
  return hpBonus;
}

/**
 * 计算职业特性对生命值的影响
 * @param character 角色数据
 * @returns 生命值加值
 */
export function calculateClassFeatureHPBonus(character: Partial<Character>): number {
  if (!character.class) return 0;
  
  let hpBonus = 0;
  const level = character.level || 1;
  
  // 检查术士龙裔血统：生命值最大值+1（每术士等级）
  if (character.class === '术士' && character.classFeatureChoices?.sorcerousOrigin === 'draconicBloodline') {
    // 每术士等级+1
    hpBonus = level;
  }
  
  return hpBonus;
}

/**
 * 计算物种特性对速度的影响
 * @param character 角色数据
 * @returns 速度加值（尺）
 */
export function calculateSpeciesSpeedBonus(character: Partial<Character>): number {
  if (!character.species) return 0;
  
  const speciesData = SPECIES.find(s => s.name === character.species);
  if (!speciesData) return 0;
  
  let speedBonus = 0;
  
  // 检查物种选择中的速度加成（如木精灵35尺已在基础speed中处理）
  // 这里处理其他可能的动态速度加成
  
  // 检查巨人裔的大型形态（5级特性，暂时不考虑，因为需要等级判断）
  // 如果需要，可以在这里添加
  
  return speedBonus;
}

/**
 * 获取物种的基础速度
 * @param character 角色数据
 * @returns 基础速度（尺）
 */
export function getSpeciesBaseSpeed(character: Partial<Character>): number {
  if (!character.species) return 30;
  
  const speciesData = SPECIES.find(s => s.name === character.species);
  if (!speciesData) return 30;
  
  let baseSpeed = speciesData.speed || 30;
  
  // 检查物种选择中的速度修改（如木精灵35尺）
  if (character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.lineage) {
        // 木精灵：速度35尺
        if (speciesChoices.lineage.includes('木精灵')) {
          baseSpeed = 35;
        }
      }
    } catch (e) {
      // 解析失败，使用默认速度
    }
  }
  
  return baseSpeed;
}

/**
 * 检查物种是否有特定的抗性
 * @param character 角色数据
 * @param damageType 伤害类型（如'毒素'、'火焰'等）
 * @returns 是否有抗性
 */
export function hasSpeciesResistance(character: Partial<Character>, damageType: string): boolean {
  if (!character.species) return false;
  
  const speciesData = SPECIES.find(s => s.name === character.species);
  if (!speciesData) return false;
  
  // 检查矮人韧性：对毒素伤害有抗性
  if (damageType === '毒素' || damageType === 'poison') {
    const hasDwarvenResilience = speciesData.traits?.some(trait => 
      trait.name === '矮人韧性' || trait.name === 'Dwarven Resilience'
    );
    if (hasDwarvenResilience) return true;
  }
  
  // 检查龙裔的伤害抗性（需要从speciesChoices中获取）
  if (character.species === '龙裔' && character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.ancestry) {
        // 根据龙裔血统判断抗性类型
        const ancestry = speciesChoices.ancestry;
        if (damageType === '强酸' || damageType === 'acid') {
          if (ancestry.includes('黑龙') || ancestry.includes('紫铜龙')) return true;
        }
        if (damageType === '闪电' || damageType === 'lightning') {
          if (ancestry.includes('蓝龙') || ancestry.includes('青铜龙')) return true;
        }
        if (damageType === '火焰' || damageType === 'fire') {
          if (ancestry.includes('黄铜龙') || ancestry.includes('金龙') || ancestry.includes('红龙')) return true;
        }
        if (damageType === '毒素' || damageType === 'poison') {
          if (ancestry.includes('绿龙')) return true;
        }
        if (damageType === '寒冷' || damageType === 'cold') {
          if (ancestry.includes('银龙') || ancestry.includes('白龙')) return true;
        }
      }
    } catch (e) {
      // 解析失败
    }
  }
  
  // 检查魔人的炼狱遗产抗性
  if (character.species === '魔人' && character.classFeatureChoices?.speciesChoices) {
    try {
      const speciesChoices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (speciesChoices.legacy) {
        const legacy = speciesChoices.legacy;
        if (damageType === '毒素' || damageType === 'poison') {
          if (legacy.includes('深渊')) return true;
        }
        if (damageType === '死灵' || damageType === 'necrotic') {
          if (legacy.includes('冥界')) return true;
        }
        if (damageType === '火焰' || damageType === 'fire') {
          if (legacy.includes('炼狱')) return true;
        }
      }
    } catch (e) {
      // 解析失败
    }
  }
  
  return false;
}

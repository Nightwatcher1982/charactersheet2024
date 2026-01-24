// D&D 2024 武器数据

export interface Weapon {
  id: string;
  name: string;
  nameEn: string;
  category: '简易近战武器' | '简易远程武器' | '军用近战武器' | '军用远程武器';
  damage: string; // 伤害骰，如"1d6"
  damageType: '挥砍' | '穿刺' | '钝击';
  properties: string[]; // 武器属性，如"轻型"、"灵巧"、"双手"等
  range?: string; // 远程武器射程，如"30/120"
  mastery?: string; // 武器精通效果
  masteryDescription?: string; // 武器精通详细描述
  price?: number; // 价格（金币）
}

export interface Armor {
  id: string;
  name: string;
  nameEn: string;
  category: '轻甲' | '中甲' | '重甲' | '盾牌';
  ac: number | string; // AC值，如10或"14 + 敏捷调整值"
  stealthDisadvantage?: boolean; // 是否对隐匿有劣势
  strengthRequirement?: number; // 力量需求
  weight?: number;
  price?: number; // 价格（金币）
}

// 常见武器数据
export const WEAPONS: Weapon[] = [
  // 简易近战武器
  {
    id: 'club',
    name: '木棒',
    nameEn: 'Club',
    category: '简易近战武器',
    damage: '1d4',
    damageType: '钝击',
    properties: ['轻型'],
    mastery: 'Slow',
    masteryDescription: '减速：命中时目标速度-10尺直到你的下回合开始'
  },
  {
    id: 'dagger',
    name: '匕首',
    nameEn: 'Dagger',
    category: '简易近战武器',
    damage: '1d4',
    damageType: '穿刺',
    properties: ['灵巧', '轻型', '投掷（20/60）'],
    mastery: 'Nick',
    masteryDescription: '轻击：可作为附赠动作进行额外攻击'
  },
  {
    id: 'greatclub',
    name: '巨棒',
    nameEn: 'Greatclub',
    category: '简易近战武器',
    damage: '1d8',
    damageType: '钝击',
    properties: ['双手'],
    mastery: 'Push',
    masteryDescription: '推撞：命中时可推开目标10尺'
  },
  {
    id: 'handaxe',
    name: '手斧',
    nameEn: 'Handaxe',
    category: '简易近战武器',
    damage: '1d6',
    damageType: '挥砍',
    properties: ['轻型', '投掷（20/60）'],
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'javelin',
    name: '标枪',
    nameEn: 'Javelin',
    category: '简易近战武器',
    damage: '1d6',
    damageType: '穿刺',
    properties: ['投掷（30/120）'],
    mastery: 'Slow',
    masteryDescription: '减速：命中时目标速度-10尺直到你的下回合开始'
  },
  {
    id: 'light-hammer',
    name: '轻锤',
    nameEn: 'Light Hammer',
    category: '简易近战武器',
    damage: '1d4',
    damageType: '钝击',
    properties: ['轻型', '投掷（20/60）'],
    mastery: 'Nick',
    masteryDescription: '轻击：可作为附赠动作进行额外攻击'
  },
  {
    id: 'mace',
    name: '钉头锤',
    nameEn: 'Mace',
    category: '简易近战武器',
    damage: '1d6',
    damageType: '钝击',
    properties: [],
    mastery: 'Sap',
    masteryDescription: '重击：命中时目标下次攻击有劣势'
  },
  {
    id: 'quarterstaff',
    name: '木棍',
    nameEn: 'Quarterstaff',
    category: '简易近战武器',
    damage: '1d6',
    damageType: '钝击',
    properties: ['多用途（1d8）'],
    mastery: 'Topple',
    masteryDescription: '击倒：命中时可尝试击倒目标'
  },
  {
    id: 'sickle',
    name: '镰刀',
    nameEn: 'Sickle',
    category: '简易近战武器',
    damage: '1d4',
    damageType: '挥砍',
    properties: ['轻型'],
    mastery: 'Nick',
    masteryDescription: '轻击：可作为附赠动作进行额外攻击'
  },
  {
    id: 'spear',
    name: '矛',
    nameEn: 'Spear',
    category: '简易近战武器',
    damage: '1d6',
    damageType: '穿刺',
    properties: ['投掷（20/60）', '多用途（1d8）'],
    mastery: 'Sap',
    masteryDescription: '重击：命中时目标下次攻击有劣势'
  },
  
  // 简易远程武器
  {
    id: 'light-crossbow',
    name: '轻弩',
    nameEn: 'Light Crossbow',
    category: '简易远程武器',
    damage: '1d8',
    damageType: '穿刺',
    properties: ['弹药（80/320）', '装填', '双手'],
    range: '80/320',
    mastery: 'Slow',
    masteryDescription: '减速：命中时目标速度-10尺直到你的下回合开始'
  },
  {
    id: 'shortbow',
    name: '短弓',
    nameEn: '短弓',
    category: '简易远程武器',
    damage: '1d6',
    damageType: '穿刺',
    properties: ['弹药（80/320）', '双手'],
    range: '80/320',
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'sling',
    name: '投石索',
    nameEn: 'Sling',
    category: '简易远程武器',
    damage: '1d4',
    damageType: '钝击',
    properties: ['弹药（30/120）'],
    range: '30/120',
    mastery: 'Slow',
    masteryDescription: '减速：命中时目标速度-10尺直到你的下回合开始'
  },
  
  // 军用近战武器
  {
    id: 'battleaxe',
    name: '战斧',
    nameEn: 'Battleaxe',
    category: '军用近战武器',
    damage: '1d8',
    damageType: '挥砍',
    properties: ['多用途（1d10）'],
    mastery: 'Topple',
    masteryDescription: '击倒：命中时可尝试击倒目标'
  },
  {
    id: 'flail',
    name: '连枷',
    nameEn: 'Flail',
    category: '军用近战武器',
    damage: '1d8',
    damageType: '钝击',
    properties: [],
    mastery: 'Sap',
    masteryDescription: '重击：命中时目标下次攻击有劣势'
  },
  {
    id: 'longsword',
    name: '长剑',
    nameEn: 'Longsword',
    category: '军用近战武器',
    damage: '1d8',
    damageType: '挥砍',
    properties: ['多用途（1d10）'],
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'rapier',
    name: '细剑',
    nameEn: 'Rapier',
    category: '军用近战武器',
    damage: '1d8',
    damageType: '穿刺',
    properties: ['灵巧'],
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'shortsword',
    name: '短剑',
    nameEn: 'Shortsword',
    category: '军用近战武器',
    damage: '1d6',
    damageType: '穿刺',
    properties: ['灵巧', '轻型'],
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'greatsword',
    name: '巨剑',
    nameEn: 'Greatsword',
    category: '军用近战武器',
    damage: '2d6',
    damageType: '挥砍',
    properties: ['重型', '双手'],
    mastery: 'Graze',
    masteryDescription: '擦伤：未命中时仍造成等于属性调整值的伤害'
  },
  {
    id: 'greataxe',
    name: '巨斧',
    nameEn: 'Greataxe',
    category: '军用近战武器',
    damage: '1d12',
    damageType: '挥砍',
    properties: ['重型', '双手'],
    mastery: 'Cleave',
    masteryDescription: '横扫：击杀敌人时可对5尺内另一敌人造成伤害'
  },
  {
    id: 'warhammer',
    name: '战锤',
    nameEn: 'Warhammer',
    category: '军用近战武器',
    damage: '1d8',
    damageType: '钝击',
    properties: ['多用途（1d10）'],
    mastery: 'Push',
    masteryDescription: '推撞：命中时可推开目标10尺'
  },
  
  // 军用远程武器
  {
    id: 'longbow',
    name: '长弓',
    nameEn: 'Longbow',
    category: '军用远程武器',
    damage: '1d8',
    damageType: '穿刺',
    properties: ['弹药（150/600）', '重型', '双手'],
    range: '150/600',
    mastery: 'Slow',
    masteryDescription: '减速：命中时目标速度-10尺直到你的下回合开始'
  },
  {
    id: 'hand-crossbow',
    name: '手弩',
    nameEn: 'Hand Crossbow',
    category: '军用远程武器',
    damage: '1d6',
    damageType: '穿刺',
    properties: ['弹药（30/120）', '轻型', '装填'],
    range: '30/120',
    mastery: 'Vex',
    masteryDescription: '烦扰：命中时下次对目标攻击有优势'
  },
  {
    id: 'heavy-crossbow',
    name: '重弩',
    nameEn: 'Heavy Crossbow',
    category: '军用远程武器',
    damage: '1d10',
    damageType: '穿刺',
    properties: ['弹药（100/400）', '重型', '装填', '双手'],
    range: '100/400',
    mastery: 'Push',
    masteryDescription: '推撞：命中时可推开目标10尺'
  }
];

// 护甲数据
export const ARMORS: Armor[] = [
  // 轻甲
  {
    id: 'padded',
    name: '厚布甲',
    nameEn: 'Padded',
    category: '轻甲',
    ac: '11 + 敏捷调整值',
    stealthDisadvantage: true
  },
  {
    id: 'leather',
    name: '皮甲',
    nameEn: 'Leather',
    category: '轻甲',
    ac: '11 + 敏捷调整值'
  },
  {
    id: 'studded-leather',
    name: '镶钉皮甲',
    nameEn: 'Studded Leather',
    category: '轻甲',
    ac: '12 + 敏捷调整值'
  },
  
  // 中甲
  {
    id: 'hide',
    name: '兽皮甲',
    nameEn: 'Hide',
    category: '中甲',
    ac: '12 + 敏捷调整值（最多+2）'
  },
  {
    id: 'chain-shirt',
    name: '链甲衫',
    nameEn: 'Chain Shirt',
    category: '中甲',
    ac: '13 + 敏捷调整值（最多+2）'
  },
  {
    id: 'scale-mail',
    name: '鳞甲',
    nameEn: 'Scale Mail',
    category: '中甲',
    ac: '14 + 敏捷调整值（最多+2）',
    stealthDisadvantage: true
  },
  {
    id: 'breastplate',
    name: '胸甲',
    nameEn: 'Breastplate',
    category: '中甲',
    ac: '14 + 敏捷调整值（最多+2）'
  },
  {
    id: 'half-plate',
    name: '半身板甲',
    nameEn: 'Half Plate',
    category: '中甲',
    ac: '15 + 敏捷调整值（最多+2）',
    stealthDisadvantage: true
  },
  
  // 重甲
  {
    id: 'ring-mail',
    name: '环甲',
    nameEn: 'Ring Mail',
    category: '重甲',
    ac: '14',
    stealthDisadvantage: true
  },
  {
    id: 'chain-mail',
    name: '链甲',
    nameEn: 'Chain Mail',
    category: '重甲',
    ac: '16',
    strengthRequirement: 13,
    stealthDisadvantage: true
  },
  {
    id: 'splint',
    name: '板条甲',
    nameEn: 'Splint',
    category: '重甲',
    ac: '17',
    strengthRequirement: 15,
    stealthDisadvantage: true
  },
  {
    id: 'plate',
    name: '板甲',
    nameEn: 'Plate',
    category: '重甲',
    ac: '18',
    strengthRequirement: 15,
    stealthDisadvantage: true
  },
  
  // 盾牌
  {
    id: 'shield',
    name: '盾牌',
    nameEn: 'Shield',
    category: '盾牌',
    ac: '+2'
  }
];

// 辅助函数
export function getWeaponById(id: string): Weapon | undefined {
  return WEAPONS.find(w => w.id === id);
}

export function getWeaponByName(name: string): Weapon | undefined {
  return WEAPONS.find(w => w.name === name || w.nameEn === name);
}

export function getArmorById(id: string): Armor | undefined {
  return ARMORS.find(a => a.id === id);
}

export function getArmorByName(name: string): Armor | undefined {
  return ARMORS.find(a => a.name === name || a.nameEn === name);
}

// 计算武器攻击加值
export function calculateWeaponAttackBonus(
  weapon: Weapon,
  strengthMod: number,
  dexterityMod: number,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  // 确定使用哪个属性调整值
  let abilityMod = strengthMod;
  
  // 灵巧武器可以使用敏捷
  if (weapon.properties.includes('灵巧')) {
    abilityMod = Math.max(strengthMod, dexterityMod);
  }
  
  // 远程武器使用敏捷
  if (weapon.category.includes('远程')) {
    abilityMod = dexterityMod;
  }
  
  // 加上熟练加值
  return abilityMod + (isProficient ? proficiencyBonus : 0);
}

// 计算AC
export function calculateAC(
  baseAC: number,
  armor: Armor | null,
  shield: boolean,
  dexterityMod: number,
  isProficientWithArmor: boolean
): number {
  if (!armor) {
    // 无甲AC = 10 + 敏捷调整值
    return 10 + dexterityMod;
  }
  
  // 如果不熟练护甲，无法获得AC加值（使用基础AC）
  if (!isProficientWithArmor) {
    return 10 + dexterityMod;
  }
  
  let ac = 0;
  const acString = armor.ac.toString();
  
  if (acString.includes('+')) {
    // 轻甲和中甲
    const baseValue = parseInt(acString);
    if (armor.category === '轻甲') {
      ac = baseValue + dexterityMod;
    } else if (armor.category === '中甲') {
      ac = baseValue + Math.min(dexterityMod, 2);
    }
  } else {
    // 重甲
    ac = parseInt(acString);
  }
  
  // 加盾牌
  if (shield) {
    ac += 2;
  }
  
  return ac;
}

// 价格数据（D&D 5e标准价格，单位：金币）
const WEAPON_PRICES: Record<string, number> = {
  // 简易近战武器
  '木棒': 0.1,
  '匕首': 2,
  '巨棒': 0.2,
  '手斧': 5,
  '标枪': 0.5,
  '轻锤': 2,
  '钉头锤': 5,
  '长杖': 0.2,
  '短剑': 10,
  '长矛': 1,
  '硬头锤': 2,
  '投石索': 0.1,
  '长矛（双手）': 1,
  '战锤': 15,
  '战镐': 5,
  '弯刀': 25,
  '镰刀': 1,
  '短棒': 0.1,
  // 简易远程武器
  '轻弩': 25,
  '飞镖': 0.05,
  '短弓': 25,
  '投石索': 0.1,
  // 军用近战武器
  '战斧': 10,
  '战锤': 15,
  '长戟': 20,
  '长矛': 1,
  '长剑': 15,
  '长鞭': 2,
  '战镐': 5,
  '弯刀': 25,
  '短剑': 10,
  '三叉戟': 5,
  '战锤': 15,
  '战斧': 10,
  '巨斧': 30,
  '巨剑': 50,
  '长戟': 20,
  '长矛': 1,
  '长柄刀': 20,
  '长鞭': 2,
  '战锤': 15,
  '战镐': 5,
  '弯刀': 25,
  '短剑': 10,
  '三叉戟': 5,
  '战锤': 15,
  '战斧': 10,
  // 军用远程武器
  '吹箭筒': 10,
  '手弩': 75,
  '重弩': 50,
  '长弓': 50,
  '网': 1,
};

const ARMOR_PRICES: Record<string, number> = {
  // 轻甲
  '厚布甲': 5,
  '皮甲': 10,
  '镶钉皮甲': 45,
  // 中甲
  '兽皮甲': 10,
  '链甲衫': 50,
  '鳞甲': 50,
  '胸甲': 400,
  '半身板甲': 750,
  // 重甲
  '环甲': 30,
  '链甲': 75,
  '板条甲': 200,
  '板甲': 1500,
  // 盾牌
  '盾牌': 10,
};

// 获取武器价格
export function getWeaponPrice(weaponName: string): number {
  return WEAPON_PRICES[weaponName] || 0;
}

// 获取护甲价格
export function getArmorPrice(armorName: string): number {
  return ARMOR_PRICES[armorName] || 0;
}

// 获取装备价格（通用函数，自动识别武器或护甲）
export function getEquipmentPrice(itemName: string): number {
  const weapon = getWeaponByName(itemName);
  if (weapon) {
    return weapon.price || getWeaponPrice(itemName);
  }
  const armor = getArmorByName(itemName);
  if (armor) {
    return armor.price || getArmorPrice(itemName);
  }
  // 默认价格（冒险装备等）
  const defaultPrices: Record<string, number> = {
    '背包': 2,
    '睡袋': 0.1,
    '绳索（50尺）': 1,
    '火把（10支）': 0.1,
    '口粮（10天）': 5,
    '水袋': 0.2,
    '盗贼工具': 25,
    '医疗包': 5,
    '撬棍': 2,
    '铁钉（10个）': 0.1,
  };
  return defaultPrices[itemName] || 0;
}

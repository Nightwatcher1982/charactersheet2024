/**
 * D&D 2024 子职业数据（3 级选择）
 * 来源：职业.md 各职业「X级：X子职」
 */

export interface Subclass {
  id: string;
  name: string;
  nameEn: string;
  classId: string; // 与 dnd-data CLASSES[].id 一致
  levelGained: number; // 均为 3
  description?: string;
}

export const SUBCLASSES: Subclass[] = [
  // 野蛮人
  { id: 'berserker', name: '狂战士道途', nameEn: 'Path of the Berserker', classId: 'barbarian', levelGained: 3 },
  { id: 'beast', name: '兽心道途', nameEn: 'Path of the Beast', classId: 'barbarian', levelGained: 3 },
  { id: 'world-tree', name: '世界树道途', nameEn: 'Path of the World Tree', classId: 'barbarian', levelGained: 3 },
  { id: 'zealot', name: '狂热者道途', nameEn: 'Path of the Zealot', classId: 'barbarian', levelGained: 3 },
  // 吟游诗人
  { id: 'dance', name: '舞蹈学院', nameEn: 'College of Dance', classId: 'bard', levelGained: 3 },
  { id: 'glamour', name: '魅心学院', nameEn: 'College of Glamour', classId: 'bard', levelGained: 3 },
  { id: 'lore', name: '逸闻学院', nameEn: 'College of Lore', classId: 'bard', levelGained: 3 },
  { id: 'valor', name: '勇气学院', nameEn: 'College of Valor', classId: 'bard', levelGained: 3 },
  // 牧师
  { id: 'life', name: '生命领域', nameEn: 'Life Domain', classId: 'cleric', levelGained: 3 },
  { id: 'light', name: '光明领域', nameEn: 'Light Domain', classId: 'cleric', levelGained: 3 },
  { id: 'trickery', name: '诡术领域', nameEn: 'Trickery Domain', classId: 'cleric', levelGained: 3 },
  { id: 'war', name: '战争领域', nameEn: 'War Domain', classId: 'cleric', levelGained: 3 },
  // 德鲁伊
  { id: 'land', name: '大地结社', nameEn: 'Circle of the Land', classId: 'druid', levelGained: 3 },
  { id: 'moon', name: '月亮结社', nameEn: 'Circle of the Moon', classId: 'druid', levelGained: 3 },
  { id: 'sea', name: '海洋结社', nameEn: 'Circle of the Sea', classId: 'druid', levelGained: 3 },
  { id: 'stars', name: '星辰结社', nameEn: 'Circle of the Stars', classId: 'druid', levelGained: 3 },
  // 战士
  { id: 'battle-master', name: '战斗大师', nameEn: 'Battle Master', classId: 'fighter', levelGained: 3 },
  { id: 'champion', name: '勇士', nameEn: 'Champion', classId: 'fighter', levelGained: 3 },
  { id: 'eldritch-knight', name: '奥法骑士', nameEn: 'Eldritch Knight', classId: 'fighter', levelGained: 3 },
  { id: 'psi-warrior', name: '灵能武士', nameEn: 'Psi Warrior', classId: 'fighter', levelGained: 3 },
  // 武僧
  { id: 'mercy', name: '命流武者', nameEn: 'Way of Mercy', classId: 'monk', levelGained: 3 },
  { id: 'shadow', name: '暗影武者', nameEn: 'Way of Shadow', classId: 'monk', levelGained: 3 },
  { id: 'four-elements', name: '四象武者', nameEn: 'Way of the Four Elements', classId: 'monk', levelGained: 3 },
  { id: 'open-hand', name: '散打武者', nameEn: 'Way of the Open Hand', classId: 'monk', levelGained: 3 },
  // 圣武士
  { id: 'devotion', name: '奉献之誓', nameEn: 'Oath of Devotion', classId: 'paladin', levelGained: 3 },
  { id: 'glory', name: '荣耀之誓', nameEn: 'Oath of Glory', classId: 'paladin', levelGained: 3 },
  { id: 'ancients', name: '古贤之誓', nameEn: 'Oath of the Ancients', classId: 'paladin', levelGained: 3 },
  { id: 'vengeance', name: '复仇之誓', nameEn: 'Oath of Vengeance', classId: 'paladin', levelGained: 3 },
  // 游侠
  { id: 'beast-master', name: '驯兽师', nameEn: 'Beast Master', classId: 'ranger', levelGained: 3 },
  { id: 'fey-wanderer', name: '妖精漫游者', nameEn: 'Fey Wanderer', classId: 'ranger', levelGained: 3 },
  { id: 'gloom-stalker', name: '幽域追猎者', nameEn: 'Gloom Stalker', classId: 'ranger', levelGained: 3 },
  { id: 'hunter', name: '猎人', nameEn: 'Hunter', classId: 'ranger', levelGained: 3 },
  // 游荡者
  { id: 'arcane-trickster', name: '诡术师', nameEn: 'Arcane Trickster', classId: 'rogue', levelGained: 3 },
  { id: 'assassin', name: '刺客', nameEn: 'Assassin', classId: 'rogue', levelGained: 3 },
  { id: 'soulknife', name: '魂刃', nameEn: 'Soulknife', classId: 'rogue', levelGained: 3 },
  { id: 'thief', name: '盗贼', nameEn: 'Thief', classId: 'rogue', levelGained: 3 },
  // 术士
  { id: 'aberrant-mind', name: '畸变术法', nameEn: 'Aberrant Mind', classId: 'sorcerer', levelGained: 3 },
  { id: 'clockwork-soul', name: '时械术法', nameEn: 'Clockwork Soul', classId: 'sorcerer', levelGained: 3 },
  { id: 'draconic', name: '龙族术法', nameEn: 'Draconic Sorcery', classId: 'sorcerer', levelGained: 3 },
  { id: 'wild-magic', name: '狂野术法', nameEn: 'Wild Magic', classId: 'sorcerer', levelGained: 3 },
  // 魔契师
  { id: 'archfey', name: '至高妖精宗主', nameEn: 'The Archfey', classId: 'warlock', levelGained: 3 },
  { id: 'celestial', name: '天界宗主', nameEn: 'The Celestial', classId: 'warlock', levelGained: 3 },
  { id: 'fiend', name: '邪魔宗主', nameEn: 'The Fiend', classId: 'warlock', levelGained: 3 },
  { id: 'great-old-one', name: '旧日支配者宗主', nameEn: 'The Great Old One', classId: 'warlock', levelGained: 3 },
  // 法师
  { id: 'abjuration', name: '防护师', nameEn: 'School of Abjuration', classId: 'wizard', levelGained: 3 },
  { id: 'divination', name: '预言师', nameEn: 'School of Divination', classId: 'wizard', levelGained: 3 },
  { id: 'evocation', name: '塑能师', nameEn: 'School of Evocation', classId: 'wizard', levelGained: 3 },
  { id: 'illusion', name: '幻术师', nameEn: 'School of Illusion', classId: 'wizard', levelGained: 3 },
];

const CLASS_ID_TO_NAME: Record<string, string> = {
  barbarian: '野蛮人',
  bard: '吟游诗人',
  cleric: '牧师',
  druid: '德鲁伊',
  fighter: '战士',
  monk: '武僧',
  paladin: '圣武士',
  ranger: '游侠',
  rogue: '游荡者',
  sorcerer: '术士',
  warlock: '魔契师',
  wizard: '法师',
};

/** 按职业 id 获取该职业的所有子职业 */
export function getSubclassesByClassId(classId: string): Subclass[] {
  return SUBCLASSES.filter((s) => s.classId === classId);
}

/** 按职业中文名获取子职业（用于角色 class 存中文名的场景） */
export function getSubclassesByClassName(className: string): Subclass[] {
  const classId = Object.entries(CLASS_ID_TO_NAME).find(([, name]) => name === className)?.[0];
  return classId ? getSubclassesByClassId(classId) : [];
}

/** 根据 classId 与 subclass id 查子职业 */
export function getSubclassById(classId: string, subclassId: string): Subclass | undefined {
  return SUBCLASSES.find((s) => s.classId === classId && s.id === subclassId);
}

/** 职业是否有 3 级子职业（12 职业均有） */
export function hasSubclassAt3(classId: string): boolean {
  return getSubclassesByClassId(classId).length > 0;
}

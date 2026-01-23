// D&D 2024 语言数据

export interface Language {
  id: string;
  name: string;
  nameEn: string;
  type: 'standard' | 'rare';
  origin: string;
  description: string;
  script?: string;
  typicalSpeakers?: string[];
}

// 标准语言 - 在物质位面广泛使用
export const STANDARD_LANGUAGES: Language[] = [
  {
    id: 'common',
    name: '通用语',
    nameEn: 'Common',
    type: 'standard',
    origin: 'Sigil',
    script: '通用语文字',
    description: '多元宇宙中最广泛使用的语言，起源于位面之城印记城',
    typicalSpeakers: ['所有种族', '商人', '旅行者']
  },
  {
    id: 'common-sign',
    name: '通用手语',
    nameEn: 'Common Sign Language',
    type: 'standard',
    origin: 'Sigil',
    description: '使用手势和面部表情进行交流的通用手语系统',
    typicalSpeakers: ['聋哑人', '需要无声交流者']
  },
  {
    id: 'draconic',
    name: '龙语',
    nameEn: 'Draconic',
    type: 'standard',
    origin: '龙族',
    script: '龙文',
    description: '古老而强大的语言，据说是最古老的凡间语言之一',
    typicalSpeakers: ['龙', '龙裔', '蜥蜴人', '克伯德']
  },
  {
    id: 'dwarvish',
    name: '矮人语',
    nameEn: 'Dwarvish',
    type: 'standard',
    origin: '矮人',
    script: '矮人文',
    description: '充满坚硬辅音和低沉音调的语言，回荡在山脉和地下城市中',
    typicalSpeakers: ['矮人']
  },
  {
    id: 'elvish',
    name: '精灵语',
    nameEn: 'Elvish',
    type: 'standard',
    origin: '精灵',
    script: '精灵文',
    description: '流畅优美的语言，带有细微的音调变化和长元音',
    typicalSpeakers: ['精灵', '半精灵', '卓尔']
  },
  {
    id: 'giant',
    name: '巨人语',
    nameEn: 'Giant',
    type: 'standard',
    origin: '巨人',
    script: '矮人文',
    description: '巨人使用的古老语言，声音洪亮而简单',
    typicalSpeakers: ['巨人', '巨人裔', '食人魔', '巨魔']
  },
  {
    id: 'gnomish',
    name: '侏儒语',
    nameEn: 'Gnomish',
    type: 'standard',
    origin: '侏儒',
    script: '矮人文',
    description: '充满技术术语和长复合词的语言',
    typicalSpeakers: ['侏儒']
  },
  {
    id: 'goblin',
    name: '地精语',
    nameEn: 'Goblin',
    type: 'standard',
    origin: '地精类',
    script: '矮人文',
    description: '粗糙而尖锐的语言，带有许多咆哮和咔嗒声',
    typicalSpeakers: ['地精', '大地精', '熊地精']
  },
  {
    id: 'halfling',
    name: '半身人语',
    nameEn: 'Halfling',
    type: 'standard',
    origin: '半身人',
    script: '通用语文字',
    description: '温和而悦耳的语言，不太经常被书写',
    typicalSpeakers: ['半身人']
  },
  {
    id: 'orc',
    name: '兽人语',
    nameEn: 'Orc',
    type: 'standard',
    origin: '兽人',
    script: '矮人文',
    description: '粗犷的语言，充满咆哮和吼叫',
    typicalSpeakers: ['兽人', '半兽人']
  }
];

// 稀有语言 - 秘密语言或来自其他位面
export const RARE_LANGUAGES: Language[] = [
  {
    id: 'abyssal',
    name: '深渊语',
    nameEn: 'Abyssal',
    type: 'rare',
    origin: '无底深渊的恶魔',
    script: '炼狱文',
    description: '混乱邪恶的恶魔使用的语言，充满混乱和疯狂',
    typicalSpeakers: ['恶魔', '魔人（深渊血统）']
  },
  {
    id: 'celestial',
    name: '天界语',
    nameEn: 'Celestial',
    type: 'rare',
    origin: '天界生物',
    script: '天界文',
    description: '善良天界生物使用的神圣语言',
    typicalSpeakers: ['天使', '阿斯莫', '天界']
  },
  {
    id: 'deep-speech',
    name: '深渊语（异怪）',
    nameEn: 'Deep Speech',
    type: 'rare',
    origin: '异怪',
    description: '异怪和它们的奴隶使用的外星语言，没有书写形式',
    typicalSpeakers: ['夺心魔', '灵吸怪', 'aboleth', '其他异怪']
  },
  {
    id: 'druidic',
    name: '德鲁伊语',
    nameEn: 'Druidic',
    type: 'rare',
    origin: '德鲁伊圈',
    script: '德鲁伊文',
    description: '德鲁伊的秘密语言，只有德鲁伊可以学习',
    typicalSpeakers: ['德鲁伊']
  },
  {
    id: 'infernal',
    name: '炼狱语',
    nameEn: 'Infernal',
    type: 'rare',
    origin: '九层地狱的魔鬼',
    script: '炼狱文',
    description: '守序邪恶的魔鬼使用的语言',
    typicalSpeakers: ['魔鬼', '魔人（炼狱血统）']
  },
  {
    id: 'primordial',
    name: '原初语',
    nameEn: 'Primordial',
    type: 'rare',
    origin: '元素',
    script: '矮人文',
    description: '元素生物使用的语言，包括四种方言',
    typicalSpeakers: ['元素', '精类', '基因']
  },
  {
    id: 'sylvan',
    name: '林地语',
    nameEn: 'Sylvan',
    type: 'rare',
    origin: '妖精荒野',
    script: '精灵文',
    description: '妖精荒野生物使用的语言',
    typicalSpeakers: ['妖精', '树人', '独角兽']
  },
  {
    id: 'thieves-cant',
    name: '盗贼黑话',
    nameEn: "Thieves' Cant",
    type: 'rare',
    origin: '各种犯罪行会',
    description: '盗贼和罪犯使用的秘密混合语言，包含隐语、行话和暗号',
    typicalSpeakers: ['盗贼', '罪犯', '游荡者']
  },
  {
    id: 'undercommon',
    name: '地底通用语',
    nameEn: 'Undercommon',
    type: 'rare',
    origin: '幽暗地域',
    script: '精灵文',
    description: '幽暗地域生物使用的通用语言',
    typicalSpeakers: ['卓尔', '夺心魔', '幽暗地域商人']
  }
];

// 原初语的四种方言
export const PRIMORDIAL_DIALECTS = [
  {
    id: 'aquan',
    name: '水族语',
    nameEn: 'Aquan',
    parent: 'primordial',
    description: '水元素和水中生物使用的原初语方言'
  },
  {
    id: 'auran',
    name: '风族语',
    nameEn: 'Auran',
    parent: 'primordial',
    description: '气元素和飞行生物使用的原初语方言'
  },
  {
    id: 'ignan',
    name: '火族语',
    nameEn: 'Ignan',
    parent: 'primordial',
    description: '火元素使用的原初语方言'
  },
  {
    id: 'terran',
    name: '土族语',
    nameEn: 'Terran',
    parent: 'primordial',
    description: '土元素和地下生物使用的原初语方言'
  }
];

// 合并所有语言
export const ALL_LANGUAGES = [...STANDARD_LANGUAGES, ...RARE_LANGUAGES];

// 根据ID获取语言
export function getLanguageById(id: string): Language | undefined {
  return ALL_LANGUAGES.find(lang => lang.id === id);
}

// 根据类型获取语言
export function getLanguagesByType(type: 'standard' | 'rare'): Language[] {
  if (type === 'standard') return STANDARD_LANGUAGES;
  if (type === 'rare') return RARE_LANGUAGES;
  return [];
}

// 获取语言的显示名称
export function getLanguageDisplayName(id: string): string {
  const language = getLanguageById(id);
  return language ? `${language.name} (${language.nameEn})` : id;
}

// 检查是否可以选择某个语言
export function canSelectLanguage(languageId: string, alreadyKnown: string[]): boolean {
  // 通用语自动获得，不需要选择
  if (languageId === 'common') return false;
  
  // 已知的语言不能再选
  if (alreadyKnown.includes(languageId)) return false;
  
  // 德鲁伊语只有德鲁伊可以学习（需要特殊检查）
  if (languageId === 'druidic') return false;
  
  // 盗贼黑话通常通过职业获得
  if (languageId === 'thieves-cant') return false;
  
  return true;
}

// 用于投骰的标准语言表（1d12）
export const STANDARD_LANGUAGES_TABLE = [
  { roll: 0, id: 'common', name: '通用语' }, // 自动获得，不用投
  { roll: 1, id: 'common-sign', name: '通用手语' },
  { roll: 2, id: 'draconic', name: '龙语' },
  { roll: [3, 4], id: 'dwarvish', name: '矮人语' },
  { roll: [5, 6], id: 'elvish', name: '精灵语' },
  { roll: 7, id: 'giant', name: '巨人语' },
  { roll: 8, id: 'gnomish', name: '侏儒语' },
  { roll: 9, id: 'goblin', name: '地精语' },
  { roll: [10, 11], id: 'halfling', name: '半身人语' },
  { roll: 12, id: 'orc', name: '兽人语' }
];

// 投骰获取随机语言
export function rollRandomLanguage(): string {
  const roll = Math.floor(Math.random() * 12) + 1; // 1-12
  const entry = STANDARD_LANGUAGES_TABLE.find(e => {
    if (Array.isArray(e.roll)) {
      return roll >= e.roll[0] && roll <= e.roll[1];
    }
    return e.roll === roll;
  });
  return entry ? entry.id : 'common-sign';
}

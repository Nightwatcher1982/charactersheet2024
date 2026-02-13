/**
 * 职业等级表：每级获得的固定特性与可选（含 3 级子职业、4/8/12/16 属性值提升等）
 * 来源：职业.md 各职业特性表
 * 角色 class 存中文名时，需先将 className 转为 classId 再查表（见 getLevelEntry）。
 */

export interface LevelChoice {
  id: string;
  name: string;
  /** 选项列表；当 id 为 subclass 时由 getSubclassesByClassId(classId) 提供，此处可空 */
  options?: { id: string; name: string }[];
}

export interface ClassLevelEntry {
  level: number;
  /** 固定获得的特性 id/名称，用于展示 */
  features: { id: string; name: string }[];
  /** 本等级需做的选择（如子职业、属性值提升） */
  choices?: LevelChoice[];
}

type ClassLevelTable = Record<number, ClassLevelEntry>;

/** 野蛮人 1～20 级 */
const BARBARIAN_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'rage', name: '狂暴' }, { id: 'unarmored-defense', name: '无甲防御' }, { id: 'weapon-mastery', name: '武器精通' }] },
  2: { level: 2, features: [{ id: 'danger-sense', name: '危机感应' }, { id: 'reckless-attack', name: '鲁莽攻击' }] },
  3: { level: 3, features: [{ id: 'primal-knowledge', name: '原初学识' }], choices: [{ id: 'subclass', name: '野蛮人子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'extra-attack', name: '额外攻击' }, { id: 'fast-movement', name: '快速移动' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'feral-instinct', name: '野性直觉' }, { id: 'instinctive-pounce', name: '莽驰' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'brutal-strike', name: '凶蛮打击' }] },
  10: { level: 10, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  11: { level: 11, features: [{ id: 'relentless-rage', name: '坚韧狂暴' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'improved-brutal-strike', name: '强化凶蛮打击' }] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [{ id: 'persistent-rage', name: '持久狂暴' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'improved-brutal-strike-2', name: '强化凶蛮打击' }] },
  18: { level: 18, features: [{ id: 'indomitable-might', name: '不屈勇武' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'primal-champion', name: '原初斗士' }] },
};

/** 吟游诗人 1～20 级 */
const BARD_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'bardic-inspiration', name: '吟游诗人激励' }, { id: 'spellcasting', name: '施法' }] },
  2: { level: 2, features: [{ id: 'expertise', name: '专精' }, { id: 'jack-of-all-trades', name: '万事通' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '吟游诗人子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'font-of-inspiration', name: '激励之源' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'countercharm', name: '反迷惑' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'expertise-2', name: '专精' }] },
  10: { level: 10, features: [{ id: 'magical-secrets', name: '魔法奥秘' }] },
  11: { level: 11, features: [] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [] },
  18: { level: 18, features: [{ id: 'superior-inspiration', name: '先发激励' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'words-of-creation', name: '创生圣言' }] },
};

/** 牧师 1～20 级 */
const CLERIC_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'spellcasting', name: '施法' }, { id: 'divine-order', name: '圣职' }] },
  2: { level: 2, features: [{ id: 'channel-divinity', name: '引导神力' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '牧师子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'sear-undead', name: '灼净亡灵' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'blessed-strikes', name: '受祝击' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [] },
  10: { level: 10, features: [{ id: 'divine-intervention', name: '神圣干预' }] },
  11: { level: 11, features: [] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'improved-blessed-strike', name: '精通受祝击' }] },
  15: { level: 15, features: [] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  18: { level: 18, features: [] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'greater-divine-intervention', name: '进阶神圣干预' }] },
};

/** 德鲁伊 1～20 级 */
const DRUID_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'druidic', name: '德鲁伊语' }, { id: 'primal-order', name: '原初职能' }, { id: 'spellcasting', name: '施法' }] },
  2: { level: 2, features: [{ id: 'wild-shape', name: '荒野变形' }, { id: 'wild-companion', name: '荒野伙伴' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '德鲁伊子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'wild-resurgence', name: '荒野复苏' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'elemental-fury', name: '元素之怒' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [] },
  10: { level: 10, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  11: { level: 11, features: [] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [{ id: 'elemental-fury-improved', name: '元素神威' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [] },
  18: { level: 18, features: [{ id: 'beast-spells', name: '兽形施法' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'archdruid', name: '大德鲁伊' }] },
};

/** 战士 1～20 级（ASI 在 4/6/8/12/14/16） */
const FIGHTER_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'fighting-style', name: '战斗风格' }, { id: 'second-wind', name: '回气' }, { id: 'weapon-mastery', name: '武器精通' }], choices: [{ id: 'fightingStyle', name: '战斗风格' }] },
  2: { level: 2, features: [{ id: 'action-surge', name: '动作如潮' }, { id: 'tactical-mind', name: '战术思维' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '战士子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'extra-attack', name: '额外攻击' }, { id: 'tactical-shift', name: '战术转进' }] },
  6: { level: 6, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  7: { level: 7, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'indomitable', name: '不屈' }, { id: 'tactical-master', name: '战术主宰' }] },
  10: { level: 10, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  11: { level: 11, features: [{ id: 'extra-attack-2', name: '额外攻击（二）' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'indomitable-2', name: '不屈（两次）' }, { id: 'studied-attacks', name: '究明攻击' }] },
  14: { level: 14, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  15: { level: 15, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'action-surge-2', name: '动作如潮（两次）' }, { id: 'indomitable-3', name: '不屈（三次）' }] },
  18: { level: 18, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'extra-attack-3', name: '额外攻击（三）' }] },
};

/** 武僧 1～20 级 */
const MONK_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'martial-arts', name: '武艺' }, { id: 'unarmored-defense', name: '无甲防御' }] },
  2: { level: 2, features: [{ id: 'monk-focus', name: '武僧武功' }, { id: 'unarmored-movement', name: '无甲移动' }, { id: 'uncanny-metabolism', name: '运转周天' }] },
  3: { level: 3, features: [{ id: 'deflect-attacks', name: '拨挡攻击' }], choices: [{ id: 'subclass', name: '武僧子职' }] },
  4: { level: 4, features: [{ id: 'slow-fall', name: '轻身坠' }], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'extra-attack', name: '额外攻击' }, { id: 'stunning-strike', name: '震慑拳' }] },
  6: { level: 6, features: [{ id: 'empowered-strikes', name: '真力注拳' }, { id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'evasion', name: '反射闪避' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'acrobatic-movement', name: '飞檐走壁' }] },
  10: { level: 10, features: [{ id: 'heightened-focus', name: '出神入化' }, { id: 'self-restoration', name: '返本还元' }] },
  11: { level: 11, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'deflect-energy', name: '拨挡能量' }] },
  14: { level: 14, features: [{ id: 'disciplined-survivor', name: '圆融自在' }] },
  15: { level: 15, features: [{ id: 'perfect-focus', name: '明镜止水' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  18: { level: 18, features: [{ id: 'superior-defense', name: '无懈可击' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'body-and-mind', name: '天人合一' }] },
};

/** 圣武士 1～20 级 */
const PALADIN_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'lay-on-hands', name: '圣疗' }, { id: 'spellcasting', name: '施法' }, { id: 'weapon-mastery', name: '武器精通' }] },
  2: { level: 2, features: [{ id: 'fighting-style', name: '战斗风格' }, { id: 'paladins-smite', name: '圣武斩' }] },
  3: { level: 3, features: [{ id: 'channel-divinity', name: '引导神力' }], choices: [{ id: 'subclass', name: '圣武士子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'extra-attack', name: '额外攻击' }, { id: 'faithful-steed', name: '信实坐骑' }] },
  6: { level: 6, features: [{ id: 'aura-of-protection', name: '守护灵光' }] },
  7: { level: 7, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'abjure-foes', name: '弃绝众敌' }] },
  10: { level: 10, features: [{ id: 'aura-of-courage', name: '勇气灵光' }] },
  11: { level: 11, features: [{ id: 'radiant-strikes', name: '光耀打击' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'restoring-touch', name: '复原之触' }] },
  15: { level: 15, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [] },
  18: { level: 18, features: [{ id: 'aura-expansion', name: '灵光增效' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'subclass-feature', name: '子职特性' }] },
};

/** 游侠 1～20 级 */
const RANGER_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'spellcasting', name: '施法' }, { id: 'favored-enemy', name: '宿敌' }, { id: 'weapon-mastery', name: '武器精通' }] },
  2: { level: 2, features: [{ id: 'deft-explorer', name: '熟练探险家' }, { id: 'fighting-style', name: '战斗风格' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '游侠子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'extra-attack', name: '额外攻击' }] },
  6: { level: 6, features: [{ id: 'roving', name: '越野' }] },
  7: { level: 7, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'expertise', name: '专精' }] },
  10: { level: 10, features: [{ id: 'tireless', name: '不知疲倦' }] },
  11: { level: 11, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'relentless-hunter', name: '永恒追猎' }] },
  14: { level: 14, features: [{ id: 'natures-veil', name: '自然面纱' }] },
  15: { level: 15, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'precise-hunter', name: '致命猎杀' }] },
  18: { level: 18, features: [{ id: 'feral-senses', name: '野性感官' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'foe-slayer', name: '屠灭众敌' }] },
};

/** 游荡者 1～20 级（ASI 在 4/8/10/12/16） */
const ROGUE_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'expertise', name: '专精' }, { id: 'sneak-attack', name: '偷袭' }, { id: 'thieves-cant', name: '盗贼黑话' }, { id: 'weapon-mastery', name: '武器精通' }] },
  2: { level: 2, features: [{ id: 'cunning-action', name: '灵巧动作' }] },
  3: { level: 3, features: [{ id: 'steady-aim', name: '稳定瞄准' }], choices: [{ id: 'subclass', name: '游荡者子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'cunning-strike', name: '诡诈打击' }, { id: 'uncanny-dodge', name: '直觉闪避' }] },
  6: { level: 6, features: [{ id: 'expertise-2', name: '专精' }] },
  7: { level: 7, features: [{ id: 'evasion', name: '反射闪避' }, { id: 'reliable-talent', name: '可靠才能' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  10: { level: 10, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  11: { level: 11, features: [{ id: 'improved-cunning-strike', name: '进阶诡诈打击' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  14: { level: 14, features: [{ id: 'devious-strike', name: '凶狡打击' }] },
  15: { level: 15, features: [{ id: 'slippery-mind', name: '圆滑心智' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  18: { level: 18, features: [{ id: 'elusive', name: '飘忽不定' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'stroke-of-luck', name: '幸运一击' }] },
};

/** 术士 1～20 级 */
const SORCERER_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'spellcasting', name: '施法' }, { id: 'innate-sorcery', name: '先天术法' }] },
  2: { level: 2, features: [{ id: 'font-of-magic', name: '魔力泉涌' }, { id: 'metamagic', name: '超魔法' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '术士子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'sorcerous-restoration', name: '术法复苏' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [{ id: 'sorcery-incarnate', name: '术法化身' }] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [] },
  10: { level: 10, features: [{ id: 'metamagic-2', name: '超魔法' }] },
  11: { level: 11, features: [] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'metamagic-3', name: '超魔法' }] },
  18: { level: 18, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'arcane-apotheosis', name: '奥术化神' }] },
};

/** 魔契师 1～20 级 */
const WARLOCK_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'eldritch-invocations', name: '魔能祈唤' }, { id: 'pact-magic', name: '契约魔法' }] },
  2: { level: 2, features: [{ id: 'magical-cunning', name: '秘法回流' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '魔契师子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [{ id: 'contact-patron', name: '联络宗主' }] },
  10: { level: 10, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  11: { level: 11, features: [{ id: 'mystic-arcanum-6', name: '玄奥秘法（六环）' }] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [{ id: 'mystic-arcanum-7', name: '玄奥秘法（七环）' }] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [{ id: 'mystic-arcanum-8', name: '玄奥秘法（八环）' }] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [{ id: 'mystic-arcanum-9', name: '玄奥秘法（九环）' }] },
  18: { level: 18, features: [] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'eldritch-master', name: '魔能掌控' }] },
};

/** 法师 1～20 级 */
const WIZARD_LEVELS: ClassLevelTable = {
  1: { level: 1, features: [{ id: 'spellcasting', name: '施法' }, { id: 'ritual-adept', name: '仪式学家' }, { id: 'arcane-recovery', name: '奥术回想' }] },
  2: { level: 2, features: [{ id: 'scholar', name: '学者' }] },
  3: { level: 3, features: [], choices: [{ id: 'subclass', name: '法师子职' }] },
  4: { level: 4, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  5: { level: 5, features: [{ id: 'memorize-spell', name: '记忆法术' }] },
  6: { level: 6, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  7: { level: 7, features: [] },
  8: { level: 8, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  9: { level: 9, features: [] },
  10: { level: 10, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  11: { level: 11, features: [] },
  12: { level: 12, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  13: { level: 13, features: [] },
  14: { level: 14, features: [{ id: 'subclass-feature', name: '子职特性' }] },
  15: { level: 15, features: [] },
  16: { level: 16, features: [], choices: [{ id: 'ability-score-improvement', name: '属性值提升' }] },
  17: { level: 17, features: [] },
  18: { level: 18, features: [{ id: 'spell-mastery', name: '法术精通' }] },
  19: { level: 19, features: [], choices: [{ id: 'epic-boon', name: '传奇恩惠' }] },
  20: { level: 20, features: [{ id: 'signature-spells', name: '招牌法术' }] },
};

const CLASS_LEVEL_TABLES: Record<string, ClassLevelTable> = {
  barbarian: BARBARIAN_LEVELS,
  bard: BARD_LEVELS,
  cleric: CLERIC_LEVELS,
  druid: DRUID_LEVELS,
  fighter: FIGHTER_LEVELS,
  monk: MONK_LEVELS,
  paladin: PALADIN_LEVELS,
  ranger: RANGER_LEVELS,
  rogue: ROGUE_LEVELS,
  sorcerer: SORCERER_LEVELS,
  warlock: WARLOCK_LEVELS,
  wizard: WIZARD_LEVELS,
};

const CLASS_NAME_TO_ID: Record<string, string> = {
  '野蛮人': 'barbarian',
  '吟游诗人': 'bard',
  '牧师': 'cleric',
  '德鲁伊': 'druid',
  '战士': 'fighter',
  '武僧': 'monk',
  '圣武士': 'paladin',
  '游侠': 'ranger',
  '游荡者': 'rogue',
  '术士': 'sorcerer',
  '魔契师': 'warlock',
  '法师': 'wizard',
};

/** 将职业中文名转为 classId */
export function getClassIdFromName(className: string): string | null {
  return CLASS_NAME_TO_ID[className] ?? null;
}

/** 按职业 id 获取指定等级的等级表条目 */
export function getLevelEntry(classId: string, level: number): ClassLevelEntry | null {
  const table = CLASS_LEVEL_TABLES[classId];
  if (!table) return null;
  return table[level] ?? null;
}

/** 按职业中文名获取等级表条目（角色 character.class 为中文名时使用） */
export function getLevelEntryByClassName(className: string, level: number): ClassLevelEntry | null {
  const classId = getClassIdFromName(className);
  return classId ? getLevelEntry(classId, level) : null;
}

/** 本等级是否有子职业选择（通常为 3 级） */
export function levelHasSubclassChoice(entry: ClassLevelEntry): boolean {
  return entry.choices?.some((c) => c.id === 'subclass') ?? false;
}

/** 本等级是否有属性值提升/专长选择 */
export function levelHasASIChoice(entry: ClassLevelEntry): boolean {
  return entry.choices?.some((c) => c.id === 'ability-score-improvement' || c.id === 'epic-boon') ?? false;
}

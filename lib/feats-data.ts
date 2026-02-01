// D&D 2024 专长数据

export interface Feat {
  id: string;
  name: string;
  nameEn: string;
  type: 'origin' | 'general' | 'epic';
  category?: string;
  description: string;
  prerequisite?: string;
  repeatable?: boolean;
  benefits: string[];
}

// 起源专长 - 这些可以在1级通过背景获得
export const ORIGIN_FEATS: Feat[] = [
  {
    id: 'alert',
    name: '警觉',
    nameEn: 'Alert',
    type: 'origin',
    category: '战斗',
    description: '你总是警惕危险，难以被突袭',
    benefits: [
      '在先攻检定中获得熟练加值的加值',
      '你无法被突袭',
      '其他生物对你进行攻击检定时，不会因为你看不见它们而获得优势'
    ]
  },
  {
    id: 'magic-initiate-cleric',
    name: '魔法学徒（牧师）',
    nameEn: 'Magic Initiate (Cleric)',
    type: 'origin',
    category: '法术',
    description: '从牧师法术列表习得两道戏法和一道一环法术',
    repeatable: true,
    benefits: [
      '两道戏法：从牧师法术列表选择两道戏法并习得',
      '一环法术：从该列表选择一道一环法术，始终准备；每长休可无偿施放一次，也可用法术位施放',
      '施法属性：从智力、感知、魅力中选择一项作为本专长法术的施法属性',
      '复选：可多次选择本专长，每次须选不同的法术列表'
    ]
  },
  {
    id: 'magic-initiate-druid',
    name: '魔法学徒（德鲁伊）',
    nameEn: 'Magic Initiate (Druid)',
    type: 'origin',
    category: '法术',
    description: '从德鲁伊法术列表习得两道戏法和一道一环法术',
    repeatable: true,
    benefits: [
      '两道戏法：从德鲁伊法术列表选择两道戏法并习得',
      '一环法术：从该列表选择一道一环法术，始终准备；每长休可无偿施放一次，也可用法术位施放',
      '施法属性：从智力、感知、魅力中选择一项作为本专长法术的施法属性',
      '复选：可多次选择本专长，每次须选不同的法术列表'
    ]
  },
  {
    id: 'magic-initiate-wizard',
    name: '魔法学徒（法师）',
    nameEn: 'Magic Initiate (Wizard)',
    type: 'origin',
    category: '法术',
    description: '从法师法术列表习得两道戏法和一道一环法术',
    repeatable: true,
    benefits: [
      '两道戏法：从法师法术列表选择两道戏法并习得',
      '一环法术：从该列表选择一道一环法术，始终准备；每长休可无偿施放一次，也可用法术位施放',
      '施法属性：从智力、感知、魅力中选择一项作为本专长法术的施法属性',
      '复选：可多次选择本专长，每次须选不同的法术列表'
    ]
  },
  {
    id: 'savage-attacker',
    name: '野蛮攻击者',
    nameEn: 'Savage Attacker',
    type: 'origin',
    category: '战斗',
    description: '你的攻击异常凶猛',
    benefits: [
      '每回合一次，当你用武器攻击命中时，可以重投伤害骰并使用任意一次的结果',
      '此能力不影响额外伤害骰（如偷袭、神击等）'
    ]
  },
  {
    id: 'skilled',
    name: '熟练',
    nameEn: 'Skilled',
    type: 'origin',
    category: '技能',
    description: '你擅长多种技能',
    repeatable: true,
    benefits: [
      '获得3个技能的熟练，或1个技能的专精',
      '专精：在你已熟练的技能上，将熟练加值翻倍'
    ]
  },
  {
    id: 'lucky',
    name: '幸运',
    nameEn: 'Lucky',
    type: 'origin',
    category: '通用',
    description: '命运眷顾着你',
    benefits: [
      '你有3点幸运点数',
      '当你进行攻击检定、属性检定或豁免投骰时，可以花费1点幸运点数重投d20',
      '当有攻击检定命中你时，你可以花费1点幸运点数让攻击者重投',
      '你必须在骰子结果揭晓前决定是否使用幸运点数',
      '每次完成长休后恢复所有幸运点数'
    ]
  },
  {
    id: 'healer',
    name: '医者',
    nameEn: 'Healer',
    type: 'origin',
    category: '支援',
    description: '你擅长治疗伤病',
    benefits: [
      '使用治疗者工具包稳定濒死生物时，该生物恢复1点生命值',
      '作为一个动作，你可以花费治疗者工具包的一次使用，治疗一个生物',
      '该生物恢复1d6+4点生命值，加上它当前等级的生命值',
      '每个生物在短休或长休之间只能从此特性获益一次'
    ]
  },
  {
    id: 'tavern-brawler',
    name: '酒馆斗士',
    nameEn: 'Tavern Brawler',
    type: 'origin',
    category: '战斗',
    description: '你善于酒馆式的斗殴',
    benefits: [
      '你的徒手打击伤害骰变为1d4（如果原本更高则保持）',
      '你精通即兴武器',
      '当你在回合中用徒手打击或即兴武器命中生物时，可以使用附赠动作尝试擒抱该生物'
    ]
  },
  {
    id: 'tough',
    name: '坚韧',
    nameEn: 'Tough',
    type: 'origin',
    category: '防御',
    description: '你异常坚韧，生命力顽强',
    benefits: [
      '你的生命值最大值增加，增加量等于你当前等级的两倍',
      '每当你获得新等级时，你的生命值最大值再增加2点'
    ]
  },
  {
    id: 'actor',
    name: '演员',
    nameEn: 'Actor',
    type: 'origin',
    category: '社交',
    description: '你擅长模仿和表演',
    benefits: [
      '魅力+1（最高20）',
      '你在欺瞒检定和表演检定中具有优势',
      '你可以完美模仿他人的说话方式、声音特点，只要你曾听过至少1分钟'
    ]
  },
  {
    id: 'athlete',
    name: '运动员',
    nameEn: 'Athlete',
    type: 'origin',
    category: '运动',
    description: '你具有超凡的运动能力',
    benefits: [
      '力量或敏捷+1（选择一个，最高20）',
      '从俯卧状态站起只需要5尺移动力',
      '攀爬不再消耗额外移动力',
      '奔跑跳远时，跳跃距离增加等同于你力量调整值的尺数（最少+0尺）'
    ]
  },
  {
    id: 'chef',
    name: '厨师',
    nameEn: 'Chef',
    type: 'origin',
    category: '支援',
    description: '你是一位技艺精湛的厨师',
    benefits: [
      '体质或感知+1（选择一个，最高20）',
      '获得厨具的熟练',
      '短休时，你可以为最多等于熟练加值数量的生物制作特殊食物',
      '进食者在短休结束时额外恢复1d8点生命值',
      '长休结束时，你可以制作等于熟练加值数量的特殊点心',
      '进食点心作为附赠动作可获得等于熟练加值的临时生命值'
    ]
  },
  {
    id: 'crossbow-expert',
    name: '弩炮专家',
    nameEn: 'Crossbow Expert',
    type: 'origin',
    category: '战斗',
    description: '你精通弩的使用',
    benefits: [
      '当你使用弩攻击后，可以使用附赠动作用装填的手弩再进行一次攻击',
      '使用弩在5尺内攻击时不会受到劣势',
      '你忽略弩的装填属性'
    ]
  },
  {
    id: 'defensive-duelist',
    name: '防御决斗者',
    nameEn: 'Defensive Duelist',
    type: 'origin',
    category: '防御',
    prerequisite: '敏捷13或更高',
    description: '你精通使用灵巧武器防御',
    benefits: [
      '当你持有一把有灵巧属性的武器，并被近战攻击命中时',
      '可以使用反应将你的熟练加值加到AC上',
      '此加值可能会让该攻击未命中'
    ]
  },
  {
    id: 'dual-wielder',
    name: '双持武器者',
    nameEn: 'Dual Wielder',
    type: 'origin',
    category: '战斗',
    description: '你精通双持武器战斗',
    benefits: [
      '当双持武器时，AC+1',
      '可以用两个武器都不是轻型的武器进行双武器战斗',
      '可以在同一回合中拔出或收起两把武器'
    ]
  },
  {
    id: 'durable',
    name: '持久',
    nameEn: 'Durable',
    type: 'origin',
    category: '防御',
    description: '你异常坚韧',
    benefits: [
      '体质+1（最高20）',
      '当你投生命骰恢复生命值时，每个生命骰恢复的最小值等于你体质调整值的两倍（最少2点）'
    ]
  },
  {
    id: 'elemental-adept',
    name: '元素专精',
    nameEn: 'Elemental Adept',
    type: 'origin',
    category: '法术',
    prerequisite: '能够施放至少一个法术',
    repeatable: true,
    description: '你的元素法术异常强大',
    benefits: [
      '选择一种伤害类型：强酸、寒冷、火焰、闪电或雷鸣',
      '造成该类型伤害的法术忽略抗性',
      '当你投该类型伤害的法术伤害骰时，骰出1视为2'
    ]
  },
  {
    id: 'grappler',
    name: '擒抱者',
    nameEn: 'Grappler',
    type: 'origin',
    category: '战斗',
    description: '你精通擒抱技巧',
    benefits: [
      '力量或敏捷+1（选择一个，最高20）',
      '你在擒抱检定中具有优势',
      '你可以使用一个动作尝试将被你擒抱的生物钉住',
      '成功后，你和目标都被束缚，直到擒抱结束'
    ]
  },
  {
    id: 'great-weapon-master',
    name: '巨武器大师',
    nameEn: 'Great Weapon Master',
    type: 'origin',
    category: '战斗',
    description: '你精通大型武器的使用',
    benefits: [
      '当你用重型武器造成重击或将生物生命值降至0时',
      '可以使用附赠动作进行一次近战武器攻击',
      '在用重型武器进行攻击检定前，可以选择承受-5减值',
      '如果命中，此次攻击的伤害+10'
    ]
  },
  {
    id: 'heavily-armored',
    name: '重甲精通',
    nameEn: 'Heavily Armored',
    type: 'origin',
    category: '防御',
    prerequisite: '精通中甲',
    description: '你接受过重甲的训练',
    benefits: [
      '力量+1（最高20）',
      '获得重甲的熟练'
    ]
  },
  {
    id: 'heavy-armor-master',
    name: '重甲大师',
    nameEn: 'Heavy Armor Master',
    type: 'origin',
    category: '防御',
    prerequisite: '精通重甲',
    description: '你精通重甲的使用',
    benefits: [
      '力量+1（最高20）',
      '当你穿着重甲时，受到的来自非魔法武器的钝击、穿刺和挥砍伤害减少3点'
    ]
  },
  {
    id: 'inspiring-leader',
    name: '鼓舞领袖',
    nameEn: 'Inspiring Leader',
    type: 'origin',
    category: '支援',
    prerequisite: '魅力13或更高',
    description: '你能够激励同伴',
    benefits: [
      '花费10分钟演讲，最多等于你魅力调整值（最少1）数量的友善生物',
      '可以获得等于你等级+魅力调整值的临时生命值',
      '每个生物完成短休或长休后才能再次从此专长获益'
    ]
  },
  {
    id: 'keen-mind',
    name: '敏锐心智',
    nameEn: 'Keen Mind',
    type: 'origin',
    category: '技能',
    description: '你的记忆力和推理能力超群',
    benefits: [
      '智力+1（最高20）',
      '你总是知道北方在哪',
      '你总是知道下一次日出或日落还有多久',
      '你能准确回忆起一个月内见过或听过的任何事情'
    ]
  },
  {
    id: 'lightly-armored',
    name: '轻甲精通',
    nameEn: 'Lightly Armored',
    type: 'origin',
    category: '防御',
    description: '你接受过轻甲的训练',
    benefits: [
      '力量或敏捷+1（选择一个，最高20）',
      '获得轻甲的熟练'
    ]
  },
  {
    id: 'linguist',
    name: '语言学家',
    nameEn: 'Linguist',
    type: 'origin',
    category: '技能',
    description: '你精通语言和密码',
    benefits: [
      '智力+1（最高20）',
      '学习3门你选择的语言',
      '你可以用1小时创造一种书面密码',
      '使用你的密码书写的信息对其他人来说是无法理解的',
      '除非你教授他们，或他们通过DC等于你智力调整值+熟练加值的智力检定破解'
    ]
  },
  {
    id: 'mage-slayer',
    name: '法师杀手',
    nameEn: 'Mage Slayer',
    type: 'origin',
    category: '战斗',
    description: '你专门对付施法者',
    benefits: [
      '当5尺内的生物施放法术时，你可以使用反应对其进行一次近战武器攻击',
      '当你被5尺内生物的法术伤害时，你对抗该法术的豁免检定具有优势',
      '当你命中专注维持法术的生物时，它对该次伤害的专注豁免检定具有劣势'
    ]
  },
  {
    id: 'martial-adept',
    name: '武技行家',
    nameEn: 'Martial Adept',
    type: 'origin',
    category: '战斗',
    description: '你学习了战技',
    benefits: [
      '学习2个战技（从战士的战技列表选择）',
      '获得1个战技骰（d6）',
      '该骰子可用于使用战技，短休或长休后恢复',
      '如果你已有战技骰，则再获得1个'
    ]
  },
  {
    id: 'medium-armor-master',
    name: '中甲大师',
    nameEn: 'Medium Armor Master',
    type: 'origin',
    category: '防御',
    prerequisite: '精通中甲',
    description: '你精通中甲的使用',
    benefits: [
      '穿着中甲时，你可以将最多3点（而非2点）的敏捷调整值加到AC',
      '穿着中甲时，不会因护甲而在潜行检定中受到劣势'
    ]
  },
  {
    id: 'mobile',
    name: '机动',
    nameEn: 'Mobile',
    type: 'origin',
    category: '运动',
    description: '你移动迅速灵活',
    benefits: [
      '你的速度增加10尺',
      '当你使用冲刺动作时，困难地形在该回合不消耗额外移动力',
      '当你对一个生物进行近战攻击后，无论是否命中，该生物在本回合内都无法对你进行借机攻击'
    ]
  },
  {
    id: 'moderately-armored',
    name: '中甲精通',
    nameEn: 'Moderately Armored',
    type: 'origin',
    category: '防御',
    prerequisite: '精通轻甲',
    description: '你接受过中甲的训练',
    benefits: [
      '力量或敏捷+1（选择一个，最高20）',
      '获得中甲和盾牌的熟练'
    ]
  },
  {
    id: 'mounted-combatant',
    name: '骑乘战斗者',
    nameEn: 'Mounted Combatant',
    type: 'origin',
    category: '战斗',
    description: '你是一位熟练的骑手',
    benefits: [
      '骑乘时对小于你坐骑的未骑乘生物的近战攻击检定具有优势',
      '你可以强制针对你坐骑的攻击改为针对你',
      '如果你的坐骑遭受能通过敏捷豁免减半伤害的效果，成功时不受伤害，失败时也只受一半伤害'
    ]
  },
  {
    id: 'observant',
    name: '观察敏锐',
    nameEn: 'Observant',
    type: 'origin',
    category: '技能',
    description: '你观察入微',
    benefits: [
      '智力或感知+1（选择一个，最高20）',
      '如果你能看到生物的嘴，你可以读懂他的唇语',
      '你的被动感知（察觉）和被动智力（调查）各+5'
    ]
  },
  {
    id: 'polearm-master',
    name: '长柄武器大师',
    nameEn: 'Polearm Master',
    type: 'origin',
    category: '战斗',
    description: '你精通长柄武器',
    benefits: [
      '当你使用长枪、戟、战戟或长戈进行攻击动作时',
      '可以使用附赠动作用武器的另一端进行攻击，造成1d4钝击伤害',
      '当生物进入你持有长枪、戟、战戟或长戈时的触及范围时',
      '你可以使用反应对其进行一次借机攻击'
    ]
  },
  {
    id: 'resilient',
    name: '韧性',
    nameEn: 'Resilient',
    type: 'origin',
    category: '防御',
    repeatable: true,
    description: '你在某个属性上变得更加坚韧',
    benefits: [
      '选择一个属性，该属性+1（最高20）',
      '你获得该属性豁免的熟练'
    ]
  },
  {
    id: 'ritual-caster',
    name: '仪式施法者',
    nameEn: 'Ritual Caster',
    type: 'origin',
    category: '法术',
    prerequisite: '智力或感知13或更高',
    description: '你学会了仪式施法',
    benefits: [
      '选择一个施法职业：吟游诗人、牧师、德鲁伊、术士或法师',
      '你获得一本仪式书，其中包含2个你选择的该职业的1级仪式法术',
      '你可以施放书中的仪式法术',
      '你可以复制其他仪式法术到书中（需花费时间和金钱）'
    ]
  },
  {
    id: 'savage-attacker',
    name: '野蛮攻击者',
    nameEn: 'Savage Attacker',
    type: 'origin',
    category: '战斗',
    description: '你的攻击异常凶猛',
    benefits: [
      '每回合一次，当你用武器攻击命中时',
      '可以重投武器的伤害骰并使用任意一次的结果'
    ]
  },
  {
    id: 'sentinel',
    name: '哨兵',
    nameEn: 'Sentinel',
    type: 'origin',
    category: '战斗',
    description: '你精通控制战场',
    benefits: [
      '当你命中借机攻击时，目标的速度在本回合内变为0',
      '即使生物采取脱离动作，你仍可对其进行借机攻击',
      '当5尺内的生物攻击你之外的目标时，你可以使用反应对其进行近战武器攻击'
    ]
  },
  {
    id: 'sharpshooter',
    name: '神射手',
    nameEn: 'Sharpshooter',
    type: 'origin',
    category: '战斗',
    description: '你是一位神射手',
    benefits: [
      '远程武器攻击忽略半身掩护和四分之三掩护',
      '用远程武器攻击时，远距离不会造成劣势',
      '在进行远程武器攻击检定前，可以选择承受-5减值',
      '如果命中，此次攻击的伤害+10'
    ]
  },
  {
    id: 'shield-master',
    name: '盾牌大师',
    nameEn: 'Shield Master',
    type: 'origin',
    category: '防御',
    description: '你精通盾牌的使用',
    benefits: [
      '在你回合采取攻击动作后，可以使用附赠动作尝试用盾牌猛推一个5尺内的生物',
      '如果你没有失能，可以将盾牌的AC加值加到任何针对你或只针对你的豁免检定',
      '如果你遭受能通过敏捷豁免减半伤害的效果，成功时不受伤害'
    ]
  },
  {
    id: 'spell-sniper',
    name: '法术狙击',
    nameEn: 'Spell Sniper',
    type: 'origin',
    category: '法术',
    prerequisite: '能够施放至少一个法术',
    description: '你精通远距离施法',
    benefits: [
      '当你施放需要攻击检定的法术时，射程翻倍',
      '你的法术攻击检定忽略半身掩护和四分之三掩护',
      '学习1个需要攻击检定的戏法（从你能施法的职业列表选择）'
    ]
  },
  {
    id: 'war-caster',
    name: '战场施法者',
    nameEn: 'War Caster',
    type: 'origin',
    category: '法术',
    prerequisite: '能够施放至少一个法术',
    description: '你精通战斗中施法',
    benefits: [
      '在维持法术专注时，受到伤害的专注豁免检定具有优势',
      '你可以在双手持武器或盾牌时进行法术的姿势成分',
      '当借机攻击被触发时，你可以施放一个目标为该生物的戏法，而非进行借机攻击'
    ]
  },
  {
    id: 'weapon-master',
    name: '武器大师',
    nameEn: 'Weapon Master',
    type: 'origin',
    category: '战斗',
    description: '你精通多种武器',
    repeatable: true,
    benefits: [
      '力量或敏捷+1（选择一个，最高20）',
      '获得4种你选择的武器的熟练'
    ]
  }
];

// 人类「多才多艺」可选专长：仅 2024 规则中的起源专长（非全部 type=origin 的专长）
export const VERSATILE_ORIGIN_FEAT_IDS: string[] = [
  'alert',           // 警觉
  'healer',          // 医疗师
  'lucky',           // 幸运
  'magic-initiate-cleric',
  'magic-initiate-druid',
  'magic-initiate-wizard',
  'savage-attacker', // 凶蛮打手
  'skilled',         // 熟习
  'tavern-brawler',  // 酒馆斗殴者
  'tough',           // 健壮
];

/** 人类多才多艺可选专长列表（仅起源专长） */
export function getVersatileOriginFeats(): Feat[] {
  return ORIGIN_FEATS.filter((f) => VERSATILE_ORIGIN_FEAT_IDS.includes(f.id));
}

// 魔法学徒专长 ID 列表（复选时每次须选不同法术列表）
export const MAGIC_INITIATE_FEAT_IDS = ['magic-initiate-cleric', 'magic-initiate-druid', 'magic-initiate-wizard'] as const;
export type MagicInitiateFeatId = (typeof MAGIC_INITIATE_FEAT_IDS)[number];

/** 根据魔法学徒专长 ID 返回对应的法术列表职业名（用于 getSpellsByClass） */
export function getMagicInitiateSpellList(featId: string): '牧师' | '德鲁伊' | '法师' | null {
  switch (featId) {
    case 'magic-initiate-cleric':
      return '牧师';
    case 'magic-initiate-druid':
      return '德鲁伊';
    case 'magic-initiate-wizard':
      return '法师';
    default:
      return null;
  }
}

/** 判断是否为魔法学徒专长 */
export function isMagicInitiateFeat(featId: string): boolean {
  return (MAGIC_INITIATE_FEAT_IDS as readonly string[]).includes(featId);
}

// 根据ID获取专长
export function getFeatById(id: string): Feat | undefined {
  return ORIGIN_FEATS.find(feat => feat.id === id);
}

// 根据类别获取专长
export function getFeatsByCategory(category: string): Feat[] {
  return ORIGIN_FEATS.filter(feat => feat.category === category);
}

// 根据类型获取专长
export function getFeatsByType(type: Feat['type']): Feat[] {
  return ORIGIN_FEATS.filter(feat => feat.type === type);
}

// 检查是否满足前置条件（简化版，实际需要检查角色数据）
export function checkFeatPrerequisite(feat: Feat, character: any): boolean {
  if (!feat.prerequisite) return true;
  // 这里需要根据角色数据实际检查前置条件
  // 暂时返回true，后续完善
  return true;
}

// 获取所有起源专长名称列表（用于选择器）
export function getOriginFeatNames(): Array<{ id: string; name: string; nameEn: string }> {
  return ORIGIN_FEATS.map(feat => ({
    id: feat.id,
    name: feat.name,
    nameEn: feat.nameEn
  }));
}

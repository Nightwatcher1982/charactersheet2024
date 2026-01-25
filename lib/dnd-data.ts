// DND 2024 角色创建数据

export interface Ability {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  species: string; // 2024 版改为 Species（物种）
  background: string;
  level: number;
  abilities: Ability;
  backgroundAbilityBonuses?: Record<string, number>; // 背景属性加值，如 {"力量": 2, "智力": 1}
  alignment: string;
  hitPoints: number;
  armorClass: number;
  skills: string[];
  proficiencies: string[];
  equipment: string[];
  spells: string[];
  features: string[];
  classFeatureChoices?: Record<string, string>; // 职业和物种特性选择，如 {"divineOrder": "protector", "speciesChoices": "...", "classSkills": "[\"驯兽\",\"运动\"]"}
  backstory: string;
  createdAt: string;
  updatedAt: string;
  
  // ⭐ 阶段1新增字段
  languages?: string[]; // 语言ID列表，如 ['common', 'dwarvish', 'elvish']
  feats?: string[]; // 专长ID列表，如 ['alert', 'magic-initiate-cleric']
  backgroundEquipmentChoice?: 'A' | 'B'; // 背景装备选择
  avatar?: string; // 头像（base64编码的图片数据）
  remainingGold?: number; // 剩余金币（购买装备后）
  classStartingEquipment?: string; // 职业起始装备选择ID，如 "option1"
  equippedWeapons?: string[]; // 用户选择的武器（武器ID数组）
}

export interface ClassFeatureChoice {
  id: string;
  name: string;
  level: number;
  options: {
    id: string;
    name: string;
    description: string;
    benefits: string[];
  }[];
}

// DND 2024 职业列表
export const CLASSES = [
  {
    id: 'barbarian',
    name: '野蛮人',
    nameEn: 'Barbarian',
    description: '凶猛的战士，在战斗中释放原始的狂怒力量',
    hitDie: 12,
    primaryAbility: ['力量'],
    savingThrows: ['力量', '体质'],
    skillChoices: 2, // 可选择的技能数量
    availableSkills: ['驯兽', '运动', '威吓', '自然', '察觉', '求生'],
    proficiencies: {
      armor: ['轻甲', '中甲', '盾牌'],
      weapons: ['简易武器', '军用武器'],
      tools: []
    }
  },
  {
    id: 'bard',
    name: '吟游诗人',
    nameEn: 'Bard',
    description: '启发盟友、迷惑敌人的魔法艺术家',
    hitDie: 8,
    primaryAbility: ['魅力'],
    savingThrows: ['敏捷', '魅力'],
    skillChoices: 3,
    availableSkills: ['特技', '驯兽', '奥秘', '运动', '欺瞒', '历史', '洞悉', '威吓', '调查', '医药', '自然', '察觉', '表演', '游说', '宗教', '巧手', '隐匿', '求生'],
    proficiencies: {
      armor: ['轻甲'],
      weapons: ['简易武器', '手弩', '长剑', '细剑', '短剑'],
      tools: ['三种乐器']
    }
  },
  {
    id: 'cleric',
    name: '牧师',
    nameEn: 'Cleric',
    description: '神圣力量的代言人，治疗盟友并惩罚敌人',
    hitDie: 8,
    primaryAbility: ['感知'],
    savingThrows: ['感知', '魅力'],
    skillChoices: 2,
    availableSkills: ['历史', '洞悉', '医药', '游说', '宗教'],
    proficiencies: {
      armor: ['轻甲', '中甲', '盾牌'],
      weapons: ['简易武器'],
      tools: []
    },
    featureChoices: [
      {
        id: 'divineOrder',
        name: '圣职选择 (Divine Order)',
        level: 1,
        options: [
          {
            id: 'protector',
            name: '守护者 (Protector)',
            description: '你训练成为战场上的神圣卫士',
            benefits: [
              '获得军用武器熟练',
              '获得重甲熟练',
              '适合近战战斗的牧师'
            ]
          },
          {
            id: 'thaumaturge',
            name: '奇术师 (Thaumaturge)',
            description: '你专注于神圣魔法和知识',
            benefits: [
              '额外学习1个牧师戏法',
              '奥秘和宗教检定加上感知调整值',
              '适合施法为主的牧师'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'druid',
    name: '德鲁伊',
    nameEn: 'Druid',
    description: '自然的守护者，能够变化形态和施展原始魔法',
    hitDie: 8,
    primaryAbility: ['感知'],
    savingThrows: ['智力', '感知'],
    skillChoices: 2,
    availableSkills: ['奥秘', '驯兽', '洞悉', '医药', '自然', '察觉', '宗教', '求生'],
    proficiencies: {
      armor: ['轻甲', '中甲', '盾牌（非金属）'],
      weapons: ['简易武器'],
      tools: ['草药工具']
    }
  },
  {
    id: 'fighter',
    name: '战士',
    nameEn: 'Fighter',
    description: '精通武器和护甲的战斗大师',
    hitDie: 10,
    primaryAbility: ['力量', '敏捷'],
    savingThrows: ['力量', '体质'],
    skillChoices: 2,
    availableSkills: ['特技', '驯兽', '运动', '历史', '洞悉', '威吓', '察觉', '求生'],
    proficiencies: {
      armor: ['所有护甲', '盾牌'],
      weapons: ['简易武器', '军用武器'],
      tools: []
    },
    featureChoices: [
      {
        id: 'fightingStyle',
        name: '战斗风格 (Fighting Style)',
        level: 1,
        options: [
          {
            id: 'archery',
            name: '箭术 (Archery)',
            description: '你专精于远程武器',
            benefits: [
              '使用远程武器进行攻击检定时+2加值'
            ]
          },
          {
            id: 'defense',
            name: '防御 (Defense)',
            description: '你专注于防护',
            benefits: [
              '穿着护甲时AC+1'
            ]
          },
          {
            id: 'dueling',
            name: '决斗 (Dueling)',
            description: '你专精于单手武器战斗',
            benefits: [
              '单手持有近战武器且另一只手未持武器或盾牌时，伤害+2'
            ]
          },
          {
            id: 'greatWeapon',
            name: '巨武器战斗 (Great Weapon Fighting)',
            description: '你专精于双手武器',
            benefits: [
              '使用双手近战武器攻击时，伤害骰为1或2可重投（必须使用新结果）'
            ]
          },
          {
            id: 'protection',
            name: '保护 (Protection)',
            description: '你保护队友',
            benefits: [
              '使用反应为5尺内的盟友提供不利于攻击检定（需持盾牌）'
            ]
          },
          {
            id: 'twoWeapon',
            name: '双武器战斗 (Two-Weapon Fighting)',
            description: '你专精于双持武器',
            benefits: [
              '双武器战斗时，副手攻击伤害加上属性调整值'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'monk',
    name: '武僧',
    nameEn: 'Monk',
    description: '掌握气能量的徒手战斗专家',
    hitDie: 8,
    primaryAbility: ['敏捷', '感知'],
    savingThrows: ['力量', '敏捷'],
    skillChoices: 2,
    availableSkills: ['特技', '运动', '历史', '洞悉', '宗教', '隐匿'],
    proficiencies: {
      armor: [],
      weapons: ['简易武器', '短剑'],
      tools: ['一种工匠工具或一种乐器']
    }
  },
  {
    id: 'paladin',
    name: '圣武士',
    nameEn: 'Paladin',
    description: '以神圣誓言为力量的正义战士',
    hitDie: 10,
    primaryAbility: ['力量', '魅力'],
    savingThrows: ['感知', '魅力'],
    skillChoices: 2,
    availableSkills: ['运动', '洞悉', '威吓', '医药', '游说', '宗教'],
    proficiencies: {
      armor: ['所有护甲', '盾牌'],
      weapons: ['简易武器', '军用武器'],
      tools: []
    }
  },
  {
    id: 'ranger',
    name: '游侠',
    nameEn: 'Ranger',
    description: '荒野的战士和追踪者',
    hitDie: 10,
    primaryAbility: ['敏捷', '感知'],
    savingThrows: ['力量', '敏捷'],
    skillChoices: 3,
    availableSkills: ['驯兽', '运动', '洞悉', '调查', '自然', '察觉', '隐匿', '求生'],
    proficiencies: {
      armor: ['轻甲', '中甲', '盾牌'],
      weapons: ['简易武器', '军用武器'],
      tools: []
    }
  },
  {
    id: 'rogue',
    name: '游荡者',
    nameEn: 'Rogue',
    description: '擅长潜行和精准打击的狡猾专家',
    hitDie: 8,
    primaryAbility: ['敏捷'],
    savingThrows: ['敏捷', '智力'],
    skillChoices: 4,
    availableSkills: ['特技', '运动', '欺瞒', '洞悉', '威吓', '调查', '察觉', '表演', '游说', '巧手', '隐匿'],
    proficiencies: {
      armor: ['轻甲'],
      weapons: ['简易武器', '手弩', '长剑', '细剑', '短剑'],
      tools: ['盗贼工具']
    }
  },
  {
    id: 'sorcerer',
    name: '术士',
    nameEn: 'Sorcerer',
    description: '拥有与生俱来魔法力量的施法者',
    hitDie: 6,
    primaryAbility: ['魅力'],
    savingThrows: ['体质', '魅力'],
    skillChoices: 2,
    availableSkills: ['奥秘', '欺瞒', '洞悉', '威吓', '游说', '宗教'],
    proficiencies: {
      armor: [],
      weapons: ['简易武器'],
      tools: []
    },
    featureChoices: [
      {
        id: 'sorcerousOrigin',
        name: '术士起源 (Sorcerous Origin)',
        level: 1,
        options: [
          {
            id: 'draconicBloodline',
            name: '龙裔血统 (Draconic Bloodline)',
            description: '你的魔法源于龙族血统',
            benefits: [
              '选择一种龙类型，获得对应伤害类型抗性',
              '未穿护甲时AC = 13 + 敏捷调整值',
              '生命值最大值+1（每术士等级）'
            ]
          },
          {
            id: 'wildMagic',
            name: '狂野魔法 (Wild Magic)',
            description: '你的魔法充满混沌和不可预测性',
            benefits: [
              '施法后可能触发狂野魔法涌动',
              '获得潮涌骰（d4）用于增强法术',
              '可以操控命运'
            ]
          },
          {
            id: 'stormSorcery',
            name: '风暴术士 (Storm Sorcery)',
            description: '你的魔法源于元素风暴',
            benefits: [
              '施法后可以飞行10尺且不引发机会攻击',
              '对雷电和雷鸣伤害有抗性',
              '可以操控风暴能量'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'warlock',
    name: '邪术师',
    nameEn: 'Warlock',
    description: '与异界存在订立契约的魔法使用者',
    hitDie: 8,
    primaryAbility: ['魅力'],
    savingThrows: ['感知', '魅力'],
    skillChoices: 2,
    availableSkills: ['奥秘', '欺瞒', '历史', '威吓', '调查', '自然', '宗教'],
    proficiencies: {
      armor: ['轻甲'],
      weapons: ['简易武器'],
      tools: []
    },
    featureChoices: [
      {
        id: 'pactBoon',
        name: '契约恩赐 (Pact Boon)',
        level: 1,
        options: [
          {
            id: 'pactOfChain',
            name: '锁链契约 (Pact of the Chain)',
            description: '你的守护神赐予你一个魔宠',
            benefits: [
              '学习寻找魔宠法术',
              '施放时可召唤特殊魔宠',
              '可以使用反应让魔宠进行攻击'
            ]
          },
          {
            id: 'pactOfBlade',
            name: '刀锋契约 (Pact of the Blade)',
            description: '你的守护神赐予你战斗能力',
            benefits: [
              '可以召唤契约武器',
              '使用魅力进行契约武器攻击和伤害',
              '获得中甲熟练'
            ]
          },
          {
            id: 'pactOfTome',
            name: '魔典契约 (Pact of the Tome)',
            description: '你的守护神赐予你奥秘知识',
            benefits: [
              '获得暗影之书',
              '从任意职业列表学习3个戏法',
              '可以将仪式法术写入书中'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'wizard',
    name: '法师',
    nameEn: 'Wizard',
    description: '通过学习掌握奥术的学者',
    hitDie: 6,
    primaryAbility: ['智力'],
    savingThrows: ['智力', '感知'],
    skillChoices: 2,
    availableSkills: ['奥秘', '历史', '洞悉', '调查', '医药', '自然', '宗教'],
    proficiencies: {
      armor: [],
      weapons: ['简易武器'],
      tools: []
    }
  }
];

// DND 2024 物种列表 - 10个核心物种
export const SPECIES = [
  {
    id: 'human',
    name: '人类',
    nameEn: 'Human',
    size: '中型或小型（可选）',
    speed: 30,
    description: '多才多艺且富有适应力，遍布多元宇宙各处',
    traits: [
      {
        name: '足智多谋',
        description: '每次长休后获得英雄灵感'
      },
      {
        name: '技艺娴熟',
        description: '获得一项任意技能的熟练'
      },
      {
        name: '多才多艺',
        description: '获得一个起源专长（推荐：技能专家）'
      }
    ],
    choices: [
      {
        id: 'size',
        name: '体型选择',
        options: ['中型（4-7尺）', '小型（2-4尺）']
      },
      {
        id: 'skill',
        name: '技能选择',
        options: [
          '特技（敏捷）- 平衡、翻滚、跳跃等灵活动作',
          '驯兽（感知）- 安抚和控制动物',
          '奥秘（智力）- 魔法和神秘知识',
          '运动（力量）- 攀爬、跳跃、游泳等运动',
          '欺瞒（魅力）- 说谎和伪装',
          '历史（智力）- 历史事件和传说',
          '洞悉（感知）- 判断意图和情绪',
          '威吓（魅力）- 威胁和恐吓',
          '调查（智力）- 寻找线索和推理',
          '医药（感知）- 治疗伤病',
          '自然（智力）- 自然环境和生物知识',
          '察觉（感知）- 注意周围环境',
          '表演（魅力）- 音乐、舞蹈等艺术表演',
          '游说（魅力）- 外交和谈判',
          '宗教（智力）- 神祗和宗教仪式',
          '巧手（敏捷）- 扒窃和精细操作',
          '隐匿（敏捷）- 隐藏和潜行',
          '求生（感知）- 追踪、狩猎、野外生存'
        ]
      }
    ]
  },
  {
    id: 'elf',
    name: '精灵',
    nameEn: 'Elf',
    size: '中型',
    speed: 30,
    description: '精类生物，拥有敏锐感官和魔法天赋',
    traits: [
      {
        name: '黑暗视觉',
        description: '60尺黑暗视觉'
      },
      {
        name: '精灵血统',
        description: '选择卓尔、高等精灵或木精灵血统，获得戏法和法术'
      },
      {
        name: '精类血脉',
        description: '对避免或终止魅惑状态的豁免具有优势'
      },
      {
        name: '敏锐感官',
        description: '获得洞悉、察觉或求生技能熟练'
      },
      {
        name: '出神状态',
        description: '4小时冥想代替睡眠完成长休，魔法无法使你入睡'
      }
    ],
    choices: [
      {
        id: 'lineage',
        name: '精灵血统',
        options: [
          '卓尔（黑暗视觉120尺，舞光术戏法，3级精灵火，5级黑暗术）',
          '高等精灵（幻术戏法，长休可更换，3级侦测魔法，5级迷踪步）',
          '木精灵（速度35尺，妖火戏法，3级大步奔行，5级行无踪迹）'
        ]
      },
      {
        id: 'skill',
        name: '技能选择（敏锐感官）',
        options: [
          '洞悉（感知）- 判断意图和情绪，看穿谎言',
          '察觉（感知）- 注意周围环境，发现隐藏的事物',
          '求生（感知）- 追踪、狩猎、野外生存技巧'
        ]
      }
    ]
  },
  {
    id: 'dwarf',
    name: '矮人',
    nameEn: 'Dwarf',
    size: '中型',
    speed: 30,
    description: '由锻造之神从大地中塑造，具有石头般的韧性',
    traits: [
      {
        name: '黑暗视觉',
        description: '120尺黑暗视觉'
      },
      {
        name: '矮人韧性',
        description: '对毒素伤害有抗性，对避免或终止中毒状态的豁免具有优势'
      },
      {
        name: '矮人坚韧',
        description: '生命值最大值+1，每次升级再+1'
      },
      {
        name: '石艺',
        description: '以附赠动作获得60尺震颤感知10分钟（需接触石头表面），每日使用次数等于熟练加值'
      }
    ]
  },
  {
    id: 'halfling',
    name: '半身人',
    nameEn: 'Halfling',
    size: '小型',
    speed: 30,
    description: '幸运而勇敢的小个子，热爱家庭和社区',
    traits: [
      {
        name: '勇敢',
        description: '对避免或终止恐慌状态的豁免具有优势'
      },
      {
        name: '半身人灵巧',
        description: '可以穿过比你大一级体型的生物空间'
      },
      {
        name: '幸运',
        description: 'D20检定投出1时，可以重投骰子，必须使用新结果'
      },
      {
        name: '天生隐匿',
        description: '即使仅被比你大一级的生物遮挡时也可以进行躲藏动作'
      }
    ]
  },
  {
    id: 'dragonborn',
    name: '龙裔',
    nameEn: 'Dragonborn',
    size: '中型',
    speed: 30,
    description: '龙神创造的龙族后裔，拥有龙的力量',
    traits: [
      {
        name: '龙裔血统',
        description: '选择一种龙类型，影响吐息武器和伤害抗性'
      },
      {
        name: '吐息武器',
        description: '15尺锥形或30尺线形，1d10伤害（5/11/17级升级），使用次数等于熟练加值'
      },
      {
        name: '伤害抗性',
        description: '对应龙裔血统的伤害类型抗性'
      },
      {
        name: '黑暗视觉',
        description: '60尺黑暗视觉'
      },
      {
        name: '龙裔飞行',
        description: '5级获得，以附赠动作长出光翼并飞行10分钟，飞行速度等于移动速度'
      }
    ],
    choices: [
      {
        id: 'ancestry',
        name: '龙裔血统',
        options: [
          '黑龙（强酸）', '蓝龙（闪电）', '黄铜龙（火焰）', '青铜龙（闪电）', '紫铜龙（强酸）',
          '金龙（火焰）', '绿龙（毒素）', '红龙（火焰）', '银龙（寒冷）', '白龙（寒冷）'
        ]
      }
    ]
  },
  {
    id: 'gnome',
    name: '侏儒',
    nameEn: 'Gnome',
    size: '小型',
    speed: 30,
    description: '魔法民族，充满创造力和聪明才智',
    traits: [
      {
        name: '黑暗视觉',
        description: '60尺黑暗视觉'
      },
      {
        name: '侏儒狡黠',
        description: '对智力、感知和魅力豁免具有优势'
      },
      {
        name: '侏儒血统',
        description: '选择森林侏儒或岩石侏儒，获得不同戏法和能力'
      }
    ],
    choices: [
      {
        id: 'lineage',
        name: '侏儒血统',
        options: [
          '森林侏儒（次级幻影戏法 + 可无限施放动物交谈）',
          '岩石侏儒（修补和幻术戏法 + 可创造发条装置）'
        ]
      }
    ]
  },
  {
    id: 'goliath',
    name: '巨人裔',
    nameEn: 'Goliath',
    size: '中型',
    speed: 35,
    description: '巨人的远亲后裔，高大强壮',
    traits: [
      {
        name: '巨人血统',
        description: '选择云巨人、火巨人、霜巨人、丘陵巨人、石巨人或风暴巨人血统，获得特殊能力'
      },
      {
        name: '大型形态',
        description: '5级获得，以附赠动作变为大型体型10分钟，力量检定优势，速度+10尺'
      },
      {
        name: '强大体格',
        description: '对终止擒抱状态的能力检定具有优势，负重计算视为大一级体型'
      }
    ],
    choices: [
      {
        id: 'giantAncestry',
        name: '巨人血统',
        options: [
          '云巨人（传送30尺）',
          '火巨人（额外1d10火焰伤害）',
          '霜巨人（1d6寒冷伤害+减速10尺）',
          '丘陵巨人（击倒大型或更小生物）',
          '石巨人（以反应减伤1d12+体质）',
          '风暴巨人（以反应造成1d8雷鸣伤害）'
        ]
      }
    ]
  },
  {
    id: 'orc',
    name: '兽人',
    nameEn: 'Orc',
    size: '中型',
    speed: 30,
    description: '格鲁乌什创造的强大战士，具有非凡耐力',
    traits: [
      {
        name: '肾上腺素冲刺',
        description: '以附赠动作进行冲刺，并获得等于熟练加值的临时生命值。每日使用次数等于熟练加值'
      },
      {
        name: '黑暗视觉',
        description: '120尺黑暗视觉'
      },
      {
        name: '不屈耐力',
        description: '当你被降至0生命值但未立即死亡时，可以降至1生命值。每次长休后可使用一次'
      }
    ]
  },
  {
    id: 'tiefling',
    name: '魔人',
    nameEn: 'Tiefling',
    size: '中型或小型（可选）',
    speed: 30,
    description: '拥有炼狱血统，与下层位面有血缘联系',
    traits: [
      {
        name: '黑暗视觉',
        description: '60尺黑暗视觉'
      },
      {
        name: '炼狱遗产',
        description: '选择深渊、冥界或炼狱遗产，获得戏法、抗性和法术'
      },
      {
        name: '异界存在',
        description: '知晓妙术戏法'
      }
    ],
    choices: [
      {
        id: 'size',
        name: '体型选择',
        options: ['中型（4-7尺）', '小型（3-4尺）']
      },
      {
        id: 'legacy',
        name: '炼狱遗产',
        options: [
          '深渊（毒素抗性，毒液喷射戏法，3级射线疾病，5级定身术）',
          '冥界（死灵抗性，冷触戏法，3级虚假生命，5级衰弱射线）',
          '炼狱（火焰抗性，火焰箭戏法，3级地狱反击，5级黑暗术）'
        ]
      }
    ]
  }
];

// DND 2024 背景列表 - 16个背景
export interface Background {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  narrative: string;
  skills: string[];
  toolProficiency: string;
  abilityBonus: number;
  abilityChoices: string[];
  featId?: string; // 2024：背景提供的专长
  feats?: string[]; // 兼容旧数据：背景提供的专长数组
  equipmentChoice: boolean; // 是否有A/B装备选项
}

export const BACKGROUNDS: Background[] = [
  {
    id: 'acolyte',
    name: '侍僧',
    nameEn: 'Acolyte',
    description: '在神殿或宗教组织中服务的虔诚信徒',
    narrative: '你致力于在神殿中服务，无论是坐落在城镇还是隐藏在神圣的林间。在那里，你代表神祗或万神殿举行仪式。你在一位祭司的指导下学习宗教知识。感谢祭司的教导和你自己的虔诚，你也学会了如何引导一些神圣力量，为你的礼拜场所和前来祈祷的人们服务。',
    skills: ['洞悉', '宗教'],
    toolProficiency: '书法工具',
    abilityBonus: 3,
    abilityChoices: ['智力', '感知', '魅力'],
    featId: 'magic-initiate-cleric',
    equipmentChoice: true // 有A/B选项
  },
  {
    id: 'artisan',
    name: '工匠',
    nameEn: 'Artisan',
    description: '技艺精湛的手工艺者',
    narrative: '你在作坊中度过了大量时间，学习你的手艺。你可能是一位铁匠、木匠、织工或珠宝匠。你的技能使你在社区中受到尊重，你的作品为你带来了稳定的收入。',
    skills: ['调查', '游说'],
    toolProficiency: '一种工匠工具',
    abilityBonus: 3,
    abilityChoices: ['力量', '敏捷', '智力'],
    featId: 'skilled',
    equipmentChoice: true
  },
  {
    id: 'charlatan',
    name: '江湖骗子',
    nameEn: 'Charlatan',
    description: '靠欺骗和伪装谋生的骗术高手',
    narrative: '你一直擅长欺骗他人，无论是伪造身份、伪造文件还是编造故事。你可能曾假扮过贵族、算命师或其他受尊敬的人物，从轻信的人那里骗取金钱或好处。',
    skills: ['欺瞒', '巧手'],
    toolProficiency: '伪造工具',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '智力', '魅力'],
    featId: 'lucky',
    equipmentChoice: true
  },
  {
    id: 'criminal',
    name: '罪犯',
    nameEn: 'Criminal',
    description: '有犯罪经历的亡命之徒',
    narrative: '你在黑暗的小巷中谋生，扒窃钱包或入室盗窃。也许你是一个小帮派的成员，大家互相照应。或者你是一匹独狼，独自应对当地的盗贼公会和更可怕的违法者。',
    skills: ['巧手', '隐匿'],
    toolProficiency: '盗贼工具',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '体质', '智力'],
    featId: 'alert',
    equipmentChoice: true
  },
  {
    id: 'entertainer',
    name: '艺人',
    nameEn: 'Entertainer',
    description: '通过表演娱乐大众的艺术家',
    narrative: '你在舞台上表演，用音乐、舞蹈、特技或其他娱乐形式取悦观众。你可能是一个游吟诗人、小丑、音乐家或演员。你的才华为你赢得了名声和粉丝。',
    skills: ['特技', '表演'],
    toolProficiency: '一种乐器',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '感知', '魅力'],
    featId: 'actor',
    equipmentChoice: true
  },
  {
    id: 'farmer',
    name: '农夫',
    nameEn: 'Farmer',
    description: '辛勤劳作的乡村劳动者',
    narrative: '你在田野和农场中长大，学会了耕作、照料动物和修理工具。你了解大自然的循环和农村生活的艰辛。你可能离开农场去寻找更好的生活，或是去保护你的家园。',
    skills: ['驯兽', '自然'],
    toolProficiency: '木匠工具',
    abilityBonus: 3,
    abilityChoices: ['力量', '体质', '感知'],
    featId: 'tough',
    equipmentChoice: true
  },
  {
    id: 'guard',
    name: '守卫',
    nameEn: 'Guard',
    description: '维护秩序的守护者',
    narrative: '你曾在城镇、城堡或商队中担任守卫，保护人员和财产的安全。你接受过基本的战斗训练，也学会了如何保持警惕和识别可疑行为。',
    skills: ['运动', '察觉'],
    toolProficiency: '一种游戏工具',
    abilityBonus: 3,
    abilityChoices: ['力量', '智力', '感知'],
    featId: 'alert',
    equipmentChoice: true
  },
  {
    id: 'guide',
    name: '向导',
    nameEn: 'Guide',
    description: '熟悉荒野的经验丰富的旅行者',
    narrative: '你在荒野中长大或花费大量时间探索未知之地。你学会了如何追踪、寻找食物和水源，以及在危险的环境中生存。你可能曾带领旅行者穿越险境。',
    skills: ['隐匿', '求生'],
    toolProficiency: '制图工具',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '体质', '感知'],
    featId: 'magic-initiate-druid',
    equipmentChoice: true
  },
  {
    id: 'hermit',
    name: '隐士',
    nameEn: 'Hermit',
    description: '远离尘嚣寻求真理的独居者',
    narrative: '你曾在孤独中度过很长时间，远离文明，在荒野、修道院或其他僻静之处寻求真理、启示或宁静。在隔离中，你学会了依靠自己，也获得了独特的见解。',
    skills: ['医药', '宗教'],
    toolProficiency: '草药工具',
    abilityBonus: 3,
    abilityChoices: ['体质', '感知', '魅力'],
    featId: 'healer',
    equipmentChoice: true
  },
  {
    id: 'merchant',
    name: '商人',
    nameEn: 'Merchant',
    description: '精于买卖的生意人',
    narrative: '你在商业世界中摸爬滚打，无论是在繁华的城市市场还是遥远地区之间的贸易路线。你学会了讨价还价、评估商品价值，以及与各种人打交道。',
    skills: ['驯兽', '游说'],
    toolProficiency: '领航工具',
    abilityBonus: 3,
    abilityChoices: ['智力', '感知', '魅力'],
    featId: 'lucky',
    equipmentChoice: true
  },
  {
    id: 'noble',
    name: '贵族',
    nameEn: 'Noble',
    description: '出身上流社会的特权阶层',
    narrative: '你出身于有权势的家族，从小就享有财富、特权和良好的教育。你了解上流社会的礼仪和政治，可能继承了家族的头衔和责任，或者选择了不同的道路。',
    skills: ['历史', '游说'],
    toolProficiency: '一种游戏工具',
    abilityBonus: 3,
    abilityChoices: ['智力', '感知', '魅力'],
    featId: 'skilled',
    equipmentChoice: true
  },
  {
    id: 'sage',
    name: '学者',
    nameEn: 'Sage',
    description: '热爱学习和研究的知识分子',
    narrative: '你在年轻时往返于庄园和修道院之间，通过做各种零工和服务来换取进入图书馆的机会。你在许多漫长的夜晚学习书籍和卷轴，学习多元宇宙的知识——甚至是魔法的基础——你的思维渴望更多知识。',
    skills: ['奥秘', '历史'],
    toolProficiency: '书法工具',
    abilityBonus: 3,
    abilityChoices: ['体质', '智力', '感知'],
    featId: 'magic-initiate-wizard',
    equipmentChoice: true
  },
  {
    id: 'sailor',
    name: '水手',
    nameEn: 'Sailor',
    description: '在海上讨生活的航海者',
    narrative: '你在船上度过了大量时间，可能是在商船、渔船或战船上。你学会了绳结、航海和应对暴风雨。你见识过不同的港口和文化，习惯了海上生活的危险和自由。',
    skills: ['运动', '察觉'],
    toolProficiency: '领航工具',
    abilityBonus: 3,
    abilityChoices: ['力量', '敏捷', '感知'],
    featId: 'tavern-brawler',
    equipmentChoice: true
  },
  {
    id: 'scribe',
    name: '抄写员',
    nameEn: 'Scribe',
    description: '记录文字和知识的文书',
    narrative: '你曾在图书馆、法庭或宗教机构中工作，抄写文件、记录信息和整理知识。你的工作让你接触到各种信息，也培养了你细致和专注的品质。',
    skills: ['调查', '察觉'],
    toolProficiency: '书法工具',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '智力', '感知'],
    featId: 'skilled',
    equipmentChoice: true
  },
  {
    id: 'soldier',
    name: '士兵',
    nameEn: 'Soldier',
    description: '受过军事训练的战士',
    narrative: '你一成年就开始接受战争训练，对参军前的生活几乎没有什么记忆。战斗融入你的血液。有时你会发现自己反射性地进行最初学会的基本战斗练习。最终，你在战场上运用这些训练，通过发动战争来保卫领土。',
    skills: ['运动', '威吓'],
    toolProficiency: '一种游戏工具',
    abilityBonus: 3,
    abilityChoices: ['力量', '敏捷', '体质'],
    featId: 'savage-attacker',
    equipmentChoice: true
  },
  {
    id: 'wayfarer',
    name: '流浪者',
    nameEn: 'Wayfarer',
    description: '四处漂泊的旅行者',
    narrative: '你在街头长大，周围是同样不幸的弃儿，其中一些是朋友，一些是对手。你睡在能睡的地方，为了食物做零工。有时，当饥饿难以忍受时，你不得不偷窃。但你从未失去自豪感，也从未放弃希望。命运还没有对你下定论。',
    skills: ['洞悉', '隐匿'],
    toolProficiency: '盗贼工具',
    abilityBonus: 3,
    abilityChoices: ['敏捷', '感知', '魅力'],
    featId: 'lucky',
    equipmentChoice: true
  }
];

// 阵营
export const ALIGNMENTS = [
  { id: 'lg', name: '守序善良', nameEn: 'Lawful Good' },
  { id: 'ng', name: '中立善良', nameEn: 'Neutral Good' },
  { id: 'cg', name: '混乱善良', nameEn: 'Chaotic Good' },
  { id: 'ln', name: '守序中立', nameEn: 'Lawful Neutral' },
  { id: 'tn', name: '绝对中立', nameEn: 'True Neutral' },
  { id: 'cn', name: '混乱中立', nameEn: 'Chaotic Neutral' },
  { id: 'le', name: '守序邪恶', nameEn: 'Lawful Evil' },
  { id: 'ne', name: '中立邪恶', nameEn: 'Neutral Evil' },
  { id: 'ce', name: '混乱邪恶', nameEn: 'Chaotic Evil' }
];

// 技能列表
export const SKILLS = [
  { id: 'acrobatics', name: '特技', ability: 'dexterity' },
  { id: 'animal-handling', name: '驯兽', ability: 'wisdom' },
  { id: 'arcana', name: '奥秘', ability: 'intelligence' },
  { id: 'athletics', name: '运动', ability: 'strength' },
  { id: 'deception', name: '欺瞒', ability: 'charisma' },
  { id: 'history', name: '历史', ability: 'intelligence' },
  { id: 'insight', name: '洞悉', ability: 'wisdom' },
  { id: 'intimidation', name: '威吓', ability: 'charisma' },
  { id: 'investigation', name: '调查', ability: 'intelligence' },
  { id: 'medicine', name: '医药', ability: 'wisdom' },
  { id: 'nature', name: '自然', ability: 'intelligence' },
  { id: 'perception', name: '察觉', ability: 'wisdom' },
  { id: 'performance', name: '表演', ability: 'charisma' },
  { id: 'persuasion', name: '游说', ability: 'charisma' },
  { id: 'religion', name: '宗教', ability: 'intelligence' },
  { id: 'sleight-of-hand', name: '巧手', ability: 'dexterity' },
  { id: 'stealth', name: '隐匿', ability: 'dexterity' },
  { id: 'survival', name: '求生', ability: 'wisdom' }
];

// 属性分配方法
export const ABILITY_GENERATION_METHODS = [
  {
    id: 'standard-array',
    name: '标准数组',
    description: '使用预设的数值：15, 14, 13, 12, 10, 8',
    values: [15, 14, 13, 12, 10, 8]
  },
  {
    id: 'point-buy',
    name: '购点法',
    description: '使用 27 点购买属性值（范围：8-15）',
    points: 27
  },
  {
    id: 'manual',
    name: '手动输入',
    description: '手动输入或投骰获得的属性值'
  }
];

// 计算调整值
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// 计算熟练加值
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

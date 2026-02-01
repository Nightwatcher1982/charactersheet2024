// DND 2024 职业特性详细数据

export interface ClassFeatureDetail {
  id: string;
  name: string;
  nameEn: string;
  level: number;
  description: string;
  details?: string[];
}

export interface WeaponMastery {
  name: string;
  nameEn: string;
  description: string;
  selectableWeapons?: string[];
}

export interface ClassFeaturesData {
  classId: string;
  className: string;
  level1Features: ClassFeatureDetail[];
  weaponMastery?: WeaponMastery;
}

export const CLASS_FEATURES: ClassFeaturesData[] = [
  {
    classId: 'paladin',
    className: '圣武士',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条，例如长剑和标枪。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['长剑', '短剑', '战锤', '战斧', '标枪', '长矛', '戟', '链枷', '钉头锤', '战镐']
    },
    level1Features: [
      {
        id: 'lay-on-hands',
        name: '圣疗',
        nameEn: 'Lay on Hands',
        level: 1,
        description: '你的触碰溢满祝福，可以医治伤口。你获得一个治疗能量池，其内的治疗能量在每次完成长休后自动补满。',
        details: [
          '治疗能量池储备的可恢复生命值总值等于你的圣武士职业等级×5',
          '你能够以一个附赠动作触碰一个生物（可以是你自己），并抽取治疗能量池中的能量恢复该生物的生命值，其恢复量最多等于你治疗能量池中剩余的治疗量',
          '此外，你也可以使用5点治疗量来移除目标身上的中毒状态，而非恢复生命值'
        ]
      },
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '你已经学会了如何通过祈祷与冥想来施展法术。',
        details: [
          '法术位：圣武士特性表显示了你可用于施展一环及以上法术的法术位数量。当你完成长休时，你重获所有已消耗的法术位',
          '准备法术：最初，选择两道圣武士法术（推荐选择英雄气概Heroism和炽焰斩Searing Smite）',
          '已准备法术数量会随你圣武士等级的提升而增加',
          '改变准备法术：每当你完成一次长休时，你可以将你准备列表上的一道法术替换为其他圣武士法术',
          '施法属性：你圣武士法术的施法属性是魅力',
          '施法法器：你可以使用圣徽作为你圣武士法术的施法法器'
        ]
      }
    ]
  },
  {
    classId: 'cleric',
    className: '牧师',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['钉头锤', '战锤', '十字弩', '长矛', '长杖', '战镐']
    },
    level1Features: [
      {
        id: 'divine-order',
        name: '圣职选择',
        nameEn: 'Divine Order',
        level: 1,
        description: '你已经献身于以下两种圣职之一：守护者或奇术师。',
        details: [
          '守护者：擅长战斗，获得重甲熟练和武器精通',
          '奇术师：注重施法，获得额外戏法和祝福Bless法术'
        ]
      },
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为神祇力量的传导者，你可以施展牧师法术。',
        details: [
          '戏法：你知晓三个牧师戏法（奇术师知晓四个）',
          '法术位：牧师特性表显示了你可用的法术位数量',
          '准备法术：最初选择四道一环牧师法术；之后按特性表“准备法术”列增加（长休可更换准备）',
          '仪式施法：你可以将任何已准备的具有仪式标签的牧师法术作为仪式施展',
          '施法属性：你牧师法术的施法属性是感知',
          '施法法器：你可以使用圣徽作为你牧师法术的施法法器'
        ]
      }
    ]
  },
  {
    classId: 'fighter',
    className: '战士',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用三种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['所有简易和军用武器']
    },
    level1Features: [
      {
        id: 'fighting-style',
        name: '战斗风格',
        nameEn: 'Fighting Style',
        level: 1,
        description: '你选择一种战斗风格作为你的专长。',
        details: [
          '防御：穿着护甲时AC+1',
          '决斗：单手持一把近战武器时伤害+2',
          '巨武器：使用双手武器重骰伤害骰1或2',
          '射击：远程武器攻击+2',
          '双武器：双持武器时可以用附赠动作添加属性调整值'
        ]
      },
      {
        id: 'second-wind',
        name: '再度振作',
        nameEn: 'Second Wind',
        level: 1,
        description: '你拥有有限的耐力储备，可以用来保护自己免受伤害。',
        details: [
          '在你的回合，你可以使用一个附赠动作来恢复生命值',
          '恢复量等于1d10+你的战士等级',
          '一旦你使用此特性，你必须完成一次短休或长休才能再次使用'
        ]
      }
    ]
  },
  {
    classId: 'wizard',
    className: '法师',
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为奥术学识的学生，你拥有记录着法师法术的法术书。',
        details: [
          '戏法：你知晓三个法师戏法',
          '法术书：1级时，你的法术书包含六个一环法师法术',
          '准备法术：从法术书中选择准备法术，数量按特性表“准备法术”列（长休可更换准备）',
          '施法属性：你法师法术的施法属性是智力',
          '仪式施法：你可以将法术书中具有仪式标签的法师法术作为仪式施展',
          '施法法器：你可以使用奥术法器作为你法师法术的施法法器'
        ]
      },
      {
        id: 'arcane-recovery',
        name: '奥术回想',
        nameEn: 'Arcane Recovery',
        level: 1,
        description: '你已经学会了如何通过学习来重获部分魔法能量。',
        details: [
          '一次短休结束时，你可以选择恢复部分已消耗的法术位',
          '恢复的法术位总环数不能超过你法师等级的一半（向上取整）',
          '且你不能恢复六环或更高环的法术位',
          '你必须完成一次长休才能再次使用此特性'
        ]
      }
    ]
  },
  {
    classId: 'bard',
    className: '吟游诗人',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['短剑', '细剑', '手弩', '短弓', '长弓']
    },
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为音乐和魔法的实践者，你拥有一个法术列表，你可以从中选择法术来施展。',
        details: [
          '戏法：你知晓两个吟游诗人戏法',
          '法术位：吟游诗人特性表显示了你可用于施展一环及以上法术的法术位数量',
          '准备法术：最初选择四道一环吟游诗人法术；之后按特性表“准备法术”列增加（升级时也可替换）',
          '施法属性：你吟游诗人法术的施法属性是魅力',
          '施法法器：你可以使用乐器作为你吟游诗人法术的施法法器'
        ]
      },
      {
        id: 'bardic-inspiration',
        name: '吟游激励',
        nameEn: 'Bardic Inspiration',
        level: 1,
        description: '你可以用话语或音乐来激励他人。',
        details: [
          '在你的回合，你可以用一个附赠动作选择一个你30尺内可见的生物（可以是你自己）',
          '该生物获得一个吟游激励骰（d6）',
          '在接下来的10分钟内，该生物可以在一次属性检定、攻击检定或豁免检定中，使用一个反应动作来掷这个骰子，并将结果加到检定结果上',
          '一旦使用，吟游激励骰就会消失',
          '你完成一次长休后，重获所有已消耗的使用次数',
          '使用次数等于你的魅力调整值（至少1次）'
        ]
      }
    ]
  },
  {
    classId: 'rogue',
    className: '游荡者',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['短剑', '匕首', '手弩', '短弓', '长剑', '细剑']
    },
    level1Features: [
      {
        id: 'expertise',
        name: '专精',
        nameEn: 'Expertise',
        level: 1,
        description: '选择两项你熟练的技能或工具。你对这些技能或工具的熟练加值翻倍。',
        details: [
          '在6级时，你可以再选择两项技能或工具获得此收益'
        ]
      },
      {
        id: 'sneak-attack',
        name: '偷袭',
        nameEn: 'Sneak Attack',
        level: 1,
        description: '你知道如何精准地打击并利用对手的分心。',
        details: [
          '每回合一次，当你用具有精准或灵巧属性的武器攻击并命中时，你可以额外造成1d6伤害',
          '攻击必须具有优势，或者目标5尺内有你的盟友且你的攻击没有劣势',
          '偷袭伤害随等级提升：1级1d6，3级2d6，5级3d6，以此类推'
        ]
      },
      {
        id: 'thieves-cant',
        name: '盗贼黑话',
        nameEn: "Thieves' Cant",
        level: 1,
        description: '你学会了盗贼黑话，这是一种秘密的混合语言，包含行话和隐藏信息。',
        details: [
          '你可以用这种语言进行秘密交流',
          '此外，你了解一套秘密符号和标记，用来传达简短的讯息'
        ]
      }
    ]
  },
  {
    classId: 'ranger',
    className: '游侠',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['长弓', '短弓', '长剑', '短剑', '手斧', '标枪', '双刃剑']
    },
    level1Features: [
      {
        id: 'favored-enemy',
        name: '宿敌',
        nameEn: 'Favored Enemy',
        level: 1,
        description: '你对某类敌人有着深入了解。选择一种生物类型作为你的宿敌。',
        details: [
          '对宿敌的攻击造成额外1d4伤害',
          '对宿敌的生存和回忆检定具有优势'
        ]
      },
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '你已经学会了如何利用大自然的精华施展法术。',
        details: [
          '法术位：游侠特性表显示了你可用于施展一环及以上法术的法术位数量',
          '准备法术：最初选择两道一环游侠法术；之后按特性表“准备法术”列增加（长休可替换一项准备）',
          '施法属性：你游侠法术的施法属性是感知'
        ]
      }
    ]
  },
  {
    classId: 'barbarian',
    className: '野蛮人',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['所有简易和军用武器']
    },
    level1Features: [
      {
        id: 'rage',
        name: '狂暴',
        nameEn: 'Rage',
        level: 1,
        description: '在战斗中，你可以进入狂暴状态，释放原始的愤怒力量。',
        details: [
          '在你的回合，你可以使用一个附赠动作进入狂暴状态',
          '狂暴持续1分钟，或直到你陷入昏迷、结束狂暴（附赠动作）',
          '狂暴时，近战武器攻击的伤害骰获得+2加值',
          '你对钝击、穿刺和挥砍伤害具有抗性',
          '你完成一次长休后，重获所有已消耗的使用次数',
          '使用次数等于你的体质调整值（至少2次）'
        ]
      },
      {
        id: 'unarmored-defense',
        name: '无甲防御',
        nameEn: 'Unarmored Defense',
        level: 1,
        description: '当你未穿着护甲时，你的AC等于10+敏捷调整值+体质调整值。',
        details: [
          '你可以使用盾牌并仍获得此收益',
          '此特性在你穿着护甲时无效'
        ]
      }
    ]
  },
  {
    classId: 'druid',
    className: '德鲁伊',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['木棒', '匕首', '飞镖', '标枪', '硬头锤', '木棍', '弯刀', '镰刀', '投石索', '矛']
    },
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为自然的守护者，你可以施展德鲁伊法术。',
        details: [
          '戏法：你知晓两个德鲁伊戏法',
          '法术位：德鲁伊特性表显示了你可用的法术位数量',
          '准备法术：最初选择四道一环德鲁伊法术；之后按特性表“准备法术”列增加（长休可更换准备）',
          '仪式施法：你可以将任何已准备的具有仪式标签的德鲁伊法术作为仪式施展',
          '施法属性：你德鲁伊法术的施法属性是感知',
          '施法法器：你可以使用德鲁伊法器作为你德鲁伊法术的施法法器'
        ]
      },
      {
        id: 'wild-shape',
        name: '野性形态',
        nameEn: 'Wild Shape',
        level: 1,
        description: '你可以使用魔法来改变自己的形态。',
        details: [
          '你可以使用一个动作变形成一只野兽，其挑战等级为0，且没有飞行或游泳速度',
          '你保持自己的智力、感知和魅力值，以及所有技能和豁免检定的熟练项',
          '你获得该野兽的感官、移动方式和特殊能力',
          '你完成一次短休或长休后，重获所有已消耗的使用次数',
          '使用次数等于你的感知调整值（至少1次）'
        ]
      }
    ]
  },
  {
    classId: 'monk',
    className: '武僧',
    weaponMastery: {
      name: '武器精通',
      nameEn: 'Weapon Mastery',
      description: '你对武器的训练使你能够运用两种自选的你具有熟练的武器的精通词条。每当你完成一次长休时，你可以改变你所选择的武器类型。',
      selectableWeapons: ['所有简易武器', '短剑']
    },
    level1Features: [
      {
        id: 'unarmored-defense',
        name: '无甲防御',
        nameEn: 'Unarmored Defense',
        level: 1,
        description: '当你未穿着护甲也未持盾时，你的AC等于10+敏捷调整值+感知调整值。',
        details: [
          '此特性在你穿着护甲或持盾时无效'
        ]
      },
      {
        id: 'martial-arts',
        name: '武艺',
        nameEn: 'Martial Arts',
        level: 1,
        description: '你的徒手攻击和特定武器攻击可以使用敏捷调整值代替力量调整值。',
        details: [
          '当你使用徒手攻击或武僧武器进行攻击时，可以使用敏捷调整值进行攻击和伤害检定',
          '当你使用攻击动作进行徒手攻击或使用武僧武器攻击时，可以用附赠动作进行一次徒手攻击',
          '徒手攻击的伤害骰为d4，随等级提升'
        ]
      }
    ]
  },
  {
    classId: 'sorcerer',
    className: '术士',
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为天生拥有魔法力量的施法者，你可以施展术士法术。',
        details: [
          '戏法：你知晓四个术士戏法',
          '法术位：术士特性表显示了你可用的法术位数量',
          '准备法术：最初选择两道一环术士法术；之后按特性表“准备法术”列增加（升级时可替换）',
          '施法属性：你术士法术的施法属性是魅力',
          '施法法器：你可以使用奥术法器作为你术士法术的施法法器'
        ]
      },
      {
        id: 'sorcerous-origin',
        name: '术士起源',
        nameEn: 'Sorcerous Origin',
        level: 1,
        description: '你选择一种术士起源，它决定了你魔法的来源和性质。',
        details: [
          '龙裔血统：你的魔法源于龙族血统',
          '狂野魔法：你的魔法充满混沌和不可预测性',
          '风暴术士：你的魔法源于元素风暴',
          '每种起源都提供独特的1级特性'
        ]
      }
    ]
  },
  {
    classId: 'warlock',
    className: '邪术师',
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为与异界存在订立契约的施法者，你可以施展邪术师法术。',
        details: [
          '戏法：你知晓两个邪术师戏法',
          '法术位：邪术师特性表显示了你可用的法术位数量（短休恢复）',
          '准备法术：最初选择两道一环邪术师法术；之后按特性表“准备法术”列增加（升级时可替换）',
          '施法属性：你邪术师法术的施法属性是魅力',
          '施法法器：你可以使用奥术法器作为你邪术师法术的施法法器'
        ]
      },
      {
        id: 'pact-magic',
        name: '契约魔法',
        nameEn: 'Pact Magic',
        level: 1,
        description: '你的魔法来自与异界存在的契约。',
        details: [
          '你的法术位在短休后恢复，而非长休',
          '所有法术位都是同一环阶（从1环开始，随等级提升）',
          '你完成一次短休后，重获所有已消耗的法术位'
        ]
      },
      {
        id: 'pact-boon',
        name: '契约恩赐',
        nameEn: 'Pact Boon',
        level: 1,
        description: '你的守护神赐予你一个特殊的恩赐。',
        details: [
          '锁链契约：获得一个魔宠',
          '刀锋契约：可以召唤契约武器',
          '魔典契约：获得暗影之书，学习额外戏法'
        ]
      }
    ]
  }
];

export function getClassFeatures(classId: string): ClassFeaturesData | undefined {
  return CLASS_FEATURES.find(cf => cf.classId === classId);
}

export function getClassFeaturesByName(className: string): ClassFeaturesData | undefined {
  return CLASS_FEATURES.find(cf => cf.className === className);
}

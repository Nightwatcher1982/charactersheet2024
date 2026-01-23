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
          '准备法术：准备法术数量等于你的感知调整值+牧师等级',
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
          '准备法术：准备法术数量等于你的智力调整值+法师等级',
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
        name: '专长',
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
          '法术位：2级开始获得法术位',
          '已知法术：你知晓一定数量的游侠法术',
          '施法属性：你游侠法术的施法属性是感知'
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

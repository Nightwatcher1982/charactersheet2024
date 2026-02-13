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
  /** 2 级及以上的职业特性（含完整描述），按等级分组 */
  featuresByLevel?: Record<number, ClassFeatureDetail[]>;
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
    ],
    featuresByLevel: {
      2: [
        { id: 'fighting-style', name: '战斗风格', nameEn: 'Fighting Style', level: 2, description: '你获得一项战斗风格专长（见第五章）。你也可以选择受祝福的勇士：习得两道牧师戏法，对你视作圣武士法术，施法属性为魅力。', details: [] },
        { id: 'paladins-smite', name: '圣武斩', nameEn: "Paladin's Smite", level: 2, description: '你始终准备着法术至圣斩。此外，你可以不消耗法术位地施展该法术一次，而后你必须完成一次长休才能再次这么做。', details: [] }
      ],
      3: [
        { id: 'channel-divinity', name: '引导神力', nameEn: 'Channel Divinity', level: 3, description: '你能从外层位面引导神圣能量，并用其引动魔法效应。你起始时具有神圣感知：以一个附赠动作，你可以扩展你的意识侦测天族、邪魔以及亡灵生物，持续10分钟内能感知到自身周围60尺内这些生物的位置。', details: ['你可以使用本职业的引导神力两次，完成短休重获一次、长休重获全部。'] }
      ],
      5: [
        { id: 'extra-attack', name: '额外攻击', nameEn: 'Extra Attack', level: 5, description: '当你在你的回合中执行攻击动作时，你可以发动两次而非一次攻击。', details: [] },
        { id: 'faithful-steed', name: '信实坐骑', nameEn: 'Faithful Steed', level: 5, description: '你能唤来异界坐骑的协助。你始终准备着法术寻获坐骑。此外，你可以不消耗法术位地施展该法术一次，而后你必须完成一次长休才能再次这么做。', details: [] }
      ],
      6: [
        { id: 'aura-of-protection', name: '守护灵光', nameEn: 'Aura of Protection', level: 6, description: '你散发出无形的保护性的灵光，覆盖源自你的10尺光环区域。你与灵光内盟友的豁免检定获得相当于你魅力调整值的加值（至少+1）。在你陷入失能状态期间，此灵光失效。', details: [] }
      ],
      9: [
        { id: 'abjure-foes', name: '弃绝众敌', nameEn: 'Abjure Foes', level: 9, description: '以一个魔法动作，你消耗一次引导神力使用次数让敌人被恐惧吞没。你选择位于你60尺内、数量至多等于你魅力调整值（最少为1）的可见生物作为目标。每个目标必须成功通过一次感知豁免，否则陷入恐慌状态，持续1分钟或在其受到任何伤害时提前结束。', details: [] }
      ],
      10: [
        { id: 'aura-of-courage', name: '勇气灵光', nameEn: 'Aura of Courage', level: 10, description: '你与你的盟友在守护灵光内具有对恐慌状态的免疫。若陷入恐慌的盟友进入灵光，该状态在灵光内不会造成影响。', details: [] }
      ],
      11: [
        { id: 'radiant-strikes', name: '光耀打击', nameEn: 'Radiant Strikes', level: 11, description: '神圣之力充盈你身，连带你的武器也承载着超自然力量。当你使用近战武器或徒手打击进行攻击检定并命中目标时，目标额外受到1d8光耀伤害。', details: [] }
      ],
      14: [
        { id: 'restoring-touch', name: '复原之触', nameEn: 'Restoring Touch', level: 14, description: '当你对一个生物使用圣疗时，你可以终止该生物身上以下一种或更多种类的状态：目盲、魅惑、耳聋、恐慌、麻痹或震慑。你每终止一个状态，都需要花费圣疗的5点治疗能量；这些治疗能量不会恢复该生物的生命值。', details: [] }
      ],
      18: [
        { id: 'aura-expansion', name: '灵光增效', nameEn: 'Aura Expansion', level: 18, description: '你的守护灵光与勇气灵光的光环半径增加至30尺。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'channel-divinity', name: '引导神力', nameEn: 'Channel Divinity', level: 2, description: '你能从外层位面引导神圣能量来引动魔法效应。你起始时具有两种效应选项：神圣火花与驱散亡灵。每当你使用本职业的引导神力时，你选择要创造哪种来自本职业的效应。', details: ['你可以使用本职业的引导神力两次，你在完成短休时重获一次已消耗的使用次数，并在完成长休时重获所有已消耗的使用次数。'] }
      ],
      5: [
        { id: 'sear-undead', name: '灼净亡灵', nameEn: 'Sear Undead', level: 5, description: '每当你使用驱散亡灵时，你都可以投掷等于你感知调整值枚d8（最少1d8），而每个在对抗驱散亡灵的豁免中失败的亡灵都将受到等同于骰值之和的光耀伤害。此伤害不会终止驱散效应。', details: [] }
      ],
      7: [
        { id: 'blessed-strikes', name: '受祝击', nameEn: 'Blessed Strikes', level: 7, description: '神圣的力量在战斗中注入你。你从以下特性中选择其一获得：神圣打击（每个你的回合一次，当你使用武器的攻击命中了一名生物时，你可以使该生物额外受到1d8点暗蚀伤害或光耀伤害）或强力施法（你将你的感知调整值加到你用任何牧师戏法造成的伤害上）。', details: [] }
      ],
      10: [
        { id: 'divine-intervention', name: '神圣干预', nameEn: 'Divine Intervention', level: 10, description: '你能呼唤你所信奉的神祇或神系来代你降下干预。以一个魔法动作，你选择一道五环或更低的牧师法术（施法时间不能为1反应），并将该法术作为执行此动作的一部分施展，无需消耗法术位也无需对应的施法材料。直到你完成一次长休前，你都无法再次使用此特性。', details: [] }
      ],
      14: [
        { id: 'improved-blessed-strike', name: '精通受祝击', nameEn: 'Improved Blessed Strike', level: 14, description: '你所选择的受祝击变得更加强大。神圣打击的额外伤害提升至2d8；强力施法时，当你施展一道施法距离为10尺或更高的牧师戏法时，法术施法距离提升300尺。', details: [] }
      ],
      20: [
        { id: 'greater-divine-intervention', name: '进阶神圣干预', nameEn: 'Greater Divine Intervention', level: 20, description: '你的神圣干预变得更加强大，可以施展的牧师法术环阶提升至七环或更低。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'action-surge', name: '动作如潮', nameEn: 'Action Surge', level: 2, description: '你可以在短期内让自己突破身为凡骨的极限。在你的回合中，你可以执行一个额外的动作，但不能是魔法动作。', details: ['你使用此特性后，你必须在完成一次短休或长休后才能再次使用。第17级起，你可以在每次休息之间使用此特性两次，但每回合只能使用一次。'] },
        { id: 'tactical-mind', name: '战术思维', nameEn: 'Tactical Mind', level: 2, description: '在战场内外，你都能够运用你的战术思维。当你在一次属性检定上失败时，你可以消耗一次回气次数让你更接近成功。你掷1d10并将骰值加入到结果之中，而非恢复生命值。这可能会让结果变为成功。如果检定依旧失败，则不会消耗回气次数。', details: [] }
      ],
      5: [
        { id: 'extra-attack', name: '额外攻击', nameEn: 'Extra Attack', level: 5, description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。', details: [] },
        { id: 'tactical-shift', name: '战术转进', nameEn: 'Tactical Shift', level: 5, description: '每当你使用附赠动作进行回气时，你可以移动至多相当于你速度一半的距离，且不会引发借机攻击。', details: [] }
      ],
      9: [
        { id: 'indomitable', name: '不屈', nameEn: 'Indomitable', level: 9, description: '当你在一次豁免检定中失败时，你可以重骰并获得等同你战士等级的加值。你必须使用新的掷骰结果，你使用此特性后，你必须在完成一次长休后才能再次使用。', details: ['第13级起，你可以在两次长休之间使用此特性两次；第17级起，你可以在两次长休之间使用此特性三次。'] },
        { id: 'tactical-master', name: '战术主宰', nameEn: 'Tactical Master', level: 9, description: '每当你用武器发动攻击，且你可以使用此武器的精通词条时，你可以将此次攻击的精通词条改为推离、削弱或缓速中的一种。', details: [] }
      ],
      11: [
        { id: 'extra-attack-2', name: '额外攻击（二）', nameEn: 'Extra Attack', level: 11, description: '你在自己回合内执行攻击动作时，可以发动三次攻击而非一次。', details: [] }
      ],
      13: [
        { id: 'indomitable-2', name: '不屈（两次）', nameEn: 'Indomitable', level: 13, description: '当你在一次豁免检定中失败时，你可以重骰并获得等同你战士等级的加值。你可以在两次长休之间使用此特性两次。', details: [] },
        { id: 'studied-attacks', name: '究明攻击', nameEn: 'Studied Attacks', level: 13, description: '你已深晓对手的一举一动，并且从每次攻击中吸取经验教训。如果你对一个生物进行攻击检定但失手，那么直到你的下个回合结束前，你对其的下次攻击检定具有优势。', details: [] }
      ],
      17: [
        { id: 'action-surge-2', name: '动作如潮（两次）', nameEn: 'Action Surge', level: 17, description: '你可以在短期内让自己突破身为凡骨的极限。在你的回合中，你可以执行一个额外的动作，但不能是魔法动作。你可以在每次休息之间使用此特性两次，但每回合只能使用一次。', details: [] },
        { id: 'indomitable-3', name: '不屈（三次）', nameEn: 'Indomitable', level: 17, description: '当你在一次豁免检定中失败时，你可以重骰并获得等同你战士等级的加值。你可以在两次长休之间使用此特性三次。', details: [] }
      ],
      20: [
        { id: 'extra-attack-3', name: '额外攻击（三）', nameEn: 'Extra Attack', level: 20, description: '你在自己回合内执行攻击动作时，可以发动四次攻击而非一次。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'scholar', name: '学者', nameEn: 'Scholar', level: 2, description: '你选择一项你熟练的智力技能，获得该技能的专精。此外，你进行该技能的属性检定时，若结果低于10，则视为10。', details: [] }
      ],
      5: [
        { id: 'memorize-spell', name: '记忆法术', nameEn: 'Memorize Spell', level: 5, description: '你可以将你法术书中已准备的一道法术牢记于心。以一个魔法动作，你可以将一道你已准备的法术从你的准备列表中移出，并改为准备你法术书中的另一道法术。你完成一次长休后，才能再次使用此特性。', details: [] }
      ],
      18: [
        { id: 'spell-mastery', name: '法术精通', nameEn: 'Spell Mastery', level: 18, description: '你从法术书中选择一道一环法术和一道二环法术。你始终视作准备着这两道法术，且可以随意施展它们而不消耗法术位。', details: [] }
      ],
      20: [
        { id: 'signature-spells', name: '招牌法术', nameEn: 'Signature Spells', level: 20, description: '你从法术书中选择两道三环法术。你始终视作准备着这两道法术，且可以各施展一次而不消耗法术位。你完成一次短休或长休后，重获此能力。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        {
          id: 'expertise',
          name: '专精',
          nameEn: 'Expertise',
          level: 2,
          description: '你获得两项由你选择的你熟练技能的专精（见术语汇编）。如果你具有表演和游说的熟练，推荐选择这两项。',
          details: [
            '当你的吟游诗人等级到达 9 级时，你再额外获得两项由你选择的你熟练技能的专精'
          ]
        },
        {
          id: 'jack-of-all-trades',
          name: '万事通',
          nameEn: 'Jack of All Trades',
          level: 2,
          description: '若你进行的任意属性检定可以使用技能熟练但你不具备其熟练，且你也无法通过其他方式在该属性检定中应用熟练加值，你可以将你熟练加值的一半（向下取整）添加到该属性检定中。',
          details: [
            '例如，如果你要进行力量（运动）检定，且不具有运动熟练，则你可以将熟练加值的一半添加到检定中'
          ]
        }
      ],
      5: [
        {
          id: 'font-of-inspiration',
          name: '激励之源',
          nameEn: 'Font of Inspiration',
          level: 5,
          description: '现在，当你完成一次短休或长休时，你重获所有已消耗的诗人激励使用次数。',
          details: [
            '此外，你可以消耗一个法术位（无需动作）来重获一次已消耗的诗人激励使用次数。'
          ]
        }
      ],
      7: [
        {
          id: 'countercharm',
          name: '反迷惑',
          nameEn: 'Countercharm',
          level: 7,
          description: '你可以用带有力量的音符或话语来干扰影响心灵的效应。',
          details: [
            '若你或位于你30尺内的一名生物在对抗施加魅惑或恐慌状态的效应的豁免检定中失败，你能够以反应令其重骰这次豁免，这次重骰具有优势。'
          ]
        }
      ],
      9: [
        {
          id: 'expertise-2',
          name: '专精',
          nameEn: 'Expertise',
          level: 9,
          description: '你再额外获得两项由你选择的你熟练技能的专精（见术语汇编）。',
          details: []
        }
      ],
      10: [
        {
          id: 'magical-secrets',
          name: '魔法奥秘',
          nameEn: 'Magical Secrets',
          level: 10,
          description: '你自各种魔法传说中习得了他们的奥秘。每当你到达一个吟游诗人特性表中准备法术数量有所增加的吟游诗人等级时（包括此等级），你可以从吟游诗人、牧师、德鲁伊和法师的法术列表中选择法术准备（这些职业的法术列表见其职业章节），这些法术对你而言都视作吟游诗人法术。',
          details: [
            '此外，每当你替换本职业的准备法术时，你也可以从这些法术列表中选择替换。'
          ]
        }
      ],
      18: [
        {
          id: 'superior-inspiration',
          name: '先发激励',
          nameEn: 'Superior Inspiration',
          level: 18,
          description: '当你投掷先攻时，若你的诗人激励使用次数不足两次，你重获已消耗的诗人激励使用次数到两次为止。',
          details: []
        }
      ],
      20: [
        {
          id: 'words-of-creation',
          name: '创生圣言',
          nameEn: 'Words of Creation',
          level: 20,
          description: '你掌握了创生圣言的其中两字：「生」与「死」。因此，你始终准备着法术律令医疗和律令死亡。',
          details: [
            '当你施展这两道法术时，你可以选择第二个生物作为目标，那名生物必须位于第一个目标10尺内。'
          ]
        }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'cunning-action', name: '灵巧动作', nameEn: 'Cunning Action', level: 2, description: '你可以用附赠动作执行疾走、撤离或躲藏动作。', details: [] }
      ],
      3: [
        { id: 'steady-aim', name: '稳定瞄准', nameEn: 'Steady Aim', level: 3, description: '作为你回合内的附赠动作，你可以放弃本回合的移动，使你在本回合下一次对30尺内目标的远程攻击检定具有优势。', details: [] }
      ],
      5: [
        { id: 'cunning-strike', name: '诡诈打击', nameEn: 'Cunning Strike', level: 5, description: '当你以偷袭对生物造成伤害时，你可以消耗任意数量的偷袭伤害骰，以造成一种诡诈打击效应。效应选项随等级解锁。', details: [] },
        { id: 'uncanny-dodge', name: '直觉闪避', nameEn: 'Uncanny Dodge', level: 5, description: '当一名你能看见的生物用攻击命中你时，你可以用反应将此次攻击的伤害减半。', details: [] }
      ],
      6: [
        { id: 'expertise-2', name: '专精', nameEn: 'Expertise', level: 6, description: '你再额外获得两项由你选择的你熟练的技能或工具的专精。', details: [] }
      ],
      7: [
        { id: 'evasion', name: '反射闪避', nameEn: 'Evasion', level: 7, description: '当某效应要求你进行敏捷豁免以仅受到一半伤害时，豁免成功则不受伤害，失败则仅受一半伤害。', details: [] },
        { id: 'reliable-talent', name: '可靠才能', nameEn: 'Reliable Talent', level: 7, description: '当你进行一项你熟练的技能检定时，你可以将掷骰结果中出现的低于10的d20结果视为10。', details: [] }
      ],
      11: [
        { id: 'improved-cunning-strike', name: '进阶诡诈打击', nameEn: 'Improved Cunning Strike', level: 11, description: '你获得更多诡诈打击效应选项，且当你使用诡诈打击时，你可以同时应用两种不同的效应。', details: [] }
      ],
      14: [
        { id: 'devious-strike', name: '凶狡打击', nameEn: 'Devious Strike', level: 14, description: '当你以偷袭对生物造成伤害时，你可以使该生物直至你的下个回合开始不能发动借机攻击。', details: [] }
      ],
      15: [
        { id: 'slippery-mind', name: '圆滑心智', nameEn: 'Slippery Mind', level: 15, description: '你获得感知豁免的熟练。', details: [] }
      ],
      18: [
        { id: 'elusive', name: '飘忽不定', nameEn: 'Elusive', level: 18, description: '以你为目标的攻击检定不会因你具有优势而获得优势，除非你处于失能状态。', details: [] }
      ],
      20: [
        { id: 'stroke-of-luck', name: '幸运一击', nameEn: 'Stroke of Luck', level: 20, description: '你拥有非凡的运气。当你的攻击检定失手或属性检定失败时，你可以将此次掷骰结果视为20。你完成一次长休后，才能再次使用此特性。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'deft-explorer', name: '熟练探险家', nameEn: 'Deft Explorer', level: 2, description: '得益于你的旅途，你获得以下增益：选择一项你熟练但不具备专精的技能，你在那个技能上获得专精；你习得两门语言。', details: [] },
        { id: 'fighting-style', name: '战斗风格', nameEn: 'Fighting Style', level: 2, description: '你获得一项战斗风格专长（见第五章）。你也可以选择德鲁伊教战士：习得两道德鲁伊戏法，对你视作游侠法术，施法属性为感知。', details: [] }
      ],
      5: [
        { id: 'extra-attack', name: '额外攻击', nameEn: 'Extra Attack', level: 5, description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。', details: [] }
      ],
      6: [
        { id: 'roving', name: '越野', nameEn: 'Roving', level: 6, description: '只要你未着装重甲，你的速度提升10尺。你也获得等于你速度的攀爬速度和游泳速度。', details: [] }
      ],
      9: [
        { id: 'expertise', name: '专精', nameEn: 'Expertise', level: 9, description: '选择两项你熟练但不具备专精的技能，你获得这些技能的专精。', details: [] }
      ],
      10: [
        { id: 'tireless', name: '不知疲倦', nameEn: 'Tireless', level: 10, description: '原初的力量现在会帮你重整旗鼓。以一个魔法动作，你能够给予自己1d8+你的感知调整值（最低为1）的临时生命值。你能够使用此特性的次数等于你的感知调整值次（最低一次），当你完成一次长休时，你重获全部已消耗的使用次数。当你完成一次短休时，你的力竭等级减少1级（若有）。', details: [] }
      ],
      13: [
        { id: 'relentless-hunter', name: '永恒追猎', nameEn: 'Relentless Hunter', level: 13, description: '你对宿敌的追踪几乎从不停歇。你始终准备着法术猎人印记；且你可以无需法术位地施展该法术的次数增加，见游侠特性表中宿敌一栏。', details: [] }
      ],
      14: [
        { id: 'natures-veil', name: '自然面纱', nameEn: "Nature's Veil", level: 14, description: '你可以用原初魔法隐藏自己。以一个附赠动作，你可以变为隐形，持续至你攻击、施法、或下个回合结束。你完成一次长休后，才能再次使用此特性。', details: [] }
      ],
      17: [
        { id: 'precise-hunter', name: '致命猎杀', nameEn: 'Precise Hunter', level: 17, description: '你对宿敌的攻击造成额外1d6伤害；对宿敌的生存和回忆检定具有优势。', details: [] }
      ],
      18: [
        { id: 'feral-senses', name: '野性感官', nameEn: 'Feral Senses', level: 18, description: '你获得30尺内的盲感。在此范围内，你可以感知到隐藏或隐形的生物的位置。', details: [] }
      ],
      20: [
        { id: 'foe-slayer', name: '屠灭众敌', nameEn: 'Foe Slayer', level: 20, description: '你成为宿敌的克星。每回合一次，当你对宿敌进行攻击检定或属性检定时，你可以将你的熟练加值加到该检定上。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'danger-sense', name: '危机感应', nameEn: 'Danger Sense', level: 2, description: '当非常事态发生时，一种不可思议的感觉降临你的心头，指引你更好的躲避危机。', details: ['只要你未陷入失能状态，你的敏捷豁免检定就具有优势。'] },
        { id: 'reckless-attack', name: '鲁莽攻击', nameEn: 'Reckless Attack', level: 2, description: '你可以抛弃一切对防御的顾虑来发起更加狂乱的攻击。', details: ['你在你的回合中进行第一次攻击检定时，可以不顾一切地发起攻势。若如此做，直至你的下个回合开始，你使用力量进行的攻击检定具有优势，但在此期间所有以你为目标的攻击检定也具有优势。'] }
      ],
      3: [
        { id: 'primal-knowledge', name: '原初学识', nameEn: 'Primal Knowledge', level: 3, description: '除了1级选择的技能以外，你可以从野蛮人技能列表中额外获得一个技能的熟练。此外，狂暴激活期间，你可以在尝试完成特定的事项时与原初之力相连。', details: ['每当你使用以下技能进行一次属性检定时，你可以使用力量进行检定而非通常使用的其他属性：特技，威吓，察觉，隐匿或求生。'] }
      ],
      5: [
        { id: 'extra-attack', name: '额外攻击', nameEn: 'Extra Attack', level: 5, description: '当你在自己的回合执行攻击动作时，你可以发动两次攻击而非一次。', details: [] },
        { id: 'fast-movement', name: '快速移动', nameEn: 'Fast Movement', level: 5, description: '当你未着装重甲时，你的速度提升10尺。', details: [] }
      ],
      7: [
        { id: 'feral-instinct', name: '野性直觉', nameEn: 'Feral Instinct', level: 7, description: '你的直觉变得格外敏锐。你的先攻检定具有优势。', details: [] },
        { id: 'instinctive-pounce', name: '莽驰', nameEn: 'Instinctive Pounce', level: 7, description: '作为你进入狂暴的附赠动作的一部分，你可以移动至多等于你速度一半的距离。', details: [] }
      ],
      9: [
        { id: 'brutal-strike', name: '凶蛮打击', nameEn: 'Brutal Strike', level: 9, description: '如果你使用了鲁莽攻击，你可以放弃本回合你选择的一次基于力量的攻击检定具有的所有优势（不可选择具有劣势的攻击检定）。被选择的攻击检定命中时，目标将受到1d10的额外伤害，伤害类型与此次攻击所使用的武器或徒手打击造成的伤害类型相同，并且你可以造成一种你所选的凶蛮打击效应。', details: ['巨力猛击：目标被你直线推开15尺距离。随后你可以立刻向该目标移动至多等于你速度一半的距离，并且不会引发借机攻击。', '断筋猛击：直至你的下个回合开始，目标的速度降低15尺。一个生物同一时间只会受到最近一次断筋猛击的影响。'] }
      ],
      11: [
        { id: 'relentless-rage', name: '坚韧狂暴', nameEn: 'Relentless Rage', level: 11, description: '你狂暴的力量让你即使身受重伤也能持续战斗。', details: ['狂暴激活期间，如果你的生命值降至0且并未立即死亡，则你可以进行一次DC10的体质豁免检定。成功则作为替代，你的生命值将变为你野蛮人等级的两倍。', '第一次使用此特性后，每当你再次使用此特性时其体质豁免DC提升5。当你完成一次短休或长休后，其DC重置为10。'] }
      ],
      13: [
        { id: 'improved-brutal-strike', name: '强化凶蛮打击', nameEn: 'Improved Brutal Strike', level: 13, description: '你训练出了更多种残暴的攻击方式。将以下效应加入到你的凶蛮打击选项中：震撼猛击（目标进行的下一次豁免检定具有劣势，并且目标直至你的下个回合开始都不能发动借机攻击）、破势猛击（直至你的下个回合开始，下一次由其他生物对目标进行的攻击检定获得+5加值）。', details: [] }
      ],
      15: [
        { id: 'persistent-rage', name: '持久狂暴', nameEn: 'Persistent Rage', level: 15, description: '当你投掷先攻时，你可以重获所有已消耗的狂暴使用次数。你以此法重获狂暴使用次数后，直至你完成一次长休，你都不能再这么做。此外，你的狂暴是如此凶悍，现在你的狂暴总是能持续10分钟，无需你做任何事来延长一轮狂暴。你陷入昏迷状态（而不再是陷入失能状态）或穿戴重甲时，你的狂暴提前结束。', details: [] }
      ],
      17: [
        { id: 'improved-brutal-strike-2', name: '强化凶蛮打击', nameEn: 'Improved Brutal Strike', level: 17, description: '你凶蛮打击的额外伤害提升至2d10。此外，每当你使用凶蛮打击特性时，你可以同时使用两种不同的凶蛮打击效应。', details: [] }
      ],
      18: [
        { id: 'indomitable-might', name: '不屈勇武', nameEn: 'Indomitable Might', level: 18, description: '如果你进行的力量检定或力量豁免检定的总值低于你的力量属性值，你可以使用你的力量属性值替代检定总值。', details: [] }
      ],
      20: [
        { id: 'primal-champion', name: '原初斗士', nameEn: 'Primal Champion', level: 20, description: '你本身便是原初之力的象征。你的力量和体质各提升4，你这两项属性的上限变为25。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'wild-shape', name: '荒野变形', nameEn: 'Wild Shape', level: 2, description: '大自然的魔力使你得以化形为一只野兽。以一个附赠动作，你变形为一只你已经通过该特性学会的野兽形态。你能保持该形态长达你德鲁伊等级一半的小时数，或者直到你再次使用荒野变形、陷入失能或死亡。', details: ['你能够使用两次荒野变形。你在完成短休后重获一次已消耗的使用次数，当你完成一次长休时，你重获全部已消耗的使用次数。', '你一开始掌握了该特性的四种形态，从最大挑战等级1/4且没有飞行速度的野兽之中选取。'] },
        { id: 'wild-companion', name: '荒野伙伴', nameEn: 'Wild Companion', level: 2, description: '你可以召唤出一个动物外形的自然精魂来帮助自己。以一个魔法动作，你可以消耗一个法术位或一次荒野变形次数来施展寻获魔宠法术，无需任何材料成分。当你以这种方式施展这一法术时，获得的魔宠为妖精，并且它会在你完成一次长休时消失。', details: [] }
      ],
      5: [
        { id: 'wild-resurgence', name: '荒野复苏', nameEn: 'Wild Resurgence', level: 5, description: '每个你的回合内一次，如果你没有荒野变形使用次数，你可以消耗一个法术位（无需动作）让自己获得一次荒野变形次数。此外，你可以消耗一次荒野变形使用次数（无需动作）来令自己获得一个一环法术位，然后直至完成长休你都无法再如此做。', details: [] }
      ],
      7: [
        { id: 'elemental-fury', name: '元素之怒', nameEn: 'Elemental Fury', level: 7, description: '元素之力在你的身体里流淌。你获得以下一个你选择的特性：强力施法（你以任何德鲁伊戏法造成的伤害上都可以加上你的感知调整值），或原力蛮击（每个你的回合内一次，当你以一次武器攻击或荒野变形中野兽形态的攻击命中一名生物时，你可以对目标额外造成1d8寒冷、火焰、闪电或雷鸣伤害）。', details: [] }
      ],
      15: [
        { id: 'elemental-fury-improved', name: '元素神威', nameEn: 'Improved Elemental Fury', level: 15, description: '你选择的元素之怒特性变得愈发强大。强力施法：当你施展一道施法距离为10尺或更高的德鲁伊戏法时，法术施法距离提升300尺。原力蛮击：额外伤害提升至2d8。', details: [] }
      ],
      18: [
        { id: 'beast-spells', name: '兽形施法', nameEn: 'Beast Spells', level: 18, description: '你可以在荒野变形的野兽形态下施展德鲁伊法术。当你处于野兽形态时，你可以进行法术的言语和姿势成分；若法术需要材料成分，你仍需要提供。', details: [] }
      ],
      20: [
        { id: 'archdruid', name: '大德鲁伊', nameEn: 'Archdruid', level: 20, description: '你可以随意使用荒野变形，且你在野兽形态下可以施展德鲁伊法术。此外，你施展德鲁伊戏法时无需言语和姿势成分。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'monk-focus', name: '武僧武功', nameEn: "Monk's Focus", level: 2, description: '通过运转玄功和习练武艺，你便得以掌握自身非凡的内在能量。功力代表着你所能使用的这份能量，具体数据见武僧特性表中的功力一列。你可以消耗功力来增强或启动特定的武僧特性：疾风连击、坚强防御、疾步如风。每当你消耗1点功力时，直到你完成一次短休或长休前其将暂时不可以再被使用。', details: [] },
        { id: 'unarmored-movement', name: '无甲移动', nameEn: 'Unarmored Movement', level: 2, description: '若你未着装任何护甲且未持用盾牌，你的速度提升10尺。该加值将随着武僧职业等级的提升而增加，具体数值见武僧特性表。', details: [] },
        { id: 'uncanny-metabolism', name: '运转周天', nameEn: 'Uncanny Metabolism', level: 2, description: '当你投掷先攻时，你可以重获所有已消耗的功力。若你如此做，掷你的武艺骰，并且恢复其结果+你的武僧等级的生命值。使用此特性后，你必须完成一次长休才能再次使用。', details: [] }
      ],
      3: [
        { id: 'deflect-attacks', name: '拨挡攻击', nameEn: 'Deflect Attacks', level: 3, description: '当你被一次伤害中包含钝击、穿刺或挥砍伤害的攻击检定命中时，你可以执行反应减少此次攻击对你造成伤害的总值，减值等于1d10+你的敏捷调整值+你的武僧等级。若被拨挡攻击的伤害减少至0，则你可以消耗1点功力将此次攻击的部分伤害重新定向至另一生物。', details: [] }
      ],
      4: [
        { id: 'slow-fall', name: '轻身坠', nameEn: 'Slow Fall', level: 4, description: '当你要承受坠落伤害时，你可以使用反应将伤害减少等同于五倍武僧职业等级的数值。', details: [] }
      ],
      5: [
        { id: 'extra-attack', name: '额外攻击', nameEn: 'Extra Attack', level: 5, description: '当你在自己的回合执行攻击动作时，你可以发动两次攻击而非一次。', details: [] },
        { id: 'stunning-strike', name: '震慑拳', nameEn: 'Stunning Strike', level: 5, description: '每回合一次，当你使用徒手打击或武僧武器命中一个生物后，你可以消耗1点功力尝试发动震慑拳。目标必须进行一次体质豁免，豁免失败则陷入震慑状态，直至你的下个回合开始。', details: [] }
      ],
      6: [
        { id: 'empowered-strikes', name: '真力注拳', nameEn: 'Empowered Strikes', level: 6, description: '你的徒手打击与武僧武器攻击被视为魔法攻击，用于克服抗性与免疫。', details: [] }
      ],
      7: [
        { id: 'evasion', name: '反射闪避', nameEn: 'Evasion', level: 7, description: '当某效应要求你进行敏捷豁免以仅受到一半伤害时，豁免成功则不受伤害，失败则仅受一半伤害。', details: [] }
      ],
      9: [
        { id: 'acrobatic-movement', name: '飞檐走壁', nameEn: 'Acrobatic Movement', level: 9, description: '你可以在垂直表面或倒挂于天花板时移动，无需进行攀爬检定。你在此类移动时的移动距离计入你的速度。', details: [] }
      ],
      10: [
        { id: 'heightened-focus', name: '出神入化', nameEn: 'Heightened Focus', level: 10, description: '你可以消耗2点功力以恢复已消耗的功力，恢复量等于你的熟练加值。你完成一次长休后，才能再次使用此特性。', details: [] },
        { id: 'self-restoration', name: '返本还元', nameEn: 'Self-Restoration', level: 10, description: '你免疫中毒与疾病。', details: [] }
      ],
      13: [
        { id: 'deflect-energy', name: '拨挡能量', nameEn: 'Deflect Energy', level: 13, description: '当你受到造成强酸、寒冷、火焰、闪电或雷鸣伤害的效应影响时，你可以使用反应减少该伤害，减值等于2d10+你的敏捷调整值+你的武僧等级。若伤害被减至0，你可以消耗1点功力将部分伤害反射给60尺内你可见的一名生物。', details: [] }
      ],
      14: [
        { id: 'disciplined-survivor', name: '圆融自在', nameEn: 'Disciplined Survivor', level: 14, description: '当你投掷先攻且没有功力时，你重获1点功力。', details: [] }
      ],
      15: [
        { id: 'perfect-focus', name: '明镜止水', nameEn: 'Perfect Focus', level: 15, description: '当你进行专注检定时，若结果低于10，则视为10。', details: [] }
      ],
      18: [
        { id: 'superior-defense', name: '无懈可击', nameEn: 'Superior Defense', level: 18, description: '当你未着装护甲且未持用盾牌时，你可以将你的感知调整值（至少+1）加到你承受的豁免检定上。', details: [] }
      ],
      20: [
        { id: 'body-and-mind', name: '天人合一', nameEn: 'Body and Mind', level: 20, description: '当你完成一次短休时，你可以重获所有已消耗的功力；且若你至少有1点生命值，你可以在短休结束时恢复至满生命值。', details: [] }
      ]
    }
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
    ],
    featuresByLevel: {
      2: [
        { id: 'font-of-magic', name: '魔力泉涌', nameEn: 'Font of Magic', level: 2, description: '你获得法术点池，可用于创造法术位或施展超魔法。你拥有的法术点等于你的术士等级。完成长休后你重获所有已消耗的法术点。', details: [] },
        { id: 'metamagic', name: '超魔法', nameEn: 'Metamagic', level: 2, description: '你获得两种自选的超魔法选项。你可以在施展法术时消耗法术点以应用超魔法。你在第10级和第17级再各获得一种超魔法选项。', details: [] }
      ],
      5: [
        { id: 'sorcerous-restoration', name: '术法复苏', nameEn: 'Sorcerous Restoration', level: 5, description: '当你完成一次短休时，你可以重获已消耗的法术点，恢复量等于你的熟练加值。', details: [] }
      ],
      7: [
        { id: 'sorcery-incarnate', name: '术法化身', nameEn: 'Sorcery Incarnate', level: 7, description: '你可以用附赠动作消耗5点法术点，在1分钟内获得你的术士起源赋予的增益。你完成一次长休后，才能再次使用此特性。', details: [] }
      ],
      10: [
        { id: 'metamagic-2', name: '超魔法', nameEn: 'Metamagic', level: 10, description: '你再获得一种自选的超魔法选项。', details: [] }
      ],
      17: [
        { id: 'metamagic-3', name: '超魔法', nameEn: 'Metamagic', level: 17, description: '你再获得一种自选的超魔法选项。', details: [] }
      ],
      20: [
        { id: 'arcane-apotheosis', name: '奥术化神', nameEn: 'Arcane Apotheosis', level: 20, description: '你获得20点法术点。此外，当你完成一次短休时，你重获4点已消耗的法术点。', details: [] }
      ]
    }
  },
  {
    classId: 'warlock',
    className: '魔契师',
    level1Features: [
      {
        id: 'spellcasting',
        name: '施法',
        nameEn: 'Spellcasting',
        level: 1,
        description: '作为与至高存在缔结契约的施法者，你可以施展魔契师法术。',
        details: [
          '戏法：你知晓两个魔契师戏法',
          '法术位：魔契师特性表显示了你可用的法术位数量（短休恢复）',
          '准备法术：最初选择两道一环魔契师法术；之后按特性表“准备法术”列增加（升级时可替换）',
          '施法属性：你魔契师法术的施法属性是魅力',
          '施法法器：你可以使用奥术法器作为你魔契师法术的施法法器'
        ]
      },
      {
        id: 'pact-magic',
        name: '契约魔法',
        nameEn: 'Pact Magic',
        level: 1,
        description: '你的魔法来自与至高存在缔结的契约。',
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
    ],
    featuresByLevel: {
      2: [
        { id: 'magical-cunning', name: '秘法回流', nameEn: 'Magical Cunning', level: 2, description: '当你完成一次短休时，若你未在该短休中施展魔契师法术，则你重获一次已消耗的魔能祈唤使用次数。', details: [] }
      ],
      9: [
        { id: 'contact-patron', name: '联络宗主', nameEn: 'Contact Patron', level: 9, description: '你可以与你的宗主进行心灵联系。你获得与宗主交流的能力，具体效果由DM根据宗主类型决定。', details: [] }
      ],
      11: [
        { id: 'mystic-arcanum-6', name: '玄奥秘法（六环）', nameEn: 'Mystic Arcanum', level: 11, description: '你习得一道自选的六环魔契师法术。你可以无需法术位地施展该法术一次，完成长休后重获此能力。', details: [] }
      ],
      13: [
        { id: 'mystic-arcanum-7', name: '玄奥秘法（七环）', nameEn: 'Mystic Arcanum', level: 13, description: '你习得一道自选的七环魔契师法术。你可以无需法术位地施展该法术一次，完成长休后重获此能力。', details: [] }
      ],
      15: [
        { id: 'mystic-arcanum-8', name: '玄奥秘法（八环）', nameEn: 'Mystic Arcanum', level: 15, description: '你习得一道自选的八环魔契师法术。你可以无需法术位地施展该法术一次，完成长休后重获此能力。', details: [] }
      ],
      17: [
        { id: 'mystic-arcanum-9', name: '玄奥秘法（九环）', nameEn: 'Mystic Arcanum', level: 17, description: '你习得一道自选的九环魔契师法术。你可以无需法术位地施展该法术一次，完成长休后重获此能力。', details: [] }
      ],
      20: [
        { id: 'eldritch-master', name: '魔能掌控', nameEn: 'Eldritch Master', level: 20, description: '你可以用1分钟与你的宗主沟通，重获所有已消耗的契约法术位。你完成一次长休后，才能再次使用此特性。', details: [] }
      ]
    }
  }
];

export function getClassFeatures(classId: string): ClassFeaturesData | undefined {
  return CLASS_FEATURES.find(cf => cf.classId === classId);
}

export function getClassFeaturesByName(className: string): ClassFeaturesData | undefined {
  return CLASS_FEATURES.find(cf => cf.className === className);
}

/** 按职业（中文名或 classId）、等级、特性 id 获取特性详情（含 2 级及以上 featuresByLevel；1 级武器精通从 weaponMastery 取） */
export function getClassFeatureDetailByLevel(
  classNameOrId: string,
  level: number,
  featureId: string
): ClassFeatureDetail | undefined {
  const cf = CLASS_FEATURES.find(
    c => c.className === classNameOrId || c.classId === classNameOrId
  );
  if (!cf) return undefined;
  if (level === 1) {
    const fromLevel1 = cf.level1Features?.find(f => f.id === featureId);
    if (fromLevel1) return fromLevel1;
    if (featureId === 'weapon-mastery' && cf.weaponMastery) {
      const wm = cf.weaponMastery;
      return {
        id: 'weapon-mastery',
        name: wm.name,
        nameEn: wm.nameEn,
        level: 1,
        description: wm.description,
        details: wm.selectableWeapons?.length ? [`可选武器：${wm.selectableWeapons.join('、')}`] : [],
      };
    }
    return undefined;
  }
  const byLevel = cf.featuresByLevel?.[level];
  return byLevel?.find(f => f.id === featureId);
}

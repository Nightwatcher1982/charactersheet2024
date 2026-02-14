/**
 * 子职业特性详情（按等级）：用于升级页、角色卡特性页展示「子职特性」的具体名称与描述
 * 来源：docs/DND资料/ 各职业子职章节
 */

export interface SubclassFeatureDetail {
  name: string;
  nameEn: string;
  description: string;
  details?: string[];
}

/** classId -> subclassId -> level -> 详情（同一等级多条时为数组） */
const SUBCLASS_FEATURES: Record<string, Record<string, Record<number, SubclassFeatureDetail | SubclassFeatureDetail[]>>> = {
  barbarian: {
    berserker: {
      3: {
        name: '狂怒',
        nameEn: 'Frenzy',
        description: '狂暴激活期间，在你使用鲁莽攻击的回合中，你基于力量的攻击首次命中时，对目标造成额外伤害。',
        details: [
          '投掷等于你狂暴伤害加值数量的d6，将它们相加，即是你造成的额外伤害。额外伤害类型与此次攻击所使用的武器或徒手打击造成的伤害类型相同。',
        ],
      },
      6: {
        name: '无我狂暴',
        nameEn: 'Mindless Rage',
        description: '狂暴激活期间，你具有魅惑与恐慌状态的免疫。',
        details: ['当你进入狂暴时，若你已陷入魅惑或恐慌，你陷入的这些状态立即结束。'],
      },
      10: {
        name: '报偿',
        nameEn: 'Retaliation',
        description: '当一名位于你5尺内的生物对你造成伤害时，你能够以反应使用武器或徒手打击对其发动一次近战攻击。',
        details: [],
      },
      14: {
        name: '威慑之姿',
        nameEn: 'Intimidating Presence',
        description: '以一个附赠动作，你可以用你那令人魂消胆丧的面相，在原初之力的辅助下将恐惧打入他者内心。',
        details: [
          '当你如此做时，每个位于以你为源点的30尺光环区域内你所选择的生物必须进行一次感知豁免检定（DC等于8＋你的力量调整值＋你的熟练加值）。豁免失败则陷入恐慌状态，持续1分钟。陷入恐慌的生物在其每个回合结束时重复豁免，成功则终止其身上的该效应。',
          '此特性一经使用，直至完成长休你都无法再次使用。你也可以消耗一次狂暴使用次数（无需动作）来重置此特性的使用权。',
        ],
      },
    },
    beast: {
      3: [
        {
          name: '动物语者',
          nameEn: 'Animal Speaker',
          description: '你可以施展法术野兽知觉与动物交谈，仅限仪式施展。感知是你这些法术的施法属性。',
          details: [],
        },
        {
          name: '兽性狂暴',
          nameEn: 'Rage of the Wilds',
          description: '你的狂暴解放来自动物的原初之力。每当你激活狂暴时，你从下列选项中选择一项。',
          details: [
            '熊：狂暴激活期间，你具有除力场、心灵、暗蚀、光耀外所有伤害类型的抗性。',
            '鹰：当你激活狂暴时，作为你进入狂暴的附赠动作的一部分，你可以同时执行撤离与疾走动作。狂暴激活期间，你也能够以一个附赠动作同时执行这两个动作。',
            '狼：狂暴激活期间，你的盟友对位于你5尺内的敌人进行的攻击检定具有优势。',
          ],
        },
      ],
      6: {
        name: '兽之形貌',
        nameEn: 'Aspect of the Wilds',
        description: '你从下列选项中自选一项能力获得。当你完成一次长休时，你可以改变你的选择。',
        details: ['枭：你具有60尺黑暗视觉。如果你已经具有黑暗视觉，你的黑暗视觉范围增加60尺。', '豹：你具有等于你速度的攀爬速度。', '鲑：你具有等于你速度的游泳速度。'],
      },
      10: {
        name: '自然语者',
        nameEn: 'Nature Speaker',
        description: '你可以施展法术问道自然，仅限仪式施展。感知是你该法术的施法属性。',
        details: [],
      },
      14: {
        name: '兽力威能',
        nameEn: 'Power of the Wilds',
        description: '每当你激活狂暴时，你从下列选项中选择一项。',
        details: [
          '猎鹰：狂暴激活期间，只要你没有着装任何护甲，你就具有等于你速度的飞行速度。',
          '雄狮：狂暴激活期间，任何位于你5尺内的敌人不以你（或另一个选择该项能力的野蛮人）为目标的攻击检定具有劣势。',
          '角羊：狂暴激活期间，当你的近战攻击命中一名体型不超过大型的生物时，你可以令其陷入倒地状态。',
        ],
      },
    },
    'world-tree': {
      3: {
        name: '圣树活力',
        nameEn: 'Vitality of the Tree',
        description: '你的狂暴浸润着世界树的生命力。你获得以下增益：',
        details: [
          '活力之涌：当你激活狂暴时，你获得等于你野蛮人等级的临时生命值。',
          '赐命之源：你的狂暴激活期间，在你的每个回合开始时，你可以赋予位于你10尺内的另一名生物临时生命值。投掷等于你狂暴伤害加值数量的d6，将它们相加，即是该生物获得的临时生命值。当你的狂暴结束时，剩余的临时生命值将会消失。',
        ],
      },
      6: {
        name: '灵树枝杈',
        nameEn: 'Branches of the Tree',
        description: '你的狂暴激活期间，每当你可见的位于你30尺内的生物的回合开始时，你能够以反应在其周围召唤世界树的灵体枝条。',
        details: [
          '目标必须成功通过一次力量豁免（DC等于8+你的力量调整值+你的熟练加值），否则将被传送到位于你5尺内的你可见的未占据空间内或距离你最近的你可见的未占据空间内。目标被你传送后，你可以令其速度降为0，持续至当前回合结束。',
        ],
      },
      10: {
        name: '根击千钧',
        nameEn: 'Battering Roots',
        description: '世界树的卷须将你的武器延长。你的回合内，你持用的任何具有重型或多用词条的近战武器的触及增加10尺。',
        details: ['当你在你的回合内以该武器命中时，除了激活这把武器本身具有的其他精通词条外，你还可以激活推离或失衡精通词条。'],
      },
      14: {
        name: '世界树之奇旅',
        nameEn: 'Travel along the Tree',
        description: '当你激活狂暴时，你可以传送至多60尺的距离，到一处你可见的未占据空间中。在你的狂暴激活期间，你也能够以一个附赠动作来进行传送。',
        details: [
          '此外，每次狂暴期间仅一次，你可以使传送的距离提升至150尺，并可以选择带上至多6个位于你10尺内的自愿生物同你一起传送。每个其他生物都将被传送至位于你目的地10尺内的你选择的未占据空间中。',
        ],
      },
    },
    zealot: {
      3: [
        {
          name: '神性之怒',
          nameEn: 'Divine Fury',
          description: '你可以引导神性的怒火，将其注入打击之中。',
          details: [
            '你的狂暴激活期间，你的每个回合中你首次以武器或徒手打击命中的生物将受到等于1d6+你野蛮人等级的一半（向下取整）的额外伤害。额外伤害的伤害类型为光耀或暗蚀，在每次造成伤害时由你选择伤害类型。',
          ],
        },
        {
          name: '神之勇者',
          nameEn: 'Warrior of the Gods',
          description: '某个神圣实体对你施以援手以确保你总能继续战斗。你获得一个有着4枚d12的治疗池，你可以用其中的骰子治愈自身。',
          details: [
            '以一个附赠动作，你可以消耗治疗池中任意枚骰子来恢复你的生命值。投掷所有你消耗的骰子，将它们相加，即是你以此恢复的生命值。当你完成一次长休时，你的治疗池重获所有已消耗的骰子。治疗池中骰子的最大数量将会在你到达特定野蛮人等级时增加，分别为6级时增加至5枚，12级时增加至6枚，17级时增加至7枚。',
          ],
        },
      ],
      6: {
        name: '专心炽志',
        nameEn: 'Fanatical Focus',
        description: '每次狂暴期间仅一次，若你失败于某次豁免检定，你可以重骰这次检定并在检定中获得等于你的狂暴伤害加值的加值，你必须使用重骰后的结果。',
        details: [],
      },
      10: {
        name: '狂热威仪',
        nameEn: 'Zealous Presence',
        description: '以一个附赠动作，你以满腔神圣能量发出战吼。选择至多十名位于你60尺内的生物，直至你的下个回合开始，他们的攻击检定和豁免检定具有优势。',
        details: ['此特性一经使用，直至完成长休你都无法再次使用。你也可以消耗一次狂暴使用次数（无需动作）来重置此特性的使用权。'],
      },
      14: {
        name: '神之狂暴',
        nameEn: 'Rage of the Gods',
        description: '当你激活狂暴时，你可以呈现出圣斗士姿态。圣斗士姿态持续1分钟，且在你生命值降至0时提前结束。此特性一经使用，直至完成长休你都无法再次使用。',
        details: [
          '处于圣斗士姿态期间，你获得以下增益：飞翔（你具有等于你速度的飞行速度，并且可以悬浮）；抗性（你具有对暗蚀、心灵和光耀伤害的抗性）；回春（当位于你30尺内的一名生物的生命值将要降至0时，你能够以反应消耗一次狂暴使用次数，令目标的生命值变为等于你野蛮人等级的值）。',
        ],
      },
    },
  },
  fighter: {
    'battle-master': {
      3: [
        {
          name: '卓越战技',
          nameEn: 'Combat Superiority',
          description: '你的战斗技巧在战场上接受了磨砺，你习得战技并获得一种名为卓越骰的特殊骰。',
          details: [
            '战技：你从战技项中习得三种自选战技。许多战技能够以某种方式增幅你的攻击，而你在每次攻击时只能应用一次战技。你在第7、第10和第15级时均习得两种自选的新战技；习得新战技时，还可以额外替换一个已习得的战技。',
            '卓越骰：你拥有四个d8卓越骰，一经使用即消耗，完成短休或长休后恢复。卓越骰在第7级（共5枚）和第15级（共6枚）时各增加一枚。',
            '豁免：若战技需要进行豁免检定，则豁免DC等于8+你的力量或敏捷调整值（由你选择）+你的熟练加值。',
          ],
        },
        {
          name: '战争学者',
          nameEn: 'Student of War',
          description: '你选择一种工匠工具并获得其熟练。此外，你选择一项战士1级可用的技能，并获得该技能的熟练。',
          details: [],
        },
      ],
      7: { name: '料敌机先', nameEn: 'Know Your Enemy', description: '以一个附赠动作，你可以获知一名位于你30尺内你可见的生物的长处和短处（是否具有抗性、免疫或易伤及具体内容）。此特性一经使用，直至完成长休你都无法再次使用；你也可以消耗1粒卓越骰（无需动作）重置。', details: [] },
      10: { name: '精通战技', nameEn: 'Improved Combat Superiority', description: '你的卓越骰变为d10。', details: [] },
      15: { name: '坚韧', nameEn: 'Relentless', description: '每回合一次，当你使用一项战技时，你可以不消耗卓越骰，而是掷d8并使用结果作为代替。', details: [] },
      18: { name: '究极战技', nameEn: 'Ultimate Combat Superiority', description: '你的卓越骰变为d12。', details: [] },
    },
    champion: {
      3: { name: '卓越运动', nameEn: 'Remarkable Athlete', description: '勇士专注于体能与战斗的完美结合。你可以在力量、敏捷或体质检定中，将熟练加值的一半（向下取整）加入未使用熟练的检定；跳远时 standing 距离增加熟练加值尺数。', details: ['详见《2024核心规则》战士·勇士。'] },
      7: { name: '额外战斗风格', nameEn: 'Additional Fighting Style', description: '你获得一项你选择的战斗风格专长。', details: [] },
      10: { name: '不屈斗士', nameEn: 'Incredible Athlete', description: '你的卓越运动加值提升，且你具有力竭的抗性。', details: [] },
      15: { name: '卓越幸存', nameEn: 'Survivor', description: '你在回合开始时若生命值低于一半，可恢复少量生命值。', details: [] },
      18: { name: '卓越运动（强化）', nameEn: 'Remarkable Athlete (Improved)', description: '勇士的体能达到巅峰。', details: [] },
    },
    'eldritch-knight': {
      3: [
        {
          name: '施法',
          nameEn: 'Spellcasting',
          description: '你学会了如何施展法师法术。你知晓两道法师戏法，准备三道一环及以上法师法术；施法属性为智力。',
          details: [
            '戏法：你知晓两道你选择的法师戏法。每获得一个战士等级可替换其一。10级时另选一道法师戏法。',
            '法术位与准备法术：见奥法骑士施法表。完成长休时恢复所有已消耗的法术位。',
          ],
        },
        {
          name: '战争联结',
          nameEn: 'War Bond',
          description: '你习得与武器建立魔法联结的仪式（持续一小时，可于短休进行）。联结后，使用联结武器时不会被缴械；若武器与你同一位面，可用附赠动作使其传送到你手中。至多两把联结武器。',
          details: [],
        },
      ],
      7: { name: '战争魔法', nameEn: 'War Magic', description: '当你在自己回合执行攻击动作时，你可以将该动作中的一次攻击替换为施展一道施法时间为动作的你的法师戏法。', details: [] },
      10: { name: '奥法打击', nameEn: 'Eldritch Strike', description: '当你使用武器命中一个生物后，直到你的下个回合结束为止，该生物在对抗你法术的下一次豁免检定中具有劣势。', details: [] },
      15: { name: '奥能冲锋', nameEn: 'Arcane Charge', description: '你可以在使用动作如潮时传送至多30尺至一个你能看到的未被占据的空间。可在使用动作如潮提供的额外动作之前或之后进行传送。', details: [] },
      18: { name: '精通战争魔法', nameEn: 'Improved War Magic', description: '当你在自己回合执行攻击动作时，你可以将该动作中的两次攻击替换为施展一道施法时间为动作、环阶为一环或二环的你的法师法术。', details: [] },
    },
    'psi-warrior': {
      3: {
        name: '灵能力量',
        nameEn: 'Psionic Power',
        description: '你内心拥有一个灵能力量的源泉。这股能量表现为灵能骰，它是你从此子职中获得的可消耗能力。灵能武士灵能骰表展示了你在达到特定战士等级后的灵能骰大小与数量。此子职中所有需要使用灵能骰的特性只能使用你从该子职获得的灵能骰。你在使用某些能力时需要消耗灵能骰，如异能描述中所述；如果某个异能在你的灵能骰全部消耗完后还需要你使用一个灵能骰，你就不能使用该异能。你可以在完成短休时重获一枚已消耗的灵能骰，完成长休时重获所有已消耗的灵能骰。',
        details: [
          '灵能武士灵能骰：3级 D6 数量4 | 5级 D8 数量6 | 9级 D8 数量8 | 11级 D10 数量8 | 13级 D10 数量10 | 17级 D12 数量12。',
          '庇护力场 Protective Field：当你或者另一个位于你30尺内的你可见的生物受到伤害时，你可以执行一个反应来消耗一枚灵能骰，对其降低等同于灵能骰骰出的数值加你的智力调整值的伤害（最少1点），如同你创造了一面瞬间的念力盾牌。',
          '灵能打击 Psionic Strike：你可以用灵能驱动你的武器。每个你的回合一次，当你用武器命中并对位于你30尺范围内的目标造成伤害时，你可以立即消耗一枚灵能骰，对目标造成等同于灵能骰骰出的数值加你的智力调整值的力场伤害。',
          '念力控物 Telekinetic Movement：你可以用意念移动一个物体或生物。以一个魔法动作，你选中一个除你以外的自愿生物或一个至多大型的未固定物件。如果你可以看见目标且目标在你30尺范围内，你就可以将其移动至多30尺至另一个对你可见的未占据空间内。另外，如果目标是一个微型物件，你可以自由给出或收回手中。此异能一经使用，直至完成短休或长休你都无法再次使用。你也可以消耗一枚灵能骰（无需动作）重置此异能的使用权。',
        ],
      },
      7: { name: '念力精通', nameEn: 'Telekinetic Adept', description: '灵力跃动：附赠动作获得两倍速度的飞行至回合结束；念力突刺：灵能打击造成伤害时可迫使目标力量豁免，失败则倒地或被水平移动至多10尺。', details: [] },
      10: { name: '意念守护', nameEn: 'Guarded Mind', description: '你获得心灵伤害的抗性。若你在回合开始时处于魅惑或恐慌，可消耗一枚灵能骰（无需动作）结束自己身上全部造成这些状态的效应。', details: [] },
      15: { name: '力场壁垒', nameEn: 'Bulwark of Force', description: '以一个附赠动作，选择包括你在内、数量等于你智力调整值（最少1）的30尺内生物，他们在1分钟内视为处于半身掩护，直至你陷入失能时提前结束。可消耗灵能骰重置。', details: [] },
      18: { name: '念力宗师', nameEn: 'Telekinetic Master', description: '你始终准备着心灵遥控法术，可无需成分和法术位施展，施法属性为智力；维持专注的每回合可以附赠动作用武器发动一次攻击。消耗灵能骰可重置。', details: [] },
    },
  },
  bard: {
    dance: {
      3: { name: '炫目舞步', nameEn: 'Dazzling Footwork', description: '未着装护甲且未持用盾牌期间，你获得以下增益：大舞蹈家（有关舞蹈的魅力表演检定具有优势）、无甲防御（AC=10+敏捷调整值+魅力调整值）、灵巧打击与诗人痛击（消耗诗人激励时可发动徒手打击，造成诗人激励骰+敏捷调整值的钝击伤害）。', details: [] },
      6: [
        { name: '鼓舞之移', nameEn: 'Inspiring Movement', description: '当一名你可见的敌人位于你5尺内结束其回合时，你可以以反应消耗一次诗人激励，移动至多等于你速度一半的距离；此时30尺内一名盟友也可用反应移动至多其速度一半，不引发借机。', details: [] },
        { name: '协同舞步', nameEn: 'Tandem Footwork', description: '当你投掷先攻时，若未陷入失能，可以消耗一次诗人激励并掷诗人激励骰，令你与30尺内每个能听见或看见你的盟友的先攻检定获得等于该骰值的加值。', details: [] },
      ],
      14: { name: '引导闪避', nameEn: 'Leading Evasion', description: '当你受到允许敏捷豁免只承受一半伤害的效应影响时，豁免成功则不受伤害，豁免失败只承受一半伤害；5尺内其他需进行同次敏捷豁免的生物也可享受此增益。失能时无法使用。', details: [] },
    },
    glamour: {
      3: [
        { name: '惑心魔法', nameEn: 'Beguiling Magic', description: '你始终准备着魅惑类人和镜影术。此外，在你使用法术位施展一道惑控或幻术学派的法术后，可以立即使60尺内一名可见生物进行感知豁免对抗你的施法DC，失败则陷入魅惑或恐慌（由你选择）1分钟，每回合结束可重骰。可消耗诗人激励重置。', details: [] },
        { name: '灵感织衣', nameEn: 'Mantle of Inspiration', description: '以一个附赠动作，消耗一次诗人激励并掷诗人激励骰，选择60尺内至多等于你魅力调整值（至少1）的生物，每名获得两倍该骰值的临时生命值，并可用反应移动至多其速度的距离且不引发借机。', details: [] },
      ],
      6: { name: '威仪作锦', nameEn: 'Mantle of Majesty', description: '你始终准备着命令术。附赠动作可无需法术位施展命令术并呈现超凡容貌1分钟；因你而魅惑的生物对抗你以此施展的命令术时豁免自动失败。可消耗三环及以上法术位重置。', details: [] },
      14: { name: '不破威仪', nameEn: 'Unbreakable Majesty', description: '附赠动作呈现庄严姿态1分钟（失能时结束）。此期间，攻击检定首次命中你的攻击者必须通过对抗你施法DC的魅力豁免，否则攻击畏缩失手。使用后直至短休或长休才能再次使用。', details: [] },
    },
    valor: {
      3: [
        { name: '战斗激励', nameEn: 'Combat Inspiration', description: '拥有你诗人激励骰的生物可从下列选项中选择一种使用：防御（被攻击命中时以反应掷诗人激励骰，将骰值加到AC，可能使攻击失手）；进攻（攻击命中后立即掷诗人激励骰，将骰值加到此次对该目标的伤害）。', details: [] },
        { name: '战争训练', nameEn: 'Martial Training', description: '你获得军用武器熟练以及中甲和盾牌的护甲受训。此外，你施展吟游诗人法术时可以使用简易或军用武器作为法器。', details: [] },
      ],
      6: { name: '额外攻击', nameEn: 'Extra Attack', description: '当你在自己的回合执行攻击动作时，你可以发动两次攻击而非一次。你也可以将其中一次攻击替换为施展一道施法时间为一动作的戏法。', details: [] },
      14: { name: '战斗魔法', nameEn: 'Battle Magic', description: '在你施展一道施法时间为一动作的法术后，你能够以一个附赠动作使用一把武器发动一次攻击。', details: [] },
    },
    lore: {
      3: [
        {
          name: '附赠熟练',
          nameEn: 'Bonus Proficiencies',
          description: '你获得三项由你选择的技能的熟练。',
          details: [],
        },
        {
          name: '语出惊人',
          nameEn: 'Cutting Words',
          description: '你学会了如何运用你的妙语连珠来超自然地打断敌人、分散注意亦或是削弱他人的自信心和行动力。',
          details: [
            '当一名你可见的位于你60尺内的生物进行伤害掷骰、成功于一次属性检定或攻击检定时，你能够以反应消耗一次诗人激励使用次数，并掷诗人激励骰，然后从该生物的掷骰结果中减去诗人骰的骰值，这将降低其造成的伤害或可能使这次检定的成功变为失败。',
          ],
        },
      ],
      6: {
        name: '魔法探秘',
        nameEn: 'Magical Discoveries',
        description: '你习得两道自选法术。这些法术可以从牧师、德鲁伊或法师的法术列表中单独或组合选择。你选择的法术必须是戏法或是你拥有对应环阶法术位的法术。你始终准备着你选择的这些法术。',
        details: ['每当你获得一个吟游诗人等级时，你可以将其中一个法术替换为另一个满足上述要求的法术。'],
      },
      14: {
        name: '超凡技艺',
        nameEn: 'Peerless Skill',
        description: '当你进行一次属性检定或攻击检定并在检定中失败时，你可以消耗一次诗人激励使用次数，投掷诗人激励骰，并将掷骰结果加到d20中，这可能使这次检定的失败变为成功。',
        details: ['若检定仍然失败，将不会被消耗诗人激励次数。'],
      },
    },
  },
  cleric: {
    life: {
      3: [
        { name: '生命门徒', nameEn: 'Disciple of Life', description: '你消耗法术位施展法术的回合中，当该法术恢复生物的生命值时，额外恢复2+消耗法术位环阶生命值。', details: [] },
        { name: '生命领域法术', nameEn: 'Life Domain Spells', description: '你与此神圣领域的链接使你始终准备着特定的法术：3级援助术、祝福术、疗伤术、次等复原术；5级群体治愈真言、回生术；7级生命灵光、防死结界；9级高等复原术、群体疗伤术。', details: [] },
        { name: '维持生命', nameEn: 'Preserve Life', description: '以一个魔法动作，你展示圣徽并消耗一次引导神力来引导治疗能量恢复等于你牧师等级五倍的生命值。你选择身边30尺内处于浴血状态的生物作为此特性的目标（可以包括你），再为其分配从中获得的治疗能量。该特性至多将目标的生命值恢复至其上限的一半。', details: [] },
      ],
      6: { name: '神祝医者', nameEn: 'Blessed Healer', description: '你为其他人施展的治疗性法术也能治疗你自己。如果你用法术位施展的一道法术为除了你自己以外的一名或更多生物恢复了生命值，此次施法后你也将立刻恢复2+该法术位环阶的生命值。', details: [] },
      17: { name: '极效治疗', nameEn: 'Supreme Healing', description: '当你需要用一道法术或引导神力掷一枚或多枚骰子，以决定为一个生物恢复的生命数值时，你无需掷骰，直接为每个骰子取最高值。', details: [] },
    },
    light: {
      3: [
        { name: '光明领域法术', nameEn: 'Light Domain Spells', description: '你始终准备着：3级燃烧之手、妖火、灼热射线、识破隐形；5级昼明术、火球术；7级秘法眼、火墙术；9级焰击术、探知术。', details: [] },
        { name: '黎明曙光', nameEn: 'Radiance of the Dawn', description: '以一个魔法动作，你展现圣徽，消耗一次引导神力次数来释放出一阵闪光，覆盖一处以你为源点的30尺光环区域。该区域内的任何魔法黑暗都将被解除。此外，区域内你选择的所有生物都必须进行一次体质豁免。豁免失败者将受2d10＋你牧师等级的光耀伤害，豁免成功则伤害减半。', details: [] },
        { name: '守御之光', nameEn: 'Warding Flare', description: '当位于你30尺内一名你可见的生物进行攻击检定时，你能够以反应在该次攻击命中或失手前在该生物面前发出闪耀之光，迫使其该次攻击检定具有劣势。使用次数等于你的感知调整值（最少1次），完成一次长休时重获所有已消耗的使用次数。', details: [] },
      ],
      6: { name: '精通守御之光', nameEn: 'Improved Warding Flare', description: '你在完成一次短休或长休后重新获得所有守御之光的使用次数。此外，每当你使用守御之光时，你可以给予触发此反应的该次攻击所指定那个目标2d6+你感知调整值点临时生命值。', details: [] },
      17: { name: '光冕', nameEn: 'Corona of Light', description: '以一个魔法动作，你可以让自己散发出日光组成的灵光，持续一分钟或直至你将其解除。你散发出半径60尺的明亮光照以及额外30尺的微光光照。身处该明亮光照范围中的敌人，在抵抗你的黎明曙光特性以及任何造成火焰或光耀伤害的法术而进行豁免检定时具有劣势。使用次数等于你的感知调整值（最低为1），完成一次长休时重获所有已消耗的使用次数。', details: [] },
    },
    trickery: {
      3: [
        { name: '诡术祝福', nameEn: 'Blessing of the Trickster', description: '以一个魔法动作，你可以选择自己或30尺内一个自愿生物，所选生物在进行敏捷（隐匿）检定时具有优势。此祝福持续至你完成一次长休或直至你再次使用此特性。', details: [] },
        { name: '召现分身', nameEn: 'Invoke Duplicity', description: '以一个附赠动作，你可以消耗一次引导神力次数来创造一个自己的完美视觉幻象并出现在你身边30尺内一个你能看见且未占据空间。幻象持续1分钟。当幻象存在时，你可以如同在幻象所在位置施展法术；当你和幻象都在同一生物5尺内且该生物可以看见幻象时，你对其进行的攻击检定具有优势；以附赠动作可移动幻象至多30尺到120尺内可见的未占据空间。', details: [] },
        { name: '诡术领域法术', nameEn: 'Trickery Domain Spells', description: '你始终准备着：3级魅惑类人、易容术、隐形术、行动无踪；5级催眠图纹、回避侦测；7级困惑术、任意门；9级支配类人、篡改记忆。', details: [] },
      ],
      6: { name: '诡诈换位', nameEn: "Trickster's Transposition", description: '每当你使用附赠动作创造或移动你来自召现分身特性的幻象时，你都可以通过传送与幻象交换位置。', details: [] },
      17: { name: '精通分身', nameEn: 'Improved Duplicity', description: '共享干扰：当你和你的盟友对位于幻象5尺内的生物进行攻击检定时具有优势。治愈幻象：当幻象消失时，你或你选择的5尺内的一名生物恢复等同于你牧师等级的生命值。', details: [] },
    },
    war: {
      3: [
        { name: '导引打击', nameEn: 'Guided Strike', description: '当你或者距离你30尺内的一个生物在一次攻击检定中失手时，你可以消耗一次引导神力次数来让这次攻击检定获得+10加值，这可能导致该次攻击命中。当你使用此特性让另一个生物的攻击检定获得此增益时，你必须使用你的反应。', details: [] },
        { name: '战争领域法术', nameEn: 'War Domain Spells', description: '你始终准备着：3级光导箭、虔诚护盾、魔化武器、灵体武器；5级十字军披风、灵体卫士；7级火焰护盾、行动自如；9级定身怪物、钢风斩。', details: [] },
        { name: '战争祭司', nameEn: 'War Priest', description: '作为一个附赠动作，你可以发动一次武器攻击或者徒手打击。你可以使用该附赠动作的次数等于你的感知调整值（最低为1），你在完成一次长休或短休后重新获得所有的使用次数。', details: [] },
      ],
      6: { name: '战神祝福', nameEn: "War God's Blessing", description: '你可以使用你的引导神力来施展虔诚护盾或灵体武器而无需消耗法术位。当你以这种方式施展其中任何一道法术时，该法术都不需要专注，且其持续时间变为1分钟，但会在你再次施展该法术、陷入失能状态或是死亡时提前结束。', details: [] },
      17: { name: '战争化身', nameEn: 'Avatar of Battle', description: '你获得对钝击、穿刺、挥砍伤害的抗性。', details: [] },
    },
  },
  druid: {
    land: {
      3: [
        { name: '大地结社法术', nameEn: 'Circle of the Land Spells', description: '完成长休时选择一种地形（荒漠、极地、温带或热带），你始终准备着该地形对应的结社法术。3级起各地形有对应戏法与二环法术；5/7/9级获得更高环法术。', details: [] },
        { name: '大地之援', nameEn: "Land's Aid", description: '以一个魔法动作，消耗一次荒野变形次数，选择60尺内一点，10尺半径球状区域内你选择的生物进行体质豁免，失败受2d6暗蚀伤害，成功半伤；区域内你选择的一名生物恢复2d6生命值。10级3d6，14级4d6。', details: [] },
      ],
      6: { name: '自然恢复', nameEn: 'Natural Recovery', description: '你可以不消耗法术位施展一道你以结社法术准备的一环及以上法术，完成长休后重获。短休结束时你可恢复消耗的法术位，环阶总和等于德鲁伊等级一半（向上取整），且不高于五环。', details: [] },
      10: { name: '自然守御', nameEn: "Nature's Ward", description: '你免疫中毒状态，并具有与所选地形相关的伤害类型抗性：荒漠-火焰，极地-寒冷，温带-闪电，热带-毒素。', details: [] },
      14: { name: '自然庇护', nameEn: "Nature's Sanctuary", description: '以一个魔法动作，消耗一次荒野变形次数，在120尺内地面制造15尺立方灵体丛林与藤蔓，持续1分钟。区域内你和盟友获得半身掩护，盟友获得你自然守御的抗性。附赠动作可将立方在120尺内移动最多60尺。', details: [] },
    },
    moon: {
      3: [
        { name: '结社形态', nameEn: 'Circle Forms', description: '荒野变形形态最大挑战等级等于德鲁伊等级三分之一（向下取整）；AC取13+感知调整值与野兽AC较高者；变形时获得德鲁伊等级三倍的临时生命值。', details: [] },
        { name: '月亮结社法术', nameEn: 'Circle of the Moon Spells', description: '你始终准备着：3级点点星芒、疗伤术、月华之光；5级咒唤兽群；7级月光涌泉；9级群体疗伤术。你可在荒野变形下施展这些法术。', details: [] },
      ],
      6: { name: '进阶结社形态', nameEn: 'Improved Circle Forms', description: '荒野变形期间：月耀辉光——每次攻击可造成普通或光耀伤害；强化韧性——将感知调整值加到体质豁免结果中。', details: [] },
      10: { name: '月光飞步', nameEn: 'Moonlight Step', description: '附赠动作传送至多30尺到可见未占据空间，本回合下一次攻击具有优势。使用次数等于感知调整值（至少1），长休恢复。也可消耗二环或更高法术位恢复一次（无需动作）。', details: [] },
      14: { name: '月辉形态', nameEn: 'Lunar Form', description: '月耀炽光：每回合一次，荒野变形下攻击命中可额外造成2d10光耀伤害。月辉同行：使用月光飞步时还可传送另一自愿生物（10尺内），将其传送到你出现点10尺内可见未占据空间。', details: [] },
    },
    sea: {
      3: [
        { name: '海洋结社法术', nameEn: 'Circle of the Sea Spells', description: '你始终准备着：3级冷冻射线、云雾术、雷鸣波、造风术、粉碎音波；5级闪电束、水下呼吸；7级操控水体、冰风暴；9级咒唤元素、定身怪物。', details: [] },
        { name: '瀚海之怒', nameEn: 'Wrath of the Sea', description: '附赠动作消耗一次荒野变形次数，在自身周围显现5尺海浪光环，持续10分钟。显现时及之后回合以附赠动作可选择光环内一生物，其需通过体质豁免，否则受寒冷伤害（投感知调整值数量的d6），大型及以下还会被推离至多15尺。', details: [] },
      ],
      6: { name: '水生亲和', nameEn: 'Aquatic Affinity', description: '瀚海之怒光环范围提升至10尺。你获得等于你速度的游泳速度。', details: [] },
      10: { name: '风暴降生', nameEn: 'Stormborn', description: '瀚海之怒激活时：飞行——获得等于速度的飞行速度；抗性——对寒冷、闪电和雷鸣伤害具有抗性。', details: [] },
      14: { name: '大洋慨赠', nameEn: 'Oceanic Gift', description: '使用瀚海之怒时，可让60尺内一自愿生物（非自己）身上显现光环，其获得光环所有增益并使用你的法术豁免DC和感知调整值。消耗两次荒野变形次数可同时在自己和另一生物身上显现光环。', details: [] },
    },
    stars: {
      3: [
        { name: '星图', nameEn: 'Star Map', description: '你创造一张星图作为德鲁伊法器。持握时视作始终准备神导术与光导箭，且可不消耗法术位施展光导箭，次数等于感知调整值（至少1），长休恢复。丢失可举行1小时仪式创造替代品。', details: [] },
        { name: '星耀形态', nameEn: 'Starry Form', description: '附赠动作消耗一次荒野变形次数呈现星耀形态（非野兽），持续10分钟。身体明亮、散发10尺明亮+10尺微光。选择星座：射手座-60尺光箭攻击1d8+感知光耀；圣杯座-施法恢复生命时你或30尺内一生物额外恢复1d8+感知；巨龙座-智力/感知检定或专注体质豁免时d20≤9视为10。', details: [] },
      ],
      6: { name: '宇宙预兆', nameEn: 'Cosmic Omen', description: '每完成长休掷骰，至下次长休获得基于奇偶的反应：吉兆（偶数）——30尺内生物进行d20检定时可用反应投d6加至结果；凶兆（奇数）——从结果中减去d6。使用次数等于感知调整值（至少1），长休恢复。', details: [] },
      10: { name: '闪烁星座', nameEn: 'Twinkling Constellations', description: '星耀形态增强：射手与圣杯的1d8变为2d8；巨龙座激活时获得20尺飞行并悬浮。每回合开始时若处于星耀形态，可更改当前闪耀的星座。', details: [] },
      14: { name: '灿若繁星', nameEn: 'Full of Stars', description: '处于星耀形态期间，身体部分无实质化，获得钝击、穿刺与挥砍伤害的抗性。', details: [] },
    },
  },
  monk: {
    mercy: {
      3: [
        { name: '夺命之手', nameEn: 'Hand of Harm', description: '每回合一次，徒手打击命中并造成伤害时，可消耗1点功力额外造成武艺骰+感知调整值的暗蚀伤害。', details: [] },
        { name: '予命之手', nameEn: 'Hand of Healing', description: '魔法动作消耗1点功力接触一生物，恢复武艺骰+感知调整值生命值。疾风连击时可将一次徒手打击替换为使用此特性且不消耗功力。', details: [] },
        { name: '操命本事', nameEn: 'Implements of Mercy', description: '你获得洞悉和医药的熟练，以及草药工具的熟练。', details: [] },
      ],
      6: { name: '生死之触', nameEn: "Physician's Touch", description: '夺命之手：使用时可另使目标中毒至你下回合结束。予命之手：使用时还可结束目标身上下列状态之一：目盲、耳聋、麻痹、中毒或震慑。', details: [] },
      11: { name: '生杀予夺', nameEn: 'Flurry of Healing and Harm', description: '疾风连击时可将每次徒手打击都替换为予命之手且不消耗功力；疾风连击造成伤害时可为该次打击使用夺命之手且不消耗功力（每回合仍仅能使用一次夺命之手）。这些增益总使用次数等于感知调整值（至少1），长休恢复。', details: [] },
      17: { name: '命极之手', nameEn: 'Hand of Ultimate Mercy', description: '魔法动作消耗5点功力触碰死亡不超过24小时的尸体，该生物以4d10+感知调整值生命值复活，并移除目盲、耳聋、麻痹、中毒、震慑。一经使用，直至长休无法再次使用。', details: [] },
    },
    shadow: {
      3: [
        { name: '暗影技艺', nameEn: 'Shadow Arts', description: '黑暗术：消耗1点功力施展黑暗术且无成分，你可看穿该黑暗，每回合开始可将区域移至60尺内。黑暗视觉60尺（已有则+60尺）。幻影术：知晓戏法次级幻象，施法属性为感知。', details: [] },
      ],
      6: { name: '暗影步', nameEn: 'Shadow Step', description: '当你完全处于微光或黑暗中时，附赠动作传送到60尺内另一处可见未占据空间（目标也须在微光或黑暗中）。接下来本回合内下一次近战攻击具有优势。', details: [] },
      11: { name: '无影步', nameEn: 'Improved Shadow Step', description: '使用暗影步时可消耗1点功力，移除对微光/黑暗环境的要求；作为该附赠动作的一部分，传送后可立即进行一次徒手打击。', details: [] },
      17: { name: '幽影斗篷', nameEn: 'Cloak of Shadows', description: '完全处于微光或黑暗时，魔法动作消耗3点功力令周身环绕幽影，持续1分钟或直至失能或在明亮光照中结束回合。增益：隐形；可如困难地形般通过已占据空间（回合结束仍在占据空间则被排出）；疾风连击不再消耗功力。', details: [] },
    },
    'four-elements': {
      3: [
        { name: '元素同调', nameEn: 'Elemental Attunement', description: '回合开始时消耗1点功力让元素能量浸润己身，持续10分钟或直至失能。持续期间：触及——徒手打击触及+10尺；元素注拳——徒手可造成强酸/寒冷/火焰/闪电/雷鸣伤害，并可迫使目标力量豁免，失败可拉近或推离10尺。', details: [] },
        { name: '掌控元素', nameEn: 'Manipulate Elements', description: '你习得戏法四象法门，施法属性为感知。', details: [] },
      ],
      6: { name: '元素爆破拳', nameEn: 'Elemental Burst', description: '魔法动作消耗2点功力，在以120尺内一点为中心、半径20尺球状区域产生能量爆发，选择强酸/寒冷/火焰/闪电/雷鸣。区域内生物敏捷豁免，失败受3个武艺骰伤害，成功半伤。', details: [] },
      11: { name: '四象遁术', nameEn: 'Stride of the Elements', description: '元素同调激活期间，你获得等于速度的飞行速度与游泳速度。', details: [] },
      17: { name: '四象神通', nameEn: 'Elemental Epitome', description: '元素同调激活期间：伤害抗性——选择一种元素伤害类型获得抗性，每回合开始可改选；破灭奔行——疾步如风时速度+20尺，进入生物5尺内可对其造成武艺骰伤害（类型任选），每生物每回合仅一次；真力注拳——每回合一次徒手命中可额外造成武艺骰伤害（与本次伤害同类型）。', details: [] },
    },
    'open-hand': {
      3: { name: '散打技巧', nameEn: 'Open Hand Technique', description: '疾风连击命中时可使目标承受其一：慌神——至其下回合开始不能使用借机攻击；推离——力量豁免失败则被推离15尺；失衡——敏捷豁免失败则倒地。', details: [] },
      6: { name: '混元体', nameEn: 'Wholeness of Body', description: '附赠动作掷武艺骰，恢复掷骰结果+感知调整值生命值（至少1）。使用次数等于感知调整值（至少1），长休恢复。', details: [] },
      11: { name: '流星步', nameEn: 'Fleet Step', description: '当你执行除疾步如风外的附赠动作时，可在该附赠动作完成后立即使用疾步如风。', details: [] },
      17: { name: '渗透劲', nameEn: 'Quivering Palm', description: '徒手命中时可消耗4点功力打入暗劲，持续武僧等级天数。你在自己回合执行攻击动作时可将一次攻击替换为结束暗劲的动作；若如此做且你与目标同一位面，目标体质豁免失败受10d12力场伤害，成功半伤。同时只能使一个生物处于此效应。可不造成伤害结束暗劲（无需动作）。', details: [] },
    },
  },
  paladin: {
    devotion: {
      3: [
        { name: '奉献之誓法术', nameEn: 'Oath of Devotion Spells', description: '你始终准备着：3级防护善恶、虔诚护盾；5级援助术、诚实之域；9级希望信标、解除魔法；13级行动自如、信仰守卫；17级通神术、焰击术。', details: [] },
        { name: '圣洁武器', nameEn: 'Sacred Weapon', description: '执行攻击动作时可消耗一次引导神力为持握的近战武器注入正能量。随后10分钟或再次使用此特性前，该武器攻击检定可加魅力调整值（至少+1），命中时可选择造成光耀伤害；武器提供20尺明亮+20尺微光。', details: [] },
      ],
      7: { name: '奉献灵光', nameEn: 'Aura of Devotion', description: '你与守护灵光内的盟友具有魅惑免疫。陷入魅惑的盟友进入灵光时，该状态在灵光内暂时无效。', details: [] },
      15: { name: '卫护斩', nameEn: 'Smite of Protection', description: '每当你施展至圣斩时，直至你的下回合开始，灵光获得增益：身处你守护灵光期间，你和盟友具有半身掩护。', details: [] },
      20: { name: '至圣光轮', nameEn: 'Holy Nimbus', description: '附赠动作使守护灵光获得增益，持续10分钟或提前结束。至圣守护：被邪魔或亡灵迫使的豁免具有优势。光耀伤害：敌人在灵光内开始回合时受魅力调整值+熟练加值光耀伤害。阳光：灵光内为明亮光照视为阳光。一经使用直至长休无法再次使用；可消耗五环法术位重置。', details: [] },
    },
    glory: {
      3: [
        { name: '鼓舞斩', nameEn: 'Inspiring Smite', description: '施展至圣斩后，可立即消耗一次引导神力，使30尺内由你选择的生物或你自己共获得2d8+圣武士等级的临时生命值（可随意分配）。', details: [] },
        { name: '荣耀之誓法术', nameEn: 'Oath of Glory Spells', description: '你始终准备着：3级光导箭、英雄气概；5级强化属性、魔化武器；9级加速术、防护能量；13级强迫术、行动自如；17级通晓传奇、悠兰德王者威仪。', details: [] },
        { name: '绝伦健将', nameEn: 'Peerless Athlete', description: '附赠动作消耗一次引导神力增强运动能力。1小时内，力量（运动）与敏捷（特技）检定具有优势，跳远跳高距离+10尺。', details: [] },
      ],
      7: { name: '迅捷灵光', nameEn: 'Aura of Alacrity', description: '你的速度提升10尺。每个在自己回合第一次进入你守护灵光内或在其内开始回合的盟友，速度提升10尺直至其下回合结束。', details: [] },
      15: { name: '辉煌防御', nameEn: 'Glorious Defense', description: '当你或10尺内一可见生物成为攻击目标并被命中时，可用反应使其获得AC加值（等于魅力调整值，至少+1），可能使攻击失手。若失手且攻击者在你的武器触及内，你可对其发动一次武器攻击（作为该反应的一部分）。使用次数等于魅力调整值（至少1），长休恢复。', details: [] },
      20: { name: '现世传说', nameEn: 'Living Legend', description: '附赠动作获得增益，持续10分钟或提前结束。神眷天恩：魅力相关检定优势。重掷豁免：豁免失败时可用反应重骰。无误打击：每回合一次武器攻击失手可改为命中。一经使用直至长休无法再次使用；可消耗五环法术位重置。', details: [] },
    },
    ancients: {
      3: [
        { name: '自然之怒', nameEn: "Nature's Wrath", description: '魔法动作消耗一次引导神力，15尺内任意数量可见生物须通过力量豁免，失败则束缚1分钟，每回合结束可重试。', details: [] },
        { name: '古贤之誓法术', nameEn: 'Oath of the Ancients Spells', description: '你始终准备着：3级捕获打击、动物交谈；5级迷踪步、月华之光；9级植物滋长、防护能量；13级冰风暴、石肤术；17级问道自然、树跃术。', details: [] },
      ],
      7: { name: '守御灵光', nameEn: 'Aura of Warding', description: '你与守护灵光内的盟友获得对暗蚀、心灵与光耀伤害的抗性。', details: [] },
      15: { name: '不灭哨卫', nameEn: 'Undying Sentinel', description: '生命值降至0但尚未被直接杀死时，可选择让生命值变为1并恢复圣武士等级三倍的生命值。一经使用直至长休无法再次使用。此外你不会因魔法效应衰老，外表停止老去。', details: [] },
      20: { name: '上古斗士', nameEn: 'Elder Champion', description: '附赠动作用原力盈满守护灵光，持续1分钟或提前结束。瓦解反抗：灵光内敌人对抗你法术或引导神力的豁免具有劣势。复生：每回合开始恢复10生命值。迅捷法术：施法时间为动作的法术可改为附赠动作施展。一经使用直至长休无法再次使用；可消耗五环法术位重置。', details: [] },
    },
    vengeance: {
      3: [
        { name: '复仇之誓法术', nameEn: 'Oath of Vengeance Spells', description: '你始终准备着：3级灾祸术、猎人印记；5级定身类人、迷踪步；9级加速术、防护能量；13级放逐术、任意门；17级定身怪物、探知术。', details: [] },
        { name: '仇敌誓言', nameEn: 'Vow of Enmity', description: '执行攻击动作时可消耗一次引导神力对30尺内一可见生物立下仇敌誓言。接下来1分钟内对该生物的攻击检定具有优势。若誓言结束前该生物生命值降至0，可将目标换为30尺内另一可见生物（无需动作）。', details: [] },
      ],
      7: { name: '坚韧复仇', nameEn: 'Relentless Avenger', description: '借机攻击命中一生物时，可将其速度降为0直至当前回合结束，并在该攻击后立即移动至多相当于速度一半的距离（作为该反应的一部分，不引发借机攻击）。', details: [] },
      15: { name: '复仇之魂', nameEn: 'Soul of Vengeance', description: '受仇敌誓言影响的生物发动一次攻击后，无论是否命中，只要其位于你的触及内，你即可用反应对其进行一次近战攻击。', details: [] },
      20: { name: '复仇天使', nameEn: 'Avenging Angel', description: '附赠动作获得增益，持续10分钟或提前结束。飞行：背后灵体双翼，60尺飞行并悬浮。恐惧灵光：灵光内开始回合的敌人须通过感知豁免否则恐慌1分钟或直至受伤，对恐慌生物攻击具有优势。一经使用直至长休无法再次使用；可消耗五环法术位重置。', details: [] },
    },
  },
  ranger: {
    'beast-master': {
      3: { name: '原初行侣', nameEn: 'Primal Companion', description: '你魔法性召唤一只原初野兽（大地/海洋/天空野兽数据卡，外形自定）。野兽友善并听从命令；战斗中在你的回合行动，可用附赠动作命令其执行动作，或牺牲一次攻击令其执行野兽打击。野兽死亡不超过1小时可用魔法动作+法术位复活；长休可召唤不同的原初野兽。', details: [] },
      7: { name: '特效训练', nameEn: 'Exceptional Training', description: '以附赠动作命令原初行侣时，还可令其以附赠动作执行疾走、撤离、回避或协助。野兽攻击命中造成伤害时，伤害类型可为力场或原本类型（由你选择）。', details: [] },
      11: { name: '兽性狂怒', nameEn: 'Bestial Fury', description: '命令原初行侣执行野兽打击时，该动作可执行两次。每回合当其首次命中受猎人印记影响的生物时，可额外造成等同于该法术额外伤害的力场伤害。', details: [] },
      15: { name: '法术共享', nameEn: 'Share Spells', description: '当你施展以自己为目标的法术且原初行侣在30尺内时，可让该法术效应同时作用于原初行侣。', details: [] },
    },
    'fey-wanderer': {
      3: [
        { name: '哀惧灵袭', nameEn: 'Dreadful Strikes', description: '武器命中生物时可额外造成1d4心灵伤害，每目标每回合仅一次。11级时该额外伤害变为1d6。', details: [] },
        { name: '妖精漫游者魔法', nameEn: 'Fey Wanderer Magic', description: '你始终准备着：3级魅惑类人；5级迷踪步；9级妖精召唤术；13级任意门；17级假象术。并可选择或掷骰获得一种精野之赐（妖精祝福）。', details: [] },
        { name: '妖冶娴都', nameEn: 'Otherworldly Glamour', description: '进行魅力检定时可获得等于感知调整值的加值（至少+1）。另选择获得欺瞒、表演或游说之一熟练。', details: [] },
      ],
      7: { name: '妖思魅缕', nameEn: 'Beguiling Twist', description: '对抗或终止魅惑/恐慌的豁免具有优势。当你或120尺内一可见生物通过对抗魅惑或恐慌的豁免时，可用反应迫使120尺内另一可见生物进行感知豁免，失败则魅惑或恐慌（由你选）1分钟，每回合结束可重试。', details: [] },
      11: { name: '精宸所与', nameEn: 'Fey Reinforcements', description: '可无材料成分施展妖精召唤术；可免费施展一次，长休恢复。施展时可使该法术无需专注，此时持续时间为1分钟。', details: [] },
      15: { name: '雾行漫游', nameEn: 'Misty Wanderer', description: '可免费施展迷踪步，次数等于感知调整值（至少1），长休恢复。施展迷踪步时可携带5尺内一自愿生物一同传送，该生物出现在你目标位置5尺内你选择的未占据空间。', details: [] },
    },
    'gloom-stalker': {
      3: [
        { name: '恐惧伏击', nameEn: 'Dread Ambusher', description: '伏击者之跃：每场战斗你的第一个回合开始，移动速度+10尺直至该回合结束。恐惧打击：武器命中时可额外造成2d6心灵伤害，每回合仅一次，使用次数等于感知调整值（至少1），长休恢复。先攻加值：投先攻时可加入感知调整值。', details: [] },
        { name: '幽域追猎者魔法', nameEn: 'Gloom Stalker Magic', description: '你始终准备着：3级易容术；5级魔绳术；9级恐惧术；13级高等隐形术；17级伪装术。', details: [] },
        { name: '阴影视野', nameEn: 'Umbral Sight', description: '获得60尺黑暗视觉（已有则+60尺）。完全身处黑暗时，对依靠黑暗视觉观察你的生物而言你具有隐形。', details: [] },
      ],
      7: { name: '钢铁意志', nameEn: 'Iron Mind', description: '获得感知豁免熟练。若已有则改为获得智力或魅力豁免熟练（由你选择）。', details: [] },
      11: { name: '追猎如风', nameEn: "Stalker's Flurry", description: '恐惧打击的心灵伤害变为2d8。使用恐惧伏击的恐惧打击时还可创造其一：瞬杀——对原目标5尺内另一生物再发动一次攻击；群慌——目标及10尺内每生物须通过感知豁免，失败则恐慌至你下回合开始。', details: [] },
      15: { name: '如影随行', nameEn: 'Shadowy Dodge', description: '生物对你发动攻击检定时，可用反应使该检定具有劣势。无论命中与否，之后你可传送至30尺内可见未占据空间。', details: [] },
    },
    hunter: {
      3: [
        { name: '猎人学识', nameEn: "Hunter's Lore", description: '被你的猎人印记标记期间，你知道该生物是否拥有免疫、抗性或易伤及其具体项目。', details: [] },
        { name: '猎杀技艺', nameEn: "Hunter's Prey", description: '选择其一（短休或长休可更换）：巨像屠夫——武器命中生命值不满的生物时额外造成1d8伤害，每回合仅一次；灭族者——每回合一次武器攻击时可对目标5尺内另一生物发动额外攻击，且未在本回合攻击过该目标。', details: [] },
      ],
      7: { name: '防守战术', nameEn: 'Defensive Tactics', description: '选择其一（短休或长休可更换）：冲出重围——对你发动的借机攻击具有劣势；多重防御——一生物攻击命中你时，该生物本回合内对你其他攻击检定具有劣势。', details: [] },
      11: { name: '高阶猎杀技艺', nameEn: 'Superior Hunter\'s Prey', description: '每回合一次，当你对被猎人印记标记的生物造成伤害时，可对位于该生物30尺内你能看见的另一生物同样施加猎人印记的额外伤害。', details: [] },
      15: { name: '高阶防守战术', nameEn: 'Superior Hunter\'s Defense', description: '受到伤害时，可用反应获得对该伤害及同类型伤害的抗性，直至当前回合结束。', details: [] },
    },
  },
  rogue: {
    'arcane-trickster': {
      3: [
        { name: '施法', nameEn: 'Spellcasting', description: '习得三道法师戏法（含法师之手及自选两道）。准备并施展一环及以上法师法术，施法属性为智力，奥术法器为法器。准备法术与法术位见诡术师施法表。', details: [] },
        { name: '法师之手诈术', nameEn: 'Mage Hand Legerdemain', description: '施展法师之手时可改为附赠动作，且可使幽灵手隐形。可用附赠动作控制幽灵手，并通过它进行敏捷（巧手）检定。', details: [] },
      ],
      9: { name: '诡术伏击', nameEn: 'Magical Ambush', description: '处于隐形期间，若你对一生物施展法术，该生物在该回合为对抗该法术而进行的任何豁免检定都具有劣势。', details: [] },
      13: { name: '万能诡术', nameEn: 'Versatile Trickster', description: '对一生物使用诡诈打击的摔绊选项时，还可对法师之手5尺内的另一生物施加该效果。', details: [] },
      17: { name: '法术窃贼', nameEn: 'Spell Thief', description: '当生物施展目标为你或效应会影响你的法术后，可用反应迫使该生物进行智力豁免。失败则你消除该法术对你的影响并偷取该法术（至少一环且你可施展），接下来8小时内你准备该法术且该生物无法施展。一经使用直至长休无法再次使用。', details: [] },
    },
    assassin: {
      3: [
        { name: '暗杀', nameEn: 'Assassinate', description: '先攻掷骰具有优势。每次战斗第一轮，你对尚未行动过的生物的攻击检定具有优势；若该轮命中并偷袭了目标，该目标额外承受等于游荡者等级的伤害（与武器伤害类型一致）。', details: [] },
        { name: '刺客工具', nameEn: "Assassin's Tools", description: '获得易容工具和毒药工具各一套，以及这些工具的熟练。', details: [] },
      ],
      9: { name: '专业渗透', nameEn: 'Infiltration Expertise', description: '模仿大师：花费至少1小时钻研后，可精准模仿他人言语、笔迹或两者。机动瞄准：使用稳定瞄准时速度不会归零。', details: [] },
      13: { name: '淬毒武器', nameEn: 'Envenom Weapons', description: '使用诡诈打击时，目标对抗淬毒选项豁免失败会额外受到2d6毒素伤害，该伤害无视毒素抗性。', details: [] },
      17: { name: '致命袭杀', nameEn: 'Death Strike', description: '战斗第一轮命中并偷袭目标时，目标须成功通过体质豁免（DC 8+熟练加值+敏捷调整值），否则本次攻击对该目标造成双倍伤害。', details: [] },
    },
    soulknife: {
      3: [
        { name: '灵能力量', nameEn: 'Psionic Power', description: '拥有灵能骰池（数量与骰面见魂刃灵能骰表）。灵振诀窍：熟练技能/工具检定失败时可投灵能骰加至结果，仅当因此成功时消耗该骰。心灵低语：魔法动作选择至多熟练加值数量的可见生物，掷灵能骰，投掷结果数小时内可与他们心灵感应交流（距离不超过1里）。长休可免费使用一次，否则消耗灵能骰。长休恢复全部灵能骰；短休恢复1枚。', details: [] },
        { name: '念刃', nameEn: 'Psychic Blades', description: '执行攻击动作或借机攻击时可在空闲手中塑造心灵之刃。简易武器，1d6心灵伤害+属性调整值，灵巧，投掷60/120尺，精通侵扰。攻击后念刃消失。同回合若另一手空闲，可用附赠动作塑造第二把念刃再攻击一次，附赠攻击伤害骰1d4。', details: [] },
      ],
      9: { name: '灵魂之刃', nameEn: 'Soul Blades', description: '寻的斩击：念刃攻击未命中时可掷灵能骰加至攻击检定，若变为命中则消耗该骰。心灵传送：附赠动作塑造念刃，消耗并投掷灵能骰，将念刃投掷至投掷结果×10尺内可见未占据空间，你传送到该位置，念刃消失。', details: [] },
      13: { name: '灵能面纱', nameEn: 'Psychic Veil', description: '魔法动作获得隐形状态，持续至多1小时或主动解除。造成伤害或迫使生物豁免则隐形立即结束。一经使用直至长休无法再次使用；可消耗灵能骰重置。', details: [] },
      17: { name: '撕裂心智', nameEn: 'Rend Mind', description: '念刃对生物造成偷袭伤害时，可迫使其进行感知豁免（DC 8+熟练加值+敏捷调整值），失败则震慑1分钟，其每回合结束可重试。一经使用直至长休无法再次使用；可消耗三枚灵能骰重置。', details: [] },
    },
    thief: {
      3: [
        { name: '快手', nameEn: 'Fast Hands', description: '可用附赠动作执行：巧手——敏捷（巧手）检定开锁、解除陷阱或扒窃；使用物件——执行操作动作或使用需该动作的魔法物品的魔法动作。', details: [] },
        { name: '梁上君子', nameEn: 'Second-Story Work', description: '攀爬者：获得等于速度的攀爬速度。跳跃者：跳跃距离由敏捷决定而非力量。', details: [] },
      ],
      9: { name: '极效潜行', nameEn: 'Supreme Sneak', description: '获得诡诈打击选项：无声袭击（花费1d6）——若通过躲藏获得隐形且回合结束时仍处于四分之三或全身掩护后，本次攻击不会导致隐形结束。', details: [] },
      13: { name: '使用魔法装置', nameEn: 'Use Magic Device', description: '同调：可同时同调最多四件魔法物品。充能：使用魔法物品消耗充能特性时投d6，结果为6则不消耗充能。卷轴：可使用任何法术卷轴，智力为施法关键属性；戏法或一环卷轴稳定使用，更高环须智力（奥秘）检定DC 10+法术等级，失败则卷轴化为尘埃。', details: [] },
      17: { name: '窃盗本能', nameEn: "Thief's Reflexes", description: '每次战斗第一轮，你可以行动两个回合：先以正常先攻执行第一回合，再以先攻减10执行第二回合。', details: [] },
    },
  },
  sorcerer: {
    'aberrant-mind': {
      3: [
        { name: '灵能法术', nameEn: 'Psionic Spells', description: '到达特定术士等级时始终准备表中法术：3级心灵之楔、哈达之臂、不谐低语、安定心神、侦测思想；5级哈达之欲、短讯术；7级艾伐黑触手、异怪召唤术；9级拉瑞心灵连接、心灵遥控。', details: [] },
        { name: '传心谈话', nameEn: 'Telepathic Speech', description: '附赠动作选择30尺内一可见生物建立心灵感应链接。距离不超过魅力调整值英里（至少1里）时可心灵交流，须使用双方知晓的语言。链接持续术士等级分钟数，与另一生物建立链接时提前结束。', details: [] },
      ],
      6: [
        { name: '灵能术法', nameEn: 'Psionic Sorcery', description: '施展灵能法术特性中一环及以上法术时，可改为消耗等于法术环数的术法点而非法术位；如此施法时无视该法术的言语、姿势及不消耗且无具体价值的材料成分。', details: [] },
        { name: '心灵防御', nameEn: 'Psychic Defenses', description: '获得心灵伤害抗性。避免和结束魅惑、恐慌状态的豁免具有优势。', details: [] },
      ],
      14: { name: '血肉启示', nameEn: 'Revelation in Flesh', description: '附赠动作消耗1点及以上术法点魔法性转变形态，持续10分钟。每消耗1点可从下列选一项（可多选）：水生适应、闪耀飞翔、识破隐形、蠕行移动。一经使用直至长休无法再次使用；可消耗5点术法点重置。', details: [] },
      18: { name: '扭曲内爆', nameEn: 'Warping Implosion', description: '魔法动作传送到120尺内可见未占据位置，原位置30尺内每生物须进行力量豁免，失败受3d10力场伤害并被拉向原位置至最近未占据空间，成功半伤。一经使用直至长休无法再次使用；可消耗5点术法点重置。', details: [] },
    },
    'clockwork-soul': {
      3: [
        { name: '时械法术', nameEn: 'Clockwork Spells', description: '到达特定等级时始终准备：3级防护善恶、警报术、次等复原术、援助术；5级解除魔法、防护能量；7级行动自如、构装召唤术；9级高等复原术、力场墙。可从秩序显迹表选择或掷骰决定施法时显现方式。', details: [] },
        { name: '归复平衡', nameEn: 'Restore Balance', description: '当60尺内一可见生物即将带优势或劣势进行检定时，可用反应使该检定免受优势或劣势影响。使用次数等于魅力调整值（至少1），长休恢复。', details: [] },
      ],
      6: { name: '律令之壁', nameEn: 'Bastion of Law', description: '魔法动作消耗1～5点术法点为你或30尺内一可见生物创造魔法屏障，屏障具有所消耗术法点数量的d8。受守护生物受伤害时可消耗任意数量d8投掷并减少该伤害。屏障持续至长休或再次使用此特性。', details: [] },
      14: { name: '序列意识', nameEn: 'Trance of Order', description: '附赠动作进入此状态1分钟。期间对你进行的攻击免受优势影响；每当你进行d20检定时可将9及以下视为10。一经使用直至长休无法再次使用；可消耗5点术法点重置。', details: [] },
      18: { name: '时械矩阵', nameEn: 'Clockwork Cavalcade', description: '魔法动作在以你为源点的30尺立方内召唤秩序精魂（无实体、不可摧毁）。治愈：精魂合计恢复至多100生命值随意分配；修复：范围内损坏物件立即修复；破法：选择范围内任意数量生物或物件，其承受的六环及以下法术结束。一经使用直至长休无法再次使用；可消耗7点术法点重置。', details: [] },
    },
    draconic: {
      3: [
        { name: '龙族体魄', nameEn: 'Draconic Resilience', description: '生命值上限+3，此后每术士等级再+1。未着装护甲时基础AC=10+敏捷调整值+魅力调整值。', details: [] },
        { name: '龙族法术', nameEn: 'Draconic Spells', description: '始终准备：3级繁彩球、命令术、龙息术、变身术；5级恐惧术、飞行术；7级秘法眼、魅惑怪物；9级通晓传奇、龙类召唤术。', details: [] },
      ],
      6: { name: '元素亲和', nameEn: 'Elemental Affinity', description: '选择强酸、寒冷、火焰、闪电或毒素之一。获得该伤害类型抗性；施展造成该类型伤害的法术时，可将魅力调整值加到该法术其中一次伤害掷骰。', details: [] },
      14: { name: '龙翼', nameEn: 'Dragon Wings', description: '附赠动作张开龙翼，持续1小时或提前解散。期间获得60尺飞行速度。一经使用直至长休无法再次使用；可消耗3点术法点重置。', details: [] },
      18: { name: '龙族伙伴', nameEn: 'Dragon Companion', description: '可无材料成分施展龙类召唤术；可无需法术位施展一次，长休恢复。施展时可使该法术无需专注，此时持续1分钟。', details: [] },
    },
    'wild-magic': {
      3: [
        { name: '狂野魔法浪涌', nameEn: 'Wild Magic Surge', description: '每回合一次，消耗法术位施展术士法术后可立即投d20；若为20则在狂野魔法浪涌表上掷骰确定随机效应。若效应为法术，该法术不受超魔法影响。', details: [] },
        { name: '混乱之潮', nameEn: 'Tide of Chaos', description: '可使一次自身d20检定具有优势，须在掷骰前决定。一经使用直至长休才能再次使用。用法术位施展术士法术时也会恢复可用，但此时会自动掷狂野魔法浪涌表。', details: [] },
      ],
      6: { name: '扭曲幸运', nameEn: 'Bend Luck', description: '当你能看见的生物投d20进行检定时，可在掷骰完成后用反应消耗1点术法点投1d4，将结果作为加值或减值（由你决定）加到该d20结果上。', details: [] },
      14: { name: '受控混沌', nameEn: 'Controlled Chaos', description: '每次掷狂野魔法浪涌表时可掷两次并自选其一生效。', details: [] },
      18: { name: '驯服浪涌', nameEn: 'Tamed Surge', description: '用法术位施展术士法术后，可立即从狂野魔法浪涌表中选择一种效应（除最后一行）而非掷骰；若效应含掷骰则须掷骰。一经使用直至长休无法再次使用。', details: [] },
    },
  },
  warlock: {
    archfey: {
      3: [
        { name: '至高妖精法术', nameEn: 'Archfey Spells', description: '始终准备：3级妖火、睡眠术、安定心神、迷踪步、魅影之力；5级闪现术、植物滋长；7级支配野兽、高等隐形术；9级支配类人、伪装术。', details: [] },
        { name: '妖精步伐', nameEn: 'Steps of the Fey', description: '可无需法术位施展迷踪步，次数等于魅力调整值（至少1），长休恢复。施展时可选：复苏步伐——传送后你或10尺内一生物获得1d10临时生命值；嘲弄步伐——传送前空间5尺内生物须感知豁免，失败则对除你外生物攻击检定劣势至你下回合开始。', details: [] },
      ],
      6: { name: '雾遁', nameEn: 'Misty Escape', description: '受到伤害时可用反应施展迷踪步。妖精步伐新增选项：无踪步伐——获得隐形至下回合开始或攻击/造成伤害/施展法术前；惊惧步伐——传送前或传送后空间5尺内生物须感知豁免，失败受2d10心灵伤害。', details: [] },
      10: { name: '斗转星移', nameEn: 'Beguiling Defenses', description: '获得魅惑免疫。当可见敌人攻击命中你后，可用反应使该次伤害减半，并迫使攻击者进行感知豁免，失败则受到与你本次承受伤害等量的心灵伤害。此反应一经使用直至长休无法再次使用；可消耗契约魔法法术位重置。', details: [] },
      14: { name: '醉心魔法', nameEn: 'Bewitching Magic', description: '当你以动作消耗法术位施展幻术或惑控法术时，可作为该动作的一部分无需法术位立即施展迷踪步。', details: [] },
    },
    celestial: {
      3: [
        { name: '天界法术', nameEn: 'Celestial Spells', description: '始终准备：3级光亮术、圣火术、疗伤术、光导箭、援助术、次等复原术；5级昼明术、回生术；7级信仰守卫、火墙术；9级高等复原术、天界召唤术。', details: [] },
        { name: '治愈之光', nameEn: 'Healing Light', description: '拥有1+魔契师等级的d6骰池。附赠动作可消耗骰池中至多魅力调整值（至少1）枚骰子，治疗自己或60尺内一可见生物，投掷消耗的骰子，总和为恢复的生命值。长休恢复全部骰子。', details: [] },
      ],
      6: { name: '光耀之魂', nameEn: 'Radiant Soul', description: '获得光耀伤害抗性。每回合一次，当你施展的法术造成光耀或火焰伤害时，可将魅力调整值加到该法术对其中一个目标造成的伤害上。', details: [] },
      10: { name: '天界韧性', nameEn: 'Celestial Resilience', description: '每当使用秘法回流或完成短休/长休后，获得魔契师等级+魅力调整值的临时生命值；此时还可选择至多五名可见生物，他们获得魔契师等级一半+魅力调整值的临时生命值。', details: [] },
      14: { name: '灼光复仇', nameEn: 'Searing Vengeance', description: '当你或60尺内一盟友将要进行死亡豁免时，可释放光能：该生物恢复生命值上限一半并可选结束倒地，之后你选择该生物30尺内的生物各受2d8+魅力调整值光耀伤害并目盲至当前回合结束。一经使用直至长休无法再次使用。', details: [] },
    },
    fiend: {
      3: [
        { name: '邪魔法术', nameEn: 'Fiend Spells', description: '始终准备：3级燃烧之手、命令术、灼热射线、暗示术；5级火球术、臭云术；7级火焰护盾、火墙术；9级指使术、疫病虫群。', details: [] },
        { name: '黑暗赐福', nameEn: "Dark One's Blessing", description: '当你将敌人生命值降至0时，获得魅力调整值+魔契师等级的临时生命值（至少1）。10尺内你的敌人被他人降至0时你也获得此增益。', details: [] },
      ],
      6: { name: '黑暗强运', nameEn: "Dark One's Own Luck", description: '进行属性检定或豁免检定时，可为该掷骰增添一个d10（可在看到结果后、生效前使用）。使用次数等于魅力调整值（至少1），单次检定只能用一次，长休恢复。', details: [] },
      10: { name: '邪魔体魄', nameEn: 'Fiendish Resilience', description: '每当你完成短休或长休时，选择一种除力场外的伤害类型，直至你再次选择前具有该类型抗性。', details: [] },
      14: { name: '直坠噩梦', nameEn: 'Hurl Through Hell', description: '每回合一次，攻击检定命中生物时可尝试将目标瞬间送入下层位面。目标须进行魅力豁免，失败则消失并受8d10心灵伤害（非邪魔），且失能直至你下回合结束，然后返回原空间或最近未占据空间。一经使用直至长休无法再次使用；可消耗契约魔法法术位重置。', details: [] },
    },
    'great-old-one': {
      3: [
        { name: '旧日支配者法术', nameEn: 'Great Old One Spells', description: '始终准备：3级不谐低语、塔莎狂笑术、魅影之力、侦测思想；5级鹰眼术、哈达之欲；7级困惑术、异怪召唤术；9级篡改记忆、心灵遥控。', details: [] },
        { name: '唤醒心灵', nameEn: 'Awakened Mind', description: '附赠动作指定30尺内一可见生物建立心灵连结。距离不超过魅力调整值英里（至少1英里）时可心灵感应交流，须使用双方知晓的语言。连结持续魔契师等级分钟，与另一生物建立时提前结束。', details: [] },
        { name: '心灵法术', nameEn: 'Psychic Spells', description: '施展造成伤害的魔契师法术时可将伤害类型改为心灵。施展惑控/幻术学派魔契师法术时可令其无言语与姿势成分。', details: [] },
      ],
      6: { name: '锐眼斗士', nameEn: 'Clairvoyant Combatant', description: '当你用唤醒心灵与生物建立连结时，可迫使其进行感知豁免。失败则连结期间该生物对你的攻击检定劣势，你对它的攻击检定优势。一经使用直至短休或长休无法再次使用；可消耗契约魔法法术位重置。', details: [] },
      10: [
        { name: '骇异恶咒', nameEn: 'Eldritch Hex', description: '始终准备脆弱诅咒。施展脆弱诅咒并选择属性时，目标在法术持续时间内以该属性进行的豁免也具有劣势。', details: [] },
        { name: '思维之盾', nameEn: 'Thought Shield', description: '除非你允许，思维无法被心灵感应或其他手段阅读。具有心灵伤害抗性；每当生物对你造成心灵伤害时，该生物受到等量伤害。', details: [] },
      ],
      14: { name: '创造奴仆', nameEn: 'Create Thrall', description: '施展异怪召唤术时可修改为无需专注，此时持续1分钟且召唤的异怪拥有魔契师等级+魅力调整值的临时生命值。该异怪每回合首次命中被脆弱诅咒影响的生物时，额外造成等于该法术附加伤害的心灵伤害。', details: [] },
    },
  },
  wizard: {
    abjuration: {
      3: [
        { name: '防护学者', nameEn: 'Abjuration Savant', description: '从法师法术列表选两道不高于二环的防护学派法术免费加入法术书。每获得新环阶法术位时，可免费将一道该环阶防护学派法术加入法术书。', details: [] },
        { name: '奥术守御', nameEn: 'Arcane Ward', description: '当你消耗法术位施展防护学派法术时，可同时为自己创建魔法结界，持续至长休。结界生命值上限=法师等级×2+智力调整值。你受伤害时结界先承受（应用你的抗性/易伤后）；溢出伤害由你承受。结界为0时不再吸收伤害。每当你消耗法术位施展防护学派法术时结界恢复该环阶两倍生命值；附赠动作消耗法术位也可恢复环阶两倍生命值。结界一经创建直至长休无法再创建。', details: [] },
      ],
      6: { name: '投射守御', nameEn: 'Projected Ward', description: '当30尺内一可见生物受到伤害时，可用反应让奥术守御吸收该伤害。若伤害使结界生命值降为0，该生物承受剩余伤害。该生物的抗性/易伤在计算结界承伤前先结算。', details: [] },
      10: { name: '破法者', nameEn: 'Spell Breaker', description: '始终准备法术反制与解除魔法。可以附赠动作施展解除魔法，且其属性检定可加熟练加值。消耗法术位施展其中任一时，若未能成功阻止或解除法术，该法术位不消耗。', details: [] },
      14: { name: '法术抗性', nameEn: 'Spell Resistance', description: '抵抗法术时的豁免检定具有优势，对法术造成的伤害具有抗性。', details: [] },
    },
    divination: {
      3: [
        { name: '预言学者', nameEn: 'Divination Savant', description: '从法师法术列表选两道不高于二环的预言学派法术免费加入法术书。每获得新环阶法术位时，可免费将一道该环阶预言学派法术加入法术书。', details: [] },
        { name: '预兆', nameEn: 'Portent', description: '每完成长休掷2次d20并记录。可用一结果替换你或你能看见的生物进行的d20检定（须在检定前选择，每回合仅能如此替换一次）。每个预兆骰只能用一次，长休时未用的预兆骰失去。', details: [] },
      ],
      6: { name: '专业预言', nameEn: 'Expert Divination', description: '消耗法术位施展二环及以上预言学派法术时，可恢复一个已消耗的法术位，所恢复环阶须低于该预言法术且不高于五环。', details: [] },
      10: { name: '天眼通', nameEn: 'The Third Eye', description: '附赠动作从下列选一，持续至开始短休或长休。此特性一经使用直至完成短休或长休无法再次使用。黑暗视觉120尺；高等通晓——读懂任何语言；识破隐形——可不消耗法术位施展识破隐形。', details: [] },
      14: { name: '高等预兆', nameEn: 'Greater Portent', description: '为预兆特性掷3次d20而非2次。', details: [] },
    },
    evocation: {
      3: [
        { name: '塑能学者', nameEn: 'Evocation Savant', description: '从法师法术列表选两道不高于二环的塑能学派法术免费加入法术书。每获得新环阶法术位时，可免费将一道该环阶塑能学派法术加入法术书。', details: [] },
        { name: '强力戏法', nameEn: 'Potent Cantrip', description: '造成伤害的戏法在攻击失手或目标豁免成功时，目标仍受到一半伤害（若有），但不受到该戏法其他效应影响。', details: [] },
      ],
      6: { name: '法术塑形', nameEn: 'Sculpt Spells', description: '施展会影响其他生物的塑能学派法术时，可指定数量等于1+该法术环阶的生物。被指定生物对抗该法术的豁免直接成功，且若豁免成功仍有一半伤害则不受任何伤害。', details: [] },
      10: { name: '强效塑能', nameEn: 'Empowered Evocation', description: '施展法师法术列表中塑能学派法术时，可将智力调整值加入该法术其中一次伤害掷骰。', details: [] },
      14: { name: '超限导能', nameEn: 'Overchannel', description: '用一至五环法术位施展会造成伤害的法师法术时，可在该回合令其伤害取最大值。首次使用无负面效应；长休前再次使用则法术后立即受到每环阶2d12暗蚀伤害（无视抗性/免疫）；每多使用一次，每环阶伤害再+1d12。', details: [] },
    },
    illusion: {
      3: [
        { name: '幻术学者', nameEn: 'Illusion Savant', description: '从法师法术列表选两道不高于二环的幻术学派法术免费加入法术书。每获得新环阶法术位时，可免费将一道该环阶幻术学派法术加入法术书。', details: [] },
        { name: '强化幻术', nameEn: 'Improved Illusions', description: '施展幻术学派法术时无需言语成分；施法距离不小于10尺时+60尺。知晓次级幻象戏法（已会则另选一道法师戏法，不计入已知数）。施展次级幻象可同时创造声音与影像，且可以附赠动作施展。', details: [] },
      ],
      6: { name: '魅影生灵', nameEn: 'Phantasmal Creatures', description: '始终准备野兽召唤术与妖精召唤术。施展其中任一时可选择将其学派变为幻术，召唤生物变为虚幻。可不消耗法术位各施展一次幻术版，但如此召唤的生物仅一半生命值；一旦如此施展任一道，直至长休无法再以此法施展该道。', details: [] },
      10: { name: '幻影化形', nameEn: 'Illusory Self', description: '当生物对你的一次攻击检定命中时，可用反应在攻击者与你之间插入幻象分身，该次攻击对你自动失手，随后幻象消失。一经使用直至长休无法再次使用；可消耗二环或更高法术位重置。', details: [] },
      14: { name: '亦真亦幻', nameEn: 'Illusory Reality', description: '用法术位施展幻术学派法术时，可选择属于幻象一部分的非活化非魔法物件，在法术持续中于自己回合以附赠动作令其化为真实。该物件在接下来1分钟内保持真实，期间无法造成伤害或赋予状态。', details: [] },
    },
  },
};

/**
 * 获取子职业在指定等级获得的特性详情列表（用于升级页、特性页展示「子职特性」）
 * 多数等级为单条，兽心/狂热者 3 级等为多条；无数据时返回空数组
 */
export function getSubclassFeaturesByLevel(
  classId: string,
  subclassId: string,
  level: number
): SubclassFeatureDetail[] {
  const byClass = SUBCLASS_FEATURES[classId];
  if (!byClass) return [];
  const bySubclass = byClass[subclassId];
  if (!bySubclass) return [];
  const raw = bySubclass[level];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

// D&D 2024 法术数据

export interface Spell {
  id: string;
  name: string;
  nameEn: string;
  level: number; // 0 = 戏法, 1 = 一环, 2 = 二环, etc.
  school: string; // 学派：防护、咒法、预言、附魔、塑能、幻术、死灵、变化
  castingTime: string; // 施法时间
  range: string; // 射程
  components: string; // 成分：V(言语)、S(姿势)、M(材料)
  duration: string; // 持续时间
  description: string; // 法术描述
  higherLevel?: string; // 升环效果
  ritual?: boolean; // 是否为仪式法术
  classes: string[]; // 可用职业列表
  source?: string; // 规则来源（例如：D&D Beyond 2024 基础规则）
  sourceUrl?: string; // 来源链接
}

// 戏法列表
export const CANTRIPS: Spell[] = [
  // 牧师戏法
  {
    id: 'guidance',
    name: '神导术',
    nameEn: 'Guidance',
    level: 0,
    school: '预言',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '专注，至多1分钟',
    description: '你触碰一名自愿生物并选择一项技能。直到法术结束为止，受术生物在进行使用到所选技能的任何属性检定时，该次检定具有1d4加值。',
    classes: ['牧师', '德鲁伊', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618971-guidance'
  },
  {
    id: 'light',
    name: '光亮术',
    nameEn: 'Light',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '触及',
    components: 'V、M（一只萤火虫或一片磷光苔藓）',
    duration: '1小时',
    description:
      '你触碰一个体型不超过大型，且未被他人携带/着装的物件。在法术终止前，物件将发出20尺半径的明亮光照以及额外20尺的微光光照。光的颜色由你决定。\n该物件被不透明的东西完全遮盖时，其光照也将被遮挡。此法术将在你再次施展它时提前终止。',
    classes: ['吟游诗人', '牧师', '术士', '法师', '奇械师']
  },
  {
    id: 'mending',
    name: '修复术',
    nameEn: 'Mending',
    level: 0,
    school: '变化',
    castingTime: '1分钟',
    range: '触及',
    components: 'V、S、M（两块天然磁石）',
    duration: '立即',
    description:
      '该法术修复你所触碰一个物件上的一处破损或裂缝，例如修复一条断裂的链条、一把碎成两半的钥匙、一件撕裂的斗篷、一个漏了的酒袋等。只要破损或断裂处在任意方向上都不超过 1 尺，你就可以不留痕迹地修复它。\n该法术可以物理性地修复一件魔法物品，但无法恢复其上的魔法。',
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619033-mending',
    classes: ['吟游诗人', '牧师', '德鲁伊', '术士', '法师']
  },
  {
    id: 'resistance',
    name: '抗性',
    nameEn: 'Resistance',
    level: 0,
    school: '防护',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '专注，至多1分钟',
    description:
      '你触碰一名自愿生物并选择一种伤害类型：强酸、钝击、寒冷、火焰、闪电、暗蚀、穿刺、毒素、光耀、挥砍、雷鸣。在此法术结束之前，每当该生物受到所选类型伤害时，那名生物所受的总伤害减少1d4。一名生物一回合只能受到一次该法术的增益。',
    classes: ['牧师', '德鲁伊', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618947-resistance'
  },
  {
    id: 'sacred-flame',
    name: '圣火',
    nameEn: 'Sacred Flame',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '60 尺',
    components: 'V、S',
    duration: '立即',
    description:
      '如同烈焰般的辉光向着施法距离内你能看见的一名生物倾泻而下。目标必须要通过一次敏捷豁免，否则将受到1d8点光耀伤害。在这次豁免检定中，目标无法享受来自半身掩护和四分之三掩护 的增益。\n戏法强化。该法术的伤害会在你达到下列等级时增加1d8：5级（2d8），11 级（3d8），17 级（4d8）。',
    classes: ['牧师']
  },
  {
    id: 'spare-the-dying',
    name: '维生术',
    nameEn: 'Spare the Dying',
    level: 0,
    school: '死灵',
    castingTime: '动作',
    range: '15尺',
    components: 'V、S',
    duration: '立即',
    description: '选择一个生命值为0但还未死亡的生物，使该生物变为伤势稳定。',
    higherLevel: '戏法强化。到达特定等级后，此法术的施法距离将翻倍：5级（30尺），11级（60尺），17级（120尺）。',
    classes: ['牧师', '德鲁伊', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619067-spare-the-dying'
  },
  {
    id: 'thaumaturgy',
    name: '奇术',
    nameEn: 'Thaumaturgy',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '30尺',
    components: 'V',
    duration: '至多1分钟',
    description:
      '你在施法距离内显现一道次级奇迹。你在施法距离内创造下述效应之一。如果你多次施展该法术，则可以同时维持至多三个不同的1分钟效应。\n\n改变眼睛Altered Eyes。 你改变自己眼睛的外观，其效应持续1分钟。\n扩音Booming Voice。 你的语音音量变为通常情况下的三倍大，其效应持续1分钟。在此期间，你在魅力（威吓）检定上具有优势 。\n玩火Fire Play。 你使一团火焰闪烁、变亮、变暗或变色，其效应持续1分钟。\n看不见的手Invisible Hand。 你使一扇没有上锁的门/窗立即打开或关上。\n幻音Phantom Sound。 指定施法距离内的一点，你使该点发出一道短暂的声音，例如雷鸣声，渡鸦叫声或不祥低语声。\n震动Tremors。 你在地面上引发无害的震动，其效应持续1分钟。',
    classes: ['牧师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619174-thaumaturgy'
  },
  // 法师戏法
  {
    id: 'acid-splash',
    name: '酸液飞溅',
    nameEn: 'Acid Splash',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '60 尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你在施法距离内一点创造出一颗酸液泡，以该点5尺球状范围爆发。该球状区域内的每名生物必须通过一次敏捷豁免，否则受到1d6点强酸伤害。\n戏法强化。本法术的伤害会在你达到下列等级时提升1d6：5级（2d6）、11级（3d6）以及17级（4d6）。',
    classes: ['术士', '法师', '奇械师']
  },
  {
    id: 'fire-bolt',
    name: '火焰箭',
    nameEn: 'Fire Bolt',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你对施法距离内一名生物或物件掷出一把火焰，对目标进行一次远程法术攻击。命中则目标将受到1d10火焰伤害。未被着装或携带的可燃物件被该法术命中时将开始燃烧。\n戏法强化。到达特定等级后，此戏法的伤害将增加1d10：5级（2d10）、11级（3d10）、17级（4d10）。',
    classes: ['术士', '法师', '奇械师']
  },
  {
    id: 'mage-hand',
    name: '法师之手',
    nameEn: 'Mage Hand',
    level: 0,
    school: '咒法',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S',
    duration: '1分钟',
    description:
      '一只漂浮的幽灵手出现在施法距离内你指定的一点。幽灵手持续存在至法术终止。如果幽灵手与你之间的距离超过30尺，则幽灵手将消失不见。若你再次施展了此法术，现存的幽灵手也将提前消失。\n你可以在施展该法术时使用幽灵手实施一个行为：你可以操控一个物件、打开一扇未上锁的门或容器、将一件物品放入或取出一个打开的容器、或是将小瓶中的内容物倾倒出来。\n在后续的回合中，你可以用魔法 动作控制幽灵手再次实施上述行为之一。而作为那次动作的一部分，你还可以令幽灵手移动至多30尺。\n该幽灵手不能攻击，也不能激活魔法物品或承载超过10磅重的物质。',
    classes: ['吟游诗人', '术士', '魔契师', '法师', '奇械师']
  },
  {
    id: 'message',
    name: '传讯术',
    nameEn: 'Message',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '120尺',
    components: 'S、M（一段铜线）',
    duration: '立即',
    description:
      '你用指向施法距离内的一名生物并低声说出一段信息。该目标（且只有该目标）会听到这段信息，并且可以用只有你能听见的低语回复你。\n你可以隔着固态物件施展此法术，但你必须熟悉法术目标并知晓其就在阻挡物后方。魔法性的沉默效应，1尺厚的石头、金属或木料，或是一片薄铅都可以阻挡此法术。',
    classes: ['吟游诗人', '德鲁伊', '术士', '法师', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619034-message'
  },
  {
    id: 'minor-illusion',
    name: '次级幻影',
    nameEn: 'Minor Illusion',
    level: 0,
    school: '幻术',
    castingTime: '动作',
    range: '30尺',
    components: 'S、M（少量羊毛）',
    duration: '1分钟',
    description:
      '你在施法距离内创造一段声响或一个物件的影像，并使之维持至法术持续时间结束，详见以下对应效应的描述。你可以再次施展该法术来终止幻象。\n生物用研究动作调查该声响或影像时，其必须进行一次对抗该法术豁免 DC 的智力（调查）检定，检定成功则判断出是幻象。对于识破幻象的生物而言，幻象会变得模糊不清。\n\n声响Sound。如果你创造一段声响，其音量可以是低声耳语也可以是高声尖叫。它可以是你或其他任何人的嗓音，或者是一头狮子的咆哮、一段鼓声以及任何你指定的其他声响。声响在持续时间内不会减弱，或者你也可以于法术终止前在不同的时间段创造几段分散的声响。\n影像Image。如果你创造一个物件的影像，比如一把椅子、泥泞的脚印、一个小箱子等，则该物件各方向上大小不得大于5尺立方区域。该影像不具有声音、光亮、味道或任何其他的感官效应。由于影像可以被任何物体穿透，因此与之进行物理互动时都会揭露其幻象的本质。',
    classes: ['吟游诗人', '术士', '魔契师', '法师']
  },
  {
    id: 'poison-spray',
    name: '毒气喷射',
    nameEn: 'Poison Spray',
    level: 0,
    school: '咒法',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你向施法距离内一个你可见的生物喷出一股毒气。对目标进行一次远程法术攻击。命中时，目标将受1d12点毒素伤害。\n戏法强化。 到达特定等级后，此戏法的伤害将增加1d12：5级（2d12）、11级（3d12）、17级（4d12）。',
    classes: ['德鲁伊', '术士', '魔契师', '法师', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618875-poison-spray'
  },
  {
    id: 'prestidigitation',
    name: '魔法伎俩',
    nameEn: 'Prestidigitation',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '10尺',
    components: 'V、S',
    duration: '至多1小时',
    description:
      '你在施法距离内创造一个魔法效应。从下述效应中选择一项。如果你多次施展该法术，则可以同时维持至多三个不同的非即时效应。\n\n感官效应Sensory Effect。 你创造一个立即生效的，无害的感官效应，比如一束火花，一阵风，微弱音乐或古怪的臭味。\n玩火Fire Play。 你立即点燃或熄灭一根蜡烛、一根火把或一处小篝火。\n清洁或弄脏Clean or Soil。 你立即清洁或弄脏一个体积不大于1立方尺的物件。\n次级感觉Minor Sensation。 你使一个不大于1立方尺的非活体物质变冷、变暖或对其调味，持续1小时。\n魔法印记Magic Mark。 你在一个物件或一个表面上创造一块色斑，一个小印记，或者一个徽记，持续1小时。\n次级造物Minor Creation。 你创造出一个非魔法小饰品或一张虚幻图像，其大小不能超过你的手掌大小，它会持续存在至下个你的回合结束为止。一个小饰品不能造成伤害，也不值任何钱。',
    classes: ['吟游诗人', '术士', '魔契师', '法师', '奇械师']
  },
  {
    id: 'ray-of-frost',
    name: '寒霜射线',
    nameEn: 'Ray of Frost',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '60尺',
    components: 'V、S',
    duration: '立即',
    description:
      '一道蓝白色的冰冷光束朝施法距离内的一名生物射去。对目标进行一次远程法术攻击。命中时，目标将受到1d8点寒冷伤害，且其速度将被减少10尺，直到你的下一回合开始为止。\n戏法强化。 到达特定等级后，此戏法的伤害将增加1d8：5级（2d8）、11级（3d8）、17级（4d8）。',
    classes: ['术士', '法师', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618930-ray-of-frost'
  },
  {
    id: 'shocking-grasp',
    name: '电爪',
    nameEn: 'Shocking Grasp',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '立即',
    description:
      '你放出闪电，击向一名你试图触碰的生物。对目标发动一次近战法术攻击。若命中，则目标受到 1d8 点闪电伤害，并且在其下一回合开始前不能执行借机攻击。\n戏法强化。 到达特定等级后，此戏法的伤害将增加1d8：5级（2d8）、11级（3d8）、17级（4d8）。',
    classes: ['术士', '法师', '奇械师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618986-shocking-grasp'
  },
  // 术士戏法
  {
    id: 'blade-ward',
    name: '剑刃防护',
    nameEn: 'Blade Ward',
    level: 0,
    school: '防护',
    castingTime: '动作',
    range: '自身',
    components: 'V、S',
    duration: '专注，至多1分钟',
    description: '在此法术结束前，每当有生物对你发动攻击检定，该生物的该次攻击检定都将承受1d4减值。',
    classes: ['吟游诗人', '术士', '魔契师', '法师']
  },
  {
    id: 'chill-touch',
    name: '颤栗之触',
    nameEn: 'Chill Touch',
    level: 0,
    school: '死灵',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '立即',
    description:
      '你引导出来自坟墓的刺骨阴冷，对目标进行一次近战法术攻击。命中时，目标将受到1d10点暗蚀伤害，并且直至你下一回合的结束前都无法恢复生命值。\n戏法强化。 法术的伤害会在你到达下列等级时增加1d10：5级（2d10）、11级（3d10）以及17级（4d10）。',
    classes: ['术士', '魔契师', '法师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2618965-chill-touch'
  },
  {
    id: 'dancing-lights',
    name: '舞光术',
    nameEn: 'Dancing Lights',
    level: 0,
    school: '幻术',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S、M（一点磷）',
    duration: '专注，至多1分钟',
    description:
      '你在施法距离内创造至多四个火把大小的光源，使其在法术持续时间内看起来如同火把、灯笼或悬浮珠。或者，你可以将四个光源合并为一个发光的整体形态，使其看上去像一个模糊的中型人形。无论你选择哪种形态，每个光源都会发出10尺半径的微光光照 。\n你可以用附赠动作将光源移动至多60尺至施法距离内的一处空间。一个由此法术创造的光源必须始终位于任一光源周围20尺内，而超出施法距离的光源会随即熄灭。',
    classes: ['吟游诗人', '术士', '法师', '奇械师']
  },
  {
    id: 'friends',
    name: '交友术',
    nameEn: 'Friends',
    level: 0,
    school: '惑控',
    castingTime: '动作',
    range: '10尺',
    components: 'S、M（一些化妆品）',
    duration: '专注，至多1分钟',
    description:
      '你魔法性地向施法距离内的一名可见生物散发出友谊感。目标必须成功于一次感知豁免，否则其在法术持续时间内陷入魅惑状态。若目标并非类人生物，或者你正在与其战斗，又或者你在过去24小时内曾对其施展过这道法术，则其进行的此次豁免自动成功。\n若目标受到伤害，或你进行一次攻击检定、造成伤害、迫使任何人进行一次豁免，则法术会提早结束。法术结束时，目标会知道他曾被你魅惑。',
    classes: ['吟游诗人', '术士', '魔契师', '法师']
  },
  {
    id: 'mind-silver',
    name: '心灵之楔',
    nameEn: 'Mind Sliver',
    level: 0,
    school: '惑控',
    castingTime: '动作',
    range: '60尺',
    components: 'V',
    duration: '1轮',
    description:
      '指定施法距离内一个你可见的生物，你试图暂时刺入目标的心灵。目标必须通过一次智力豁免 。豁免失败将受到1d6点心灵伤害，并且其在你的下回合结束前，进行的下一次豁免检定将获得1d4减值。\n戏法强化。 到达特定等级后，此戏法的伤害将增加1d6：5级（2d6）、11级（3d6）、17级（4d6）。',
    classes: ['术士', '邪术师', '魔契师', '法师']
  },
  // 魔契师戏法
  {
    id: 'eldritch-blast',
    name: '魔能爆',
    nameEn: 'Eldritch Blast',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你释放出一束爆裂能量射线，对施法距离内一名生物或一个物件发动一次远程法术攻击。命中时，目标将受1d10点力场伤害。\n戏法强化。到达5级后此法术将创造出两条射线，11级后三条，17级后四条。你可以使这些射线攻击同一个目标或分别攻击不同的目标。你需要为每条射线分别进行攻击检定。',
    classes: ['魔契师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619161-eldritch-blast'
  },
  // 吟游诗人戏法
  {
    id: 'vicious-mockery',
    name: '恶言相加',
    nameEn: 'Vicious Mockery',
    level: 0,
    school: '惑控',
    castingTime: '动作',
    range: '60尺',
    components: 'V',
    duration: '立即',
    description:
      '你对施法距离内一名你可见或可听的生物连珠炮式地释出一串蕴涵微妙惑控的侮辱。目标必须通过一次感知豁免，否则受到1d6点心灵伤害，且在其下一回合结束前，其进行的下一次攻击检定具有劣势。\n戏法强化。到达特定等级后，此戏法的伤害将增加1d6：5级（2d6）、11级（3d6）、17级（4d6）。',
    classes: ['吟游诗人'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619216-vicious-mockery'
  },
  // 其他戏法（来自中文规则文档）
  {
    id: 'druidcraft',
    name: '德鲁伊伎俩',
    nameEn: 'Druidcraft',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你向自然精魂低语，在施法距离内创造出下述效应之一。\n\n感知天气Weather Sensor。你创造一个微型而无害的感官效应，并以之预报你所在地接下来 4小时的天气状况。该效应可表现为一个代表晴空的金球、一朵代表雨天的云彩、代表雪日而飘飞的雪花等等。该效应将持续1轮。\n盛放Blossom。你可以立即让一朵鲜花绽放，让一颗种子破壳，或是让一片叶蕾发芽。\n感官效应Sensory Effect。 你创造一个无害的感官效应，例如落叶、如幽灵般舞动的小仙灵们、微风、动物的声音或者臭鼬的微弱臭气。该效应只能在5尺的立方 区域内起效。\n玩火Fire Play。 你点亮/熄灭一根蜡烛、一根火把或一处小篝火。',
    classes: ['德鲁伊']
  },
  {
    id: 'elementalism',
    name: '四象法门',
    nameEn: 'Elementalism',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你操控元素，在施法距离内创造下述效应之一。\n\n召气Beckon Air。你在一处5尺立方区域内创造一股和风，其足以吹动布料、搅动灰尘、使落叶沙沙作响、关闭开着的门和百叶窗。若开着的门/百叶窗被某人/某物顶住，则其不受该效应影响。\n召土Beckon Earth。你创造灰尘或沙子组成的薄帷，覆盖在5尺立方区域内的表面上，或者你可以在一堆泥土或沙子中使一个单词以你的手写体出现。\n召火Beckon Fire。你在一处5尺立方区域内创造一片无害余烬与一股富有色彩和气味的烟。你选择烟的色彩和气味，而余烬可以点燃区域中的蜡烛、火把或油灯。烟的气味会存留1分钟。\n召水Beckon Water。你在一处5尺立方范围内创造一片凉爽的，使范围内生物和物件略微潮湿的雾气。或者，你可以在一个有开口的容器或表面上创造出一杯干净的水，水会在1分钟内蒸发。\n塑形元素Sculpt Element。你使1尺立方区域内的泥土、沙子、火焰、烟尘、雾气或水呈现出一个粗略的形状（如一名生物），持续1小时。',
    classes: ['德鲁伊', '术士', '法师', '奇械师']
  },
  {
    id: 'produce-flame',
    name: '燃火术',
    nameEn: 'Produce Flame',
    level: 0,
    school: '咒法',
    castingTime: '附赠动作',
    range: '自身',
    components: 'V、S',
    duration: '10分钟',
    description:
      '一朵摇曳的火焰出现在你手中，火焰会存在至法术持续时间结束为止。火焰在你手中期间，不会散发任何热量也不会点燃任何东西，发出20尺半径的明亮光照，以及其外20尺范围的微光光照 。此法术会在你再次施展它时提前终止。\n直到法术结束为止，你可以用魔法动作向60尺内的一名生物或一个物件丢出火焰。进行一次远程法术攻击。命中时，目标将受到1d8点火焰伤害。',
    higherLevel: '戏法强化。 到达特定等级后，此戏法的伤害将增加1d8：5级（2d8）、11级（3d8）、17级（4d8）。',
    classes: ['德鲁伊']
  },
  {
    id: 'shillelagh',
    name: '橡棍术',
    nameEn: 'Shillelagh',
    level: 0,
    school: '变化',
    castingTime: '附赠动作',
    range: '自身',
    components: 'V、S、M（槲寄生）',
    duration: '1分钟',
    description:
      '你将自然之力灌入手中持握的一根短棒或长棍中。你在法术持续时间内使用该武器进行近战攻击时，可以用你的施法属性代替力量属性来进行攻击检定和伤害掷骰，且该武器的伤害骰变为d8。此类攻击造成伤害时，你可以选择将其伤害类型改为力场伤害，或是维持武器原本的伤害类型。你再次施展该法术或丢掉该武器时，该法术也随之终止。',
    higherLevel: '戏法强化。 到达特定等级后，受术武器的伤害骰会改变：5级（1d10），11级（1d12），17级（2d6）。',
    classes: ['德鲁伊']
  },
  {
    id: 'sorcerous-burst',
    name: '术法爆发',
    nameEn: 'Sorcerous Burst',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你向施法距离内的一名生物或一个物件施展术法能量。对目标进行一次远程攻击检定，命中时，目标将受到1d8点伤害。由你选择法术造成何种类型的伤害：强酸，寒冷，火焰，闪电，毒素，心灵或雷鸣。\n如果你在此法术的任一d8骰上丢出了8，你便可以立刻再丢一枚d8，并将其加入此法术的伤害中。施展此法术时，你最多以此法造成的额外d8伤害骰数量等同于你的施法属性调整值。',
    higherLevel: '戏法强化。到达特定等级后，此戏法的初始伤害将增加1d8：5级（2d8）、11级（3d8）、17级（4d8）。',
    classes: ['术士']
  },
  {
    id: 'starry-wisp',
    name: '点点星芒',
    nameEn: 'Starry Wisp',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '60 尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你对施法距离内一名生物或一个物件射出一点光芒。对目标进行一次远程法术攻击。命中时，目标将受到1d8点光耀伤害，并且直到你的下个回合结束前，它会散发出10尺微光光照，且无法受益于隐形 状态。',
    higherLevel: '戏法强化。到达特定等级后，此戏法的伤害将增加1d8：5级（2d8），11 级（3d8），17 级1d8（4d8）。',
    classes: ['吟游诗人', '德鲁伊']
  },
  {
    id: 'thorn-whip',
    name: '荆棘之鞭',
    nameEn: 'Thorn Whip',
    level: 0,
    school: '变化',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S、M（一根带刺植物茎）',
    duration: '立即',
    description:
      '你创造出一条藤蔓般的带刺长鞭，并猛抽向施法距离内一个你指定的生物。对目标进行一次近战法术攻击，命中时，目标将受到1d6点穿刺伤害，如果目标生物的体型不超过大型，则你还可以将其朝你所在位置拉近至多10尺。',
    higherLevel: '戏法强化。到达特定等级后，此戏法的伤害将增加1d6：5级（2d6）、11级（3d6）、17级（4d6）。',
    classes: ['德鲁伊', '奇械师']
  },
  {
    id: 'thunderclap',
    name: '鸣雷破',
    nameEn: 'Thunderclap',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '自身',
    components: 'S',
    duration: '立即',
    description:
      '位于以你为原点5尺光环区域内的每名生物必须成功于一次体质豁免，否则受到1d6点雷鸣伤害。此法术会创造出在100尺内都能听见的巨大声响。',
    higherLevel: '戏法强化。到达特定等级后，此戏法的伤害将增加1d6：5级（2d6）、11级（3d6）、17级（4d6）。',
    classes: ['吟游诗人', '德鲁伊', '术士', '魔契师', '法师', '奇械师']
  },
  {
    id: 'toll-the-dead',
    name: '亡者丧钟',
    nameEn: 'Toll the Dead',
    level: 0,
    school: '死灵',
    castingTime: '动作',
    range: '60尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你对着施法距离内一名你可见的生物一指，随后目标10尺内响起一阵哀恸的钟鸣。目标必须通过一次感知豁免，否则将受到1d8点暗蚀伤害。若目标豁免失败时已损失任意数量生命值，则改为令其受到1d12点暗蚀伤害。',
    higherLevel:
      '戏法强化。到达特定等级后，此戏法的伤害骰将增加一枚：5级（2d8或2d12）、11级（3d8或3d12）、17级（4d8或4d12）。',
    classes: ['牧师', '魔契师', '法师']
  },
  {
    id: 'true-strike',
    name: '克敌先击',
    nameEn: 'True Strike',
    level: 0,
    school: '预言',
    castingTime: '动作',
    range: '自身',
    components: 'S、M（一把价值1+CP的你熟练的武器）',
    duration: '立即',
    description:
      '你受到一瞬魔法洞见的指引，使用施展此法术时使用的那把武器发动一次攻击。此次攻击使用你的施法属性（而非力量属性或敏捷属性）进行攻击检定与伤害掷骰。此次攻击造成伤害时，你可以选择将其伤害类型改为光耀伤害，或是维持武器原本的伤害类型。\n（译注：根据术语汇编武器攻击条目，“使用武器发动的攻击”就是“武器攻击”（与“法术攻击”并不冲突）。）',
    higherLevel:
      '戏法强化。到达特定等级后，无论你选择造成光耀伤害还是原本类型的伤害，本次攻击都会额外造成光耀伤害：5级（1d6）、11级（2d6）、17级（3d6）。',
    classes: ['吟游诗人', '术士', '魔契师', '法师', '奇械师']
  },
  {
    id: 'word-of-radiance',
    name: '光耀祷词',
    nameEn: 'Word of Radiance',
    level: 0,
    school: '塑能',
    castingTime: '动作',
    range: '自身',
    components: 'V、M（一枚艳阳标志）',
    duration: '立即',
    description:
      '灼热的光辉喷薄而出，覆盖你周身5尺光环区域。每个区域中你可见且受你选择的生物必须通过一次体质豁免，否则受到1d6点光耀伤害。',
    higherLevel: '戏法强化。到达特定等级后，此戏法的伤害将增加1d6：5级（2d6）、11级（3d6）、17级（4d6）。',
    classes: ['牧师']
  }
];

// 一环法术列表
export const FIRST_LEVEL_SPELLS: Spell[] = [
  // 牧师一环法术
  {
    id: 'bless',
    name: '祝福术',
    nameEn: 'Bless',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S、M（一枚价值5+GP的圣徽）',
    duration: '专注，至多1分钟',
    description: '你祝福施法范围内至多三个生物。在法术终止前，受术目标进行的每次攻击检定与豁免检定都将获得1d4的加值。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['牧师', '圣武士']
  },
  {
    id: 'cure-wounds',
    name: '疗伤术',
    nameEn: 'Cure Wounds',
    level: 1,
    school: '防护',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '立即',
    description: '你触碰的一名生物恢复等同于2d8+你施法属性调整值点生命值。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的治疗量就增加2d8点。',
    classes: ['吟游诗人', '牧师', '德鲁伊', '圣武士', '游侠', '奇械师']
  },
  {
    id: 'detect-magic',
    name: '侦测魔法',
    nameEn: 'Detect Magic',
    level: 1,
    school: '预言',
    castingTime: '动作或仪式',
    range: '自身',
    components: 'V、S',
    duration: '专注，至多10分钟',
    ritual: true,
    description:
      '在法术持续时间内，你感受到距你30尺内的魔法效应。若你感知到了此类效应，则你可以用一个魔法动作以看到任何带有该魔法效应的可见生物或物件周围环绕着微弱的灵光，且若该魔法效应属于被法术创造的效应，则你可分辨出其所属的魔法学派。\n此法术会被1尺厚的岩石、泥土或木头，1寸厚的金属，或薄薄一层铅阻隔。',
    classes: ['吟游诗人', '牧师', '德鲁伊', '圣武士', '游侠', '术士', '魔契师', '法师', '奇械师']
  },
  {
    id: 'guiding-bolt',
    name: '光导箭',
    nameEn: 'Guiding Bolt',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '1轮',
    description: '你向施法距离内的一名生物掷出一道光箭。对目标进行一次远程法术攻击。命中时，目标受4d6点光耀伤害。在你下个回合结束前，对目标发动的下一次攻击检定具有优势。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的伤害就增加1d6点。',
    classes: ['牧师']
  },
  {
    id: 'healing-word',
    name: '治愈真言',
    nameEn: 'Healing Word',
    level: 1,
    school: '防护',
    castingTime: '附赠动作',
    range: '60尺',
    components: 'V',
    duration: '立即',
    description: '你指定施法距离内一个你能看见的生物并恢复其生命值，恢复量等于2d4+你的施法属性调整值。',
    higherLevel: '升环施法。 使用的法术位每比一环高一环，此法术的治疗量就增加2d4点。',
    classes: ['牧师', '德鲁伊', '吟游诗人']
  },
  {
    id: 'inflict-wounds',
    name: '致伤术',
    nameEn: 'Inflict Wounds',
    level: 1,
    school: '死灵',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '立即',
    description: '你迫使触碰的一名生物进行体质豁免检定，豁免失败将受到 2d10 的暗蚀伤害，豁免成功则受到半数伤害。',
    higherLevel: '升环施法。你使用的法术位每比一环高一环，暗蚀伤害就增加1d10。',
    classes: ['牧师']
  },
  {
    id: 'sanctuary',
    name: '庇护术',
    nameEn: 'Sanctuary',
    level: 1,
    school: '防护',
    castingTime: '附赠动作',
    range: '30尺',
    components: 'V、S、M（一块镜子碎片）',
    duration: '1分钟',
    description:
      '你为施法距离内的一名生物施加守护。在法术终止前，当任何生物将受守护的生物定为其攻击检定或伤害性法术的目标时，该生物都必须成功通过一次感知豁免，否则该生物必须改为选定另一名生物作为新的目标或者失去本次的攻击或法术。不过此法术无法令受术者免受区域效应的影响。\n若受保护生物发动一次攻击，施展一道法术，或是造成任何伤害，则该法术随之终止。',
    classes: ['牧师', '奇械师']
  },
  {
    id: 'shield-of-faith',
    name: '虔诚护盾',
    nameEn: 'Shield of Faith',
    level: 1,
    school: '防护',
    castingTime: '附赠动作',
    range: '60 尺',
    components: 'V、S、M（一张祷文卷轴）',
    duration: '专注，至多 10 分钟',
    description: '一片闪着微光的能量场围绕着施法距离内你指定的一个生物，使目标在法术持续时间内AC获得+2 加值。',
    classes: ['牧师', '圣武士']
  },
  // 圣武士一环法术
  {
    id: 'heroism',
    name: '英雄气概',
    nameEn: 'Heroism',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '触及',
    components: 'V、S',
    duration: '专注，至多1分钟',
    description: '你触碰一个自愿生物使其充满勇气。该生物直至法术终止前免疫恐慌状态，且它将在其每回合开始时获得等同于你施法属性调整值的临时生命值。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['吟游诗人', '圣武士']
  },
  {
    id: 'searing-smite',
    name: '炽焰斩',
    nameEn: 'Searing Smite',
    level: 1,
    school: '塑能',
    castingTime: '附赠动作，当你使用近战武器或徒手打击命中一个目标后立即执行',
    range: '自身',
    components: 'V',
    duration: '1分钟',
    description:
      '被该次攻击检定命中的目标会在此次攻击中额外受到1d6火焰伤害。直至法术终止前，目标会在其每个回合开始时受到1d6点火焰伤害，并进行一次体质豁免。豁免失败则法术继续生效，成功则法术终止。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术造成的所有伤害都会增加1d6点。',
    classes: ['圣武士']
  },
  {
    id: 'thunderous-smite',
    name: '雷鸣斩',
    nameEn: 'Thunderous Smite',
    level: 1,
    school: '塑能',
    castingTime: '附赠动作，当你使用近战武器或徒手打击命中一个目标后立即执行',
    range: '自身',
    components: 'V',
    duration: '立即',
    description:
      '你的打击发出距你300尺内都能听见的雷鸣。被该次攻击检定命中的目标会在此次攻击中额外受到2d6点雷鸣伤害，如果目标是一名生物，则它必须成功于一次力量豁免，否则其被向着远离你的方向推离10尺并陷入倒地状态。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，伤害就提高1d6。',
    classes: ['圣武士']
  },
  // 法师一环法术
  {
    id: 'magic-missile',
    name: '魔法飞弹',
    nameEn: 'Magic Missile',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你创造三枚由魔法力场形成的闪光飞镖，并让每发飞镖袭向施法距离内你能看见的指定生物。每发飞镖对目标造成1d4+1点力场伤害。所有飞镖将同时袭向目标，而你还可以指定它们击中同一个目标或是分别击中几个目标。',
    higherLevel: '升环施法。 使用的法术位每比一环高一环，该法术就会多制造出一支飞镖。',
    classes: ['术士', '法师']
  },
  {
    id: 'shield',
    name: '护盾术',
    nameEn: 'Shield',
    level: 1,
    school: '防护',
    castingTime: '反应，当你被攻击命中或被作为魔法飞弹Magic Missile法术的目标时执行',
    range: '自身',
    components: 'V、S',
    duration: '1轮',
    description:
      '一道看不见的力场制护盾浮现在你身旁，保护着你。在你的下一回合开始前，你的 AC 具有+5 加值（在触发该法术的攻击之前生效），并且不会受到魔法飞弹Magic Missle的伤害。',
    classes: ['法师', '术士']
  },
  {
    id: 'sleep',
    name: '睡眠术',
    nameEn: 'Sleep',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '60 尺',
    components: 'V、S、M（一把细沙或玫瑰花瓣）',
    duration: '专注，至多1分钟',
    description:
      '以施法距离内一点为源点，5尺半径球状区域内每个你选择的生物都必须成功通过一次感知豁免否则直到其下个回合结束陷入失能状态。在其下个回合结束时，它必须重复此豁免。如果目标第二次豁免失败，目标在持续时间内陷入昏迷状态。若目标受到伤害或其5尺内有人用一个动作将其摇醒，目标身上的法术结束。\n不需要睡眠的生物（例如精灵）或免疫力竭状态的生物自动成功通过对抗此法术的豁免。',
    classes: ['吟游诗人', '术士', '法师'],
    source: 'D&D Beyond（基础规则 2024）',
    sourceUrl: 'https://www.dndbeyond.com/spells/2619064-sleep'
  },
  {
    id: 'chromatic-orb',
    name: '繁彩球',
    nameEn: 'Chromatic Orb',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '90 尺',
    components: 'V、S、M（一枚价值50GP+的钻石）',
    duration: '立即',
    description:
      '你向施法距离内某个目标掷出一颗能量球。从强酸、寒冷、火焰、闪电、毒素、雷鸣中选择一个作为创造出来的球体的伤害类型，然后对该目标发动一次远程法术攻击。命中时，该目标将受到 3d8 点你所选类型的伤害。\n如果你的d8骰中有两枚（或更多）投出了相同的数字，能量球将会从原目标跃向其周围30尺内由你所选择的另一个目标。你需要对新目标再进行一次攻击检定，然后进行一次新的伤害掷骰。能量球无法再次进行此种跳跃，除非你施展此法术时使用了环阶2+的法术位。\n升环施法。使用的法术位每高一环，法术的伤害就增加1d8。能量球能够跳跃的最大次数等同于所消耗的法术位环阶，但每次施展此法术时，每名生物只能被指定为此法术目标一次。',
    classes: ['术士', '法师']
  },
  {
    id: 'mage-armor',
    name: '法师护甲',
    nameEn: 'Mage Armor',
    level: 1,
    school: '防护',
    castingTime: '动作',
    range: '触及',
    components: 'V、S、M（一块鞣制过的皮革）',
    duration: '8小时',
    description: '你触碰一个未着装护甲的自愿生物。直至法术终止前，目标的基础AC变为 13+它的敏捷调整值。当目标穿上护甲时，此法术将提前终止。',
    classes: ['术士', '法师']
  },
  // 术士一环法术
  {
    id: 'burning-hands',
    name: '燃烧之手',
    nameEn: 'Burning Hands',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '自身（15尺锥形）',
    components: 'V、S',
    duration: '立即',
    description:
      '你向前喷射出一片火焰。处于15尺锥状区域内的生物必须进行一次敏捷豁免。豁免失败者受到3d6火焰伤害，豁免成功者受到一半伤害。\n在此锥状区域内的未被着装或携带的易燃物件会开始燃烧。\n升环施法。你使用的法术位每比一环高一环，此法术的伤害就会提升1d6。',
    classes: ['术士', '法师']
  },
  {
    id: 'charm-person',
    name: '魅惑类人',
    nameEn: 'Charm Person',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S',
    duration: '1小时',
    description:
      '选择法术距离内你可见的一名类人生物，迫使该生物进行一次感知豁免，如果你或者你的同伴正在与它战斗，它进行的这次豁免将具有优势。如果它豁免失败，它陷入魅惑状态直到法术结束，或者直到你或你的同伴对它造成伤害。被魅惑的生物将对你友好。在法术结束时，生物会知道它曾被你魅惑。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['吟游诗人', '德鲁伊', '术士', '魔契师', '法师']
  },
  {
    id: 'expeditious-retreat',
    name: '脚底抹油',
    nameEn: 'Expeditious Retreat',
    level: 1,
    school: '变化',
    castingTime: '附赠动作',
    range: '自身',
    components: 'V、S',
    duration: '专注，至多10分钟',
    description: '你执行疾走动作，且直到法术结束为止，你均能使用附赠动作执行疾走 动作。',
    classes: ['术士', '魔契师', '法师', '奇械师']
  },
  // 魔契师一环法术
  {
    id: 'armor-of-agathys',
    name: '黯冰狱铠',
    nameEn: 'Armor of Agathys',
    level: 1,
    school: '防护',
    castingTime: '附赠动作',
    range: '自身',
    components: 'V、S、M（一块蓝色玻璃碎片）',
    duration: '1小时',
    description:
      '防护性的魔法寒霜包裹着你。 你获得5临时生命值 。在法术结束之前，若有生物以近战攻击检定命中你，该生物将受到5寒冷伤害。此法术会在你不具有临时生命值时提前结束。',
    higherLevel: '升环施法。 你使用的法术位每比一环高一环，临时生命和寒冷伤害就各提升5。',
    classes: ['邪术师', '魔契师']
  },
  {
    id: 'hex',
    name: '脆弱诅咒',
    nameEn: 'Hex',
    level: 1,
    school: '惑控',
    castingTime: '附赠动作',
    range: '90尺',
    components: 'V、S、M（一只风干的蝾螈眼）',
    duration: '专注，至多1小时',
    description:
      '你对施法距离内一个你能看见的一个生物施加诅咒。直到法术终止前，你对命中该目标的任意攻击都将额外造成1d6点暗蚀伤害。此外，你在施展该法术时选择一项属性，使该目标进行所选属性的属性检定时具有劣势 。\n如果目标在法术终止前 HP 降至 0，则你可以在法术终止前后续的某一回合中使用一个附赠动作 诅咒另一个生物。',
    higherLevel:
      '升环施法。 使用二环法术位施展该法术时，其专注可以维持至多4小时。使用三环或四环法术位施展该法术时，其专注可以维持至多8小时。使用环阶5+的法术位施展该法术时，其专注可以维持至多 24 小时。',
    classes: ['邪术师', '魔契师']
  },
  // 吟游诗人一环法术
  {
    id: 'faerie-fire',
    name: '妖火',
    nameEn: 'Faerie Fire',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '60尺',
    components: 'V',
    duration: '专注，至多1分钟',
    description:
      '施法距离内一处20尺立方区域内每个物件的轮廓都将被蓝色、绿色、或紫色的光芒所勾勒（颜色由你指定）。区域内的生物则必须进行一次敏捷豁免，豁免失败时也会被彩色光芒勾勒出轮廓。受术物件和生物在法术持续时间内发出10尺半径的微光光照 。\n受术生物或物件无法受益于隐形状态，且任何能看见他们的攻击者对其发动的攻击检定具有优势。',
    classes: ['吟游诗人', '德鲁伊', '奇械师']
  },
  {
    id: 'thunderwave',
    name: '雷鸣波',
    nameEn: 'Thunderwave',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '自身',
    components: 'V、S',
    duration: '立即',
    description:
      '你释放出一道雷鸣能量。在以你为源点15尺立方区域内的每名生物必须进行一次体质豁免。豁免失败者将受到2d8点雷鸣伤害，并被向远离你的方向推离10尺。豁免成功则只受一半伤害。\n此外，所有完全位于该区域内且未被固定住的物件都将被推离10尺。该法术还会发出距你300尺内都能听见的雷霆巨响。\n升环施法。使用的法术位每比一环高一环，伤害就提高1d8。',
    classes: ['吟游诗人', '德鲁伊', '术士', '法师']
  },
  // 其他一环法术（来自中文规则文档）
  {
    id: 'alarm',
    name: '警报术',
    nameEn: 'Alarm',
    level: 1,
    school: '防护',
    castingTime: '1 分钟或仪式',
    range: '30 尺',
    components: 'V、S、M（一个小铃铛和一小段银线）',
    duration: '8 小时',
    ritual: true,
    description:
      '你设置一个针对不速之客的警报。在施法距离内指定一扇门窗或选择一个边长不大于20 尺的立方区域。在法术持续时间内，任何触碰或进入被法术保护区域的生物都会触发警报。施法时，你可以决定哪些生物不会触发警报，还可以选择警报方式为声音警报或是精神警报。\n\n声音警报Audible Alarm。警报将在其保护区域 60 尺范围内响起持续 10 秒的摇铃声。\n精神警报Mental Alarm。 如果你距离目标区域不超过 1 里，警报会在你脑海中会传来“乒”的警报声。如果你在睡觉，则警报将使你惊醒。',
    classes: ['游侠', '法师', '奇械师']
  },
  {
    id: 'animal-friendship',
    name: '化兽为友',
    nameEn: 'Animal Friendship',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '30 尺',
    components: 'V、S、M（一点食物）',
    duration: '24 小时',
    description:
      '在施法距离内指定一只你能看见的野兽。该野兽必须通过一次感知豁免，否则在法术持续时间内陷入魅惑状态。如果你或你的盟友对目标造成伤害，法术将提前终止。',
    higherLevel: '升环施法。你使用的法术位每比一环高一环，就可以多选择一个野兽作为目标。',
    classes: ['吟游诗人', '德鲁伊', '游侠']
  },
  {
    id: 'arms-of-hadar',
    name: '哈达之臂',
    nameEn: 'Arms of Hadar',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '自身',
    components: 'V、S',
    duration: '立即',
    description:
      '你祈唤哈达的力量，让触须从你身上蔓延而出。以你为源点的10尺光环 区域内，每个生物都必须进行一次力量豁免。豁免失败的生物将受到2d6点暗蚀伤害，并其直到下一回合前都无法执行反应。豁免成功的生物仅受到一半伤害。',
    higherLevel: '升环施法。 你使用的法术位每比一环高一环，法术的伤害就增加1d6点。',
    classes: ['邪术师', '魔契师']
  },
  {
    id: 'bane',
    name: '灾祸术',
    nameEn: 'Bane',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S、M（一滴血）',
    duration: '专注，至多1分钟',
    description:
      '你选择施法距离内至多三个你可见的生物，迫使其分别进行一次魅力豁免。在法术终止前，豁免失败于此次魅力豁免的目标进行的每次攻击检定与豁免检定都必须承受1d4的减值。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['吟游诗人', '牧师', '魔契师']
  },
  {
    id: 'color-spray',
    name: '七彩喷射',
    nameEn: 'Color Spray',
    level: 1,
    school: '幻术',
    castingTime: '动作',
    range: '自身',
    components: 'V、S、M（一撮彩色沙子）',
    duration: '立即',
    description:
      '你射出一道炫目的闪耀彩光。以你为源点的15尺锥状区域内的每个生物必须成功通过一次体质豁免，否则陷入目盲状态，持续至下个你的回合结束。',
    classes: ['吟游诗人', '术士', '法师']
  },
  {
    id: 'command',
    name: '命令术',
    nameEn: 'Command',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '60 尺',
    components: 'V',
    duration: '立即',
    description:
      '你对施法距离内一个你能看见的生物说出一个单词的命令。目标生物必须通过一次感知豁免，否则在它自己的下一回合中，其必须服从这道命令行事。从以下选项中选择一条命令：\n\n过来Approach。目标以最短最直接的路线向你移动，若其到达你5尺范围内，其会结束自己的回合。\n放下Drop。目标放下持握的任何东西，然后结束自己的回合。\n走开Flee。目标消耗其整个回合，以最快最有效的方式远离你。\n趴下Grovel。目标陷入倒地状态并结束自己的回合。\n立定Halt。在其回合内，目标不进行移动且不作任何动作和附赠动作。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['吟游诗人', '牧师', '圣武士']
  },
  {
    id: 'compelled-duel',
    name: '强令对决',
    nameEn: 'Compelled Duel',
    level: 1,
    school: '惑控',
    castingTime: '附赠动作',
    range: '30 尺',
    components: 'V',
    duration: '专注，至多 1 分钟',
    description:
      '你尝试强令一名生物与你决斗。选择施法距离内一名你可见的生物，该生物必须成功通过一次感知豁免，豁免失败则，该生物对除你之外任何生物进行攻击检定时都具有劣势，且该生物不能自主移动到距离你超过30尺的位置。\n当你攻击另一名生物时，当你对另一名敌对生物施展法术时，当一名你的盟友对该目标造成伤害或者对其施展伤害性法术时，又或者你在距离该目标超过 30 尺的位置结束你的回合时，该法术提前终止。',
    classes: ['圣武士']
  },
  {
    id: 'comprehend-languages',
    name: '通晓语言',
    nameEn: 'Comprehend Languages',
    level: 1,
    school: '预言',
    castingTime: '动作或仪式',
    range: '自身',
    components: 'V、S、M（一撮煤灰和盐）',
    duration: '1 小时',
    ritual: true,
    description:
      '你在法术持续时间内知晓你所听到或看到手语的所有语言的字面意义。你也可以通过触碰书写的文字来读懂其字面意义。以这种方式阅读每页文字需要花费 1 分钟的时间。这个法术并不能解读符号和暗语。',
    classes: ['吟游诗人', '术士', '魔契师', '法师']
  },
  {
    id: 'create-or-destroy-water',
    name: '造水术/枯水术',
    nameEn: 'Create or Destroy Water',
    level: 1,
    school: '变化',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S、M（水沙混合物）',
    duration: '立即',
    description:
      '你选择其一执行：\n\n造水术Create Water。你在施法距离内一个打开的容器中创造至多10加仑干净的水。作为另一种选项，你使施法距离内一处30尺的立方区域降下雨水并浇灭区域内不受遮盖的火焰。\n枯水术Destroy Water。你使施法距离内一个打开的容器里至多10加仑水枯竭不见。作为另一种选项，你使施法距离内一片30尺立方 区域的浓雾消失不见。',
    higherLevel:
      '升环施法。 使用的法术位每比一环高一环，法术就多创造或多枯竭10加仑额外的水分，另一种选项能影响的立方 区域边长增加5尺。',
    classes: ['牧师', '德鲁伊']
  },
  {
    id: 'detect-evil-and-good',
    name: '侦测善恶',
    nameEn: 'Detect Evil and Good',
    level: 1,
    school: '预言',
    castingTime: '动作',
    range: '自身',
    components: 'V、S',
    duration: '专注，至多10分钟',
    description:
      '在法术持续时间内，你定位距你30尺内任何异怪、天族、元素、妖精、邪魔、亡灵。你也可以感知到范围内是否具有激活的圣居Hallow并确定其位置。\n此法术会被1尺厚的岩石、泥土或木头，1寸厚的金属，或薄薄一层铅阻隔。',
    classes: ['牧师', '圣武士']
  },
  {
    id: 'detect-poison-and-disease',
    name: '侦测毒性和疾病',
    nameEn: 'Detect Poison and Disease',
    level: 1,
    school: '预言',
    castingTime: '动作或仪式',
    range: '自身',
    components: 'V、S、M（一片紫杉叶）',
    duration: '专注，至多10分钟',
    ritual: true,
    description:
      '在法术持续时间内，你定位距你30尺内的毒药、有毒生物和魔法疫病。你可以感知到毒药、有毒生物和疫病的种类。\n此法术会被1尺厚的岩石、泥土或木头，1寸厚的金属，或薄薄一层铅阻隔。',
    classes: ['牧师', '德鲁伊', '圣武士', '游侠']
  },
  {
    id: 'disguise-self',
    name: '易容术',
    nameEn: 'Disguise Self',
    level: 1,
    school: '幻术',
    castingTime: '动作',
    range: '自身',
    components: 'V、S',
    duration: '1小时',
    description:
      '你改变自身以及随身的衣物、护甲、武器等在你身上的所有物。该效应在法术终止时结束。肉眼看来你的身高可以有1尺的增减，体态可胖可瘦。你必须选择一个和你肢体基础排列方式一致的形态。此外，幻术的影响范围由你决定。\n此法术产生的变化无法应对物理检查。比如，你用此法术添了一顶帽子，那么现实物件会从帽子穿过去，且任何触碰帽子的人将摸不到任何东西。\n如果一名生物想要分辨你是否易容，则必须使用一个研究动作研究你的外貌，并成功于一次对抗你法术豁免DC的智力（调查）检定。',
    classes: ['吟游诗人', '术士', '法师', '奇械师']
  },
  {
    id: 'dissonant-whispers',
    name: '不谐低语',
    nameEn: 'Dissonant Whispers',
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '60尺',
    components: 'V',
    duration: '立即',
    description:
      '一名施法距离内你选择的可见生物的心灵中听见一段不协和旋律。目标进行一次感知豁免。豁免失败则受到3d6点心灵伤害，并立即执行其反应（若可用）尽可能往远离你的方向移动，并采取最安全的路径。豁免成功则只受一半伤害。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，伤害就提高1d6。',
    classes: ['吟游诗人']
  },
  {
    id: 'divine-favor',
    name: '神恩',
    nameEn: 'Divine Favor',
    level: 1,
    school: '变化',
    castingTime: '附赠动作',
    range: '自身',
    components: 'V、S',
    duration: '1分钟',
    description: '直到法术结束之前，你使用武器的攻击在命中时造成额外1d4点光耀伤害。',
    classes: ['圣武士']
  },
  {
    id: 'divine-smite',
    name: '至圣斩',
    nameEn: 'Divine Smite',
    level: 1,
    school: '塑能',
    castingTime: '附赠动作，当你使用近战武器或徒手打击命中一个生物后立即执行',
    range: '自身',
    components: 'V',
    duration: '立即',
    description:
      '被该次攻击检定命中的目标会在此次攻击中额外受到2d8点光耀伤害。若目标为邪魔生物或亡灵生物，则此伤害增加1d8。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的伤害就提高1d8。',
    classes: ['圣武士']
  },
  {
    id: 'ensnaring-strike',
    name: '捕获打击',
    nameEn: 'Ensnaring Strike',
    level: 1,
    school: '咒法',
    castingTime: '附赠动作，在你用武器命中目标后立即可用',
    range: '自身',
    components: 'V',
    duration: '专注，至多1分钟',
    description:
      '你命中目标时，目标身上出现一根紧紧将其攫住的藤蔓，使其进行一次力量豁免，大型及更大体型的生物进行该豁免时具有优势。豁免失败，则目标将直到法术结束为止陷入束缚状态。豁免成功，则藤蔓立即枯萎，法术结束。\n处于束缚状态期间，目标在其每回合开始受到1d6点穿刺伤害。目标或其他位于其触及内的生物可用一个动作进行一次对抗法术豁免DC的力量（运动）检定。检定成功则法术结束。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的伤害就提高1d6点。',
    classes: ['游侠']
  },
  {
    id: 'entangle',
    name: '纠缠术',
    nameEn: 'Entangle',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '90尺',
    components: 'V、S',
    duration: '专注，至多1分钟',
    description:
      '缠绕的植物在施法距离内从20尺方状区域地面中破土而出。在法术持续时间内，这片被植物覆盖的区域变为困难地形 。法术结束时，这些植物会消失。\n在你施展法术时，该区域内的生物（除你之外）必须成功于一次力量豁免，否则陷入束缚状态，直到法术终止。一名因此被束缚的生物可以用其动作进行一次力量（运动）检定对抗该法术的豁免DC。检定成功则成功摆脱缠绕在其身上的藤蔓并不再被其束缚。',
    classes: ['德鲁伊', '游侠']
  },
  {
    id: 'false-life',
    name: '虚假生命',
    nameEn: 'False Life',
    level: 1,
    school: '死灵',
    castingTime: '动作',
    range: '自身',
    components: 'V、S、M（一滴酒精）',
    duration: '立即',
    description: '你获得2d4+4点临时生命值。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，其给予的临时生命值就增加5。',
    classes: ['术士', '法师', '奇械师']
  },
  {
    id: 'feather-fall',
    name: '羽落术',
    nameEn: 'Feather Fall',
    level: 1,
    school: '变化',
    castingTime: '反应，你或距你60尺内的可见生物坠落时可用',
    range: '60尺',
    components: 'V、M（一小根羽毛或一块羽绒）',
    duration: '1分钟',
    description:
      '指定施法距离内至多五个正坠落的生物。受术生物的坠落速度在法术持续时间内降低至每回合60尺。如果该生物在法术终止前落地，则其不会受到任何坠落伤害，且着地后法术对该生物的效应随即终止。',
    classes: ['吟游诗人', '术士', '法师', '奇械师']
  },
  {
    id: 'fog-cloud',
    name: '云雾术',
    nameEn: 'Fog Cloud',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '120尺',
    components: 'V、S',
    duration: '专注，至多1小时',
    description:
      '你以施法距离内一点为中心创造一片半径20尺的球状浓雾。球状区域被重度遮蔽。浓雾持续至法术持续时间结束，被强风（比如造风术Gust of Wind创造的风）吹散时法术也将提前结束。',
    higherLevel: '升环施法。 使用的法术位每比一环高一环，浓雾的半径就增加20尺。',
    classes: ['德鲁伊', '游侠', '术士', '法师']
  },
  {
    id: 'goodberry',
    name: '神莓术',
    nameEn: 'Goodberry',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '自身',
    components: 'V、S、M（一根槲寄生）',
    duration: '24小时',
    description:
      '10颗浆果出现在你手里。果子在法术持续时间内充满魔法。一名生物可以用一个附赠动作 吃下一颗浆果。吃掉一颗浆果者恢复1生命值，且一枚浆果就可以满足该生物一整天的营养需求。\n法术结束时还没有被吃掉的浆果会消失。',
    classes: ['德鲁伊', '游侠']
  },
  {
    id: 'grease',
    name: '油腻术',
    nameEn: 'Grease',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '60尺',
    components: 'V、S、M（一块猪皮或黄油）',
    duration: '1分钟',
    description:
      '你在施法距离内指定一点，光滑的不可燃油脂以该点为中心覆盖一处10尺的方状区域。在法术持续时间内。该区域变为困难地形 。\n油脂出现时，站在其范围内的每个生物必须成功通过一次敏捷豁免，否则陷入倒地状态。进入该区域或在区域内结束其回合的生物也必须进行该敏捷豁免，豁免失败则陷入倒地。',
    classes: ['术士', '法师', '奇械师']
  },
  {
    id: 'hail-of-thorns',
    name: '荆棘之雨',
    nameEn: 'Hail of Thorns',
    level: 1,
    school: '咒法',
    castingTime: '1附赠动作，在你使用远程武器命中一个生物时紧接可用',
    range: '自身',
    components: 'V',
    duration: '立即',
    description:
      '当你攻击命中生物时，法术会从你的远程武器或弹药中创造出棘刺，并形成一片棘刺之雨。目标和在目标周围5尺内每个生物必须进行一次敏捷豁免检定，豁免失败者将受到 1d10 点穿刺伤害，豁免成功则受到一半伤害。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的伤害就增加 1d10。',
    classes: ['游侠']
  },
  {
    id: 'hellish-rebuke',
    name: '炼狱叱喝',
    nameEn: 'Hellish Rebuke',
    level: 1,
    school: '塑能',
    castingTime: '反应，当你受到来自60尺内你可见生物的伤害时执行。',
    range: '60尺',
    components: 'V、S',
    duration: '立即',
    description:
      '伤害你的生物立刻被绿色的烈焰席卷。该生物必须进行一次敏捷豁免，豁免失败则受到2d10点火焰伤害，豁免成功则受到一半伤害。',
    higherLevel: '升环施法。 使用的法术位每比一环高一环，此法术的伤害就增加1d10点。',
    classes: ['邪术师', '魔契师']
  },
  {
    id: 'hunters-mark',
    name: "猎人印记",
    nameEn: "Hunter's Mark",
    level: 1,
    school: '预言',
    castingTime: '附赠动作',
    range: '90尺',
    components: 'V',
    duration: '专注，至多1小时',
    description:
      '你指定施法距离内一个你能看见的生物并以魔法标记其作为你的猎物。直至法术终止前，你每次以任何攻击命中该目标时都会额外造成1d6点力场伤害，且每当你为寻找目标生物而进行感知（察觉或生存）检定时都具有优势 。\n如果在法术结束前目标 HP 降至 0，则你可以用附赠动作 将标记转移至施法距离内的另一个可见生物。',
    higherLevel:
      '升环施法。使用三环或四环法术位施展该法术时，其专注可以维持至多8小时。使用环阶5+的法术位施展该法术时，其专注可以维持至多 24 小时。',
    classes: ['游侠']
  },
  {
    id: 'ice-knife',
    name: '冰刃',
    nameEn: 'Ice Knife',
    level: 1,
    school: '咒法',
    castingTime: '动作',
    range: '60尺',
    components: 'S、M（一滴水或一块冰）',
    duration: '立即',
    description:
      '你制造出一块冰晶裂片，并将它射向施法距离内的一个生物。你对目标进行一次远程法术攻击。若击中，目标受到 1d10 点穿刺伤害。无论击中与否，裂片都会在那之后立刻爆裂。攻击目标和其5尺范围内的每名生物都必须通过一次敏捷豁免检定，否则将受到 2d6 点寒冷伤害。',
    higherLevel: '升环施法。 你使用的法术位每比一环高一环，寒冷伤害就增加1d6。',
    classes: ['德鲁伊', '术士', '法师']
  },
  {
    id: 'jump',
    name: '跳跃术',
    nameEn: 'Jump',
    level: 1,
    school: '变化',
    castingTime: '附赠动作',
    range: '触碰',
    components: 'V、S、M（一只蚱蜢的后腿）',
    duration: '1分钟',
    description:
      '你触碰一个自愿生物。在法术结束前，每该生物他的回合内一次，其可以消耗10尺移动力来跳跃至多30尺距离。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['德鲁伊', '游侠', '术士', '法师', '奇械师']
  },
  {
    id: 'longstrider',
    name: '大步奔行',
    nameEn: 'Longstrider',
    level: 1,
    school: '变化',
    castingTime: '动作',
    range: '触碰',
    components: 'V、S、M（一撮泥土）',
    duration: '1 小时',
    description: '你触碰一个生物，该目标的速度增加10尺，直至法术结束。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外指定一个目标。',
    classes: ['吟游诗人', '德鲁伊', '游侠', '法师', '奇械师']
  },
  {
    id: 'protection-from-evil-and-good',
    name: '防护善恶',
    nameEn: 'Protection from Evil and Good',
    level: 1,
    school: '防护',
    castingTime: '动作',
    range: '触碰',
    components: 'V、S、M（一瓶25GP+的圣水，作为此法术的耗材）',
    duration: '专注，至多10分钟',
    description:
      '法术结束前，你使触碰的一名自愿生物获得针对下述生物类型的防护：异怪、天族、元素、妖精、邪魔、亡灵。\n此防护提供下述几种增益。上述生物类型的生物对目标的攻击检定具有劣势。目标不能被其附身，也不会因其陷入魅惑或恐慌状态。如果目标已经被具有上述生物类型的生物附身，或其魅惑或恐慌状态影响，目标后续进行的相关效应的豁免检定也将具有优势。',
    classes: ['牧师', '德鲁伊', '圣武士', '魔契师', '法师']
  },
  {
    id: 'purify-food-and-drink',
    name: '净化饮食',
    nameEn: 'Purify Food and Drink',
    level: 1,
    school: '变化',
    castingTime: '动作或仪式',
    range: '10尺',
    components: 'V、S',
    duration: '立即',
    ritual: true,
    description: '以施法距离内一点为中心，你移除半径5尺球状 区域内非魔法食物与饮品中的毒素和腐败。',
    classes: ['牧师', '德鲁伊', '圣武士', '奇械师']
  },
  {
    id: 'ray-of-sickness',
    name: '致病射线',
    nameEn: 'Ray of Sickness',
    level: 1,
    school: '死灵',
    castingTime: '动作',
    range: '60尺',
    components: 'V、S',
    duration: '立即',
    description:
      '你朝施法距离内一名生物射出一道绿色射线。对目标进行一次远程法术攻击。若命中，则目标受到2d8点毒素伤害且陷入中毒状态，持续至你的下一回合结束。',
    higherLevel: '升环施法。 使用的法术位每比一环高一环，此法术的伤害就增加1d8点。',
    classes: ['术士', '法师']
  },
  {
    id: 'silent-image',
    name: '无声幻影',
    nameEn: 'Silent Image',
    level: 1,
    school: '幻术',
    castingTime: '动作',
    range: '60 尺',
    components: 'V、S、M（少量羊毛）',
    duration: '专注，至多 10 分钟',
    description:
      '你创造一个影像，其形象来自一个大小不超过边长 15 尺立方体的物件，生物或其他的可视现象。影像出现在施法距离内的一处位置并在法术持续时间内持续存在。该影像是纯粹的视觉影像；它不会被听觉，嗅觉或其他感官感受到。\n你可以使用魔法动作将影像移动到施法距离内的另一个位置。影像改变位置时，你可以改变影像的外观使其移动得更自然。例如，如果你创造了一个生物的影像并移动它，则你可以改变影像，使它看起来就像是在走路。\n由于影像无法被碰到，任何与该影像进行的物理互动都会暴露其幻象的本质。一个生物使用研究动作调查影像时，它可以进行一次对抗法术豁免 DC 的智力（调查）检定。辨出幻象的生物可以看破该影像，在该生物看来会透过影像看到其背后的事物。',
    classes: ['吟游诗人', '术士', '法师']
  },
  {
    id: 'speak-with-animals',
    name: '动物交谈',
    nameEn: 'Speak with Animals',
    level: 1,
    school: '预言',
    castingTime: '动作或仪式',
    range: '自身',
    components: 'V、S',
    duration: '10 分钟',
    ritual: true,
    description:
      '你在法术持续时间内获得理解野兽生物并用语言与其沟通的能力，并且你可以对它们使用交涉动作时任何技能选项都可以适用。\n大多数野兽在谈及和生存与伙伴无关的话题时能说的很少，但至少，一只野兽能够给你提供周遭的地点和怪物的情报，包括任何它们近一日内察觉到过的东西。',
    classes: ['吟游诗人', '德鲁伊', '游侠', '魔契师']
  },
  {
    id: 'tashas-hideous-laughter',
    name: "塔莎狂笑术",
    nameEn: "Tasha's Hideous Laughter",
    level: 1,
    school: '惑控',
    castingTime: '动作',
    range: '30尺',
    components: 'V、S、M（一块甜馅饼和一根羽毛）',
    duration: '专注，至多1分钟',
    description:
      '施法距离内你可见的一名生物进行一次感知豁免。豁免失败，目标在持续时间内陷入失能和倒地状态。在此期间，目标会不受控制地狂笑（只要它能够发笑），且无法结束自身的倒地状态。\n目标在其每回合结束或受到伤害时，可以再进行一次感知豁免。如果豁免是因受到伤害所致，则该次豁免具有优势。豁免成功时，法术终止。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，你就可以额外选择一个生物作为目标。',
    classes: ['吟游诗人', '魔契师', '法师']
  },
  {
    id: 'witch-bolt',
    name: '巫术箭',
    nameEn: 'Witch Bolt',
    level: 1,
    school: '塑能',
    castingTime: '动作',
    range: '60尺',
    components: 'V、S、M（一根被闪电击中的树枝）',
    duration: '专注，至多1分钟',
    description:
      '一支缠绕着碎裂魔力的蓝色能量长矛射向施法距离内的一个生物，并在你与目标之间生成一道持久的闪电弧。对目标进行一次远程法术攻击。若命中，则目标受到2d12点闪电伤害。\n无论首次攻击是否命中，在你接下来的每个回合中，你都可以用附赠动作直接对目标造成1d12点闪电伤害。\n此外，如果目标与你之间的距离超出了法术的施法距离，或者目标相对你而言处于全身掩护状态，法术将提前终止。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，此法术的初始伤害就提高1d12。',
    classes: ['术士', '邪术师', '魔契师', '法师']
  },
  {
    id: 'wrathful-smite',
    name: '激愤斩',
    nameEn: 'Wrathful Smite',
    level: 1,
    school: '死灵',
    castingTime: '附赠动作，当你使用近战武器或徒手打击命中一个生物后立即执行',
    range: '自身',
    components: 'V',
    duration: '1分钟',
    description:
      '被该次攻击检定命中的目标会在此次攻击中额外受到1d6点暗蚀伤害，并且目标必须通过一次感知豁免检定，否则直到法术结束为止陷入恐慌状态。在自己的每回合结束时，被恐慌的目标可以重复此豁免，成功则结束该法术对自身的影响。',
    higherLevel: '升环施法。使用的法术位每比一环高一环，伤害就提高1d6。',
    classes: ['圣武士']
  },
  {
    id: 'find-familiar',
    name: '寻获魔宠',
    nameEn: 'Find Familiar',
    level: 1,
    school: '咒法',
    castingTime: '1小时或仪式',
    range: '10尺',
    components: 'V、S、M（价值10+GP的焚香，作为法术耗材）',
    duration: '立即',
    ritual: true,
    description:
      '你获得一只为你服务的魔宠，魔宠精魄可以采用下述你选择的动物形态之一：蝙蝠Bat、猫Cat、蛙Frog、隼Hawk、蜥蜴Lizard、章鱼Octopus、猫头鹰Owl、鼠Rat、渡鸦Raven、蜘蛛Spider、鼬Weasel，你也可以选择其他挑战等级为0的野兽作为魔宠的形态。魔宠出现在施法距离内一处未被占据的空间，虽然有着所选的生物属性数据，但其生物类型为天族、妖精、邪魔之一（由你选择）而非野兽。你的魔宠可脱离你独立行动，不过它会一直遵循你的命令行事。\n心灵连接Telepathic Connection。你的魔宠距你100尺内期间，你可以与其进行心灵交流。此外，你还能够以一个附赠动作将自己的视觉和听觉切换到魔宠的感官，并一持续至你下一回合开始。在此期间，你同时享有该魔宠自身的特殊感官。\n最后，当你施展施法距离为触碰的法术时，你的魔宠可以帮你传递这道触碰法术。此时你的魔宠必须距你100尺内，且在你施展这道法术时你的魔宠需要执行一个反应才能将其传递。\n战斗Combat。魔宠是你和你盟友的盟友。战斗时，它为自己骰先攻，并在自己回合里行动。魔宠无法攻击，但是它能如常执行其他动作。\n魔宠的消失Disappearance of the Familiar。当魔宠生命值降至0点时，它会消失。它会在你再次施展此法术后重新出现。你可以用一个魔法动作，暂时解散你的魔宠，将其送入一个口袋位面。你也可以选择永久解散它。暂时解散时，你可以用一个魔法动作使其重新出现于距你30尺内任意未占空间中。当魔宠生命值归0或消失进入了口袋位面时，它都会将自己穿着或携带的任何物品留在自己曾占据的空间中。\n独一无二One Familiar Only。你在同一时间不能拥有多于一只魔宠。如果你在已拥有一只魔宠期间施展此法术，作为替代，你会使其采用一个新的符合条件的形态。',
    classes: ['法师']
  },
  {
    id: 'identify',
    name: '鉴定术',
    nameEn: 'Identify',
    level: 1,
    school: '预言',
    castingTime: '1分钟或仪式',
    range: '触碰',
    components: 'V、S、M（一颗价值100GP+的珍珠）',
    duration: '立即',
    ritual: true,
    description:
      '你需要在施法过程中与某个物件保持接触。如果该物件是魔法物品之类的魔法性物件，你将知晓其属性和使用方式，以及了解是否需要同调、剩余多少充能数（若其有）。你还可以发现是否有法术正影响着该物件，以及这些法术具体是什么。如果该物件是由法术创造出来的物件，你将知晓该法术的名称。\n你也可以改为在施法过程中一直接触一名生物，而你将知晓正在影响该生物的那些法术（若有）是哪些法术。',
    classes: ['吟游诗人', '法师', '奇械师']
  },
  {
    id: 'illusory-script',
    name: '迷幻手稿',
    nameEn: 'Illusory Script',
    level: 1,
    school: '幻术',
    castingTime: '1分钟或仪式',
    range: '触碰',
    components: 'V、S、M（价值 10+GP 的墨水，作为法术耗材）',
    duration: '10日',
    ritual: true,
    description:
      '你在羊皮纸，纸张或是其他适合书写的材质上书写文字并对其施加一个强力的幻象。其效应将持续至法术终止。\n文件对于你和你施法时所指定的生物而言是一份普通的文件，文件内容即是以你的笔迹传达你写下手稿时想要传达的一切意义。而对于所有其他阅读者而言，该文件看起来就像由难懂的未知文字或魔法文字所书写。此外，你还可以使该文件呈现出完全不同的信息，使其看起来是用另一种笔迹或者语言所书写，不过你必须懂得该语言。\n如果法术被解除，则幻象和原始手稿一同消失不见。\n拥有真实视觉的生物可以读出其内被隐藏的信息。',
    classes: ['吟游诗人', '法师']
  },
  {
    id: 'tensers-floating-disk',
    name: '谭森浮碟术',
    nameEn: "Tenser's Floating Disk",
    level: 1,
    school: '咒法',
    castingTime: '动作或仪式',
    range: '30尺',
    components: 'V、S、M（一滴汞）',
    duration: '1小时',
    ritual: true,
    description:
      '指定施法距离内一处你可见的未占空间，并在该处创造一个圆盘状的碟型水平力场。浮碟直径3尺，厚1寸，悬浮在离地3尺的空中。其可以在法术持续时间内持续存在，并至多可负载500磅重量。如果放在浮碟上的物件重量超过500磅，则该法术终止，浮碟上的所有东西也将掉落至地上。\n浮碟距你20尺内时静止不动。只要你与其距离超过20尺，浮碟就会跟随你移动，并保持在距你20尺范围内。浮碟可以自由跨越崎岖地形、上下阶梯、斜坡面、诸如此类的地面，但它不能越过高差超过10尺的地面。例如，浮碟不能越过一个10尺深的坑；如果将浮碟创造在这个坑的坑底，则它将无法离开这个坑。\n如果你距浮碟超过100尺（通常是因为它受障碍所阻无法跟上你），则法术终止。',
    classes: ['法师']
  },
  {
    id: 'unseen-servant',
    name: '隐形仆役',
    nameEn: 'Unseen Servant',
    level: 1,
    school: '咒法',
    castingTime: '动作或仪式',
    range: '60尺',
    components: 'V、S、M（一些线和木头）',
    duration: '1小时',
    ritual: true,
    description:
      '该法术创造出一个隐形、无心智、无定形的中型力场。你可以在法术终止前命令它进行简单的工作。该仆役被创造出来后出现在施法距离内一处未占空间的地面上。其AC为10，具有1生命值，力量为2，且不能攻击。若仆从的生命值降至 0，则法术终止。\n在每个自己回合内以一个附赠动作 ，你可以精神性的对仆役下达一道命令，使其移动至多15尺并与一个物件进行互动。仆役可以做人类能做到的简单工作，例如拿取东西、打扫卫生、修补东西、叠衣服、点火、上菜、倒饮料等。一旦你下达了命令，仆役就会尽全力去进行任务直至完成任务，并在此后等待你的下一个命令。\n如果你命令仆役做一件需要它离开你身边60尺的工作，则法术终止。',
    classes: ['吟游诗人', '魔契师', '法师']
  }
];

// 所有法术
export const ALL_SPELLS = [...CANTRIPS, ...FIRST_LEVEL_SPELLS];

// 根据职业获取可用戏法
export function getCantripsForClass(className: string): Spell[] {
  return CANTRIPS.filter(spell => spell.classes.includes(className));
}

// 根据职业获取可用一环法术
export function getFirstLevelSpellsForClass(className: string): Spell[] {
  return FIRST_LEVEL_SPELLS.filter(spell => spell.classes.includes(className));
}

// 根据ID获取法术
export function getSpellById(id: string): Spell | undefined {
  return ALL_SPELLS.find(spell => spell.id === id);
}

// 检查职业是否有施法能力
export function hasSpellcasting(className: string): boolean {
  const spellcastingClasses = ['牧师', '法师', '术士', '魔契师', '吟游诗人', '圣武士', '德鲁伊', '游侠'];
  return spellcastingClasses.includes(className);
}

// 根据职业获取所有法术（戏法+1级法术）
export function getSpellsByClass(className: string) {
  return {
    cantrips: getCantripsForClass(className),
    level1: getFirstLevelSpellsForClass(className)
  };
}

// 获取职业的施法信息（简化版）
export function getClassSpellInfo(className: string) {
  const rules = getSpellcastingRules(className, 1);
  if (!rules) return null;
  
  return {
    cantripsKnown: rules.cantripsKnown,
    spellsKnown: rules.spellbookSpellsKnown || null, // 法师使用法术书数量
    isPrepared: className !== '术士' && className !== '吟游诗人' && className !== '魔契师', // 大部分职业需要准备法术
    preparedCount: rules.preparedSpells,
    spellSlots: rules.spellSlots,
    spellcastingAbility: rules.spellcastingAbility
  };
}

// 获取职业的施法规则
export interface SpellcastingRules {
  cantripsKnown: number; // 已知戏法数量
  preparedSpells: number; // 准备法术数量（2024：多数施法职业都使用“准备法术”）
  spellbookSpellsKnown?: number; // 法师：法术书中法术数量（起始6，每级+2；不含冒险中额外抄录）
  spellSlots: {
    level1: number; // 1环法术位数量
    level2?: number;
    level3?: number;
    level4?: number;
    level5?: number;
    level6?: number;
    level7?: number;
    level8?: number;
    level9?: number;
  };
  pactMagic?: {
    slots: number;
    slotLevel: number;
    recoversOn: '短休' | '长休';
  }; // 魔契师：契约法术位（短休恢复）
  spellcastingAbility: string; // 施法属性
  spellcastingFocus: string; // 施法法器
}

export function getSpellcastingRules(className: string, level: number = 1, classFeatureChoices?: Record<string, string>): SpellcastingRules | null {
  if (!hasSpellcasting(className)) return null;

  const normalizedClassName = className === '魔契师' ? '魔契师' : className;
  const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level || 1)));
  const idx = normalizedLevel - 1;

  // D&D Beyond 2024（Free Rules）职业表：准备法术数量、戏法数量、法术位
  // 来源页面（供维护核对）：https://www.dndbeyond.com/sources/dnd/free-rules/character-classes

  type SpellSlots = SpellcastingRules['spellSlots'];

  const FULL_CASTER_SLOTS: SpellSlots[] = [
    { level1: 2 },
    { level1: 3 },
    { level1: 4, level2: 2 },
    { level1: 4, level2: 3 },
    { level1: 4, level2: 3, level3: 2 },
    { level1: 4, level2: 3, level3: 3 },
    { level1: 4, level2: 3, level3: 3, level4: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 2 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 1, level7: 1, level8: 1, level9: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 1, level8: 1, level9: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 2, level8: 1, level9: 1 }
  ];

  const HALF_CASTER_SLOTS: SpellSlots[] = [
    { level1: 2 },
    { level1: 2 },
    { level1: 3 },
    { level1: 3 },
    { level1: 4, level2: 2 },
    { level1: 4, level2: 2 },
    { level1: 4, level2: 3 },
    { level1: 4, level2: 3 },
    { level1: 4, level2: 3, level3: 2 },
    { level1: 4, level2: 3, level3: 2 },
    { level1: 4, level2: 3, level3: 3 },
    { level1: 4, level2: 3, level3: 3 },
    { level1: 4, level2: 3, level3: 3, level4: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 2 },
    { level1: 4, level2: 3, level3: 3, level4: 2 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2 },
    { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2 }
  ];

  const BARD_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const CLERIC_CANTRIPS = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  const DRUID_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const SORCERER_CANTRIPS = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
  const WIZARD_CANTRIPS = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

  const BARD_PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
  const CLERIC_PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
  const DRUID_PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
  const SORCERER_PREPARED = [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
  const WIZARD_PREPARED = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25];

  const HALF_CASTER_PREPARED = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];

  const WARLOCK_CANTRIPS = [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
  const WARLOCK_PREPARED = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
  const WARLOCK_SLOTS = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4];
  const WARLOCK_SLOT_LEVEL = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

  const base: Omit<SpellcastingRules, 'cantripsKnown' | 'preparedSpells' | 'spellSlots'> = {
    spellcastingAbility: '智力',
    spellcastingFocus: '奥术法器'
  };

  const buildPactSlots = (slots: number, slotLevel: number): SpellSlots => {
    const s: SpellSlots = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      level5: 0,
      level6: 0,
      level7: 0,
      level8: 0,
      level9: 0
    };
    switch (slotLevel) {
      case 1:
        s.level1 = slots;
        break;
      case 2:
        s.level2 = slots;
        break;
      case 3:
        s.level3 = slots;
        break;
      case 4:
        s.level4 = slots;
        break;
      case 5:
        s.level5 = slots;
        break;
      case 6:
        s.level6 = slots;
        break;
      case 7:
        s.level7 = slots;
        break;
      case 8:
        s.level8 = slots;
        break;
      case 9:
        s.level9 = slots;
        break;
      default:
        s.level1 = slots;
        break;
    }
    return s;
  };

  const tableRules: Record<string, () => SpellcastingRules> = {
    '吟游诗人': () => ({
      ...base,
      cantripsKnown: BARD_CANTRIPS[idx],
      preparedSpells: BARD_PREPARED[idx],
      spellSlots: FULL_CASTER_SLOTS[idx],
      spellcastingAbility: '魅力',
      spellcastingFocus: '乐器'
    }),
    '牧师': () => {
      const baseCantrips = CLERIC_CANTRIPS[idx];
      const extra = classFeatureChoices?.divineOrder === 'thaumaturge' ? 1 : 0;
      return {
        ...base,
        cantripsKnown: baseCantrips + extra,
        preparedSpells: CLERIC_PREPARED[idx],
        spellSlots: FULL_CASTER_SLOTS[idx],
        spellcastingAbility: '感知',
        spellcastingFocus: '圣徽'
      };
    },
    '德鲁伊': () => ({
      ...base,
      cantripsKnown: DRUID_CANTRIPS[idx],
      preparedSpells: DRUID_PREPARED[idx],
      spellSlots: FULL_CASTER_SLOTS[idx],
      spellcastingAbility: '感知',
      spellcastingFocus: '德鲁伊法器'
    }),
    '术士': () => ({
      ...base,
      cantripsKnown: SORCERER_CANTRIPS[idx],
      preparedSpells: SORCERER_PREPARED[idx],
      spellSlots: FULL_CASTER_SLOTS[idx],
      spellcastingAbility: '魅力',
      spellcastingFocus: '奥术法器'
    }),
    '法师': () => ({
      ...base,
      cantripsKnown: WIZARD_CANTRIPS[idx],
      preparedSpells: WIZARD_PREPARED[idx],
      spellbookSpellsKnown: 2 * normalizedLevel + 4, // 1级6个，每级+2（不含冒险抄录）
      spellSlots: FULL_CASTER_SLOTS[idx],
      spellcastingAbility: '智力',
      spellcastingFocus: '奥术法器'
    }),
    '圣武士': () => ({
      ...base,
      cantripsKnown: 0,
      preparedSpells: HALF_CASTER_PREPARED[idx],
      spellSlots: HALF_CASTER_SLOTS[idx],
      spellcastingAbility: '魅力',
      spellcastingFocus: '圣徽'
    }),
    '游侠': () => ({
      ...base,
      cantripsKnown: 0,
      preparedSpells: HALF_CASTER_PREPARED[idx],
      spellSlots: HALF_CASTER_SLOTS[idx],
      spellcastingAbility: '感知',
      spellcastingFocus: '德鲁伊法器'
    }),
    '魔契师': () => {
      const slots = WARLOCK_SLOTS[idx];
      const slotLevel = WARLOCK_SLOT_LEVEL[idx];
      return {
        ...base,
        cantripsKnown: WARLOCK_CANTRIPS[idx],
        preparedSpells: WARLOCK_PREPARED[idx],
        spellSlots: buildPactSlots(slots, slotLevel),
        pactMagic: { slots, slotLevel, recoversOn: '短休' },
        spellcastingAbility: '魅力',
        spellcastingFocus: '奥术法器'
      };
    }
  };

  const resolver = tableRules[normalizedClassName];
  return resolver ? resolver() : null;
}

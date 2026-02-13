// D&D 2024 法术数据
// 戏法为手写；一环～九环来自 docs/DND资料/*.md，由 scripts/parse-spells-from-docs.mjs 生成 spells-from-docs.generated.ts

import { getMagicInitiateSpellList } from '@/lib/feats-data';
import {
  SPELLS_1_FROM_DOCS,
  SPELLS_2_FROM_DOCS,
  SPELLS_3_FROM_DOCS,
  SPELLS_4_FROM_DOCS,
  SPELLS_5_FROM_DOCS,
  SPELLS_6_FROM_DOCS,
  SPELLS_7_FROM_DOCS,
  SPELLS_8_FROM_DOCS,
  SPELLS_9_FROM_DOCS,
} from './spells-from-docs.generated';

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
    classes: ['术士', '魔契师', '法师']
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

// 一环法术来自 docs/DND资料/一环法术.md
export const FIRST_LEVEL_SPELLS = SPELLS_1_FROM_DOCS;

// 所有法术（戏法手写，一环～九环来自 docs/DND资料 生成）
export const ALL_SPELLS = [
  ...CANTRIPS,
  ...FIRST_LEVEL_SPELLS,
  ...SPELLS_2_FROM_DOCS,
  ...SPELLS_3_FROM_DOCS,
  ...SPELLS_4_FROM_DOCS,
  ...SPELLS_5_FROM_DOCS,
  ...SPELLS_6_FROM_DOCS,
  ...SPELLS_7_FROM_DOCS,
  ...SPELLS_8_FROM_DOCS,
  ...SPELLS_9_FROM_DOCS,
];

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

/** 根据法术中文名或英文名解析为 id（用于子职业法术表等）；先按 id 匹配，再按 name，再按 nameEn 忽略大小写 */
export function getSpellIdByName(nameOrId: string): string | undefined {
  if (!nameOrId || typeof nameOrId !== 'string') return undefined;
  const s = nameOrId.trim();
  if (!s) return undefined;
  const byId = ALL_SPELLS.find(spell => spell.id === s);
  if (byId) return byId.id;
  const byName = ALL_SPELLS.find(spell => spell.name === s);
  if (byName) return byName.id;
  const lower = s.toLowerCase();
  const byNameEn = ALL_SPELLS.find(spell => spell.nameEn.toLowerCase() === lower);
  if (byNameEn) return byNameEn.id;
  return undefined;
}

/** 物种特质授予的戏法 ID（提夫林：异界存在奇术 + 邪魔遗赠 1 级戏法；侏儒：血系戏法） */
export function getSpeciesGrantedCantrips(character: {
  species?: string;
  classFeatureChoices?: Record<string, string>;
}): string[] {
  if (!character.species) return [];
  const out: string[] = [];

  // 提夫林：异界存在 -> 奇术 Thaumaturgy
  if (character.species === '提夫林') {
    out.push('thaumaturgy');
    // 邪魔遗赠 1 级：深渊=毒气喷涌，幽冥=颤栗之触，炼狱=火焰箭
    if (character.classFeatureChoices?.speciesChoices) {
      try {
        const choices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
        if (choices.legacy) {
          const legacy = choices.legacy as string;
          if (legacy.includes('深渊')) out.push('poison-spray');
          if (legacy.includes('冥界')) out.push('chill-touch');
          if (legacy.includes('炼狱')) out.push('fire-bolt');
        }
      } catch {
        // ignore
      }
    }
  }

  // 侏儒：森林侏儒=次级幻象；岩石侏儒=修复术+魔法伎俩
  if (character.species === '侏儒' && character.classFeatureChoices?.speciesChoices) {
    try {
      const choices = JSON.parse(character.classFeatureChoices.speciesChoices as string);
      if (choices.lineage) {
        const lineage = choices.lineage as string;
        if (lineage.includes('森林侏儒')) out.push('minor-illusion');
        if (lineage.includes('岩石侏儒')) {
          out.push('mending', 'prestidigitation');
        }
      }
    } catch {
      // ignore
    }
  }

  return [...new Set(out)];
}

/** 有效戏法列表 = 物种授予 + 职业选择（去重，物种在前） */
export function getEffectiveCantrips(character: {
  species?: string;
  classFeatureChoices?: Record<string, string>;
}): string[] {
  const speciesIds = getSpeciesGrantedCantrips(character);
  const raw = character.classFeatureChoices?.selectedCantrips;
  const selected: string[] = raw ? (JSON.parse(raw as string) as string[]) : [];
  return [...new Set([...speciesIds, ...selected])];
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

/** 按职业与法术环位筛选：返回该职业可用的、环位 ≤ maxSpellLevel 的所有法术（0=戏法，1-9=环位） */
export function getSpellsForClassUpToLevel(className: string, maxSpellLevel: number): Spell[] {
  return ALL_SPELLS.filter(
    (s) => s.classes.includes(className) && s.level >= 0 && s.level <= maxSpellLevel
  );
}

/** 按职业与单环位筛选：返回该职业可用的指定环位法术列表（0=戏法） */
export function getSpellsForClassByLevel(className: string, spellLevel: number): Spell[] {
  return ALL_SPELLS.filter((s) => s.classes.includes(className) && s.level === spellLevel);
}

/** 根据职业与角色等级，返回当前可用的最高法术环位（用于升级时选法术）；非施法者返回 -1 */
export function getMaxSpellLevelForClassAtLevel(className: string, characterLevel: number): number {
  const rules = getSpellcastingRules(className, characterLevel);
  if (!rules?.spellSlots) return -1;
  const slots = rules.spellSlots;
  let max = 0;
  if (slots.level1 && slots.level1 > 0) max = 1;
  if (slots.level2 && slots.level2 > 0) max = 2;
  if (slots.level3 && slots.level3 > 0) max = 3;
  if (slots.level4 && slots.level4 > 0) max = 4;
  if (slots.level5 && slots.level5 > 0) max = 5;
  if (slots.level6 && slots.level6 > 0) max = 6;
  if (slots.level7 && slots.level7 > 0) max = 7;
  if (slots.level8 && slots.level8 > 0) max = 8;
  if (slots.level9 && slots.level9 > 0) max = 9;
  return max;
}

// 魔法学徒专长：从 classFeatureChoices.magicInitiateChoices 读取每个专长的戏法/一环法术/施法属性
export interface MagicInitiateEntry {
  featId: string;
  listName: '牧师' | '德鲁伊' | '法师';
  cantrips: string[];
  level1Spell: string;
  ability: string; // 智力 | 感知 | 魅力
}

export function getMagicInitiateSpellInfo(character: {
  feats?: string[];
  classFeatureChoices?: Record<string, string>;
}): { entries: MagicInitiateEntry[] } {
  const feats = character.feats || [];
  const raw = character.classFeatureChoices?.magicInitiateChoices;
  let choices: Record<string, { cantrips: string[]; spell: string; ability: string }> = {};
  if (raw) {
    try {
      choices = JSON.parse(raw) as Record<string, { cantrips: string[]; spell: string; ability: string }>;
    } catch {
      // ignore
    }
  }
  const entries: MagicInitiateEntry[] = [];
  for (const featId of feats) {
    const listName = getMagicInitiateSpellList(featId);
    if (!listName) continue;
    const c = choices[featId] || { cantrips: [], spell: '', ability: listName === '法师' ? '智力' : '感知' };
    entries.push({
      featId,
      listName,
      cantrips: Array.isArray(c.cantrips) ? c.cantrips : [],
      level1Spell: c.spell || '',
      ability: c.ability || (listName === '法师' ? '智力' : '感知')
    });
  }
  return { entries };
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
    '德鲁伊': () => {
      const baseCantrips = DRUID_CANTRIPS[idx];
      const extra = classFeatureChoices?.primalOrder === 'magician' ? 1 : 0;
      return {
        ...base,
        cantripsKnown: baseCantrips + extra,
        preparedSpells: DRUID_PREPARED[idx],
        spellSlots: FULL_CASTER_SLOTS[idx],
        spellcastingAbility: '感知',
        spellcastingFocus: '德鲁伊法器'
      };
    },
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

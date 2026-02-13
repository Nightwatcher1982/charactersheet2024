/**
 * 战斗大师战技选项（Maneuver Options）
 * 来源：战士.md；用于升级时选/换战技，存 classFeatureChoices.maneuvers（JSON 数组 id）
 */

export interface ManeuverOption {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
}

export const MANEUVER_OPTIONS: ManeuverOption[] = [
  { id: 'ambush', name: '伏击', nameEn: 'Ambush', description: '敏捷（隐匿）或先攻检定时可消耗卓越骰加入结果' },
  { id: 'bait-and-switch', name: '换位诈术', nameEn: 'Bait and Switch', description: '与5尺内自愿生物互换位置，AC获得卓越骰加值' },
  { id: 'commanders-strike', name: '指挥官奇袭', nameEn: "Commander's Strike", description: '让伙伴用反应发动一次攻击，伤害加卓越骰' },
  { id: 'commanding-presence', name: '领导风范', nameEn: 'Commanding Presence', description: '魅力（威吓/表演/游说）检定可加卓越骰' },
  { id: 'disarming-attack', name: '缴械攻击', nameEn: 'Disarming Attack', description: '命中后目标力量豁免失败则丢弃手中物品' },
  { id: 'distracting-strike', name: '扰乱打击', nameEn: 'Distracting Strike', description: '命中后盟友对目标下次攻击具有优势' },
  { id: 'evasive-footwork', name: '灵巧步法', nameEn: 'Evasive Footwork', description: '附赠动作撤离，AC加卓越骰直至下回合' },
  { id: 'feinting-attack', name: '诡诈攻击', nameEn: 'Feinting Attack', description: '附赠动作虚晃，本回合对该目标下次攻击具有优势' },
  { id: 'goading-attack', name: '挑衅攻击', nameEn: 'Goading Attack', description: '命中后目标感知豁免失败则对除你外生物攻击具有劣势' },
  { id: 'lunging-attack', name: '突刺攻击', nameEn: 'Lunging Attack', description: '附赠动作疾走，直线移动5尺后命中可加卓越骰伤害' },
  { id: 'maneuvering-attack', name: '灵动攻击', nameEn: 'Maneuvering Attack', description: '命中后指定盟友可用反应移动半速且不引发借机' },
  { id: 'menacing-attack', name: '恐吓攻击', nameEn: 'Menacing Attack', description: '命中后目标感知豁免失败则恐慌至你下回合结束' },
  { id: 'parry', name: '格挡', nameEn: 'Parry', description: '反应减少近战伤害（卓越骰+力或敏调整值）' },
  { id: 'precision-attack', name: '精准攻击', nameEn: 'Precision Attack', description: '攻击失手时可消耗卓越骰加在攻击检定上' },
  { id: 'pushing-attack', name: '推撞攻击', nameEn: 'Pushing Attack', description: '命中后大型或更小目标力量豁免失败则被推离15尺' },
  { id: 'rally', name: '重整旗鼓', nameEn: 'Rally', description: '附赠动作使30尺内盟友获得临时生命值' },
  { id: 'riposte', name: '反击', nameEn: 'Riposte', description: '近战攻击失手时反应发动一次近战攻击' },
  { id: 'sweeping-attack', name: '横扫攻击', nameEn: 'Sweeping Attack', description: '命中后对触及内另一生物造成卓越骰伤害' },
  { id: 'tactical-assessment', name: '战术预估', nameEn: 'Tactical Assessment', description: '智力（调查/历史）或感知（洞悉）检定可加卓越骰' },
  { id: 'trip-attack', name: '摔绊攻击', nameEn: 'Trip Attack', description: '命中后大型或更小目标力量豁免失败则倒地' },
];

/** 战斗大师 3/7/10/15 级获得战技数量及可替换数 */
export function getManeuverCountAtLevel(level: number): { total: number; replaceCount: number } {
  if (level >= 15) return { total: 9, replaceCount: 1 };
  if (level >= 10) return { total: 7, replaceCount: 1 };
  if (level >= 7) return { total: 5, replaceCount: 1 };
  if (level >= 3) return { total: 3, replaceCount: 0 };
  return { total: 0, replaceCount: 0 };
}

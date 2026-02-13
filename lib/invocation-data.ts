/**
 * 魔契师魔能祈唤选项（Eldritch Invocations）
 * 来源：魔契师.md；用于升级时选/换祈唤，存 classFeatureChoices.invocations（JSON 数组 id）
 */

export interface InvocationOption {
  id: string;
  name: string;
  nameEn?: string;
  minLevel: number;
  /** 先决祈唤 id（如刃之魔契、链之魔契、书之魔契） */
  prereqInvocationIds?: string[];
  description?: string;
}

export const INVOCATION_OPTIONS: InvocationOption[] = [
  { id: 'armor-of-shadows', name: '幽影护甲', nameEn: 'Armor of Shadows', minLevel: 1, description: '随意施展法师护甲且无需消耗法术位' },
  { id: 'eldritch-mind', name: '魔能意志', nameEn: 'Eldritch Mind', minLevel: 1, description: '保持专注的体质豁免具有优势' },
  { id: 'pact-of-the-blade', name: '刃之魔契', nameEn: 'Pact of the Blade', minLevel: 1, description: '咒唤契约武器，可用魅力进行攻击与伤害' },
  { id: 'pact-of-the-chain', name: '链之魔契', nameEn: 'Pact of the Chain', minLevel: 1, description: '寻获魔宠，可选特殊形态' },
  { id: 'pact-of-the-tome', name: '书之魔契', nameEn: 'Pact of the Tome', minLevel: 1, description: '获得三道戏法与两道仪式法术' },
  { id: 'agonizing-blast', name: '苦痛魔爆', nameEn: 'Agonizing Blast', minLevel: 2, description: '将魅力调整值加到伤害戏法的伤害掷骰' },
  { id: 'devils-sight', name: '魔鬼视界', nameEn: "Devil's Sight", minLevel: 2, description: '黑暗与微光中120尺可视' },
  { id: 'eldritch-spear', name: '魔能长枪', nameEn: 'Eldritch Spear', minLevel: 2, description: '戏法射程增加' },
  { id: 'fiendish-vigor', name: '邪魔活力', nameEn: 'Fiendish Vigor', minLevel: 2, description: '随意施展虚假生命且无需法术位' },
  { id: 'mask-of-many-faces', name: '千面之颜', nameEn: 'Mask of Many Faces', minLevel: 2, description: '随意施展易容术且无需法术位' },
  { id: 'misty-visions', name: '幻象迷踪', nameEn: 'Misty Visions', minLevel: 2, description: '随意施展无声幻影且无需法术位' },
  { id: 'otherworldly-leap', name: '超凡跳跃', nameEn: 'Otherworldly Leap', minLevel: 2, description: '随意对自己施展跳跃术且无需法术位' },
  { id: 'repelling-blast', name: '斥力魔爆', nameEn: 'Repelling Blast', minLevel: 2, description: '戏法命中可推开目标10尺' },
  { id: 'ascendant-step', name: '星移步法', nameEn: 'Ascendant Step', minLevel: 5, description: '随意对自己施展浮空术且无需法术位' },
  { id: 'eldritch-smite', name: '魔能斩', nameEn: 'Eldritch Smite', minLevel: 5, prereqInvocationIds: ['pact-of-the-blade'], description: '契约武器命中可消耗法术位造成额外力场伤害' },
  { id: 'gaze-of-two-minds', name: '共视感官', nameEn: 'Gaze of Two Minds', minLevel: 5, description: '与自愿生物建立感官连接' },
  { id: 'gift-of-the-depths', name: '深海馈赠', nameEn: 'Gift of the Depths', minLevel: 5, description: '水下呼吸与游泳速度' },
  { id: 'investment-of-the-chain-master', name: '链主赋能', nameEn: 'Investment of the Chain Master', minLevel: 5, prereqInvocationIds: ['pact-of-the-chain'], description: '强化魔宠' },
  { id: 'master-of-myriad-forms', name: '万形之主', nameEn: 'Master of Myriad Forms', minLevel: 5, description: '随意施展变身术且无需法术位' },
  { id: 'one-with-shadows', name: '融身入影', nameEn: 'One with Shadows', minLevel: 5, description: '微光或黑暗中可对自己施展隐形术' },
  { id: 'thirsting-blade', name: '饥渴魔刃', nameEn: 'Thirsting Blade', minLevel: 5, prereqInvocationIds: ['pact-of-the-blade'], description: '契约武器额外攻击一次' },
  { id: 'whispers-of-the-grave', name: '坟茔殁语', nameEn: 'Whispers of the Grave', minLevel: 7, description: '随意施展死者交谈且无需法术位' },
  { id: 'lifedrinker', name: '饮命者', nameEn: 'Lifedrinker', minLevel: 9, prereqInvocationIds: ['pact-of-the-blade'], description: '契约武器命中额外暗蚀/心灵/光耀伤害并恢复生命' },
  { id: 'gift-of-the-protectors', name: '守护馈赠', nameEn: 'Gift of the Protectors', minLevel: 9, prereqInvocationIds: ['pact-of-the-tome'], description: '书页上写名的生物濒死时生命值变为1' },
  { id: 'visions-of-distant-realms', name: '穹宇尽视', nameEn: 'Visions of Distant Realms', minLevel: 9, description: '随意施展秘法眼且无需法术位' },
  { id: 'devouring-blade', name: '灭世魔刃', nameEn: 'Devouring Blade', minLevel: 12, prereqInvocationIds: ['thirsting-blade'], description: '饥渴魔刃额外攻击变为两次' },
  { id: 'witch-sight', name: '巫术视界', nameEn: 'Witch Sight', minLevel: 15, description: '30尺真实视觉' },
];

/** 魔契师各等级可获得的祈唤数量（特性表） */
export const INVOCATION_COUNT_BY_LEVEL: Record<number, number> = {
  1: 1, 2: 3, 3: 3, 4: 3, 5: 5, 6: 5, 7: 6, 8: 6, 9: 7, 10: 7, 11: 7, 12: 8, 13: 8, 14: 8, 15: 9, 16: 9, 17: 9, 18: 10, 19: 10, 20: 10,
};

/** 可选祈唤中满足等级且满足先决的列表 */
export function getAvailableInvocations(characterLevel: number, currentInvocationIds: string[]): InvocationOption[] {
  return INVOCATION_OPTIONS.filter((inv) => {
    if (inv.minLevel > characterLevel) return false;
    if (inv.prereqInvocationIds?.length && !inv.prereqInvocationIds.every((id) => currentInvocationIds.includes(id))) return false;
    return true;
  });
}

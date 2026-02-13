/**
 * 术士超魔法选项（Metamagic Options）
 * 来源：术士.md；2级获2个，10/17级各+2个；每级可替换1个。存 classFeatureChoices.metamagic（JSON 数组 id）
 */

export interface MetamagicOption {
  id: string;
  name: string;
  nameEn?: string;
  cost: string;
  description?: string;
}

export const METAMAGIC_OPTIONS: MetamagicOption[] = [
  { id: 'careful-spell', name: '谨慎法术', nameEn: 'Careful Spell', cost: '1术法点', description: '保护若干生物使法术豁免自动通过' },
  { id: 'distant-spell', name: '远程法术', nameEn: 'Distant Spell', cost: '1术法点', description: '射程翻倍或触碰改为30尺' },
  { id: 'empowered-spell', name: '强效法术', nameEn: 'Empowered Spell', cost: '1术法点', description: '重掷部分伤害骰' },
  { id: 'extended-spell', name: '延效法术', nameEn: 'Extended Spell', cost: '1术法点', description: '持续时间翻倍' },
  { id: 'heightened-spell', name: '升阶法术', nameEn: 'Heightened Spell', cost: '2术法点', description: '一名目标豁免具有劣势' },
  { id: 'quickened-spell', name: '瞬发法术', nameEn: 'Quickened Spell', cost: '2术法点', description: '施法时间改为附赠动作' },
  { id: 'seeking-spell', name: '追踪法术', nameEn: 'Seeking Spell', cost: '1术法点', description: '攻击未中时可重骰' },
  { id: 'subtle-spell', name: '精妙法术', nameEn: 'Subtle Spell', cost: '1术法点', description: '无言语与姿势成分' },
  { id: 'transmuted-spell', name: '转化法术', nameEn: 'Transmuted Spell', cost: '1术法点', description: '改变伤害类型' },
  { id: 'twinned-spell', name: '孪生法术', nameEn: 'Twinned Spell', cost: '1术法点', description: '可额外增加一名目标' },
];

/** 术士 2/10/17 级获得的超魔法数量（累计可选数） */
export function getMetamagicCountAtLevel(level: number): number {
  if (level >= 17) return 6;
  if (level >= 10) return 4;
  if (level >= 2) return 2;
  return 0;
}

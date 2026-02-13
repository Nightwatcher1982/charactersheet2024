/**
 * 子职业法术表：选子职或升级到对应等级时，将这些法术自动加入角色准备/已知列表。
 * 数据与 docs/职业资料改动清单-12职业.md 一致；法术 id 与 lib/spells-data / spells-from-docs 一致。
 */

export interface SubclassSpellsEntry {
  /** 职业 id（dnd-data CLASSES[].id） */
  classId: string;
  /** 子职业 id（subclass-data SUBCLASSES[].id） */
  subclassId: string;
  /** 仅大地结社：地形 key，用于从 spellsByTerrain 取表 */
  terrain?: string;
  /** 按角色等级（3,5,7,9 等）对应的法术 id 列表；自动追加时只追加 ≤ 当前等级 的档位 */
  spellsByLevel: Record<number, string[]>;
}

/** 大地结社按地形分的法术表（key: arid | polar | temperate | tropical） */
export const DRUID_LAND_SPELLS_BY_TERRAIN: Record<string, Record<number, string[]>> = {
  arid: {
    3: ['fire-bolt', 'burning-hands', 'blur'],
    5: ['fireball'],
    7: ['blight'],
    9: ['wall-of-stone'],
  },
  polar: {
    3: ['ray-of-frost', 'fog-cloud', 'hold-person'],
    5: ['sleet-storm'],
    7: ['ice-storm'],
    9: ['cone-of-cold'],
  },
  temperate: {
    3: ['shocking-grasp', 'sleep', 'misty-step'],
    5: ['lightning-bolt'],
    7: ['freedom-of-movement'],
    9: ['tree-stride'],
  },
  tropical: {
    3: ['acid-splash', 'web', 'ray-of-sickness'],
    5: ['stinking-cloud'],
    7: ['polymorph'],
    9: ['insect-plague'],
  },
};

/** 各子职业法术表（不含大地结社地形分支；大地结社用 getSubclassSpellsForDruidLand(terrain)） */
export const SUBCLASS_SPELLS: SubclassSpellsEntry[] = [
  // 德鲁伊·月亮结社
  {
    classId: 'druid',
    subclassId: 'moon',
    spellsByLevel: {
      3: ['starry-wisp', 'cure-wounds', 'moonbeam'],
      5: ['conjure-animals'],
      7: ['fount-of-moonlight'],
      9: ['mass-cure-wounds'],
    },
  },
  // 德鲁伊·海洋结社
  {
    classId: 'druid',
    subclassId: 'sea',
    spellsByLevel: {
      3: ['ray-of-frost', 'fog-cloud', 'thunderwave', 'gust-of-wind', 'shatter'],
      5: ['lightning-bolt', 'water-breathing'],
      7: ['control-water', 'ice-storm'],
      9: ['conjure-elemental', 'hold-monster'],
    },
  },
  // 德鲁伊·星辰结社：仅固定 2 道，不入表也可；这里列出便于统一逻辑
  {
    classId: 'druid',
    subclassId: 'stars',
    spellsByLevel: {
      3: ['guidance', 'guiding-bolt'],
    },
  },
  // 牧师·生命领域
  {
    classId: 'cleric',
    subclassId: 'life',
    spellsByLevel: {
      3: ['aid', 'bless', 'cure-wounds', 'lesser-restoration'],
      5: ['mass-healing-word', 'revivify'],
      7: ['aura-of-life', 'death-ward'],
      9: ['greater-restoration', 'mass-cure-wounds'],
    },
  },
  // 牧师·光明领域
  {
    classId: 'cleric',
    subclassId: 'light',
    spellsByLevel: {
      3: ['burning-hands', 'faerie-fire', 'scorching-ray', 'see-invisibility'],
      5: ['daylight', 'fireball'],
      7: ['arcane-eye', 'wall-of-fire'],
      9: ['flame-strike', 'scrying'],
    },
  },
  // 牧师·诡术领域
  {
    classId: 'cleric',
    subclassId: 'trickery',
    spellsByLevel: {
      3: ['charm-person', 'disguise-self', 'invisibility', 'pass-without-trace'],
      5: ['hypnotic-pattern', 'nondetection'],
      7: ['confusion', 'dimension-door'],
      9: ['dominate-person', 'modify-memory'],
    },
  },
  // 牧师·战争领域
  {
    classId: 'cleric',
    subclassId: 'war',
    spellsByLevel: {
      3: ['guiding-bolt', 'shield-of-faith', 'magic-weapon', 'spiritual-weapon'],
      5: ['crusaders-mantle', 'guardian-of-faith'],
      7: ['fire-shield', 'freedom-of-movement'],
      9: ['hold-monster', 'steel-wind-strike'],
    },
  },
  // 圣武士·奉献之誓
  {
    classId: 'paladin',
    subclassId: 'devotion',
    spellsByLevel: {
      3: ['protection-from-evil-and-good', 'shield-of-faith'],
      5: ['aid', 'zone-of-truth'],
      9: ['beacon-of-hope', 'dispel-magic'],
      13: ['freedom-of-movement', 'guardian-of-faith'],
      17: ['commune', 'flame-strike'],
    },
  },
  // 圣武士·荣耀之誓
  {
    classId: 'paladin',
    subclassId: 'glory',
    spellsByLevel: {
      3: ['guiding-bolt', 'heroism'],
      5: ['enhance-ability', 'magic-weapon'],
      9: ['haste', 'protection-from-energy'],
      13: ['compulsion', 'freedom-of-movement'],
      17: ['legend-lore', 'yolandes-regal-presence'],
    },
  },
  // 圣武士·古贤之誓
  {
    classId: 'paladin',
    subclassId: 'ancients',
    spellsByLevel: {
      3: ['ensnaring-strike', 'speak-with-animals'],
      5: ['misty-step', 'moonbeam'],
      9: ['plant-growth', 'protection-from-energy'],
      13: ['ice-storm', 'stoneskin'],
      17: ['commune-with-nature', 'tree-stride'],
    },
  },
  // 圣武士·复仇之誓
  {
    classId: 'paladin',
    subclassId: 'vengeance',
    spellsByLevel: {
      3: ['bane', 'hunters-mark'],
      5: ['hold-person', 'misty-step'],
      9: ['haste', 'protection-from-energy'],
      13: ['banishment', 'dimension-door'],
      17: ['hold-monster', 'scrying'],
    },
  },
  // 术士·畸变术法
  {
    classId: 'sorcerer',
    subclassId: 'aberrant-mind',
    spellsByLevel: {
      3: ['mind-sliver', 'arms-of-hadar', 'dissonant-whispers', 'calm-emotions', 'detect-thoughts'],
      5: ['hunger-of-hadar', 'sending'],
      7: ['evards-black-tentacles', 'summon-aberration'],
      9: ['rarys-telepathic-bond', 'telekinesis'],
    },
  },
  // 术士·时械术法
  {
    classId: 'sorcerer',
    subclassId: 'clockwork-soul',
    spellsByLevel: {
      3: ['protection-from-evil-and-good', 'alarm', 'lesser-restoration', 'aid'],
      5: ['dispel-magic', 'protection-from-energy'],
      7: ['freedom-of-movement', 'summon-construct'],
      9: ['greater-restoration', 'wall-of-force'],
    },
  },
  // 术士·龙族术法
  {
    classId: 'sorcerer',
    subclassId: 'draconic',
    spellsByLevel: {
      3: ['chromatic-orb', 'command', 'dragons-breath', 'alter-self'],
      5: ['fear', 'fly'],
      7: ['arcane-eye', 'charm-monster'],
      9: ['legend-lore', 'summon-dragon'],
    },
  },
  // 游侠·妖精漫游者
  {
    classId: 'ranger',
    subclassId: 'fey-wanderer',
    spellsByLevel: {
      3: ['charm-person'],
      5: ['misty-step'],
      9: ['conjure-fey'],
      13: ['dimension-door'],
      17: ['mislead'],
    },
  },
  // 游侠·幽域追猎者
  {
    classId: 'ranger',
    subclassId: 'gloom-stalker',
    spellsByLevel: {
      3: ['disguise-self'],
      5: ['rope-trick'],
      9: ['fear'],
      13: ['greater-invisibility'],
      17: ['seeming'],
    },
  },
  // 魔契师·至高妖精
  {
    classId: 'warlock',
    subclassId: 'archfey',
    spellsByLevel: {
      3: ['faerie-fire', 'sleep', 'calm-emotions', 'misty-step', 'phantasmal-force'],
      5: ['blink', 'plant-growth'],
      7: ['dominate-beast', 'greater-invisibility'],
      9: ['dominate-person', 'seeming'],
    },
  },
  // 魔契师·天界
  {
    classId: 'warlock',
    subclassId: 'celestial',
    spellsByLevel: {
      3: ['light', 'sacred-flame', 'cure-wounds', 'guiding-bolt', 'aid', 'lesser-restoration'],
      5: ['daylight', 'revivify'],
      7: ['guardian-of-faith', 'wall-of-fire'],
      9: ['greater-restoration', 'summon-celestial'],
    },
  },
  // 魔契师·邪魔
  {
    classId: 'warlock',
    subclassId: 'fiend',
    spellsByLevel: {
      3: ['burning-hands', 'command', 'scorching-ray', 'suggestion'],
      5: ['fireball', 'stinking-cloud'],
      7: ['fire-shield', 'wall-of-fire'],
      9: ['geas', 'insect-plague'],
    },
  },
  // 魔契师·旧日支配者
  {
    classId: 'warlock',
    subclassId: 'great-old-one',
    spellsByLevel: {
      3: ['dissonant-whispers', 'tashas-hideous-laughter', 'phantasmal-force', 'detect-thoughts'],
      5: ['clairvoyance', 'hunger-of-hadar'],
      7: ['confusion', 'summon-aberration'],
      9: ['modify-memory', 'telekinesis'],
    },
  },
];

/** 吟游诗人·魅心学院：3 级与 6 级固定法术（可单独用或并入升级逻辑） */
export const BARD_GLAMOUR_SPELLS: Record<number, string[]> = {
  3: ['charm-person', 'mirror-image'],
  6: ['command'],
};

/** 按职业 id、子职业 id 获取子职业法术表（不含大地结社地形） */
export function getSubclassSpells(
  classId: string,
  subclassId: string
): SubclassSpellsEntry | undefined {
  return SUBCLASS_SPELLS.find(
    (e) => e.classId === classId && e.subclassId === subclassId && !e.terrain
  );
}

/** 德鲁伊·大地结社：按地形获取法术表 */
export function getDruidLandSpellsByLevel(terrain: string): Record<number, string[]> | undefined {
  return DRUID_LAND_SPELLS_BY_TERRAIN[terrain];
}

/** 获取某等级及以下应自动追加的子职业法术 id 列表（用于升级完成时 merge 到角色） */
export function getSubclassSpellIdsUpToLevel(
  classId: string,
  subclassId: string,
  characterLevel: number,
  landTerrain?: string
): string[] {
  const ids: string[] = [];
  if (classId === 'druid' && subclassId === 'land' && landTerrain) {
    const byLevel = getDruidLandSpellsByLevel(landTerrain);
    if (byLevel) {
      for (const level of Object.keys(byLevel).map(Number).sort((a, b) => a - b)) {
        if (level <= characterLevel) ids.push(...byLevel[level]);
      }
    }
    return ids;
  }
  const entry = getSubclassSpells(classId, subclassId);
  if (!entry) return ids;
  for (const level of Object.keys(entry.spellsByLevel).map(Number).sort((a, b) => a - b)) {
    if (level <= characterLevel) ids.push(...entry.spellsByLevel[level]);
  }
  return ids;
}

/**
 * 法师学派免费入书法术：3 级 2 道≤二环学派法术，之后每新环阶 +1 道（见改动清单）。
 * 学派 id 与 subclass-data 一致：abjuration, divination, evocation, illusion。
 */

import { ALL_SPELLS } from './spells-data';

const SCHOOL_ID_TO_NAME: Record<string, string> = {
  abjuration: '防护',
  divination: '预言',
  evocation: '塑能',
  illusion: '幻术',
};

/** 3 级时每学派固定入书的 2 道法术（≤二环，法师表） */
const SCHOOL_SPELLS_AT_3: Record<string, string[]> = {
  abjuration: ['mage-armor', 'protection-from-evil-and-good'],
  divination: ['detect-magic', 'identify'],
  evocation: ['magic-missile', 'scorching-ray'],
  illusion: ['disguise-self', 'mirror-image'],
};

/** 获取法师某学派在指定角色等级时应自动入书的法术 id 列表（加入法术书） */
export function getWizardSchoolSpellIdsForLevel(schoolId: string, characterLevel: number): string[] {
  const schoolName = SCHOOL_ID_TO_NAME[schoolId];
  if (!schoolName) return [];

  const wizardSpells = ALL_SPELLS.filter(
    (s) => s.classes.includes('法师') && s.school === schoolName
  );

  const out: string[] = [];

  if (characterLevel >= 3) {
    const at3 = SCHOOL_SPELLS_AT_3[schoolId];
    if (at3) out.push(...at3);
  }

  const tierToSpellLevel: [number, number][] = [
    [5, 3],
    [7, 4],
    [9, 5],
    [11, 6],
    [13, 7],
    [15, 8],
    [17, 9],
  ];
  for (const [level, spellLevel] of tierToSpellLevel) {
    if (characterLevel >= level) {
      const candidate = wizardSpells.find((s) => s.level === spellLevel);
      if (candidate && !out.includes(candidate.id)) out.push(candidate.id);
    }
  }

  return out;
}

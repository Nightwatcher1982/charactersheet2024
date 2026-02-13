'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterData } from '@/lib/character-data-context';
import { ArrowLeft, ArrowRight, TrendingUp, Heart, ListChecks, CheckCircle, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import { CLASSES, SKILLS } from '@/lib/dnd-data';
import {
  getLevelEntryByClassName,
  levelHasSubclassChoice,
  getClassIdFromName,
} from '@/lib/class-level-table';
import { getClassFeatureDetailByLevel } from '@/lib/class-features-data';
import { getSubclassFeaturesByLevel } from '@/lib/subclass-features-data';
import {
  getSubclassesByClassName,
  type Subclass,
} from '@/lib/subclass-data';
import { getSubclassSpellIdsUpToLevel } from '@/lib/subclass-spells-data';
import { getWizardSchoolSpellIdsForLevel } from '@/lib/wizard-school-spells';
import { getSpellsForClassByLevel, getSpellsForClassUpToLevel, getSpellcastingRules, getSpellById, getMaxSpellLevelForClassAtLevel, type Spell } from '@/lib/spells-data';
import { INVOCATION_OPTIONS, INVOCATION_COUNT_BY_LEVEL, getAvailableInvocations } from '@/lib/invocation-data';
import { MANEUVER_OPTIONS, getManeuverCountAtLevel } from '@/lib/maneuvers-data';
import { METAMAGIC_OPTIONS, getMetamagicCountAtLevel } from '@/lib/metamagic-data';
import type { Character } from '@/lib/dnd-data';

/** 大地结社地形选项（存 classFeatureChoices.landTerrain） */
const LAND_TERRAIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'arid', label: '荒漠' },
  { value: 'polar', label: '极地' },
  { value: 'temperate', label: '温带' },
  { value: 'tropical', label: '热带' },
];

/** 法师学者专精可选技能（选 1 项已熟练技能获专精） */
const SCHOLAR_SKILL_OPTIONS = ['奥秘', '历史', '调查', '医药', '自然', '宗教'];

/** 圣武士 2 级战斗风格选项（存 classFeatureChoices.fightingStyle） */
const PALADIN_FIGHTING_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'defense', label: '防御' },
  { value: 'blessed-warrior', label: '受祝福的勇士（2 道牧师戏法）' },
];
/** 游侠 2 级战斗风格选项 */
const RANGER_FIGHTING_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'defense', label: '防御' },
  { value: 'druidic-warrior', label: '德鲁伊教战士（2 道德鲁伊戏法）' },
];
/** 野蛮人 3 级原初学识：从野蛮人技能列表选 1 项获熟练（存 classFeatureChoices.primalKnowledgeSkill） */
const BARBARIAN_SKILL_OPTIONS = ['驯兽', '运动', '威吓', '自然', '察觉', '求生'];

/** 牧师 7 级受祝击（存 classFeatureChoices.blessedStrikes） */
const CLERIC_BLESSED_STRIKES_OPTIONS: { value: string; label: string }[] = [
  { value: 'divine-strike', label: '神圣打击' },
  { value: 'potent-spellcasting', label: '强力施法' },
];
/** 德鲁伊 7 级元素之怒（存 classFeatureChoices.elementalFury） */
const DRUID_ELEMENTAL_FURY_OPTIONS: { value: string; label: string }[] = [
  { value: 'potent-spellcasting', label: '强力施法' },
  { value: 'primal-strike', label: '原力蛮击' },
];
/** 术士龙族 6 级元素亲和伤害类型（存 classFeatureChoices.draconicElement） */
const DRACONIC_ELEMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'acid', label: '强酸' },
  { value: 'cold', label: '寒冷' },
  { value: 'fire', label: '火焰' },
  { value: 'lightning', label: '闪电' },
  { value: 'poison', label: '毒素' },
];
/** 驯兽师 3 级原初行侣类型（存 classFeatureChoices.primalCompanionType） */
const PRIMAL_COMPANION_OPTIONS: { value: string; label: string }[] = [
  { value: 'land', label: '大地野兽' },
  { value: 'sea', label: '海洋野兽' },
  { value: 'sky', label: '天空野兽' },
];
/** 猎人 3 级猎杀技艺（存 classFeatureChoices.hunterPrey） */
const HUNTER_PREY_OPTIONS: { value: string; label: string }[] = [
  { value: 'colossus-slayer', label: '巨像屠夫' },
  { value: 'horde-breaker', label: '灭族者' },
];
/** 猎人 7 级防守战术（存 classFeatureChoices.hunterDefense） */
const HUNTER_DEFENSE_OPTIONS: { value: string; label: string }[] = [
  { value: 'escape-the-horde', label: '冲出重围' },
  { value: 'multiattack-defense', label: '多重防御' },
];

/** 游侠熟练探险家 +2 门语言（常用语言列表，存 character.languages） */
const LANGUAGES = ['通用语', '精灵语', '矮人语', '龙语', '半身人语', '兽人语', '侏儒语', '木族语', '深渊语', '炼狱语', '原初语', '地底通用语', '巨人语', '地精语', '德鲁伊语'];

/** 德鲁伊 2 级荒野变形·已知形态：选 4 种野兽（CR≤1/4 无飞行），存 classFeatureChoices.wildShapeForms */
const WILD_SHAPE_FORM_OPTIONS = ['鼠', '乘用马', '蜘蛛', '狼', '獒犬', '鹰', '猫', '渡鸦', '猎犬', '章鱼', '鲨鱼', '狼蛛'];

const STEPS = [
  { id: 0, title: '确认升级', icon: CheckCircle },
  { id: 1, title: '生命值', icon: Heart },
  { id: 2, title: '职业特性与子职业', icon: ListChecks },
  { id: 3, title: '等级选择', icon: Settings2 },
];

const ABILITY_IDS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
const ABILITY_NAMES: Record<string, string> = {
  strength: '力量',
  dexterity: '敏捷',
  constitution: '体质',
  intelligence: '智力',
  wisdom: '感知',
  charisma: '魅力',
};

function getHitDie(className: string): number {
  const c = CLASSES.find((x) => x.name === className);
  return c?.hitDie ?? 8;
}

/** 固定值 = 职业生命骰一半向上取整 + 1 + 体质调整值 */
function fixedHP(hitDie: number, conMod: number): number {
  return Math.ceil(hitDie / 2) + 1 + conMod;
}

function getConMod(character: Character): number {
  const con = character.abilities?.constitution;
  const n = typeof con === 'number' ? con : typeof con === 'string' ? parseInt(String(con), 10) : 10;
  return Math.floor((n - 10) / 2);
}

export default function LevelUpPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { character, loading, error, updateCharacter, isOwner } = useCharacterData();

  const newLevel = character ? character.level + 1 : 1;
  const levelEntry = character ? getLevelEntryByClassName(character.class, newLevel) : null;
  const hitDie = character ? getHitDie(character.class) : 8;
  const conMod = character ? getConMod(character) : 0;

  const [step, setStep] = useState(0);
  const [hpChoice, setHpChoice] = useState<'roll' | 'fixed'>('fixed');
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(
    (character?.subclass ?? (character?.classFeatureChoices as Record<string, string> | undefined)?.subclass) ?? null
  );
  const [selectedExpertiseSkills, setSelectedExpertiseSkills] = useState<string[]>([]);
  const [selectedASIAbility, setSelectedASIAbility] = useState<string | null>(null);
  const [landTerrain, setLandTerrain] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.landTerrain ?? null
  );
  const [selectedScholarSkill, setSelectedScholarSkill] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.scholarSkill ?? null
  );
  const [selectedMysticArcanumSpell, setSelectedMysticArcanumSpell] = useState<string | null>(null);
  const [selectedFightingStyle, setSelectedFightingStyle] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.fightingStyle ?? null
  );
  const [selectedPrimalKnowledgeSkill, setSelectedPrimalKnowledgeSkill] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.primalKnowledgeSkill ?? null
  );
  const [selectedBlessedStrikes, setSelectedBlessedStrikes] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.blessedStrikes ?? null
  );
  const [selectedElementalFury, setSelectedElementalFury] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.elementalFury ?? null
  );
  const [selectedDraconicElement, setSelectedDraconicElement] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.draconicElement ?? null
  );
  const [selectedPrimalCompanionType, setSelectedPrimalCompanionType] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.primalCompanionType ?? null
  );
  const [selectedHunterPrey, setSelectedHunterPrey] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.hunterPrey ?? null
  );
  const [selectedHunterDefense, setSelectedHunterDefense] = useState<string | null>(
    (character?.classFeatureChoices as Record<string, string> | undefined)?.hunterDefense ?? null
  );
  const choices = character?.classFeatureChoices as Record<string, string> | undefined;
  const [selectedSpellMasteryL1, setSelectedSpellMasteryL1] = useState<string | null>(() => {
    try { const j = JSON.parse(choices?.spellMastery ?? '{}'); return j.level1 ?? null; } catch { return null; }
  });
  const [selectedSpellMasteryL2, setSelectedSpellMasteryL2] = useState<string | null>(() => {
    try { const j = JSON.parse(choices?.spellMastery ?? '{}'); return j.level2 ?? null; } catch { return null; }
  });
  const [selectedSignatureSpells, setSelectedSignatureSpells] = useState<string[]>(() => {
    try { return JSON.parse(choices?.signatureSpells ?? '[]'); } catch { return []; }
  });
  const [selectedDeftExplorerSkill, setSelectedDeftExplorerSkill] = useState<string | null>(choices?.deftExplorerSkill ?? null);
  const [selectedDeftExplorerLangs, setSelectedDeftExplorerLangs] = useState<string[]>(() => {
    try { return JSON.parse(choices?.deftExplorerLanguages ?? '[]'); } catch { return []; }
  });
  const [selectedLoreSkills, setSelectedLoreSkills] = useState<string[]>(() => {
    try { return JSON.parse(choices?.loreExtraSkills ?? '[]'); } catch { return []; }
  });
  const [selectedLoreSpells, setSelectedLoreSpells] = useState<string[]>(() => {
    try { return JSON.parse(choices?.loreMagicalSecrets ?? '[]'); } catch { return []; }
  });
  const [selectedMetamagic, setSelectedMetamagic] = useState<string[]>(() => {
    try { return JSON.parse(choices?.metamagic ?? '[]'); } catch { return []; }
  });
  const [selectedInvocations, setSelectedInvocations] = useState<string[]>(() => {
    try { return JSON.parse(choices?.invocations ?? '[]'); } catch { return []; }
  });
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(() => {
    try { return JSON.parse(choices?.maneuvers ?? '[]'); } catch { return []; }
  });
  const [selectedNewSpells, setSelectedNewSpells] = useState<string[]>([]);
  const [selectedMagicalSecrets10, setSelectedMagicalSecrets10] = useState<string[]>(() => {
    try { return JSON.parse(choices?.magicalSecrets10 ?? '[]'); } catch { return []; }
  });
  const [selectedFeyWandererSkill, setSelectedFeyWandererSkill] = useState<string | null>(choices?.feyWandererSkill ?? null);
  const [selectedWildShapeForms, setSelectedWildShapeForms] = useState<string[]>(() => {
    try { return JSON.parse(choices?.wildShapeForms ?? '[]'); } catch { return []; }
  });
  const [selectedBeastRageForm, setSelectedBeastRageForm] = useState<string | null>(choices?.beastRageForm ?? null);
  const [selectedBeastFormAspect, setSelectedBeastFormAspect] = useState<string | null>(choices?.beastFormAspect ?? null);
  const [selectedBeastPowerAspect, setSelectedBeastPowerAspect] = useState<string | null>(choices?.beastPowerAspect ?? null);
  const [newSpellSearch, setNewSpellSearch] = useState('');
  const [newSpellLevelFilter, setNewSpellLevelFilter] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // E2E/开发环境：供自动化直接同步子职与地形 state（因部分环境下 label 点击不触发 React）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as unknown as Record<string, unknown>).__levelUpSetSubclass = setSelectedSubclass;
    (window as unknown as Record<string, unknown>).__levelUpSetLandTerrain = setLandTerrain;
    return () => {
      delete (window as unknown as Record<string, unknown>).__levelUpSetSubclass;
      delete (window as unknown as Record<string, unknown>).__levelUpSetLandTerrain;
      delete (window as unknown as Record<string, unknown>).__levelUpSubclassReady;
    };
  }, []);
  // E2E：子职 state 提交后设标志，供 waitForFunction 轮询
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (window as unknown as Record<string, unknown>).__levelUpSubclassReady = selectedSubclass;
  }, [selectedSubclass]);

  // 新等级可选的最高法术环位（用于限制可选法术与环阶筛选）
  const maxSpellLevelForNewSpells = useMemo(
    () => (character?.class ? getMaxSpellLevelForClassAtLevel(character.class, newLevel) : 0),
    [character?.class, newLevel]
  );
  // 可选法术：仅限新等级已解锁的环位（如 5 级诗人最高 3 环，不能选 4 环及以上）
  const newSpellOptions = useMemo(() => {
    if (!character?.class || maxSpellLevelForNewSpells < 1) return [];
    return getSpellsForClassUpToLevel(character.class, maxSpellLevelForNewSpells)
      .filter((s) => s.level >= 1 && !(character.spells ?? []).includes(s.id));
  }, [character?.class, character?.spells, newLevel, maxSpellLevelForNewSpells]);
  const newSpellOptionsRef = useRef(newSpellOptions);
  newSpellOptionsRef.current = newSpellOptions;

  const filteredNewSpellOptions = useMemo(() => {
    let list = newSpellOptions;
    if (newSpellLevelFilter) {
      const lv = parseInt(newSpellLevelFilter, 10);
      if (!Number.isNaN(lv)) list = list.filter((s) => s.level === lv);
    }
    if (newSpellSearch.trim()) {
      const q = newSpellSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.includes(newSpellSearch.trim()) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [newSpellOptions, newSpellSearch, newSpellLevelFilter]);

  // E2E：供自动化直接设置 Step 3 新增法术（勾选前 N 个），避免 Playwright 下 checkbox 点击不触发 React；用 ref 取最新 options 保证挂载即可用
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as Record<string, (n: number) => void>;
    w.__levelUpSetStep3NewSpells = (count: number) => {
      const opts = newSpellOptionsRef.current;
      setSelectedNewSpells(opts.slice(0, Math.max(0, count)).map((s) => s.id));
    };
    return () => {
      delete w.__levelUpSetStep3NewSpells;
    };
  }, []);

  const subclasses = useMemo(
    () => (character ? getSubclassesByClassName(character.class) : []),
    [character?.class]
  );
  const needSubclass = useMemo(
    () => levelEntry && levelHasSubclassChoice(levelEntry) && newLevel === 3,
    [levelEntry, newLevel]
  );
  const needsExpertise = useMemo(
    () => levelEntry?.features?.some((f) => f.id === 'expertise' || f.id === 'expertise-2') ?? false,
    [levelEntry]
  );
  const expertiseCount = 2;
  const needsASI = useMemo(
    () => levelEntry?.choices?.some((c) => c.id === 'ability-score-improvement') ?? false,
    [levelEntry]
  );
  const needsScholar = character?.class === '法师' && newLevel === 2;
  const scholarSkillOptions = useMemo(
    () => (character?.skills ?? []).filter((s) => SCHOLAR_SKILL_OPTIONS.includes(s)),
    [character?.skills]
  );
  const mysticArcanumLevel = useMemo(() => {
    if (character?.class !== '魔契师') return null;
    if (newLevel === 11) return 6;
    if (newLevel === 13) return 7;
    if (newLevel === 15) return 8;
    if (newLevel === 17) return 9;
    return null;
  }, [character?.class, newLevel]);
  const mysticArcanumSpellOptions = useMemo(
    () => (mysticArcanumLevel !== null ? getSpellsForClassByLevel('魔契师', mysticArcanumLevel) : []),
    [mysticArcanumLevel]
  );
  const needsFightingStyle = (character?.class === '圣武士' || character?.class === '游侠') && newLevel === 2;
  const fightingStyleOptions = character?.class === '圣武士' ? PALADIN_FIGHTING_STYLE_OPTIONS : character?.class === '游侠' ? RANGER_FIGHTING_STYLE_OPTIONS : [];
  const needsPrimalKnowledge = character?.class === '野蛮人' && newLevel === 3;
  const needsBlessedStrikes = character?.class === '牧师' && newLevel === 7;
  const needsElementalFury = character?.class === '德鲁伊' && newLevel === 7;
  const needsDraconicElement = character?.class === '术士' && newLevel === 6 && (selectedSubclass ?? character?.subclass) === 'draconic';
  const needsPrimalCompanion = character?.class === '游侠' && newLevel === 3 && (selectedSubclass ?? character?.subclass) === 'beast-master';
  const needsHunterPrey = character?.class === '游侠' && newLevel === 3 && (selectedSubclass ?? character?.subclass) === 'hunter';
  const needsHunterDefense = character?.class === '游侠' && newLevel === 7 && (selectedSubclass ?? character?.subclass) === 'hunter';
  const needsSpellMastery = character?.class === '法师' && newLevel === 18;
  const needsSignatureSpells = character?.class === '法师' && newLevel === 20;
  const needsDeftExplorer = character?.class === '游侠' && newLevel === 2;
  const needsLoreExtraSkills = character?.class === '吟游诗人' && newLevel === 3 && (selectedSubclass ?? character?.subclass) === 'lore';
  const needsLoreMagicalSecrets = character?.class === '吟游诗人' && newLevel === 6 && (selectedSubclass ?? character?.subclass) === 'lore';
  const needsFeyWandererSkill = character?.class === '游侠' && newLevel === 3 && (selectedSubclass ?? character?.subclass) === 'fey-wanderer';
  const FEY_WANDERER_SKILL_OPTIONS = ['欺瞒', '表演', '游说'];
  const needsWildShapeForms = character?.class === '德鲁伊' && newLevel === 2;
  const needsBeastRageForm = character?.class === '野蛮人' && newLevel === 3 && (selectedSubclass ?? character?.subclass) === 'beast';
  const BEAST_RAGE_OPTIONS = ['熊', '鹰', '狼'];
  const needsBeastFormAspect = character?.class === '野蛮人' && newLevel === 6 && (selectedSubclass ?? character?.subclass) === 'beast';
  const BEAST_FORM_OPTIONS = ['枭', '豹', '鲑'];
  const needsBeastPowerAspect = character?.class === '野蛮人' && newLevel === 14 && (selectedSubclass ?? character?.subclass) === 'beast';
  const BEAST_POWER_OPTIONS = ['猎鹰', '雄狮', '角羊'];
  const needsMetamagic = character?.class === '术士' && (newLevel === 2 || newLevel === 10 || newLevel === 17);
  const metamagicTargetCount = useMemo(() => getMetamagicCountAtLevel(newLevel), [newLevel]);
  const needsInvocations = character?.class === '魔契师';
  const invocationTargetCount = INVOCATION_COUNT_BY_LEVEL[newLevel] ?? 0;
  const needsManeuvers = character?.class === '战士' && (newLevel === 3 || newLevel === 7 || newLevel === 10 || newLevel === 15) && (selectedSubclass ?? character?.subclass) === 'battle-master';
  const maneuverTargetCount = useMemo(() => getManeuverCountAtLevel(newLevel).total, [newLevel]);
  // 本等级「新增」法术数 = 规则表本级数量 − 上一级数量（与角色当前已有数量无关，符合规则表）
  const needNewSpellsCount = useMemo(() => {
    if (!character?.class) return 0;
    const rulesNew = getSpellcastingRules(character.class, newLevel);
    if (!rulesNew) return 0;
    const prevLevel = newLevel - 1;
    const rulesPrev = prevLevel >= 1 ? getSpellcastingRules(character.class, prevLevel) : null;
    const newTotal = rulesNew.spellbookSpellsKnown ?? rulesNew.preparedSpells ?? 0;
    const prevTotal = rulesPrev ? (rulesPrev.spellbookSpellsKnown ?? rulesPrev.preparedSpells ?? 0) : 0;
    let n = Math.max(0, newTotal - prevTotal);
    if (character.class === '吟游诗人' && newLevel === 10) n = 0;
    return n;
  }, [character?.class, newLevel]);
  const needsNewSpells = needNewSpellsCount > 0;
  const needsMagicalSecrets10 = character?.class === '吟游诗人' && newLevel === 10;
  const magicalSecrets10Count = 1;
  const magicalSecrets10SpellOptions = useMemo(() => {
    const byId = new Map<string, Spell>();
    for (const cls of ['吟游诗人', '牧师', '德鲁伊', '法师'] as const) {
      getSpellsForClassUpToLevel(cls, 5).filter((s) => s.level >= 1).forEach((s) => byId.set(s.id, s));
    }
    return Array.from(byId.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, []);
  const wizardSpellbookForLevel = useMemo(() => {
    if (character?.class !== '法师' || !character?.spells) return { level1: [] as string[], level2: [] as string[], level3: [] as string[] };
    const level1: string[] = [];
    const level2: string[] = [];
    const level3: string[] = [];
    for (const id of character.spells) {
      const s = getSpellById(id);
      if (!s || s.level < 1) continue;
      if (s.level === 1) level1.push(id);
      else if (s.level === 2) level2.push(id);
      else if (s.level === 3) level3.push(id);
    }
    return { level1, level2, level3 };
  }, [character?.class, character?.spells]);
  const deftExplorerSkillOptions = useMemo(() => {
    const skills = character?.skills ?? [];
    let expertise: string[] = [];
    try { expertise = JSON.parse(choices?.expertiseSkills ?? '[]'); } catch { }
    return skills.filter((s) => !expertise.includes(s));
  }, [character?.skills, choices?.expertiseSkills]);
  const loreMagicalSecretsSpellOptions = useMemo(() => {
    const byId = new Map<string, Spell>();
    for (const cls of ['牧师', '德鲁伊', '法师'] as const) {
      getSpellsForClassUpToLevel(cls, 3).filter((s) => s.level >= 1).forEach((s) => byId.set(s.id, s));
    }
    return Array.from(byId.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, []);
  const invocationOptions = useMemo(
    () => getAvailableInvocations(newLevel, selectedInvocations),
    [newLevel, selectedInvocations]
  );
  const invocationOptionsRef = useRef(invocationOptions);
  invocationOptionsRef.current = invocationOptions;
  // E2E：逸闻 3 技能、魔能祈唤，供自动化直接设置 state（避免 checkbox 点击不触发 React）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as Record<string, unknown>;
    (w as Record<string, (count: number) => void>).__levelUpSetStep3LoreSkills = (count: number) => {
      setSelectedLoreSkills(SKILLS.slice(0, Math.max(0, count)).map((s) => s.name));
    };
    (w as Record<string, (count: number) => void>).__levelUpSetStep3Invocations = (count: number) => {
      const opts = invocationOptionsRef.current;
      setSelectedInvocations(opts.slice(0, Math.max(0, count)).map((inv) => inv.id));
    };
    return () => {
      delete (w as Record<string, unknown>).__levelUpSetStep3LoreSkills;
      delete (w as Record<string, unknown>).__levelUpSetStep3Invocations;
    };
  }, []);
  const hasLevelChoices = needsExpertise || needsASI || (needsScholar && scholarSkillOptions.length > 0) || (mysticArcanumLevel !== null && mysticArcanumSpellOptions.length > 0) || needsFightingStyle || needsPrimalKnowledge || needsBlessedStrikes || needsElementalFury || needsDraconicElement || needsPrimalCompanion || needsHunterPrey || needsHunterDefense || needsSpellMastery || needsSignatureSpells || needsDeftExplorer || needsLoreExtraSkills || needsLoreMagicalSecrets || needsMagicalSecrets10 || needsFeyWandererSkill || needsWildShapeForms || needsBeastRageForm || needsBeastFormAspect || needsBeastPowerAspect || needsMetamagic || needsInvocations || needsManeuvers || needsNewSpells;
  const isDruidLand = character?.class === '德鲁伊' && selectedSubclass === 'land';
  const canProceedFromStep2 = useMemo(() => {
    if (needSubclass && !selectedSubclass) return false;
    if (isDruidLand && !landTerrain) return false;
    return true;
  }, [needSubclass, selectedSubclass, isDruidLand, landTerrain]);
  const canFinish = useMemo(() => {
    if (step === 2 && !hasLevelChoices) {
      return canProceedFromStep2;
    }
    if (step === 2) return canProceedFromStep2;
    if (step === 3) {
      if (needsExpertise && selectedExpertiseSkills.length !== expertiseCount) return false;
      if (needsASI && !selectedASIAbility) return false;
      if (needsScholar && !selectedScholarSkill) return false;
      if (mysticArcanumLevel !== null && !selectedMysticArcanumSpell) return false;
      if (needsFightingStyle && !selectedFightingStyle) return false;
      if (needsPrimalKnowledge && !selectedPrimalKnowledgeSkill) return false;
      if (needsBlessedStrikes && !selectedBlessedStrikes) return false;
      if (needsElementalFury && !selectedElementalFury) return false;
      if (needsDraconicElement && !selectedDraconicElement) return false;
      if (needsPrimalCompanion && !selectedPrimalCompanionType) return false;
      if (needsHunterPrey && !selectedHunterPrey) return false;
      if (needsHunterDefense && !selectedHunterDefense) return false;
      if (needsSpellMastery && (!selectedSpellMasteryL1 || !selectedSpellMasteryL2)) return false;
      if (needsSignatureSpells && selectedSignatureSpells.length !== 2) return false;
      if (needsDeftExplorer && (!selectedDeftExplorerSkill || selectedDeftExplorerLangs.length !== 2)) return false;
      if (needsLoreExtraSkills && selectedLoreSkills.length !== 3) return false;
      if (needsLoreMagicalSecrets && selectedLoreSpells.length !== 2) return false;
      if (needsMagicalSecrets10 && selectedMagicalSecrets10.length !== magicalSecrets10Count) return false;
      if (needsFeyWandererSkill && !selectedFeyWandererSkill) return false;
      if (needsWildShapeForms && selectedWildShapeForms.length !== 4) return false;
      if (needsBeastRageForm && !selectedBeastRageForm) return false;
      if (needsBeastFormAspect && !selectedBeastFormAspect) return false;
      if (needsBeastPowerAspect && !selectedBeastPowerAspect) return false;
      if (needsMetamagic && selectedMetamagic.length !== metamagicTargetCount) return false;
      if (needsInvocations && selectedInvocations.length !== invocationTargetCount) return false;
      if (needsManeuvers && selectedManeuvers.length !== maneuverTargetCount) return false;
      if (needsNewSpells && selectedNewSpells.length !== needNewSpellsCount) return false;
      return true;
    }
    if (step === 1 && hpChoice === 'roll' && hpRoll === null) return false;
    return false;
  }, [step, needSubclass, selectedSubclass, hpChoice, hpRoll, hasLevelChoices, canProceedFromStep2, needsExpertise, needsASI, needsScholar, mysticArcanumLevel, needsFightingStyle, needsPrimalKnowledge, needsBlessedStrikes, needsElementalFury, needsDraconicElement, needsPrimalCompanion, needsHunterPrey, needsHunterDefense, needsSpellMastery, needsSignatureSpells, needsDeftExplorer, needsLoreExtraSkills, needsLoreMagicalSecrets, needsMagicalSecrets10, needsMetamagic, needsInvocations, needsManeuvers, needsNewSpells, needNewSpellsCount, selectedExpertiseSkills, selectedASIAbility, selectedScholarSkill, selectedMysticArcanumSpell, selectedFightingStyle, selectedPrimalKnowledgeSkill, selectedBlessedStrikes, selectedElementalFury, selectedDraconicElement, selectedPrimalCompanionType, selectedHunterPrey, selectedHunterDefense, selectedSpellMasteryL1, selectedSpellMasteryL2, selectedSignatureSpells, selectedDeftExplorerSkill, selectedDeftExplorerLangs, selectedLoreSkills, selectedLoreSpells, selectedMagicalSecrets10, selectedFeyWandererSkill, selectedWildShapeForms, selectedBeastRageForm, selectedBeastFormAspect, selectedBeastPowerAspect, selectedMetamagic, selectedInvocations, selectedManeuvers, selectedNewSpells, expertiseCount, metamagicTargetCount, invocationTargetCount, maneuverTargetCount, magicalSecrets10Count, needsFeyWandererSkill, needsWildShapeForms, needsBeastRageForm, needsBeastFormAspect, needsBeastPowerAspect]);

  const handleRollHP = () => {
    const roll = Math.floor(Math.random() * hitDie) + 1;
    setHpRoll(roll);
  };

  const newHP = useMemo(() => {
    if (!character) return 0;
    const base = character.hitPoints;
    if (hpChoice === 'fixed') return base + fixedHP(hitDie, conMod);
    if (hpRoll !== null) return base + hpRoll + conMod;
    return base;
  }, [character?.hitPoints, hpChoice, hpRoll, hitDie, conMod]);

  const handleFinish = async () => {
    if (!character) return;
    const isFinishingFromStep2 = step === 2 && !hasLevelChoices;
    const isFinishingFromStep3 = step === 3;
    if (!canFinish && !isFinishingFromStep2) return;
    if (step === 2 && hasLevelChoices) return;
    setSaving(true);
    try {
      const choices: Record<string, string> = { ...(character.classFeatureChoices as Record<string, string> | undefined) };
      if (newLevel === 3 && selectedSubclass) {
        choices.subclass = selectedSubclass;
      }
      if (character.class === '德鲁伊' && (selectedSubclass === 'land' || character.subclass === 'land') && landTerrain) {
        choices.landTerrain = landTerrain;
      }
      if (isFinishingFromStep3 && needsExpertise && selectedExpertiseSkills.length > 0) {
        try {
          const existing: string[] = JSON.parse(choices.expertiseSkills ?? '[]');
          choices.expertiseSkills = JSON.stringify([...existing, ...selectedExpertiseSkills]);
        } catch {
          choices.expertiseSkills = JSON.stringify(selectedExpertiseSkills);
        }
      }
      if (isFinishingFromStep3 && needsASI && selectedASIAbility) {
        choices[`asiLevel${newLevel}`] = selectedASIAbility;
      }
      if (isFinishingFromStep3 && needsScholar && selectedScholarSkill) {
        choices.scholarSkill = selectedScholarSkill;
        try {
          const existing: string[] = JSON.parse(choices.expertiseSkills ?? '[]');
          if (!existing.includes(selectedScholarSkill)) {
            choices.expertiseSkills = JSON.stringify([...existing, selectedScholarSkill]);
          }
        } catch {
          choices.expertiseSkills = JSON.stringify([selectedScholarSkill]);
        }
      }
      const updates: Partial<Character> = {
        level: newLevel,
        hitPoints: newHP,
        updatedAt: new Date().toISOString(),
      };
      if (Object.keys(choices).length > 0) {
        updates.classFeatureChoices = choices;
      }
      if (newLevel === 3 && selectedSubclass) {
        updates.subclass = selectedSubclass;
      }
      if (isFinishingFromStep3 && needsASI && selectedASIAbility && character.abilities) {
        const ab = character.abilities as unknown as Record<string, number>;
        const current = typeof ab[selectedASIAbility] === 'number' ? ab[selectedASIAbility] : 10;
        updates.abilities = { ...ab, [selectedASIAbility]: Math.min(30, current + 2) } as unknown as Character['abilities'];
      }
      const classId = CLASSES.find((c) => c.name === character.class)?.id;
      const subclassId = selectedSubclass ?? character.subclass;
      const effectiveLandTerrain = landTerrain ?? (character.classFeatureChoices as Record<string, string> | undefined)?.landTerrain;
      let spellIdsToAdd: string[] = [];
      if (classId && subclassId) {
        spellIdsToAdd = getSubclassSpellIdsUpToLevel(
          classId,
          subclassId,
          newLevel,
          character.class === '德鲁伊' && subclassId === 'land' ? effectiveLandTerrain : undefined
        );
      }
      if (character.class === '法师' && subclassId) {
        const schoolSpells = getWizardSchoolSpellIdsForLevel(subclassId, newLevel);
        spellIdsToAdd = [...spellIdsToAdd, ...schoolSpells];
      }
      if (spellIdsToAdd.length > 0) {
        const existing = character.spells ?? [];
        updates.spells = [...new Set([...existing, ...spellIdsToAdd])];
      }
      if (mysticArcanumLevel !== null && selectedMysticArcanumSpell) {
        const key = `level${mysticArcanumLevel}` as 'level6' | 'level7' | 'level8' | 'level9';
        updates.mysticArcanum = { ...(character.mysticArcanum ?? {}), [key]: selectedMysticArcanumSpell };
      }
      if (isFinishingFromStep3 && needsFightingStyle && selectedFightingStyle) {
        choices.fightingStyle = selectedFightingStyle;
      }
      if (isFinishingFromStep3 && needsPrimalKnowledge && selectedPrimalKnowledgeSkill) {
        choices.primalKnowledgeSkill = selectedPrimalKnowledgeSkill;
        const existingSkills = character.skills ?? [];
        if (!existingSkills.includes(selectedPrimalKnowledgeSkill)) {
          updates.skills = [...existingSkills, selectedPrimalKnowledgeSkill];
        }
      }
      if (isFinishingFromStep3 && needsBlessedStrikes && selectedBlessedStrikes) {
        choices.blessedStrikes = selectedBlessedStrikes;
      }
      if (isFinishingFromStep3 && needsElementalFury && selectedElementalFury) {
        choices.elementalFury = selectedElementalFury;
      }
      if (isFinishingFromStep3 && needsDraconicElement && selectedDraconicElement) {
        choices.draconicElement = selectedDraconicElement;
      }
      if (isFinishingFromStep3 && needsPrimalCompanion && selectedPrimalCompanionType) {
        choices.primalCompanionType = selectedPrimalCompanionType;
      }
      if (isFinishingFromStep3 && needsHunterPrey && selectedHunterPrey) {
        choices.hunterPrey = selectedHunterPrey;
      }
      if (isFinishingFromStep3 && needsHunterDefense && selectedHunterDefense) {
        choices.hunterDefense = selectedHunterDefense;
      }
      if (isFinishingFromStep3 && needsSpellMastery && selectedSpellMasteryL1 && selectedSpellMasteryL2) {
        choices.spellMastery = JSON.stringify({ level1: selectedSpellMasteryL1, level2: selectedSpellMasteryL2 });
      }
      if (isFinishingFromStep3 && needsSignatureSpells && selectedSignatureSpells.length === 2) {
        choices.signatureSpells = JSON.stringify(selectedSignatureSpells);
      }
      if (isFinishingFromStep3 && needsDeftExplorer && selectedDeftExplorerSkill && selectedDeftExplorerLangs.length === 2) {
        choices.deftExplorerSkill = selectedDeftExplorerSkill;
        choices.deftExplorerLanguages = JSON.stringify(selectedDeftExplorerLangs);
        try {
          const existingExp: string[] = JSON.parse(choices.expertiseSkills ?? '[]');
          if (!existingExp.includes(selectedDeftExplorerSkill)) {
            choices.expertiseSkills = JSON.stringify([...existingExp, selectedDeftExplorerSkill]);
          }
        } catch {
          choices.expertiseSkills = JSON.stringify([selectedDeftExplorerSkill]);
        }
        const existingLangs = character.languages ?? [];
        updates.languages = [...new Set([...existingLangs, ...selectedDeftExplorerLangs])];
      }
      if (isFinishingFromStep3 && needsLoreExtraSkills && selectedLoreSkills.length === 3) {
        choices.loreExtraSkills = JSON.stringify(selectedLoreSkills);
        const existingSkills = character.skills ?? [];
        updates.skills = [...new Set([...existingSkills, ...selectedLoreSkills])];
      }
      if (isFinishingFromStep3 && needsLoreMagicalSecrets && selectedLoreSpells.length === 2) {
        choices.loreMagicalSecrets = JSON.stringify(selectedLoreSpells);
        const existingSpells = character.spells ?? [];
        updates.spells = [...new Set([...existingSpells, ...selectedLoreSpells])];
      }
      if (isFinishingFromStep3 && needsMagicalSecrets10 && selectedMagicalSecrets10.length > 0) {
        choices.magicalSecrets10 = JSON.stringify(selectedMagicalSecrets10);
        const existingSpells = updates.spells ?? character.spells ?? [];
        updates.spells = [...new Set([...existingSpells, ...selectedMagicalSecrets10])];
      }
      if (isFinishingFromStep3 && needsFeyWandererSkill && selectedFeyWandererSkill) {
        choices.feyWandererSkill = selectedFeyWandererSkill;
        const existingSkills = character.skills ?? [];
        if (!existingSkills.includes(selectedFeyWandererSkill)) {
          updates.skills = [...existingSkills, selectedFeyWandererSkill];
        }
      }
      if (isFinishingFromStep3 && needsWildShapeForms && selectedWildShapeForms.length === 4) {
        choices.wildShapeForms = JSON.stringify(selectedWildShapeForms);
      }
      if (isFinishingFromStep3 && needsBeastRageForm && selectedBeastRageForm) {
        choices.beastRageForm = selectedBeastRageForm;
      }
      if (isFinishingFromStep3 && needsBeastFormAspect && selectedBeastFormAspect) {
        choices.beastFormAspect = selectedBeastFormAspect;
      }
      if (isFinishingFromStep3 && needsBeastPowerAspect && selectedBeastPowerAspect) {
        choices.beastPowerAspect = selectedBeastPowerAspect;
      }
      if (isFinishingFromStep3 && needsMetamagic && selectedMetamagic.length > 0) {
        choices.metamagic = JSON.stringify(selectedMetamagic);
      }
      if (isFinishingFromStep3 && needsInvocations && selectedInvocations.length > 0) {
        choices.invocations = JSON.stringify(selectedInvocations);
      }
      if (isFinishingFromStep3 && needsManeuvers && selectedManeuvers.length > 0) {
        choices.maneuvers = JSON.stringify(selectedManeuvers);
      }
      if (isFinishingFromStep3 && needsNewSpells && selectedNewSpells.length > 0) {
        const baseSpells = updates.spells ?? character.spells ?? [];
        const maxSpellLevel = maxSpellLevelForNewSpells;
        const validNewSpells = selectedNewSpells.filter((id) => {
          const s = getSpellById(id);
          return s && s.level >= 1 && s.level <= maxSpellLevel;
        });
        updates.spells = [...new Set([...baseSpells, ...validNewSpells])];
      }
      if (Object.keys(choices).length > 0) {
        updates.classFeatureChoices = choices;
      }
      if (character.class === '吟游诗人' && newLevel === 20) {
        const base = updates.spells ?? character.spells ?? [];
        updates.spells = [...new Set([...base, 'power-word-heal', 'power-word-kill'])];
      }
      if (character.class === '法师' && (selectedSubclass ?? character.subclass) === 'illusion' && newLevel === 3) {
        const base = updates.spells ?? character.spells ?? [];
        if (!base.includes('minor-illusion')) {
          updates.spells = [...base, 'minor-illusion'];
        }
      }
      await updateCharacter(updates);
      router.push(`/characters/${id}/character-sheet`);
    } catch {
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpertiseSkill = (skill: string) => {
    setSelectedExpertiseSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : prev.length < expertiseCount ? [...prev, skill] : [...prev.slice(1), skill]
    );
  };

  if (error) {
    router.push('/');
    return null;
  }

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (character.level >= 20) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link href={`/characters/${id}/character-sheet`} className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6">
            <ArrowLeft className="w-5 h-5" />
            返回角色档案
          </Link>
          <div className="card bg-amber-50 border-2 border-amber-300">
            <h1 className="text-xl font-bold text-amber-900 mb-2">已达最高等级</h1>
            <p className="text-amber-800">你的角色已是 20 级，无法继续升级。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href={`/characters/${id}/character-sheet`} className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          返回角色档案
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2" data-testid="level-up-heading">
          <TrendingUp className="w-8 h-8 text-green-600" />
          升级到 {newLevel} 级
        </h1>
        <p className="text-gray-600 mb-6">
          {character.name} · {character.class} · 当前 {character.level} 级 → {newLevel} 级
        </p>

        {/* 步骤指示 */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  active
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Step 0: 确认升级 */}
        {step === 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">确认升级</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">当前等级</div>
                <div className="text-lg font-semibold">{character.level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">下一等级</div>
                <div className="text-lg font-semibold">{newLevel}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">职业</div>
                <div className="text-lg font-semibold">{character.class}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">新熟练加值</div>
                <div className="text-lg font-semibold">+{Math.floor(2 + (newLevel - 1) / 4)}</div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">升级后将获得新的职业特性与生命值。点击「下一步」继续。</p>
            <button type="button" onClick={() => setStep(1)} className="btn btn-primary inline-flex items-center gap-2">
              下一步：生命值
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: 生命值 */}
        {step === 1 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">生命值</h2>
            <p className="text-gray-600 mb-4">
              职业生命骰：d{hitDie}，体质调整值：{conMod >= 0 ? '+' : ''}{conMod}。选择掷骰或固定值增加生命值。
            </p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hpChoice"
                  checked={hpChoice === 'fixed'}
                  onChange={() => setHpChoice('fixed')}
                  className="w-4 h-4"
                />
                <span>固定值：+{fixedHP(hitDie, conMod)}（半骰+1+体质）</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="hpChoice"
                  checked={hpChoice === 'roll'}
                  onChange={() => setHpChoice('roll')}
                  className="w-4 h-4"
                />
                <span>掷骰：1d{hitDie} + 体质</span>
              </label>
              {hpChoice === 'roll' && (
                <div className="flex items-center gap-4">
                  <button type="button" onClick={handleRollHP} className="btn btn-secondary">
                    {hpRoll === null ? '掷 1d' + hitDie : '重掷'}
                  </button>
                  {hpRoll !== null && (
                    <span className="text-lg">
                      结果：{hpRoll} + {conMod} = +{hpRoll + conMod}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              升级后总生命值：<strong>{newHP}</strong>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setStep(0)} className="btn btn-secondary">
                上一步
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-primary inline-flex items-center gap-2"
                disabled={hpChoice === 'roll' && hpRoll === null}
              >
                下一步：职业特性与子职业
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 职业特性与子职业 */}
        {step === 2 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{newLevel} 级职业特性</h2>
            {levelEntry && (
              <>
                {(levelEntry.features?.length ?? 0) > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-600 mb-2">本等级获得</div>
                    <ul className="space-y-4 list-none pl-0">
                      {(levelEntry.features ?? []).map((f) => {
                        if (f.id === 'subclass-feature') {
                          const classId = character?.class ? getClassIdFromName(character.class) : null;
                          const subclassId = selectedSubclass ?? character?.subclass;
                          const subFeatures = classId && subclassId
                            ? getSubclassFeaturesByLevel(classId, subclassId, newLevel)
                            : [];
                          if (subFeatures.length > 0) {
                            return subFeatures.map((sub, idx) => (
                              <li key={`subclass-${idx}-${sub.name}`} className="border-l-4 border-amber-500/60 pl-4 py-2 bg-amber-50/50 rounded-r">
                                <div className="font-semibold text-gray-900">{sub.name}</div>
                                {sub.nameEn && <div className="text-xs text-gray-500 mb-1">{sub.nameEn}</div>}
                                {sub.description && <p className="text-sm text-gray-700 mt-1">{sub.description}</p>}
                                {sub.details && sub.details.length > 0 && (
                                  <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                                    {sub.details.map((d, i) => (
                                      <li key={i}>{d}</li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ));
                          }
                          return (
                            <li key={f.id} className="border-l-4 border-amber-500/60 pl-4 py-2 bg-amber-50/50 rounded-r">
                              <div className="font-semibold text-gray-900">{f.name}</div>
                              <p className="text-sm text-gray-600 mt-1">详见《2024 核心规则》对应子职业说明。</p>
                            </li>
                          );
                        }
                        const detail = character?.class
                          ? getClassFeatureDetailByLevel(character.class, newLevel, f.id)
                          : undefined;
                        return (
                          <li key={f.id} className="border-l-4 border-amber-500/60 pl-4 py-2 bg-amber-50/50 rounded-r">
                            <div className="font-semibold text-gray-900">{detail?.name ?? f.name}</div>
                            {detail?.nameEn && (
                              <div className="text-xs text-gray-500 mb-1">{detail.nameEn}</div>
                            )}
                            {detail?.description && (
                              <p className="text-sm text-gray-700 mt-1">{detail.description}</p>
                            )}
                            {detail?.details && detail.details.length > 0 && (
                              <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                                {detail.details.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {needSubclass && subclasses.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">选择子职业（3 级）</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {subclasses.map((s: Subclass) => (
                        <label
                          key={s.id}
                          data-testid={`subclass-${s.id}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedSubclass === s.id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedSubclass(s.id)}
                        >
                          <input
                            type="radio"
                            name="subclass"
                            value={s.id}
                            checked={selectedSubclass === s.id}
                            onChange={() => setSelectedSubclass(s.id)}
                            className="w-4 h-4"
                          />
                          <span className="font-medium">{s.name}</span>
                          <span className="text-sm text-gray-500">{s.nameEn}</span>
                        </label>
                      ))}
                    </div>
                    {isDruidLand && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">大地结社：选择地形</div>
                        <div className="flex flex-wrap gap-2">
                          {LAND_TERRAIN_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              data-testid={`land-terrain-${opt.value}`}
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                                landTerrain === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setLandTerrain(opt.value)}
                            >
                              <input
                                type="radio"
                                name="landTerrain"
                                value={opt.value}
                                checked={landTerrain === opt.value}
                                onChange={() => setLandTerrain(opt.value)}
                                className="w-4 h-4"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {levelEntry.choices?.filter((c) => c.id !== 'subclass').map((c) => (
                  <div key={c.id} className="text-sm text-gray-600 mb-2">
                    {c.name}（选择见角色卡或规则书）
                  </div>
                ))}
              </>
            )}
            {!levelEntry && <p className="text-gray-600">本等级无额外选项。</p>}
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                上一步
              </button>
              {hasLevelChoices ? (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceedFromStep2 || !isOwner}
                  className="btn btn-primary inline-flex items-center gap-2"
                  data-testid="level-up-next-to-step3"
                  data-can-proceed={String(canProceedFromStep2)}
                  data-is-owner={String(isOwner)}
                  data-selected-subclass={selectedSubclass ?? ''}
                >
                  下一步：等级选择
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  {!isOwner && <p className="text-amber-600">仅角色拥有者可执行升级。</p>}
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={!canProceedFromStep2 || saving || !isOwner}
                    className="btn btn-primary inline-flex items-center gap-2"
                    data-testid="level-up-finish-from-step2"
                    data-selected-subclass={selectedSubclass ?? ''}
                    data-can-proceed={String(canProceedFromStep2)}
                    data-is-owner={String(isOwner)}
                  >
                    {saving ? '保存中…' : '完成升级'}
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 等级选择（专精 / 属性值提升等） */}
        {step === 3 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{newLevel} 级 · 等级选择</h2>
            {!hasLevelChoices ? (
              <p className="text-gray-600 mb-4">本等级无需额外选择，可直接完成升级。</p>
            ) : (
              <div className="space-y-6">
                {/* 属性值提升优先展示，避免被法术选择等长列表挡住 */}
                {needsASI && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">属性值提升（+2 至一项属性）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择一项属性，使其永久 +2（上限 30）。</p>
                    <select
                      value={selectedASIAbility ?? ''}
                      onChange={(e) => setSelectedASIAbility(e.target.value || null)}
                      className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs"
                    >
                      <option value="">请选择</option>
                      {ABILITY_IDS.map((aid) => (
                        <option key={aid} value={aid}>
                          {ABILITY_NAMES[aid]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {needsExpertise && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">专精（选择 {expertiseCount} 项你熟练的技能）</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      你获得两项由你选择的你熟练技能的专精。推荐选择表演和游说。
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(character?.skills ?? []).map((skill) => (
                        <label
                          key={skill}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedExpertiseSkills.includes(skill) ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedExpertiseSkills.includes(skill)}
                            onChange={() => toggleExpertiseSkill(skill)}
                            className="w-4 h-4"
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                    {selectedExpertiseSkills.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">已选：{selectedExpertiseSkills.join('、')}</p>
                    )}
                  </div>
                )}
                {needsFightingStyle && fightingStyleOptions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">战斗风格</h3>
                    <p className="text-sm text-gray-600 mb-3">选择一项战斗风格。</p>
                    <div className="flex flex-wrap gap-2">
                      {fightingStyleOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedFightingStyle === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="fightingStyle"
                            value={opt.value}
                            checked={selectedFightingStyle === opt.value}
                            onChange={() => setSelectedFightingStyle(opt.value)}
                            className="w-4 h-4"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsPrimalKnowledge && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">原初学识（选 1 项野蛮人技能获熟练）</h3>
                    <p className="text-sm text-gray-600 mb-3">从野蛮人技能列表中额外获得一项技能的熟练。</p>
                    <div className="flex flex-wrap gap-2">
                      {BARBARIAN_SKILL_OPTIONS.map((skill) => (
                        <label
                          key={skill}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedPrimalKnowledgeSkill === skill ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="primalKnowledgeSkill"
                            value={skill}
                            checked={selectedPrimalKnowledgeSkill === skill}
                            onChange={() => setSelectedPrimalKnowledgeSkill(skill)}
                            className="w-4 h-4"
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsBlessedStrikes && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">受祝击（选一）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择神圣打击或强力施法。</p>
                    <div className="flex flex-wrap gap-2">
                      {CLERIC_BLESSED_STRIKES_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedBlessedStrikes === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="blessedStrikes" value={opt.value} checked={selectedBlessedStrikes === opt.value} onChange={() => setSelectedBlessedStrikes(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsElementalFury && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">元素之怒（选一）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择强力施法或原力蛮击。</p>
                    <div className="flex flex-wrap gap-2">
                      {DRUID_ELEMENTAL_FURY_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedElementalFury === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="elementalFury" value={opt.value} checked={selectedElementalFury === opt.value} onChange={() => setSelectedElementalFury(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsDraconicElement && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">元素亲和（龙族术法 6 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择伤害类型，获得抗性并将魅力调整值加到该类型法术伤害。</p>
                    <div className="flex flex-wrap gap-2">
                      {DRACONIC_ELEMENT_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedDraconicElement === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="draconicElement" value={opt.value} checked={selectedDraconicElement === opt.value} onChange={() => setSelectedDraconicElement(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsPrimalCompanion && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">原初行侣（驯兽师 3 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择你的原初行侣类型。</p>
                    <div className="flex flex-wrap gap-2">
                      {PRIMAL_COMPANION_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedPrimalCompanionType === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="primalCompanionType" value={opt.value} checked={selectedPrimalCompanionType === opt.value} onChange={() => setSelectedPrimalCompanionType(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsHunterPrey && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">猎杀技艺（猎人 3 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择一项，短休或长休后可更换。</p>
                    <div className="flex flex-wrap gap-2">
                      {HUNTER_PREY_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedHunterPrey === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="hunterPrey" value={opt.value} checked={selectedHunterPrey === opt.value} onChange={() => setSelectedHunterPrey(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsHunterDefense && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">防守战术（猎人 7 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择一项，短休或长休后可更换。</p>
                    <div className="flex flex-wrap gap-2">
                      {HUNTER_DEFENSE_OPTIONS.map((opt) => (
                        <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedHunterDefense === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="hunterDefense" value={opt.value} checked={selectedHunterDefense === opt.value} onChange={() => setSelectedHunterDefense(opt.value)} className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsSpellMastery && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">法术精通（法师 18 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">从法术书中选 1 道一环、1 道二环，可随意施展且不消耗法术位。</p>
                    <div className="grid gap-3 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">一环</label>
                        <select value={selectedSpellMasteryL1 ?? ''} onChange={(e) => setSelectedSpellMasteryL1(e.target.value || null)} className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full">
                          <option value="">请选择</option>
                          {wizardSpellbookForLevel.level1.map((id) => {
                            const s = getSpellById(id);
                            return s ? <option key={id} value={id}>{s.name}（{s.nameEn}）</option> : null;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">二环</label>
                        <select value={selectedSpellMasteryL2 ?? ''} onChange={(e) => setSelectedSpellMasteryL2(e.target.value || null)} className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full">
                          <option value="">请选择</option>
                          {wizardSpellbookForLevel.level2.map((id) => {
                            const s = getSpellById(id);
                            return s ? <option key={id} value={id}>{s.name}（{s.nameEn}）</option> : null;
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {needsSignatureSpells && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">招牌法术（法师 20 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">从法术书中选 2 道三环法术，可随意施展且不消耗法术位。</p>
                    <div className="flex flex-wrap gap-2">
                      {wizardSpellbookForLevel.level3.map((id) => {
                        const s = getSpellById(id);
                        if (!s) return null;
                        const checked = selectedSignatureSpells.includes(id);
                        return (
                          <label key={id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedSignatureSpells((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev))} className="w-4 h-4" />
                            <span>{s.name}（{s.nameEn}）</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsDeftExplorer && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">熟练探险家（游侠 2 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选 1 项已熟练技能获专精，并选 2 门语言。</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">专精技能（选 1）</label>
                        <select value={selectedDeftExplorerSkill ?? ''} onChange={(e) => setSelectedDeftExplorerSkill(e.target.value || null)} className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs">
                          <option value="">请选择</option>
                          {deftExplorerSkillOptions.map((skill) => (
                            <option key={skill} value={skill}>{skill}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">语言（选 2）</label>
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGES.map((lang) => {
                            const checked = selectedDeftExplorerLangs.includes(lang);
                            return (
                              <label key={lang} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input type="checkbox" checked={checked} onChange={() => setSelectedDeftExplorerLangs((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : prev.length < 2 ? [...prev, lang] : prev))} className="w-4 h-4" />
                                <span>{lang}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {needsLoreExtraSkills && (
                  <div data-testid="level-up-step3-lore-skills">
                    <h3 className="font-semibold text-gray-800 mb-2">逸闻学院 3 级：额外技能熟练</h3>
                    <p className="text-sm text-gray-600 mb-3">选择 3 项技能获得熟练。</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map((sk) => {
                        const name = sk.name;
                        const checked = selectedLoreSkills.includes(name);
                        return (
                          <label key={sk.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedLoreSkills((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : prev.length < 3 ? [...prev, name] : prev))} className="w-4 h-4" />
                            <span>{name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsLoreMagicalSecrets && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">魔法探秘（逸闻学院 6 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">从牧师/德鲁伊/法师法术表中选 2 道法术加入已知。</p>
                    <select multiple value={selectedLoreSpells} onChange={(e) => setSelectedLoreSpells(Array.from(e.target.selectedOptions, (o) => o.value))} className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full max-w-md min-h-[80px]">
                      {loreMagicalSecretsSpellOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}（{s.nameEn}）{s.level}环</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">请按住 Ctrl/Cmd 多选 2 道</p>
                  </div>
                )}
                {needsMagicalSecrets10 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">魔法奥秘（吟游诗人 10 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">从吟游诗人/牧师/德鲁伊/法师法术表中选 {magicalSecrets10Count} 道法术加入准备列表。</p>
                    <div className="flex flex-wrap gap-2">
                      {magicalSecrets10SpellOptions.map((s) => {
                        const checked = selectedMagicalSecrets10.includes(s.id);
                        return (
                          <label key={s.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedMagicalSecrets10((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : prev.length < magicalSecrets10Count ? [...prev, s.id] : prev))} className="w-4 h-4" />
                            <span>{s.name}（{s.level}环）</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsFeyWandererSkill && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">妖精漫游者 3 级：额外技能熟练</h3>
                    <p className="text-sm text-gray-600 mb-3">从欺瞒、表演、游说中选 1 项获得熟练。</p>
                    <div className="flex flex-wrap gap-2">
                      {FEY_WANDERER_SKILL_OPTIONS.map((skill) => (
                        <label key={skill} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedFeyWandererSkill === skill ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="feyWandererSkill" value={skill} checked={selectedFeyWandererSkill === skill} onChange={() => setSelectedFeyWandererSkill(skill)} className="w-4 h-4" />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsWildShapeForms && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">荒野变形·已知形态（德鲁伊 2 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择 4 种野兽形态（CR≤1/4、无飞行速度）。推荐鼠、乘用马、蜘蛛、狼。</p>
                    <div className="flex flex-wrap gap-2">
                      {WILD_SHAPE_FORM_OPTIONS.map((form) => {
                        const checked = selectedWildShapeForms.includes(form);
                        return (
                          <label key={form} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedWildShapeForms((prev) => (prev.includes(form) ? prev.filter((x) => x !== form) : prev.length < 4 ? [...prev, form] : prev))} className="w-4 h-4" />
                            <span>{form}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">已选：{selectedWildShapeForms.length} / 4</p>
                  </div>
                )}
                {needsBeastRageForm && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">兽性狂暴（兽心道途 3 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择一种野兽形态：熊、鹰或狼。</p>
                    <div className="flex flex-wrap gap-2">
                      {BEAST_RAGE_OPTIONS.map((opt) => (
                        <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedBeastRageForm === opt ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="beastRageForm" value={opt} checked={selectedBeastRageForm === opt} onChange={() => setSelectedBeastRageForm(opt)} className="w-4 h-4" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsBeastFormAspect && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">兽之形貌（兽心道途 6 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择枭、豹或鲑。</p>
                    <div className="flex flex-wrap gap-2">
                      {BEAST_FORM_OPTIONS.map((opt) => (
                        <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedBeastFormAspect === opt ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="beastFormAspect" value={opt} checked={selectedBeastFormAspect === opt} onChange={() => setSelectedBeastFormAspect(opt)} className="w-4 h-4" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsBeastPowerAspect && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">兽力威能（兽心道途 14 级）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择猎鹰、雄狮或角羊。</p>
                    <div className="flex flex-wrap gap-2">
                      {BEAST_POWER_OPTIONS.map((opt) => (
                        <label key={opt} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${selectedBeastPowerAspect === opt ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="beastPowerAspect" value={opt} checked={selectedBeastPowerAspect === opt} onChange={() => setSelectedBeastPowerAspect(opt)} className="w-4 h-4" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {needsMetamagic && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">超魔法（术士）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择 {metamagicTargetCount} 项超魔法选项（2/10/17 级可替换 1 个）。</p>
                    <div className="flex flex-wrap gap-2">
                      {METAMAGIC_OPTIONS.map((opt) => {
                        const checked = selectedMetamagic.includes(opt.id);
                        return (
                          <label key={opt.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedMetamagic((prev) => (prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : prev.length < metamagicTargetCount ? [...prev, opt.id] : prev))} className="w-4 h-4" />
                            <span>{opt.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsInvocations && (
                  <div data-testid="level-up-step3-invocations">
                    <h3 className="font-semibold text-gray-800 mb-2">魔能祈唤（魔契师）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择 {invocationTargetCount} 项祈唤（满足等级与先决）。</p>
                    <div className="flex flex-wrap gap-2">
                      {invocationOptions.map((inv) => {
                        const checked = selectedInvocations.includes(inv.id);
                        return (
                          <label key={inv.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedInvocations((prev) => (prev.includes(inv.id) ? prev.filter((x) => x !== inv.id) : prev.length < invocationTargetCount ? [...prev, inv.id] : prev))} className="w-4 h-4" />
                            <span>{inv.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsManeuvers && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">战技（战斗大师）</h3>
                    <p className="text-sm text-gray-600 mb-3">选择 {maneuverTargetCount} 项战技。</p>
                    <div className="flex flex-wrap gap-2">
                      {MANEUVER_OPTIONS.map((opt) => {
                        const checked = selectedManeuvers.includes(opt.id);
                        return (
                          <label key={opt.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedManeuvers((prev) => (prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : prev.length < maneuverTargetCount ? [...prev, opt.id] : prev))} className="w-4 h-4" />
                            <span>{opt.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {needsNewSpells && (
                  <div data-testid="level-up-step3-new-spells">
                    <h3 className="font-semibold text-gray-800 mb-2">新增已知/准备法术</h3>
                    <p className="text-sm text-gray-600 mb-3">本等级可多选 {needNewSpellsCount} 道法术。</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <input
                        type="text"
                        value={newSpellSearch}
                        onChange={(e) => setNewSpellSearch(e.target.value)}
                        placeholder="搜索法术（中文/英文）"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full max-w-xs focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <select
                        value={newSpellLevelFilter}
                        onChange={(e) => setNewSpellLevelFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">全部环阶</option>
                        {Array.from({ length: maxSpellLevelForNewSpells }, (_, i) => i + 1).map((lv) => (
                          <option key={lv} value={String(lv)}>{lv} 环</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredNewSpellOptions.map((s) => {
                        const checked = selectedNewSpells.includes(s.id);
                        return (
                          <label key={s.id} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${checked ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={checked} onChange={() => setSelectedNewSpells((prev) => (prev.includes(s.id) ? prev.filter((x) => x !== s.id) : prev.length < needNewSpellsCount ? [...prev, s.id] : prev))} className="w-4 h-4" />
                            <span>{s.name}（{s.level}环）</span>
                          </label>
                        );
                      })}
                    </div>
                    {filteredNewSpellOptions.length === 0 && (newSpellSearch || newSpellLevelFilter) && (
                      <p className="text-sm text-gray-500 mt-2">无匹配法术，可清空搜索或更换环阶筛选。</p>
                    )}
                  </div>
                )}
                {mysticArcanumLevel !== null && mysticArcanumSpellOptions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">玄奥秘法（选择 1 道{mysticArcanumLevel}环法术）</h3>
                    <p className="text-sm text-gray-600 mb-3">每日一次可无需消耗法术位施展该法术，完成长休后恢复。</p>
                    <select
                      value={selectedMysticArcanumSpell ?? ''}
                      onChange={(e) => setSelectedMysticArcanumSpell(e.target.value || null)}
                      className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full max-w-md"
                    >
                      <option value="">请选择</option>
                      {mysticArcanumSpellOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}（{s.nameEn}）
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {needsScholar && scholarSkillOptions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">学者（选择 1 项已熟练技能获得专精）</h3>
                    <p className="text-sm text-gray-600 mb-3">从以下你已熟练的技能中选一项获得专精。</p>
                    <div className="flex flex-wrap gap-2">
                      {scholarSkillOptions.map((skill) => (
                        <label
                          key={skill}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedScholarSkill === skill ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="scholarSkill"
                            value={skill}
                            checked={selectedScholarSkill === skill}
                            onChange={() => setSelectedScholarSkill(skill)}
                            className="w-4 h-4"
                          />
                          <span>{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                上一步
              </button>
              {!isOwner && <p className="text-amber-600">仅角色拥有者可执行升级。</p>}
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canFinish || saving || !isOwner}
                className="btn btn-primary inline-flex items-center gap-2"
                data-testid="level-up-finish-from-step3"
                data-can-finish={String(canFinish)}
                data-is-owner={String(isOwner)}
                data-selected-subclass={selectedSubclass ?? ''}
                data-selected-new-spells-count={String(selectedNewSpells.length)}
                data-need-new-spells-count={String(needNewSpellsCount)}
              >
                {saving ? '保存中…' : '完成升级'}
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!isOwner && (
          <p className="text-sm text-amber-700 mt-4">你正在查看他人角色，无法执行升级。</p>
        )}
      </div>
    </div>
  );
}

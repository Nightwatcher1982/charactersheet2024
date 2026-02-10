/**
 * 骰子公式解析与掷骰：AdB±C（如 d20、2d6+3、1d4-1）
 */

export interface ParsedFormula {
  count: number;
  sides: number;
  modifier: number;
}

const FORMULA_REG = /^(\d*)d(\d+)([+-]\d+)?$/i;
const MAX_COUNT = 100;
const MAX_SIDES = 1000;
const MIN_SIDES = 1;

/**
 * 解析公式，合法返回 ParsedFormula，非法返回 null
 */
export function parseDiceFormula(formula: string): ParsedFormula | null {
  const s = (formula || '').trim().replace(/\s/g, '');
  if (!s) return null;
  const m = s.match(FORMULA_REG);
  if (!m) return null;
  const count = m[1] ? parseInt(m[1], 10) : 1;
  const sides = parseInt(m[2], 10);
  const modifier = m[3] ? parseInt(m[3], 10) : 0;
  if (Number.isNaN(count) || Number.isNaN(sides) || Number.isNaN(modifier)) return null;
  if (count < 1 || count > MAX_COUNT) return null;
  if (sides < MIN_SIDES || sides > MAX_SIDES) return null;
  return { count, sides, modifier };
}

/**
 * 掷单颗骰（1 到 sides 均匀）
 */
function rollOne(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * 按解析结果掷骰，返回各颗结果与总和
 */
export function rollDice(parsed: ParsedFormula): { rolls: number[]; total: number } {
  const rolls: number[] = [];
  for (let i = 0; i < parsed.count; i++) {
    rolls.push(rollOne(parsed.sides));
  }
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + parsed.modifier;
  return { rolls, total };
}

/** 复合公式中的一段骰子：如 2d6 */
export interface DiceTerm {
  count: number;
  sides: number;
}

const DICE_TERM_REG = /([+]?(?:\d*)d\d+)/gi;
const MODIFIER_REG = /([+-]\d+)(?!\s*d)/g;

/**
 * 解析复合公式为多段骰子 + 修正值，如 "2d6+2d10+3" -> { terms: [{count:2,sides:6},{count:2,sides:10}], modifier: 3 }
 */
export function parseCompoundFormula(formula: string): { terms: DiceTerm[]; modifier: number } | null {
  const s = (formula || '').trim().replace(/\s/g, '');
  if (!s) return null;
  const terms: DiceTerm[] = [];
  let modifier = 0;
  let rest = s;
  for (const diceMatch of s.matchAll(DICE_TERM_REG)) {
    const token = diceMatch[0].replace(/^\+/, '');
    const single = parseDiceFormula(token);
    if (!single) continue;
    terms.push({ count: single.count, sides: single.sides });
    rest = rest.replace(diceMatch[0], '\u0000');
  }
  rest = rest.replace(/\u0000/g, '').replace(/\s/g, '');
  const modMatch = rest.match(MODIFIER_REG);
  if (modMatch) {
    for (const m of modMatch) {
      modifier += parseInt(m, 10);
    }
  }
  const restWithoutMod = rest.replace(MODIFIER_REG, '').replace(/\s/g, '');
  if (restWithoutMod && restWithoutMod !== '+' && restWithoutMod !== '-') {
    return null;
  }
  if (terms.length === 0) return null;
  return { terms, modifier };
}

/**
 * 掷复合公式（多段骰子 + 修正值），返回各颗结果、总和与规范公式；含 parts 便于前端 3D 展示
 */
export function parseAndRollCompound(
  formula: string
): { rolls: number[]; total: number; formula: string; parts: { formula: string; rolls: number[] }[] } {
  const parsed = parseCompoundFormula(formula);
  if (!parsed) {
    throw new Error('INVALID_FORMULA');
  }
  const allRolls: number[] = [];
  const parts: { formula: string; rolls: number[] }[] = [];
  for (const t of parsed.terms) {
    const termRolls: number[] = [];
    for (let i = 0; i < t.count; i++) {
      const r = rollOne(t.sides);
      termRolls.push(r);
      allRolls.push(r);
    }
    const countStr = t.count === 1 ? '' : String(t.count);
    parts.push({ formula: `${countStr}d${t.sides}`, rolls: termRolls });
  }
  const total = allRolls.reduce((a, b) => a + b, 0) + parsed.modifier;
  const formulaParts = parsed.terms
    .map((t) => (t.count === 1 ? `d${t.sides}` : `${t.count}d${t.sides}`))
    .join('+');
  const modStr =
    parsed.modifier === 0 ? '' : parsed.modifier > 0 ? `+${parsed.modifier}` : String(parsed.modifier);
  const normalized = formulaParts + modStr;
  return { rolls: allRolls, total, formula: normalized, parts };
}

/**
 * 解析公式并掷骰；支持单段 AdB±C 与复合 2d6+2d10+3；公式非法时抛错（供 API 返回 400）
 */
export function parseAndRoll(formula: string): {
  rolls: number[];
  total: number;
  formula: string;
  parts?: { formula: string; rolls: number[] }[];
} {
  const compound = parseCompoundFormula(formula);
  if (compound && compound.terms.length > 0) {
    return parseAndRollCompound(formula);
  }
  const parsed = parseDiceFormula(formula);
  if (!parsed) {
    throw new Error('INVALID_FORMULA');
  }
  const modStr = parsed.modifier === 0 ? '' : (parsed.modifier >= 0 ? `+${parsed.modifier}` : String(parsed.modifier));
  const countStr = parsed.count === 1 ? '' : String(parsed.count);
  const normalized = `${countStr}d${parsed.sides}${modStr}`;
  const { rolls, total } = rollDice(parsed);
  return { rolls, total, formula: normalized };
}

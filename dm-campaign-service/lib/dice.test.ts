import { describe, it, expect } from 'vitest';
import { parseDiceFormula, parseAndRoll, rollDice } from './dice';

describe('parseDiceFormula', () => {
  it('解析 d20', () => {
    const r = parseDiceFormula('d20');
    expect(r).toEqual({ count: 1, sides: 20, modifier: 0 });
  });

  it('解析 2d6+3', () => {
    const r = parseDiceFormula('2d6+3');
    expect(r).toEqual({ count: 2, sides: 6, modifier: 3 });
  });

  it('解析 1d4-1', () => {
    const r = parseDiceFormula('1d4-1');
    expect(r).toEqual({ count: 1, sides: 4, modifier: -1 });
  });

  it('解析 3d8（无修饰）', () => {
    const r = parseDiceFormula('3d8');
    expect(r).toEqual({ count: 3, sides: 8, modifier: 0 });
  });

  it('非法公式返回 null', () => {
    expect(parseDiceFormula('')).toBeNull();
    expect(parseDiceFormula('abc')).toBeNull();
    expect(parseDiceFormula('d')).toBeNull();
    expect(parseDiceFormula('1d')).toBeNull();
    expect(parseDiceFormula('d0')).toBeNull();
    expect(parseDiceFormula('0d6')).toBeNull();
    expect(parseDiceFormula('2d6+')).toBeNull();
    expect(parseDiceFormula('2d6+3d4')).toBeNull();
  });
});

describe('rollDice', () => {
  it('掷 2d6 得到 2 个 1-6 的数，总和在 2-12', () => {
    const { rolls, total } = rollDice({ count: 2, sides: 6, modifier: 0 });
    expect(rolls).toHaveLength(2);
    rolls.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    });
    expect(total).toBe(rolls[0] + rolls[1]);
  });

  it('掷 1d4-1 总和在 0-3', () => {
    const { rolls, total } = rollDice({ count: 1, sides: 4, modifier: -1 });
    expect(rolls).toHaveLength(1);
    expect(rolls[0]).toBeGreaterThanOrEqual(1);
    expect(rolls[0]).toBeLessThanOrEqual(4);
    expect(total).toBe(rolls[0] - 1);
  });
});

describe('parseAndRoll', () => {
  it('d20 返回 1 个骰，总和 1-20', () => {
    const out = parseAndRoll('d20');
    expect(out.rolls).toHaveLength(1);
    expect(out.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(out.rolls[0]).toBeLessThanOrEqual(20);
    expect(out.total).toBe(out.rolls[0]);
    expect(out.formula).toBe('d20');
  });

  it('2d6+3 返回 2 个骰，总和 = 两骰和+3', () => {
    const out = parseAndRoll('2d6+3');
    expect(out.rolls).toHaveLength(2);
    expect(out.total).toBe(out.rolls[0] + out.rolls[1] + 3);
    expect(out.formula).toBe('2d6+3');
  });

  it('1d4-1 非法时抛错', () => {
    expect(() => parseAndRoll('invalid')).toThrow();
    expect(() => parseAndRoll('')).toThrow();
  });
});

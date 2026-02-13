#!/usr/bin/env node
/**
 * 从 docs/ 下的法术 Markdown（戏法.md、一环法术.md … 九环法术.md）解析出 Spell 数据，
 * 并生成 lib/spells-from-docs.generated.ts，供 spells-data 引用。
 *
 * 用法: node scripts/parse-spells-from-docs.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 法术文档目录：docs/DND资料/（一环～九环法术.md）
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'DND资料');
const OUT_PATH = path.join(__dirname, '..', 'lib', 'spells-from-docs.generated.ts');

const FILE_MAP = [
  { file: '一环法术.md', level: 1 },
  { file: '二环法术.md', level: 2 },
  { file: '三环法术.md', level: 3 },
  { file: '四环法术.md', level: 4 },
  { file: '五环法术.md', level: 5 },
  { file: '六环法术.md', level: 6 },
  { file: '七环法术.md', level: 7 },
  { file: '八环法术.md', level: 8 },
  { file: '九环法术.md', level: 9 },
];

// 学派：文档用「惑控」，代码里沿用「附魔」
const SCHOOL_MAP = { '惑控': '附魔' };

function slugify(nameEn) {
  return nameEn
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/['']/g, '')
    .toLowerCase();
}

function parseLevelLine(line, defaultLevel) {
  const match = line.match(/^(.+?)\uFF08(.+)\uFF09$/);
  if (!match) return { school: '', classes: [], level: defaultLevel };
  const left = match[1].trim();
  const classesStr = match[2].trim();
  const classes = classesStr ? classesStr.split(/[\u3001,，]/).map((s) => s.trim()).filter(Boolean) : [];

  let level = defaultLevel;
  let school = left;
  const levelMatch = left.match(/^(一环|二环|三环|四环|五环|六环|七环|八环|九环)\s+(.+)$/);
  if (levelMatch) {
    const ring = { 一环: 1, 二环: 2, 三环: 3, 四环: 4, 五环: 5, 六环: 6, 七环: 7, 八环: 8, 九环: 9 }[levelMatch[1]];
    level = ring;
    school = levelMatch[2].trim();
  } else {
    const cantripMatch = left.match(/^(.+?)\s+戏法/);
    if (cantripMatch) {
      school = cantripMatch[1].trim();
      level = 0;
    }
  }
  school = SCHOOL_MAP[school] || school;
  return { school, classes, level };
}

function parseSpellBlock(block, defaultLevel) {
  const lines = block.split(/\n/).map((l) => l.trim());
  if (lines.length < 5) return null;

  const titleLine = lines[0];
  const titleMatch = titleLine.match(/^(.+)\uFF5C(.+)$/);
  if (!titleMatch) return null;
  const name = titleMatch[1].trim();
  const nameEn = titleMatch[2].trim();
  const id = slugify(nameEn);

  const levelLine = lines[1];
  const { school, classes, level } = parseLevelLine(levelLine, defaultLevel);
  if (!school || classes.length === 0) return null;

  let castingTime = '';
  let range = '';
  let components = '';
  let duration = '';
  const fieldPattern = /^(施法时间|施法距离|法术成分|持续时间)[：:]\s*(.*)$/;
  let bodyStart = 2;
  for (let i = 2; i < lines.length; i++) {
    const m = lines[i].match(fieldPattern);
    if (m) {
      const v = m[2].trim();
      if (m[1] === '施法时间') castingTime = v;
      else if (m[1] === '施法距离') range = v;
      else if (m[1] === '法术成分') components = v;
      else if (m[1] === '持续时间') duration = v;
      bodyStart = i + 1;
    } else if (lines[i].length > 0) break;
  }

  const restLines = lines.slice(bodyStart).filter((l) => l.length > 0);
  const rest = restLines.join('\n');
  const higherMatch = rest.match(/(戏法强化[。\.].*|升环施法[。\.].*)/s);
  let description = rest;
  let higherLevel = undefined;
  if (higherMatch) {
    const idx = rest.indexOf(higherMatch[1]);
    description = rest.slice(0, idx).trim();
    higherLevel = rest.slice(idx).trim();
  }
  if (description.includes('（注：')) {
    const noteIdx = description.indexOf('（注：');
    higherLevel = (higherLevel ? higherLevel + '\n\n' : '') + description.slice(noteIdx);
    description = description.slice(0, noteIdx).trim();
  }

  const ritual = castingTime.includes('或仪式');

  return {
    id,
    name,
    nameEn,
    level,
    school,
    castingTime,
    range,
    components,
    duration,
    description,
    higherLevel: higherLevel || undefined,
    ritual,
    classes,
    source: '项目 docs 法术文档',
  };
}

function extractBlocks(content) {
  const blocks = [];
  const lines = content.split(/\n/);
  let current = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTitle = /^[^\n]+\uFF5C[^\n]+$/.test(line);
    if (isTitle && current.length > 0) {
      blocks.push(current.join('\n'));
      current = [];
    }
    if (isTitle || current.length > 0) current.push(line);
  }
  if (current.length > 0) blocks.push(current.join('\n'));
  return blocks.filter((b) => /^[^\n]+\uFF5C[^\n]+/.test(b.trim()));
}

function parseFile(filePath, defaultLevel) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const blocks = extractBlocks(content);
  const spells = [];
  for (const block of blocks) {
    const spell = parseSpellBlock(block, defaultLevel);
    if (spell) spells.push(spell);
  }
  return spells;
}

function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function spellToTs(spell) {
  const desc = escapeStr(spell.description);
  const parts = [
    `  {`,
    `    id: '${spell.id}',`,
    `    name: '${escapeStr(spell.name)}',`,
    `    nameEn: '${escapeStr(spell.nameEn)}',`,
    `    level: ${spell.level},`,
    `    school: '${spell.school}',`,
    `    castingTime: '${escapeStr(spell.castingTime)}',`,
    `    range: '${escapeStr(spell.range)}',`,
    `    components: '${escapeStr(spell.components)}',`,
    `    duration: '${escapeStr(spell.duration)}',`,
    `    description: '${desc}',`,
  ];
  if (spell.higherLevel) parts.push(`    higherLevel: '${escapeStr(spell.higherLevel)}',`);
  if (spell.ritual) parts.push(`    ritual: true,`);
  parts.push(`    classes: [${spell.classes.map((c) => `'${c}'`).join(', ')}],`);
  if (spell.source) parts.push(`    source: '${escapeStr(spell.source)}',`);
  parts.push(`  },`);
  return parts.join('\n');
}

function main() {
  const byLevel = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
  for (const { file, level } of FILE_MAP) {
    const filePath = path.join(DOCS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn('Skip (not found):', filePath);
      continue;
    }
    const spells = parseFile(filePath, level);
    byLevel[level].push(...spells);
    console.log(`${file}: ${spells.length} spells`);
  }

  const outLines = [
    '// 本文件由 scripts/parse-spells-from-docs.mjs 根据 docs/DND资料/ 下法术 Markdown 自动生成，请勿手改。',
    '// 数据来源：docs/DND资料/一环法术.md … 九环法术.md',
    '',
    "import type { Spell } from './spells-data';",
    '',
  ];

  // 戏法仍使用 spells-data 内手写 CANTRIPS，此处仅占位以保持 ALL_SPELLS_FROM_DOCS 结构
  outLines.push("export const CANTRIPS_FROM_DOCS: Spell[] = [];");
  outLines.push('');

  for (let level = 1; level <= 9; level++) {
    const arr = byLevel[level];
    const varName = `SPELLS_${level}_FROM_DOCS`;
    outLines.push(`export const ${varName}: Spell[] = [`);
    for (const spell of arr) {
      outLines.push(spellToTs(spell));
    }
    outLines.push('];');
    outLines.push('');
  }

  outLines.push('export const ALL_SPELLS_FROM_DOCS: Spell[] = [');
  outLines.push('  ...CANTRIPS_FROM_DOCS,');
  for (let level = 1; level <= 9; level++) {
    outLines.push(`  ...SPELLS_${level}_FROM_DOCS,`);
  }
  outLines.push('];');

  fs.writeFileSync(OUT_PATH, outLines.join('\n'), 'utf-8');
  console.log('Wrote', OUT_PATH);
}

main();

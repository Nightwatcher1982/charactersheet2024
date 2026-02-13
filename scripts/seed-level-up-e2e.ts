/**
 * 升级 E2E 种子脚本：在数据库中创建 12 个职业的 2 级角色，供 level-up E2E 测试使用。
 *
 * 前置条件：
 * - .env 中 DATABASE_URL 已配置
 * - E2E_TEST_EMAIL 为已存在的测试账号邮箱（脚本会为该用户创建角色）
 *
 * 运行：npx tsx scripts/seed-level-up-e2e.ts
 * 输出：e2e/level-up-seed.json（角色 serverId、职业、选定的子职、预期子职法术等）
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CLASSES } from '../lib/dnd-data';
import { getSubclassesByClassId } from '../lib/subclass-data';
import { getSubclassSpellIdsUpToLevel } from '../lib/subclass-spells-data';
import { getWizardSchoolSpellIdsForLevel } from '../lib/wizard-school-spells';

const prisma = new PrismaClient();

/** 每个职业在测试中选定的子职（id），以及德鲁伊大地结社时的地形 */
const CHOSEN_SUBCLASS: Record<string, { subclassId: string; landTerrain?: string }> = {
  barbarian: { subclassId: 'berserker' },
  bard: { subclassId: 'lore' },
  cleric: { subclassId: 'life' },
  druid: { subclassId: 'land', landTerrain: 'arid' },
  fighter: { subclassId: 'champion' },
  monk: { subclassId: 'open-hand' },
  paladin: { subclassId: 'devotion' },
  ranger: { subclassId: 'hunter' },
  rogue: { subclassId: 'thief' },
  sorcerer: { subclassId: 'draconic' },
  warlock: { subclassId: 'fiend' },
  wizard: { subclassId: 'evocation' },
};

function getSubclassName(classId: string, subclassId: string): string {
  const list = getSubclassesByClassId(classId);
  const sub = list.find((s) => s.id === subclassId);
  return sub?.name ?? subclassId;
}

function buildMinimalCharacterData(
  className: string,
  classId: string,
  hitDie: number
): Record<string, unknown> {
  const now = new Date().toISOString();
  const skills =
    CLASSES.find((c) => c.id === classId)?.availableSkills?.slice(0, 2) ?? ['察觉', '运动'];
  return {
    name: `E2E-${className}-2`,
    class: className,
    species: '人类',
    background: '侍僧',
    level: 2,
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 14,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    alignment: '中立善良',
    hitPoints: hitDie + 6 + 2, // 1级+2级固定HP 简化
    armorClass: 10,
    skills,
    proficiencies: [],
    equipment: [],
    spells: [],
    features: [],
    classFeatureChoices: {},
    backstory: '',
    createdAt: now,
    updatedAt: now,
  };
}

async function main() {
  const email = process.env.E2E_TEST_EMAIL;
  if (!email) {
    console.error('请设置环境变量 E2E_TEST_EMAIL（已存在的测试账号邮箱）');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    console.error(`未找到用户: ${email}，请先创建该测试账号`);
    process.exit(1);
  }

  const seedDir = path.join(process.cwd(), 'e2e');
  const seedPath = path.join(seedDir, 'level-up-seed.json');
  const allChars = await prisma.character.findMany({
    where: { userId: user.id },
  });
  const toDelete = allChars.filter((c) => {
    const d = c.data as Record<string, unknown>;
    const name = d?.name as string;
    return name?.startsWith('E2E-') && name?.includes('-2');
  });
  for (const c of toDelete) {
    await prisma.character.delete({ where: { id: c.id } });
    console.log('已删除旧种子角色:', (c.data as Record<string, unknown>)?.name);
  }

  const seedEntries: Array<{
    serverId: string;
    class: string;
    classId: string;
    name: string;
    chosenSubclassId: string;
    chosenSubclassName: string;
    landTerrain?: string;
    expectedSpellIds: string[];
  }> = [];

  for (const cls of CLASSES) {
    const classId = cls.id;
    const className = cls.name;
    const hitDie = cls.hitDie ?? 8;
    const chosen = CHOSEN_SUBCLASS[classId];
    if (!chosen) {
      console.warn(`未配置子职: ${classId}`);
      continue;
    }

    const data = buildMinimalCharacterData(className, classId, hitDie);
    const created = await prisma.character.create({
      data: {
        userId: user.id,
        data: data as any,
      },
    });

    let expectedSpellIds: string[] = [];
    expectedSpellIds = getSubclassSpellIdsUpToLevel(
      classId,
      chosen.subclassId,
      3,
      chosen.landTerrain
    );
    if (classId === 'wizard' && chosen.subclassId) {
      const schoolSpells = getWizardSchoolSpellIdsForLevel(chosen.subclassId, 3);
      expectedSpellIds = [...new Set([...expectedSpellIds, ...schoolSpells])];
    }

    seedEntries.push({
      serverId: created.id,
      class: className,
      classId,
      name: data.name as string,
      chosenSubclassId: chosen.subclassId,
      chosenSubclassName: getSubclassName(classId, chosen.subclassId),
      landTerrain: chosen.landTerrain,
      expectedSpellIds,
    });
    console.log(`创建: ${className} (${created.id}) -> 子职 ${chosen.subclassId}`);
  }

  if (!fs.existsSync(seedDir)) fs.mkdirSync(seedDir, { recursive: true });
  fs.writeFileSync(seedPath, JSON.stringify({ characterIds: seedEntries }, null, 2), 'utf-8');
  console.log(`\n种子文件已写入: ${seedPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

/**
 * 创建测试用会员账号与玩家账号（角色卡库）
 * 使用：npx tsx scripts/create-test-users.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

const TEST_MEMBER_EMAIL = 'member@test.com';
const TEST_MEMBER_PASSWORD = 'TestMember123!';
const TEST_PLAYER_EMAIL = 'player@test.com';
const TEST_PLAYER_PASSWORD = 'TestPlayer123!';

async function main() {
  const prisma = new PrismaClient();
  const memberHash = await bcrypt.hash(TEST_MEMBER_PASSWORD, BCRYPT_ROUNDS);
  const playerHash = await bcrypt.hash(TEST_PLAYER_PASSWORD, BCRYPT_ROUNDS);

  const memberExpiresAt = new Date();
  memberExpiresAt.setFullYear(memberExpiresAt.getFullYear() + 1);

  for (const row of [
    {
      email: TEST_MEMBER_EMAIL,
      passwordHash: memberHash,
      role: 'member' as const,
      memberExpiresAt: memberExpiresAt as Date | null,
    },
    {
      email: TEST_PLAYER_EMAIL,
      passwordHash: playerHash,
      role: 'normal' as const,
      memberExpiresAt: null as Date | null,
    },
  ]) {
    const { email, passwordHash, role, memberExpiresAt: expiresAt } = row;
    const data = {
      email: email.toLowerCase(),
      passwordHash,
      role,
      memberExpiresAt: expiresAt,
    };
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          passwordHash: data.passwordHash,
          role: data.role,
          memberExpiresAt: data.memberExpiresAt,
          updatedAt: new Date(),
        },
      });
      console.log('已更新:', email, '(role=' + role + ')');
    } else {
      await prisma.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          memberExpiresAt: data.memberExpiresAt,
        },
      });
      console.log('已创建:', email, '(role=' + role + ')');
    }
  }

  await prisma.$disconnect();
  console.log('\n测试账号：');
  console.log('  会员 DM:', TEST_MEMBER_EMAIL, '/', TEST_MEMBER_PASSWORD);
  console.log('  玩家:  ', TEST_PLAYER_EMAIL, '/', TEST_PLAYER_PASSWORD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

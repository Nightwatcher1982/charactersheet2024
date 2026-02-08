/**
 * 创建或更新管理员账号
 * 使用：ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourpassword npx tsx scripts/create-admin.ts
 * 或：node --loader ts-node/esm scripts/create-admin.ts（需安装 ts-node）
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('请设置环境变量 ADMIN_EMAIL 和 ADMIN_PASSWORD');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('管理员密码至少 8 位');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const existing = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: { passwordHash, updatedAt: new Date() },
    });
    console.log('管理员密码已更新:', normalizedEmail);
  } else {
    await prisma.admin.create({
      data: { email: normalizedEmail, passwordHash },
    });
    console.log('管理员已创建:', normalizedEmail);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

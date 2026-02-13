import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

const MAX_CHARACTERS_PER_USER = 5;

// POST /api/characters/import - 批量导入本地角色
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { characters } = await request.json();

    if (!Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        { error: '无效的角色数据' },
        { status: 400 }
      );
    }

    const currentCount = await prisma.character.count({
      where: { userId: session.userId! },
    });
    if (currentCount + characters.length > MAX_CHARACTERS_PER_USER) {
      return NextResponse.json(
        {
          error: `最多只能拥有 ${MAX_CHARACTERS_PER_USER} 个角色。当前已有 ${currentCount} 个，本次导入 ${characters.length} 个将超出限制，请先删除部分角色或减少导入数量。`,
        },
        { status: 400 }
      );
    }

    // 批量创建角色
    const imported = [];
    for (const characterData of characters) {
      const character = await prisma.character.create({
        data: {
          userId: session.userId!,
          data: characterData as any,
        },
      });
      imported.push(character.data);
    }

    return NextResponse.json({
      success: true,
      message: `成功导入 ${imported.length} 个角色`,
      characters: imported,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('导入角色失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

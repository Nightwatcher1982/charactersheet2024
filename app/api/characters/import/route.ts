import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

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

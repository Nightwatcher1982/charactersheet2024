import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/characters - 获取当前用户的所有角色
export async function GET() {
  try {
    const session = await requireAuth();

    const characters = await prisma.character.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      characters: characters.map((c) => ({
        ...(c.data as object),
        serverId: c.id,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('获取角色列表失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// POST /api/characters - 创建新角色
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const characterData = await request.json();

    const character = await prisma.character.create({
      data: {
        userId: session.userId!,
        data: characterData as any,
      },
    });

    return NextResponse.json({
      success: true,
      character: character.data,
      serverId: character.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('创建角色失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

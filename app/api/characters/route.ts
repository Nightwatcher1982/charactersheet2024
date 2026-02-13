import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/** 每用户最多创建的角色数量 */
const MAX_CHARACTERS_PER_USER = 5;

// GET /api/characters - 获取当前用户的所有角色（支持 cookie session 或 Authorization: Bearer）
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    const characters = await prisma.character.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      characters: characters.map((c) => ({
        ...(c.data as object),
        serverId: c.id,
        isPublic: c.isPublic,
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
    const auth = await getAuthFromRequest(request);
    const characterData = await request.json();

    const count = await prisma.character.count({
      where: { userId: auth.userId },
    });
    if (count >= MAX_CHARACTERS_PER_USER) {
      return NextResponse.json(
        { error: `每个用户最多只能创建 ${MAX_CHARACTERS_PER_USER} 个角色，请先删除不需要的角色后再创建。` },
        { status: 400 }
      );
    }

    const character = await prisma.character.create({
      data: {
        userId: auth.userId,
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

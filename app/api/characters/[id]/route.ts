import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/jwt';
import { getCharacterComputedStats } from '@/lib/character-computed';
import { getAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

/** 可选鉴权：有 cookie/JWT 则返回 userId，否则返回 null（不抛错） */
async function getOptionalAuth(request: Request): Promise<{ userId: string } | null> {
  try {
    const auth = await getAuthFromRequest(request);
    return { userId: auth.userId };
  } catch {
    return null;
  }
}

// GET /api/characters/[id] - 获取单个角色；本人始终可读，公开角色允许未登录只读，管理员可查看任意角色
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getOptionalAuth(request);
    const { id } = await params;

    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    const data = character.data as Record<string, unknown>;
    const computed = getCharacterComputedStats(data as Parameters<typeof getCharacterComputedStats>[0]);
    const characterWithComputed = {
      ...data,
      armorClass: computed.armorClass,
      maxHp: computed.maxHp,
      currentHitPoints: computed.currentHp,
    };

    const isOwner = auth !== null && character.userId === auth.userId;
    if (isOwner) {
      return NextResponse.json({
        success: true,
        character: characterWithComputed,
        isOwner: true,
      });
    }

    if (character.isPublic) {
      return NextResponse.json({
        success: true,
        character: characterWithComputed,
        isOwner: false,
      });
    }

    // 后台管理员可查看任意角色（只读，isOwner: false）
    try {
      const adminSession = await getAdminSession();
      if (adminSession?.isAdmin && adminSession?.adminId) {
        return NextResponse.json({
          success: true,
          character: characterWithComputed,
          isOwner: false,
        });
      }
    } catch {
      /* 非管理员，忽略 */
    }

    return NextResponse.json(
      { error: '角色不存在' },
      { status: 404 }
    );
  } catch (error) {
    console.error('获取角色失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// PATCH /api/characters/[id] - 仅更新 isPublic 等元字段（仅本人）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: { isPublic?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: '请求体无效' },
      { status: 400 }
    );
  }
  try {
    const auth = await getAuthFromRequest(request);
    const { id } = await params;

    const character = await prisma.character.findFirst({
      where: { id, userId: auth.userId },
    });
    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    const updates: { isPublic?: boolean } = {};
    if (typeof body.isPublic === 'boolean') updates.isPublic = body.isPublic;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        character: character.data,
        isPublic: character.isPublic,
      });
    }

    const updated = await prisma.character.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      character: updated.data,
      isPublic: updated.isPublic,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('PATCH 角色失败:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// PUT /api/characters/[id] - 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request);
    const { id } = await params;
    const characterData = await request.json();

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    const updated = await prisma.character.update({
      where: { id },
      data: { data: characterData as any }, // 使用 any 类型绕过 Prisma Json 类型检查
    });

    return NextResponse.json({
      success: true,
      character: updated.data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('更新角色失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// DELETE /api/characters/[id] - 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthFromRequest(request);
    const { id } = await params;

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: '角色已删除',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('删除角色失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';

// GET /api/characters/[id] - 获取单个角色
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: '角色不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      character: character.data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    console.error('获取角色失败:', error);
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
    const session = await requireAuth();
    const { id } = await params;
    const characterData = await request.json();

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: session.userId,
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
    const session = await requireAuth();
    const { id } = await params;

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: session.userId,
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

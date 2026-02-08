import { NextRequest, NextResponse } from 'next/server';
import OSS from 'ali-oss';
import { requireAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

const OSS_USER_UPLOAD_PREFIX = 'charactersheet2024/user-uploads';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function getPublicUrl(objectName: string): string {
  const base = process.env.NEXT_PUBLIC_PIC_BASE_URL?.replace(/\/+$/, '') || '';
  if (!base) return '';
  const path = objectName.replace(/^charactersheet2024\/?/, '');
  return `${base}/${path}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const characterId = (formData.get('characterId') as string) || 'draft';

    if (!file || !file.size) {
      return NextResponse.json({ error: '请选择图片文件' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '图片大小不能超过 2MB' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPEG/PNG/WebP/GIF' }, { status: 400 });
    }

    const bucket = process.env.OSS_BUCKET || process.env.ALIYUN_OSS_BUCKET;
    const region = process.env.OSS_REGION || process.env.ALIYUN_OSS_REGION || 'oss-cn-shanghai';
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;

    if (!bucket || !accessKeyId || !accessKeySecret) {
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          url: '',
          message: '未配置 OSS，开发环境可暂用 base64',
        });
      }
      return NextResponse.json({ error: '未配置 OSS 上传' }, { status: 503 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const objectName = `${OSS_USER_UPLOAD_PREFIX}/${session.userId}/${characterId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    await client.put(objectName, buffer, {
      headers: {
        'Content-Type': file.type,
      },
    });

    const url = getPublicUrl(objectName);
    return NextResponse.json({ url, objectName });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    console.error('upload portrait error:', e);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}

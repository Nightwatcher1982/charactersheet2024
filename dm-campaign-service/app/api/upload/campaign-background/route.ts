import { NextRequest, NextResponse } from 'next/server';
import OSS from 'ali-oss';
import { getAuthFromRequest } from '@/lib/verify-jwt';

export const dynamic = 'force-dynamic';

const OSS_CAMPAIGN_BACKGROUND_PREFIX = 'charactersheet2024/campaign-backgrounds';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function getPublicUrl(objectName: string, bucket: string, region: string): string {
  const base = process.env.NEXT_PUBLIC_PIC_BASE_URL?.replace(/\/+$/, '');
  if (base) {
    const path = objectName.replace(/^charactersheet2024\/?/, '');
    return `${base}/${path}`;
  }
  // 未配置 NEXT_PUBLIC_PIC_BASE_URL 时用 OSS 外网地址拼接（Bucket 需公共读）
  const r = region.replace(/^oss-/, '');
  return `https://${bucket}.oss-${r}.aliyuncs.com/${objectName}`;
}

/**
 * POST /api/upload/campaign-background - 上传战役背景图到 OSS（需登录，与主项目共用 OSS 配置）
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: '请选择图片文件' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '图片大小不能超过 5MB' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPEG/PNG/WebP/GIF' }, { status: 400 });
    }

    const bucket = process.env.OSS_BUCKET || process.env.ALIYUN_OSS_BUCKET;
    const region = process.env.OSS_REGION || process.env.ALIYUN_OSS_REGION || 'oss-cn-shanghai';
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;

    if (!bucket || !accessKeyId || !accessKeySecret) {
      return NextResponse.json({ error: '未配置 OSS，请在 .env 中配置 OSS_BUCKET、OSS_REGION、ALIYUN_ACCESS_KEY_ID、ALIYUN_ACCESS_KEY_SECRET' }, { status: 503 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
    const objectName = `${OSS_CAMPAIGN_BACKGROUND_PREFIX}/${auth.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

    const client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    await client.put(objectName, buffer, {
      headers: { 'Content-Type': file.type },
    });

    const url = getPublicUrl(objectName, bucket, region);
    return NextResponse.json({ url, objectName });
  } catch (e) {
    if (e instanceof Error && e.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录或 Token 无效' }, { status: 401 });
    }
    console.error('upload campaign background error:', e);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}

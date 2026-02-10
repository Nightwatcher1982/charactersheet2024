import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

/** 所有骰子音效请求统一返回这一个 MP3，避免加载几十个文件 */
const SINGLE_MP3 = path.join(
  process.cwd(),
  'public',
  'dice-assets',
  'sounds',
  'dicehit',
  'dicehit_plastic1.mp3'
);

export async function GET() {
  try {
    const buffer = await readFile(SINGLE_MP3);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('dice-sound serve error:', err);
    return new NextResponse(null, { status: 404 });
  }
}

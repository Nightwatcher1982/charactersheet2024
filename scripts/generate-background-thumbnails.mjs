#!/usr/bin/env node
/**
 * 为 public/pic/background/ 下的背景图生成 160x160 缩略图，用于「确定起源」步骤以加快加载。
 * 运行前请先安装: npm install sharp
 * 然后执行: node scripts/generate-background-thumbnails.mjs
 */
import { readdir, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const BACKGROUND_DIR = join(ROOT, 'public', 'pic', 'background');
const SIZE = 160;

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('请先安装 sharp: npm install sharp');
    process.exit(1);
  }

  const files = await readdir(BACKGROUND_DIR);
  const images = files.filter(
    (f) =>
      (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')) &&
      !f.includes('original-') &&
      !f.includes('-thumb.')
  );

  for (const file of images) {
    const ext = extname(file);
    const base = file.slice(0, -ext.length);
    const outName = `${base}-thumb.jpg`;
    const inputPath = join(BACKGROUND_DIR, file);
    const outputPath = join(BACKGROUND_DIR, outName);

    try {
      await sharp(inputPath)
        .resize(SIZE, SIZE, { fit: 'cover' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(outputPath);
      console.log('OK', outName);
    } catch (e) {
      console.error('FAIL', file, e.message);
    }
  }
  console.log('完成。组件已配置为先加载缩略图，失败时回退到原图。');
}

main();

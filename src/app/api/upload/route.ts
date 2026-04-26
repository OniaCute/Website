import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { ensureDir } from '@/lib/fsAtomic';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
const MAX_SIZE_DEFAULT = 5 * 1024 * 1024;   // 5 MB (images / fonts)
const MAX_SIZE_CUSTOM  = 100 * 1024 * 1024; // 100 MB (custom categories)
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'font/woff2': '.woff2',
  'font/woff': '.woff',
  'font/ttf': '.ttf',
  'application/octet-stream': '.bin',
  // 自定义分类下载资源
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/gzip': '.gz',
  'application/x-tar': '.tar',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'video/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
};

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subdir = (formData.get('dir') as string) || '';

    if (!file) {
      return NextResponse.json({ code: 400, message: 'No file provided', data: null }, { status: 400 });
    }
    const isSystemDir = !subdir || subdir === 'fonts';
    const maxSize = isSystemDir ? MAX_SIZE_DEFAULT : MAX_SIZE_CUSTOM;
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024);
      return NextResponse.json({ code: 400, message: `File too large (max ${maxMB}MB)`, data: null }, { status: 400 });
    }

    let ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      // 自定义分类目录下，尝试按原始文件扩展名推断
      if (!isSystemDir && file.name) {
        const rawExt = path.extname(file.name).toLowerCase();
        if (rawExt && rawExt.length > 1) {
          ext = rawExt;
        } else {
          return NextResponse.json({ code: 400, message: 'Unsupported file type', data: null }, { status: 400 });
        }
      } else {
        return NextResponse.json({ code: 400, message: 'Unsupported file type', data: null }, { status: 400 });
      }
    }

    const targetDir = subdir ? path.join(UPLOAD_DIR, subdir.replace(/\.\./g, '')) : UPLOAD_DIR;
    ensureDir(targetDir);

    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(targetDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const urlPath = subdir
      ? `/api/static/${subdir}/${filename}`
      : `/api/static/${filename}`;

    return NextResponse.json({ code: 200, message: 'Uploaded', data: { url: urlPath, filename } });
  } catch {
    return NextResponse.json({ code: 500, message: 'Upload failed', data: null }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const subdir = request.nextUrl.searchParams.get('dir') || '';
  const targetDir = subdir ? path.join(UPLOAD_DIR, subdir.replace(/\.\./g, '')) : UPLOAD_DIR;
  ensureDir(targetDir);

  const files = fs.readdirSync(targetDir)
    .filter(f => !fs.statSync(path.join(targetDir, f)).isDirectory())
    .filter(f => !/^favicon\./i.test(f))
    .map(f => ({
      name: f,
      url: subdir ? `/api/static/${subdir}/${f}` : `/api/static/${f}`,
      size: fs.statSync(path.join(targetDir, f)).size,
      createdAt: fs.statSync(path.join(targetDir, f)).birthtime.toISOString(),
    }));

  return NextResponse.json({ code: 200, message: 'ok', data: files });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const { filename, dir } = await request.json() as { filename: string; dir?: string };
    const safeName = path.basename(filename);
    const targetDir = dir ? path.join(UPLOAD_DIR, dir.replace(/\.\./g, '')) : UPLOAD_DIR;
    const filePath = path.join(targetDir, safeName);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return NextResponse.json({ code: 200, message: 'Deleted', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Delete failed', data: null }, { status: 500 });
  }
}

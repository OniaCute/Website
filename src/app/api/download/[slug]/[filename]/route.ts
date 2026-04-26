import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFilePermission } from '@/lib/assetCategories';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.pdf': 'application/pdf',
  '.zip': 'application/zip', '.tar': 'application/x-tar',
  '.gz': 'application/gzip', '.txt': 'text/plain',
  '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
};

/**
 * GET /api/download/[slug]/[filename]
 * 公开下载接口 — 检查 publicDownload 权限，允许则以 attachment 方式返回文件
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string; filename: string } },
) {
  const { slug, filename } = params;

  // 安全过滤路径穿越
  const safeSlug = slug.replace(/\.\./g, '').replace(/[^a-z0-9-_]/gi, '');
  const safeFilename = path.basename(filename);

  const permission = getFilePermission(safeSlug, safeFilename);
  if (!permission.publicDownload) {
    return new NextResponse('Access denied', { status: 403 });
  }

  const filePath = path.join(UPLOAD_DIR, safeSlug, safeFilename);
  if (!fs.existsSync(filePath)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_MAP[ext] ?? 'application/octet-stream';
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"`,
      'Cache-Control': 'no-cache',
    },
  });
}

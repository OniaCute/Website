import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSiteConfig, saveSiteConfig } from '@/lib/siteConfig';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const FAVICON_DIR = path.join(process.cwd(), 'data', 'favicon');

const ALLOWED_MIME: Record<string, string> = {
  'image/png':  'png',
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/gif':  'gif',
};

function extFromMime(mime: string): string {
  return ALLOWED_MIME[mime] ?? 'png';
}

function clearFaviconDir(): void {
  if (!fs.existsSync(FAVICON_DIR)) return;
  for (const file of fs.readdirSync(FAVICON_DIR)) {
    fs.unlinkSync(path.join(FAVICON_DIR, file));
  }
}

function findCurrentFaviconUrl(): string | null {
  if (!fs.existsSync(FAVICON_DIR)) return null;
  for (const ext of ['png', 'webp', 'jpg', 'jpeg', 'gif', 'ico']) {
    const filename = `favicon.${ext}`;
    if (fs.existsSync(path.join(FAVICON_DIR, filename))) return `/api/favicon-asset/${filename}`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const radiusRaw = formData.get('radius');

    if (!file) {
      return NextResponse.json({ code: 400, message: 'No file provided', data: null }, { status: 400 });
    }

    const ext = extFromMime(file.type);
    const radius = Math.max(0, Math.min(50, Number(radiusRaw ?? 0)));
    const size = 256;
    const buffer = Buffer.from(await file.arrayBuffer());

    let pipeline = sharp(buffer).resize(size, size, { fit: 'cover', position: 'center' }).ensureAlpha();

    if (radius > 0) {
      const cornerRadius = Math.round((radius / 100) * (size / 2));
      const maskSvg = Buffer.from(
        `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="0" y="0" width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>` +
        `</svg>`
      );
      pipeline = pipeline.composite([{ input: maskSvg, blend: 'dest-in' }]) as typeof pipeline;
    }

    let output: Buffer;
    if (ext === 'webp') {
      output = await pipeline.webp({ quality: 95 }).toBuffer();
    } else if (ext === 'jpg') {
      output = await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    } else {
      output = await pipeline.png().toBuffer();
    }

    if (!fs.existsSync(FAVICON_DIR)) fs.mkdirSync(FAVICON_DIR, { recursive: true });
    clearFaviconDir();

    const filename = `favicon.${ext === 'gif' ? 'png' : ext}`;
    fs.writeFileSync(path.join(FAVICON_DIR, filename), output);

    const faviconUrl = `/api/favicon-asset/${filename}`;
    const config = getSiteConfig();
    saveSiteConfig({ ...config, meta: { ...config.meta, favicon: faviconUrl } });

    return NextResponse.json({ code: 200, message: 'Favicon saved', data: { url: faviconUrl, ext } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ code: 500, message: msg, data: null }, { status: 500 });
  }
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const config = getSiteConfig();
  const customUrl = findCurrentFaviconUrl();
  const baseUrl = customUrl ?? config.meta.favicon;
  const url = customUrl ? `${customUrl}?t=${Date.now()}` : baseUrl;
  const extMatch = baseUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = extMatch?.[1]?.toLowerCase() ?? 'png';

  return NextResponse.json({
    code: 200,
    message: 'ok',
    data: { url, ext, hasCustom: Boolean(customUrl) },
  });
}

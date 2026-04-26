import { NextResponse } from 'next/server';
import { getSiteConfig } from '@/lib/siteConfig';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const config = getSiteConfig();
    const target = config.meta.favicon || '/images/default-favicon.png';
    const url = new URL(target, request.url);
    return NextResponse.redirect(url, 307);
  } catch {
    return NextResponse.redirect(new URL('/images/default-favicon.png', request.url), 307);
  }
}

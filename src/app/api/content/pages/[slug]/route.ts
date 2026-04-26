import { NextRequest, NextResponse } from 'next/server';
import { getPage, savePage } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import type { Locale } from '@/types';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const locale = (request.nextUrl.searchParams.get('locale') as Locale) || 'zh-CN';
  const page = getPage(params.slug, locale);

  if (!page) {
    return NextResponse.json({ code: 404, message: 'Not found', data: null }, { status: 404 });
  }

  return NextResponse.json({ code: 200, message: 'ok', data: page });
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const { locale, content, meta } = await request.json() as { locale: Locale; content: string; meta?: Record<string, unknown> };
    savePage(params.slug, locale, content, meta ?? {});
    return NextResponse.json({ code: 200, message: 'Saved', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Failed to save page', data: null }, { status: 500 });
  }
}

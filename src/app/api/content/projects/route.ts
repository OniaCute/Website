import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, saveProject } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import { broadcastSse } from '@/lib/sse';
import type { Locale } from '@/types';

export async function GET(request: NextRequest) {
  const locale = (request.nextUrl.searchParams.get('locale') as Locale) || 'zh-CN';
  const projects = getAllProjects(locale);
  return NextResponse.json({ code: 200, message: 'ok', data: projects });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json() as { slug: string; locale: Locale; meta: Record<string, unknown>; content: string };
    const { slug, locale, meta, content } = body;

    if (!slug || !locale) {
      return NextResponse.json({ code: 400, message: 'Missing slug or locale', data: null }, { status: 400 });
    }

    saveProject(slug, locale, meta as never, content);
    broadcastSse({ type: 'content:updated', payload: { section: 'projects' } });

    return NextResponse.json({ code: 200, message: 'Project saved', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Failed to save project', data: null }, { status: 500 });
  }
}

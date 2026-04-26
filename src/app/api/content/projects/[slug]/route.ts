import { NextRequest, NextResponse } from 'next/server';
import { getProject, saveProject, deleteProject } from '@/lib/content';
import { isAuthenticated } from '@/lib/auth';
import { broadcastSse } from '@/lib/sse';
import type { Locale } from '@/types';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const locale = (request.nextUrl.searchParams.get('locale') as Locale) || 'zh-CN';
  const project = getProject(params.slug, locale);

  if (!project) {
    return NextResponse.json({ code: 404, message: 'Not found', data: null }, { status: 404 });
  }

  return NextResponse.json({ code: 200, message: 'ok', data: project });
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json() as { locale: Locale; meta: Record<string, unknown>; content: string };
    saveProject(params.slug, body.locale, body.meta as never, body.content);
    broadcastSse({ type: 'content:updated', payload: { section: 'projects' } });
    return NextResponse.json({ code: 200, message: 'Updated', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Failed to update', data: null }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  deleteProject(params.slug);
  broadcastSse({ type: 'content:updated', payload: { section: 'projects' } });
  return NextResponse.json({ code: 200, message: 'Deleted', data: null });
}

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getArticle, saveArticle, deleteArticle } from '@/lib/blog';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Article not found', data: null }, { status: 404 });
  }

  const authed = await isAuthenticated();
  if (!article.published && !authed) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Article not found', data: null }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: article });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { slug } = await params;
  const existing = getArticle(slug);

  if (!existing) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Article not found', data: null }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updated = { ...existing, ...body, slug, updatedAt: new Date().toISOString() };
    saveArticle(updated);
    broadcastSse({ type: 'blog:updated' });
    return NextResponse.json<ApiResponse>({ code: 200, message: 'Article updated', data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { slug } = await params;
  deleteArticle(slug);
  broadcastSse({ type: 'blog:updated' });

  return NextResponse.json<ApiResponse>({ code: 200, message: 'Article deleted', data: null });
}

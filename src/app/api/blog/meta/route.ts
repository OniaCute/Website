import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getBlogMeta, saveBlogMeta, getAllArticles, getAllNotes } from '@/lib/blog';
import { pruneReactions } from '@/lib/reactions';
import type { ApiResponse } from '@/types';

export async function GET() {
  const meta = getBlogMeta();
  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: meta });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = getBlogMeta();
    const updated = {
      categories: body.categories ?? existing.categories,
      tags: body.tags ?? existing.tags,
      reactionEmojis: body.reactionEmojis ?? existing.reactionEmojis,
    };

    const validEmojis: string[] = updated.reactionEmojis;
    const validArticleSlugs = getAllArticles().articles.map(a => a.slug);
    const validNoteIds = getAllNotes().notes.map(n => n.id);
    const pruned = pruneReactions(validEmojis, validArticleSlugs, validNoteIds);

    saveBlogMeta(updated);
    return NextResponse.json<ApiResponse>({
      code: 200,
      message: 'Blog meta updated',
      data: { ...updated, pruned },
    });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

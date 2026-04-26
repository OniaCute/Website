import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllNotes, createNote } from '@/lib/blog';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get('published') !== 'false';
  const tag = searchParams.get('tag') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);

  const authed = await isAuthenticated();
  const result = getAllNotes({
    publishedOnly: authed ? publishedOnly : true,
    tag,
    search,
    page,
    limit,
  });

  return NextResponse.json<ApiResponse>({
    code: 200,
    message: 'success',
    data: result,
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, tags, published } = body;

    if (!content) {
      return NextResponse.json<ApiResponse>({ code: 400, message: 'Missing required field: content', data: null }, { status: 400 });
    }

    const note = createNote({ content, tags: tags ?? [], published: published ?? false });
    broadcastSse({ type: 'blog:updated' });

    return NextResponse.json<ApiResponse>({ code: 200, message: 'Note created', data: note });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

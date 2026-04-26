import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllArticles, createArticle } from '@/lib/blog';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const publishedOnly = searchParams.get('published') !== 'false';
  const category = searchParams.get('category') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  // tags 参数支持逗号分隔的多个 tag id
  const tagsParam = searchParams.get('tags');
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;
  const search = searchParams.get('search') ?? undefined;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  const authed = await isAuthenticated();
  const result = getAllArticles({
    publishedOnly: authed ? publishedOnly : true,
    category,
    tag,
    tags,
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
    const { slug, title, content, category, tags, cover, excerpt, published, pinned } = body;

    if (!slug || !title || !content || !category) {
      return NextResponse.json<ApiResponse>({ code: 400, message: 'Missing required fields: slug, title, content, category', data: null }, { status: 400 });
    }

    const article = createArticle({ slug, title, content, category, tags: tags ?? [], cover, excerpt, published: published ?? false, pinned: pinned ?? false });
    broadcastSse({ type: 'blog:updated' });

    return NextResponse.json<ApiResponse>({ code: 200, message: 'Article created', data: article });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

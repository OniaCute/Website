import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllPhotos, createPhoto } from '@/lib/gallery';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get('tag') ?? undefined;
  const region = searchParams.get('region') ?? undefined;
  const sort = (searchParams.get('sort') ?? 'newest') as 'newest' | 'oldest' | 'taken';
  const search = searchParams.get('search') ?? undefined;

  const photos = getAllPhotos({ tag, region, sort, search });
  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: photos });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { url, name, description, takenAt, location, region, tags } = body;

    if (!url || !name) {
      return NextResponse.json<ApiResponse>({ code: 400, message: 'Missing required fields: url, name', data: null }, { status: 400 });
    }

    const photo = createPhoto({ url, name, description, takenAt, location, region, tags: tags ?? [] });
    broadcastSse({ type: 'gallery:updated' });

    return NextResponse.json<ApiResponse>({ code: 200, message: 'Photo added', data: photo });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

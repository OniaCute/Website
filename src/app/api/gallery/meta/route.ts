import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getGalleryMeta, saveGalleryMeta } from '@/lib/gallery';
import type { ApiResponse } from '@/types';

export async function GET() {
  const meta = getGalleryMeta();
  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: meta });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = getGalleryMeta();
    const updated = {
      regions: body.regions ?? existing.regions,
      tags: body.tags ?? existing.tags,
    };
    saveGalleryMeta(updated);
    return NextResponse.json<ApiResponse>({ code: 200, message: 'Gallery meta updated', data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

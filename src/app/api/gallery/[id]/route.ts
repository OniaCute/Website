import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getPhoto, updatePhoto, deletePhoto } from '@/lib/gallery';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = getPhoto(id);

  if (!photo) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Photo not found', data: null }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: photo });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = updatePhoto(id, body);

    if (!updated) {
      return NextResponse.json<ApiResponse>({ code: 404, message: 'Photo not found', data: null }, { status: 404 });
    }

    broadcastSse({ type: 'gallery:updated' });
    return NextResponse.json<ApiResponse>({ code: 200, message: 'Photo updated', data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json<ApiResponse>({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const { id } = await params;
  const ok = deletePhoto(id);

  if (!ok) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Photo not found', data: null }, { status: 404 });
  }

  broadcastSse({ type: 'gallery:updated' });
  return NextResponse.json<ApiResponse>({ code: 200, message: 'Photo deleted', data: null });
}

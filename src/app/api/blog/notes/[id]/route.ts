import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getNote, updateNote, deleteNote } from '@/lib/blog';
import { broadcastSse } from '@/lib/sse';
import type { ApiResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const note = getNote(id);

  if (!note) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Note not found', data: null }, { status: 404 });
  }

  const authed = await isAuthenticated();
  if (!note.published && !authed) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Note not found', data: null }, { status: 404 });
  }

  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: note });
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
    const updated = updateNote(id, body);

    if (!updated) {
      return NextResponse.json<ApiResponse>({ code: 404, message: 'Note not found', data: null }, { status: 404 });
    }

    broadcastSse({ type: 'blog:updated' });
    return NextResponse.json<ApiResponse>({ code: 200, message: 'Note updated', data: updated });
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
  const ok = deleteNote(id);

  if (!ok) {
    return NextResponse.json<ApiResponse>({ code: 404, message: 'Note not found', data: null }, { status: 404 });
  }

  broadcastSse({ type: 'blog:updated' });
  return NextResponse.json<ApiResponse>({ code: 200, message: 'Note deleted', data: null });
}

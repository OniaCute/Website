import { NextRequest, NextResponse } from 'next/server';
import { getViewCount, recordView } from '@/lib/views';
import type { ApiResponse } from '@/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ contentKey: string }> }
) {
  const { contentKey } = await params;
  const count = getViewCount(decodeURIComponent(contentKey));

  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: { count } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentKey: string }> }
) {
  const { contentKey } = await params;

  const cookieName = 'onia_visitor';
  let sessionId = request.cookies.get(cookieName)?.value;

  const isNew = !sessionId;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  const count = recordView(decodeURIComponent(contentKey), sessionId);

  const response = NextResponse.json<ApiResponse>({ code: 200, message: 'success', data: { count } });

  if (isNew) {
    response.cookies.set(cookieName, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}

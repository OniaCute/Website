import { NextRequest, NextResponse } from 'next/server';
import { getReactionsWithIp, toggleReaction } from '@/lib/reactions';
import type { ApiResponse } from '@/types';

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentKey: string }> }
) {
  const { contentKey } = await params;
  const ip = getClientIp(request);
  const data = getReactionsWithIp(decodeURIComponent(contentKey), ip);

  return NextResponse.json<ApiResponse>({ code: 200, message: 'success', data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentKey: string }> }
) {
  const { contentKey } = await params;
  const ip = getClientIp(request);

  try {
    const { emoji } = await request.json();

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json<ApiResponse>({ code: 400, message: 'Missing emoji', data: null }, { status: 400 });
    }

    const result = toggleReaction(decodeURIComponent(contentKey), emoji, ip);
    return NextResponse.json<ApiResponse>({ code: 200, message: result.action, data: result });
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Internal server error', data: null }, { status: 500 });
  }
}

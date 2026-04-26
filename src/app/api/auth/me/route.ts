import { NextResponse } from 'next/server';
import { getAuthToken, verifyToken } from '@/lib/auth';

export async function GET() {
  const token = getAuthToken();
  if (!token) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ code: 401, message: 'Invalid token', data: null }, { status: 401 });
  }

  return NextResponse.json({ code: 200, message: 'ok', data: { username: payload.username } });
}

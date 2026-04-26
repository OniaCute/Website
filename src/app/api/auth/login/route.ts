import { NextRequest, NextResponse } from 'next/server';
import { loadAppConfig } from '@/lib/config';
import { signToken, verifyPassword, recordFailedAttempt, clearAttempts, isLockedOut, COOKIE_NAME } from '@/lib/auth';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';

  if (isLockedOut(ip)) {
    return NextResponse.json<ApiResponse>({ code: 429, message: 'Too many attempts. Account locked.', data: null }, { status: 429 });
  }

  try {
    const { username, password } = await request.json() as { username: string; password: string };

    if (!username || !password) {
      return NextResponse.json<ApiResponse>({ code: 400, message: 'Missing credentials', data: null }, { status: 400 });
    }

    const config = loadAppConfig();
    const isValid = username === config.admin.username && await verifyPassword(password, config.admin.passwordHash);

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json<ApiResponse>({ code: 401, message: 'Invalid credentials', data: null }, { status: 401 });
    }

    clearAttempts(ip);
    const token = signToken(username);

    const response = NextResponse.json<ApiResponse>({ code: 200, message: 'Login successful', data: { username } });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json<ApiResponse>({ code: 500, message: 'Server error', data: null }, { status: 500 });
  }
}

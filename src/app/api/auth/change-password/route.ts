import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, verifyPassword, hashPassword } from '@/lib/auth';
import { loadAppConfig, getConfigPath } from '@/lib/config';
import { atomicWriteJson } from '@/lib/fsAtomic';

export async function POST(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await request.json() as { oldPassword: string; newPassword: string };

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ code: 400, message: 'Password must be at least 8 characters', data: null }, { status: 400 });
    }

    const config = loadAppConfig();
    const isValid = await verifyPassword(oldPassword, config.admin.passwordHash);

    if (!isValid) {
      return NextResponse.json({ code: 401, message: 'Invalid current password', data: null }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);
    const updatedConfig = { ...config, admin: { ...config.admin, passwordHash: newHash } };
    atomicWriteJson(getConfigPath(), updatedConfig);

    return NextResponse.json({ code: 200, message: 'Password changed', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Server error', data: null }, { status: 500 });
  }
}

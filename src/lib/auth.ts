import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { JwtPayload, LoginAttempt } from '@/types';
import { loadAppConfig } from './config';
import { readJson, atomicWriteJson } from './fsAtomic';
import path from 'path';

const ATTEMPTS_PATH = path.join(process.cwd(), 'data', 'login-attempts.json');
const COOKIE_NAME = 'onia_auth';

export function signToken(username: string): string {
  const { security } = loadAppConfig();
  return jwt.sign({ username }, security.jwtSecret, {
    expiresIn: security.tokenExpiry as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const { security } = loadAppConfig();
    return jwt.verify(token, security.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value ?? null;
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  return verifyToken(token) !== null;
}

export function getAttempts(ip: string): LoginAttempt {
  const all = readJson<Record<string, LoginAttempt>>(ATTEMPTS_PATH) ?? {};
  return all[ip] ?? { count: 0, lastAttempt: 0 };
}

export function recordFailedAttempt(ip: string): void {
  const { security } = loadAppConfig();
  const all = readJson<Record<string, LoginAttempt>>(ATTEMPTS_PATH) ?? {};
  const attempt = all[ip] ?? { count: 0, lastAttempt: 0 };
  attempt.count += 1;
  attempt.lastAttempt = Date.now();

  if (attempt.count >= security.maxLoginAttempts) {
    attempt.lockedUntil = Date.now() + security.lockoutDuration * 1000;
  }

  all[ip] = attempt;
  atomicWriteJson(ATTEMPTS_PATH, all);
}

export function clearAttempts(ip: string): void {
  const all = readJson<Record<string, LoginAttempt>>(ATTEMPTS_PATH) ?? {};
  delete all[ip];
  atomicWriteJson(ATTEMPTS_PATH, all);
}

export function isLockedOut(ip: string): boolean {
  const attempt = getAttempts(ip);
  if (!attempt.lockedUntil) return false;
  if (Date.now() > attempt.lockedUntil) {
    clearAttempts(ip);
    return false;
  }
  return true;
}

export { COOKIE_NAME };

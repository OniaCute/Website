'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { isAuthenticated, username, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(res => {
        if (res.code === 200 && res.data?.username) {
          setAuth(res.data.username);
        } else {
          clearAuth();
        }
      })
      .catch(() => clearAuth());
  }, [setAuth, clearAuth]);

  async function login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json() as { code: number; message: string; data?: { username: string } };
    if (data.code === 200 && data.data) {
      setAuth(data.data.username);
      return { success: true, message: data.message };
    }
    return { success: false, message: data.message };
  }

  async function logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearAuth();
  }

  return { isAuthenticated, username, login, logout };
}

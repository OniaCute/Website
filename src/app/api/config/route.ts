import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig, saveSiteConfig, validateSiteConfig } from '@/lib/siteConfig';
import { isAuthenticated } from '@/lib/auth';
import { broadcastSse } from '@/lib/sse';

export async function GET() {
  const config = getSiteConfig();
  return NextResponse.json({ code: 200, message: 'ok', data: config });
}

export async function PUT(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = validateSiteConfig(body);

    if (!result.success) {
      return NextResponse.json({ code: 400, message: result.error, data: null }, { status: 400 });
    }

    saveSiteConfig(result.data);
    broadcastSse({ type: 'config:updated', payload: result.data });

    return NextResponse.json({ code: 200, message: 'Config updated', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Failed to update config', data: null }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    const patch = await request.json() as Record<string, unknown>;
    const current = getSiteConfig();
    const merged = deepMerge(current as unknown as Record<string, unknown>, patch) as unknown as typeof current;
    const result = validateSiteConfig(merged);

    if (!result.success) {
      return NextResponse.json({ code: 400, message: result.error, data: null }, { status: 400 });
    }

    saveSiteConfig(result.data);
    broadcastSse({ type: 'config:updated', payload: result.data });

    return NextResponse.json({ code: 200, message: 'Config patched', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Failed to patch config', data: null }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

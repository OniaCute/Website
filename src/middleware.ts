import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isSetupRoute = pathname.startsWith('/setup') || pathname.startsWith('/api/setup');
  const isAdminRoute = pathname.startsWith('/admin') || (pathname.startsWith('/api/') && isWriteApi(pathname));
  const isApiPublic = (pathname.startsWith('/api/config') && request.method === 'GET')
    || pathname.startsWith('/api/events')
    || pathname.startsWith('/api/static')
    || (pathname.startsWith('/api/content') && request.method === 'GET')
    || pathname.startsWith('/api/auth/me')
    || (pathname.startsWith('/api/blog') && request.method === 'GET')
    || pathname.startsWith('/api/reactions')
    || pathname.startsWith('/api/views')
    || (pathname.startsWith('/api/gallery') && request.method === 'GET');

  const cookieToken = request.cookies.get('onia_auth')?.value;

  if (isSetupRoute) return NextResponse.next();
  if (isApiPublic) return NextResponse.next();

  if (isAdminRoute) {
    if (!cookieToken) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
    }
  }

  return NextResponse.next();
}

function isWriteApi(pathname: string): boolean {
  return pathname.startsWith('/api/config')
    || pathname.startsWith('/api/content')
    || pathname.startsWith('/api/upload')
    || pathname.startsWith('/api/blog')
    || pathname.startsWith('/api/gallery');
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/api/:path*',
    '/setup/:path*',
    '/projects/:path*',
    '/blog/:path*',
    '/gallery/:path*',
  ],
};

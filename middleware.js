import { NextResponse } from 'next/server';

export function middleware(req) {
  // Get the pathname
  const { pathname } = req.nextUrl;

  // Protect all admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    response.headers.set('Content-Security-Policy', "default-src 'self'");
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}; 
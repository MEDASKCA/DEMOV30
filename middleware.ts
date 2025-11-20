import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page, terms page, and API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/terms') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated via Worker (medaskca_session) OR via app (tom_authenticated)
  const hasWorkerAuth = request.cookies.has('medaskca_session');
  const hasAppAuth = request.cookies.get('tom_authenticated')?.value === 'true';
  const isAuthenticated = hasWorkerAuth || hasAppAuth;

  if (!isAuthenticated) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

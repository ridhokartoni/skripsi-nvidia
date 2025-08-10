import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Admin-only routes
  const adminPaths = ['/admin'];
  const isAdminPath = pathname.startsWith('/admin');
  
  // User routes
  const userPaths = ['/user'];
  const isUserPath = pathname.startsWith('/user');
  
  // Get token from cookies (more reliable than localStorage for SSR)
  const token = request.cookies.get('token')?.value;
  
  // If no token and trying to access protected route, redirect to login
  if (!token && (isAdminPath || isUserPath)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If has token and trying to access login/register, redirect to appropriate dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    // We can't decode JWT on middleware without the secret, so we'll handle role-based redirect on client
    return NextResponse.redirect(new URL('/user', request.url));
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
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};

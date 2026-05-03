import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;
  
  // Exclude login routes
  const isAuthRoute = pathname.startsWith('/admin/login') || pathname.startsWith('/rider/login') || pathname === '/login';

  if (pathname.startsWith('/admin') && !isAuthRoute) {
    if (!token || token.role !== 'admin') {
      // If user is logged in but not admin, it's an unauthorized access attempt
      return NextResponse.redirect(new URL('/admin/login?error=AccessDenied', request.url));
    }
  }
  
  if (pathname.startsWith('/rider') && !isAuthRoute) {
    if (!token || token.role !== 'rider' || !token.is_active) {
      return NextResponse.redirect(new URL('/rider/login', request.url));
    }
  }
  
  // Check if the path is a static file (has an extension)
  const isFile = pathname.match(/\.[a-zA-Z0-9]+$/);
  
  if ((pathname.startsWith('/profile') || pathname.startsWith('/checkout') || (pathname.startsWith('/menu') && !isFile)) && !isAuthRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/rider/:path*', '/profile/:path*', '/checkout/:path*', '/menu/:path*']
};

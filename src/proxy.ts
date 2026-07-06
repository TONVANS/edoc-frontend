import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Check if the user is trying to access a protected route (e.g., /dashboard)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Look for the accessToken cookie set during login
    const token = request.cookies.get('accessToken')?.value;

    // If no token exists, redirect the user to the login page
    if (!token) {
      const loginUrl = new URL('/login', request.url);

      // Optionally, you can pass the original URL as a query parameter
      // to redirect them back after successful login:
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If token exists or route is not protected, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // Apply middleware to specific paths
  // Here we protect /dashboard and all its sub-routes
  matcher: [
    '/dashboard/:path*',
    // Add other protected routes here if needed
  ],
};

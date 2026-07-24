import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to decode JWT token
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Define route permissions based on Sidebar.tsx
const routePermissions = [
  { path: '/dashboard/warehouses', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
  { path: '/dashboard/locker', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
  { path: '/dashboard/shelves', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
  { path: '/dashboard/document-expired', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN', 'BRANCH_ADMIN'] },
  { path: '/dashboard/document-types', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
  { path: '/dashboard/users', allowedRoles: ['SUPER_ADMIN'] },
  { path: '/dashboard/departments', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
  { path: '/dashboard/divisions', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
  { path: '/dashboard/offices', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
  { path: '/dashboard/units', allowedRoles: ['SUPER_ADMIN', 'HQ_ADMIN'] },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is trying to access a protected route (e.g., /dashboard)
  if (pathname.startsWith('/dashboard')) {
    // Look for the accessToken cookie set during login
    const token = request.cookies.get('accessToken')?.value;

    // If no token exists, redirect the user to the login page
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode token to get user role
    const decodedToken = decodeJwt(token);
    const userRole = decodedToken?.role;

    // Check route permissions
    for (const route of routePermissions) {
      if (pathname.startsWith(route.path)) {
        if (!userRole || !route.allowedRoles.includes(userRole)) {
          // User does not have permission, redirect to a default authorized page (like /dashboard)
          // or an unauthorized page if you have one. Here we redirect to /dashboard.
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        break; // Match found and allowed, no need to check other rules
      }
    }
  }

  // If token exists and has permission, or route is not protected, allow the request to proceed
  return NextResponse.next();
}

// Apply proxy to specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
    // Add other protected routes here if needed
  ],
};

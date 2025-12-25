// frontend/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the routes that are "public" and do not require authentication.
// All other routes will be protected by default.
const isPublicRoute = createRouteMatcher([
    '/',
    '/blog(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/clerk-webhooks', // Ensure the webhook is public
]);

// This is the main middleware function.
// Configure Clerk to skip OPTIONS requests to avoid header immutability issues
export default clerkMiddleware(
  async (auth, req) => {
    // Skip authentication for OPTIONS requests - let route handlers handle CORS preflight
    // This prevents Clerk from trying to modify immutable headers on OPTIONS responses
    if (req.method === 'OPTIONS') {
      // Return undefined to let the request pass through without authentication
      // Route handlers will handle the OPTIONS response with proper CORS headers
      return;
    }

    // If the route is not public, it's protected.
    if (!isPublicRoute(req)) {
      const { isAuthenticated } = await auth();
      if (!isAuthenticated) {
        // For API routes, return 401 JSON instead of redirecting
        if (req.nextUrl.pathname.startsWith('/api/')) {
          const origin = req.headers.get('origin');
          const response = NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
          if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
          }
          return response;
        }
        // For page routes, redirect to sign-in
        return Response.redirect(new URL("/sign-in", req.url));
      }
    }
  },
  {
    // Skip Clerk's default header modifications for OPTIONS requests
    // This prevents the immutable header error
    publicRoutes: (req) => req.method === 'OPTIONS',
  }
);

export const config = {
  // This specifies which routes the middleware will run on.
  // Exclude OPTIONS requests to avoid header immutability issues
  matcher: [
    "/((?!.*\\..*|_next).*)", 
    "/", 
    "/(api|trpc)(.*)"
  ],
};
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
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, it's protected.
  if (!isPublicRoute(req)) {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      // For API routes, return 401 JSON instead of redirecting
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      // For page routes, redirect to sign-in
      return Response.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  // This specifies which routes the middleware will run on.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
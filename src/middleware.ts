import { NextRequest, NextResponse } from "next/server";
import { routeAccessMap } from "./lib/settings";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Get user from cookie (we'll set it after login)
  const userCookie = request.cookies.get("user")?.value;

  let userRole: string | null = null;

  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      userRole = user.role;
    } catch (e) {
      console.error("Failed to parse user cookie", e);
    }
  }

  // If no user role, redirect to login
  if (!userRole) {
    if (pathname !== "/" && !pathname.startsWith("/[[...sign-in]]")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Check route access permissions
  for (const [route, allowedRoles] of Object.entries(routeAccessMap)) {
    const routePattern = route.replace("(.*)", "");
    if (pathname.startsWith(routePattern) && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};



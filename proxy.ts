import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  let authToken;
  const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV;

  if (NODE_ENV === "development") {
    authToken = request.cookies.get("auth_token")?.value;
  } else {
    authToken = request.cookies.get("_vercel_jwt")?.value;
  }
  console.log("authToken", authToken);

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // User is not authenticated
  if (!authToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User is already authenticated
  if (authToken && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

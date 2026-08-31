import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed if authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect these routes — unauthenticated users are redirected to /login?callbackUrl=...
export const config = {
  matcher: ["/cart", "/settings", "/orders/:path*", "/checkout/:path*", "/favorites"],
};

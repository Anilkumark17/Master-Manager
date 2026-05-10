import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/server-jwt";

const COOKIE = "mm_token";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const payload = token ? verifySessionToken(token) : null;
  const isAuthed = Boolean(payload?.sub);

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/sign-in", "/sign-up"],
};

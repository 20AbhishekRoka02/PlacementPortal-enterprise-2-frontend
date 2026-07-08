import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const access = request.cookies.get("access");
  const refresh = request.cookies.get("refresh")

  if ((!access || !refresh) && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // if token is present, and user try to access any page of path /auth/*, redirect user to the dashboard
  if ((access && refresh) && request.nextUrl.pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // redirect to /dashboard, if user request for / 
  if (request.nextUrl.pathname == "/") { return NextResponse.redirect(new URL("/dashboard/job", request.url))}
  if (request.nextUrl.pathname == "/dashboard") { return NextResponse.redirect(new URL("/dashboard/job", request.url))}


  return NextResponse.next();
}
import { NextResponse } from 'next/server';

// Define protected routes (require authentication)
const protectedRoutes = ['/chat', '/home', '/fb_oauth'];

// Define auth routes (only accessible when not authenticated)
const authRoutes = ['/login', '/register', '/'];

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route and user is not authenticated
  if (protectedRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if the path is an auth route and user is authenticated
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes],
}; 
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Only apply middleware to dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      // Check for session cookie
      const sessionCookie = request.cookies.get('better-auth.session_token')
      
      if (!sessionCookie) {
        // Redirect to login if no session cookie
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
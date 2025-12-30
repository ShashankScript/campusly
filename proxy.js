import { NextResponse } from 'next/server'

export async function proxy(request) {
    // Only apply proxy to dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        try {
            // Check for session cookie
            // checks for both auth-token (simple auth) and better-auth.session_token (better auth)
            const sessionCookie = request.cookies.get('auth-token') || request.cookies.get('better-auth.session_token')

            if (!sessionCookie) {
                // Redirect to login if no session cookie
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (error) {
            console.error('Proxy auth error:', error)
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}

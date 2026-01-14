import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Routes that don't require authentication
  const publicRoutes = [
    '/api/customers/register',
    '/api/customers/login',
    '/api/merchant/register',
    '/api/merchant/login',
    '/api/auth/session',
    '/customers/login',
    '/customers/register',
    '/sellers/login',
    '/sellers/register',
  ]

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Dashboard routes are protected by client-side checks (localStorage in layout components)
  // Middleware can't verify JWT in edge runtime, so we let the page load and the layout will redirect if needed
  const dashboardRoutes = [
    '/sellers/dashboard',
    '/customers/orders',
    '/marketplace',
  ]

  const isDashboardRoute = dashboardRoutes.some(route => pathname === route || pathname.startsWith(route))
  if (isDashboardRoute) {
    console.log('[MIDDLEWARE] Dashboard route:', pathname, '- delegating auth to client-side layout check')
    return NextResponse.next()
  }

  // Routes that require merchant authentication (API only)
  const merchantProtectedRoutes = [
    '/sellers/products',
    '/sellers/orders',
    '/api/merchant',
  ]

  // Routes that require customer authentication (API only)
  const customerProtectedRoutes = [
    '/api/customers',
  ]

  // Check if this is a protected API route
  const isMerchantRoute = merchantProtectedRoutes.some(route => pathname.startsWith(route))
  const isCustomerRoute = customerProtectedRoutes.some(route => pathname.startsWith(route))

  if (isMerchantRoute || isCustomerRoute) {
    // Get token from cookie or header
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    console.log('[MIDDLEWARE] Protected API route check:', { pathname, hasToken: !!token })

    if (!token) {
      console.log('[MIDDLEWARE] ❌ No token found, redirecting to login')
      // Redirect to login
      if (isMerchantRoute) {
        return NextResponse.redirect(new URL('/sellers/login', request.url))
      } else {
        return NextResponse.redirect(new URL('/customers/login', request.url))
      }
    }

    console.log('[MIDDLEWARE] ✅ Token found, allowing API access')
    // For API routes, we trust the cookie is valid. Full token verification happens in the API routes themselves.
    return NextResponse.next()
  }

  // Redirect authenticated users away from login pages
  const token = request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  if (token) {
    if (pathname === '/sellers/login') {
      console.log('[MIDDLEWARE] Authenticated user on /sellers/login, allowing (will be redirected by page)')
      return NextResponse.next()
    }

    if (pathname === '/customers/login') {
      console.log('[MIDDLEWARE] Authenticated user on /customers/login, allowing (will be redirected by page)')
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

// Configure which routes should be checked by this middleware
export const config = {
  matcher: [
    '/sellers/:path*',
    '/customers/:path*',
    '/marketplace/:path*',
    '/api/merchant/:path*',
    '/api/customers/:path*',
  ],
}

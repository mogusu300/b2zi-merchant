import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getSession } from '@/lib/auth-utils'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    type: 'merchant' | 'customer'
  }
  session?: any
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check cookies
  const cookieToken = request.cookies.get('auth-token')?.value
  if (cookieToken) {
    return cookieToken
  }

  return null
}

/**
 * Middleware to verify session
 */
export async function withAuth(
  request: NextRequest,
  requiredType?: 'merchant' | 'customer'
): Promise<AuthenticatedRequest | NextResponse> {
  try {
    const token = extractToken(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      )
    }

    // Verify JWT
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check required user type
    if (requiredType && payload.type !== requiredType) {
      return NextResponse.json(
        { error: `Forbidden: This endpoint requires ${requiredType} authentication` },
        { status: 403 }
      )
    }

    // Get session from database
    const session = await getSession(token)
    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Unauthorized: Session expired' },
        { status: 401 }
      )
    }

    // Attach user info to request
    const authRequest = request as AuthenticatedRequest
    authRequest.user = {
      id: payload.id,
      email: payload.email,
      type: payload.type,
    }
    authRequest.session = session

    return authRequest
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Wrapper for protected API routes
 */
export function withAuthWrapper(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredType?: 'merchant' | 'customer'
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request, requiredType)

    // If it's a NextResponse, it's an error
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // Otherwise, it's the authenticated request
    return handler(authResult as AuthenticatedRequest)
  }
}

/**
 * Extract user from request context
 */
export function extractUser(request: NextRequest) {
  const token = extractToken(request)
  if (!token) return null

  const payload = verifyToken(token)
  return payload
}

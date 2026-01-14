import { NextRequest, NextResponse } from 'next/server'
import { getSession, verifyToken } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Get session from database
    const session = await getSession(token)
    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Return session info
    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.id,
        email: payload.email,
        type: payload.type,
      },
      session: {
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}

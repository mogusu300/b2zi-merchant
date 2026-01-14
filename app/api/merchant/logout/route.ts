import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('[MERCHANT LOGOUT] 🔌 Logout request received')
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    console.log('[MERCHANT LOGOUT] Token exists in cookie:', !!token)

    if (token) {
      console.log('[MERCHANT LOGOUT] Token found, invalidating session...')
      // Invalidate session in database
      await invalidateSession(token)
      console.log('[MERCHANT LOGOUT] ✅ Session invalidated')
    } else {
      console.log('[MERCHANT LOGOUT] ⚠️ No token found')
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear auth cookie - set maxAge: 0 to expire it immediately
    console.log('[MERCHANT LOGOUT] 🍪 Clearing auth-token cookie...')
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,  // Expire immediately
      path: '/',
    })

    console.log('[MERCHANT LOGOUT] ✅ Auth cookie marked for deletion')
    console.log('[MERCHANT LOGOUT] ✅ Logout successful')
    return response
  } catch (error) {
    console.error('[MERCHANT LOGOUT] ❌ Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

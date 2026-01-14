import { NextRequest, NextResponse } from 'next/server'
import { invalidateSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    console.log('[CUSTOMER LOGOUT] 🔌 Logout request received')
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value
    console.log('[CUSTOMER LOGOUT] Token exists in cookie:', !!token)

    if (token) {
      console.log('[CUSTOMER LOGOUT] Token found, invalidating session...')
      // Invalidate session in database
      await invalidateSession(token)
      console.log('[CUSTOMER LOGOUT] ✅ Session invalidated')
    } else {
      console.log('[CUSTOMER LOGOUT] ⚠️ No token found')
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear auth cookie - set maxAge: 0 to expire it immediately
    console.log('[CUSTOMER LOGOUT] 🍪 Clearing auth-token cookie...')
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,  // Expire immediately
      path: '/',
    })

    console.log('[CUSTOMER LOGOUT] ✅ Auth cookie marked for deletion')
    console.log('[CUSTOMER LOGOUT] ✅ Logout successful')
    return response
  } catch (error) {
    console.error('[CUSTOMER LOGOUT] ❌ Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

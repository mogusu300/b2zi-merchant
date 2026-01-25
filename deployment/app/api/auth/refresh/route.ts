import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth.service'
import { refreshTokenSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = refreshTokenSchema.parse(body)
    const result = await AuthService.refreshAccessToken(refreshToken)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully',
    })
  } catch (error: any) {
    console.error('[AUTH] Refresh token error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or expired refresh token. Please log in again.',
      },
      { status: 401 }
    )
  }
}

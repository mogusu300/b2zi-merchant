import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth.service'
import { merchantRegisterSchema, merchantLoginSchema, refreshTokenSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const path = request.nextUrl.pathname

    if (path.includes('/merchant/register')) {
      const merchantId = path.split('/').pop()
      const validatedData = merchantRegisterSchema.parse(body)

      const result = await AuthService.registerMerchant(merchantId!, validatedData)

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Merchant login created successfully',
        },
        { status: 201 }
      )
    }

    if (path.includes('/merchant/login')) {
      const { phone, password } = merchantLoginSchema.parse(body)
      const result = await AuthService.loginMerchant(phone, password)

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Login successful',
      })
    }

    if (path.includes('/refresh')) {
      const { refreshToken } = refreshTokenSchema.parse(body)
      const result = await AuthService.refreshAccessToken(refreshToken)

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      })
    }

    if (path.includes('/logout')) {
      return NextResponse.json({
        success: true,
        message: 'Logout successful',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Not found' },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('[AUTH]', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 400 }
    )
  }
}

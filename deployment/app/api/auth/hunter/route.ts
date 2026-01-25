import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth.service'
import { hunterRegisterSchema, hunterLoginSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const path = request.nextUrl.pathname

    if (path.includes('/hunter/register')) {
      const validatedData = hunterRegisterSchema.parse(body)
      const result = await AuthService.registerHunter(validatedData)

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Hunter registered successfully',
        },
        { status: 201 }
      )
    }

    if (path.includes('/hunter/login')) {
      const { email, password } = hunterLoginSchema.parse(body)
      const result = await AuthService.loginHunter(email, password)

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Login successful',
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

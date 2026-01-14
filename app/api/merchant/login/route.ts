import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  comparePassword,
  createToken,
  createSession,
  handleSuccessfulLogin,
} from '@/lib/auth-utils'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    console.log('[MERCHANT LOGIN] Attempt - Email:', email)

    if (!email || !password) {
      console.log('[MERCHANT LOGIN] ❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find merchant by email
    console.log('[MERCHANT LOGIN] 🔍 Searching for merchant by email:', email)
    const merchant = await prisma.merchant.findUnique({
      where: { email },
    })

    if (!merchant) {
      console.log('[MERCHANT LOGIN] ❌ Merchant NOT found for email:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[MERCHANT LOGIN] ✅ Merchant found:', merchant.id)
    console.log('[MERCHANT LOGIN] 🔐 Comparing passwords...')

    // Check password
    const passwordMatch = await comparePassword(password, merchant.password)
    console.log('[MERCHANT LOGIN] Password match:', passwordMatch)

    if (!passwordMatch) {
      console.log('[MERCHANT LOGIN] ❌ Password mismatch for merchant:', merchant.id)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[MERCHANT LOGIN] ✅ Password correct!')

    // Update login info
    await handleSuccessfulLogin(merchant.id, 'merchant')
    console.log('[MERCHANT LOGIN] ✅ Login attempt marked as successful')

    // Create JWT token
    const token = createToken({
      id: merchant.id,
      email: merchant.email,
      type: 'merchant',
    })
    console.log('[MERCHANT LOGIN] ✅ JWT token created')

    // Get client IP and user agent
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') ||
                     req.ip ||
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Create session in database
    await createSession(merchant.id, 'merchant', token, ipAddress, userAgent)
    console.log('[MERCHANT LOGIN] ✅ Session created in database')

    // Return merchant data with token (exclude password)
    const { password: _, ...merchantData } = merchant

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: merchant.id,
          email: merchant.email,
          businessName: merchant.businessName,
          ownerName: merchant.ownerName,
          type: 'merchant',
        },
        merchant: merchantData,
        token,
      },
      { status: 200 }
    )

    // Set auth token in httpOnly cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    console.log('[MERCHANT LOGIN] ✅ Setting auth-token cookie with JWT token')
    console.log('[MERCHANT LOGIN] ✅ Login successful! Merchant:', merchant.email)
    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[MERCHANT LOGIN] ❌ Error:', errorMsg)
    console.error('[MERCHANT LOGIN] Full error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}


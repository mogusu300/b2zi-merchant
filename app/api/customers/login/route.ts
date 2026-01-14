import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  comparePassword,
  createToken,
  createSession,
  handleSuccessfulLogin,
} from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('[CUSTOMER LOGIN] Attempt - Email:', email)

    if (!email || !password) {
      console.log('[CUSTOMER LOGIN] ❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if customer exists
    console.log('[CUSTOMER LOGIN] 🔍 Searching for customer by email:', email)
    const customer = await prisma.customer.findUnique({
      where: { email },
    })

    if (!customer) {
      console.log('[CUSTOMER LOGIN] ❌ Customer NOT found for email:', email)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[CUSTOMER LOGIN] ✅ Customer found:', customer.id)
    console.log('[CUSTOMER LOGIN] 🔐 Comparing passwords...')

    // Check password
    const passwordMatch = await comparePassword(password, customer.password)
    console.log('[CUSTOMER LOGIN] Password match:', passwordMatch)

    if (!passwordMatch) {
      console.log('[CUSTOMER LOGIN] ❌ Password mismatch for customer:', customer.id)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('[CUSTOMER LOGIN] ✅ Password correct!')

    // Update login info
    await handleSuccessfulLogin(customer.id, 'customer')
    console.log('[CUSTOMER LOGIN] ✅ Login attempt marked as successful')

    // Create JWT token
    const token = createToken({
      id: customer.id,
      email: customer.email,
      type: 'customer',
    })
    console.log('[CUSTOMER LOGIN] ✅ JWT token created')

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     request.ip ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create session in database
    await createSession(customer.id, 'customer', token, ipAddress, userAgent)
    console.log('[CUSTOMER LOGIN] ✅ Session created in database')

    // Return customer data with token (exclude password)
    const { password: _, ...customerData } = customer

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          type: 'customer',
        },
        customer: customerData,
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

    console.log('[CUSTOMER LOGIN] ✅ Setting auth-token cookie with JWT token')
    console.log('[CUSTOMER LOGIN] ✅ Login successful! User:', customer.email)
    return response
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[CUSTOMER LOGIN] ❌ Error:', errorMsg)
    console.error('[CUSTOMER LOGIN] Full error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login', details: errorMsg },
      { status: 500 }
    )
  }
}


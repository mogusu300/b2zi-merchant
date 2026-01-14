import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  createToken,
  createSession,
} from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, confirmPassword, phone } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone: phone || null,
      },
    })

    // Return customer without password
    const { password: _, ...customerData } = customer

    // Create JWT token for auto-login
    const token = createToken({
      id: customer.id,
      email: customer.email,
      type: 'customer',
    })

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     request.ip ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create session in database
    await createSession(customer.id, 'customer', token, ipAddress, userAgent)

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        customer: customerData,
        token,
      },
      { status: 201 }
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

    return response
  } catch (error) {
    console.error('[Customer Registration] Error:', error)
    return NextResponse.json(
      { error: 'Failed to register account' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, confirmPassword } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // TODO: Hash password with bcrypt in production
    const customer = await prisma.customer.create({
      data: {
        email,
        name,
        password, // NOT RECOMMENDED FOR PRODUCTION
      },
    })

    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Customer registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    )
  }
}

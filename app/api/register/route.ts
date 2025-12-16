import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { businessName, ownerName, email, phone, businessType, businessAddress, idType, password } = body
    
    if (!businessName || !ownerName || !email || !phone || !businessType || !businessAddress || !idType || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingMerchant = await prisma.merchant.findUnique({
      where: { email }
    })

    if (existingMerchant) {
      return NextResponse.json(
        { error: 'A merchant with this email already exists' },
        { status: 409 }
      )
    }

    // TODO: Hash password before storing in production
    // For now, storing as-is (NOT RECOMMENDED FOR PRODUCTION)
    // Use bcrypt or similar in production:
    // import bcrypt from 'bcrypt'
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Create new merchant
    const merchant = await prisma.merchant.create({
      data: {
        businessName,
        ownerName,
        email,
        phone,
        businessType,
        businessAddress,
        password, // TODO: Hash this in production
        idType,
        idFrontUrl: body.idFrontUrl || null,
        idBackUrl: body.idBackUrl || null,
        status: 'pending'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Merchant registered successfully',
        merchantId: merchant.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Merchant Registration] Error:', error)
    return NextResponse.json(
      { error: 'Failed to register merchant' },
      { status: 500 }
    )
  }
}

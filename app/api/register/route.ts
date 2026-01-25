import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-utils'

// Handle CORS
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({})
  return setCorsHeaders(response)
}

export async function POST(request: NextRequest) {
  try {
    console.log('[REGISTER API] Request received')
    // Log requester info for auditing
    try {
      console.log('[REGISTER API] User-Agent:', request.headers.get('user-agent'))
      console.log('[REGISTER API] Authorization present:', !!request.headers.get('authorization'))
      console.log('[REGISTER API] X-Forwarded-For:', request.headers.get('x-forwarded-for'))
    } catch (e) {
      console.warn('[REGISTER API] Failed to read headers for audit', e)
    }

    const body = await request.json()
    console.log('[REGISTER API] Request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    const { businessName, ownerName, email, phone, businessType, businessAddress, idType, password } = body
    console.log('[REGISTER API] Extracted fields')
    
    if (!businessName || !ownerName || !email || !phone || !businessType || !businessAddress || !idType || !password) {
      console.log('[REGISTER API] Missing required fields')
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    // Validate password strength
    if (password.length < 8) {
      console.log('[REGISTER API] Password too short')
      const response = NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('[REGISTER API] Invalid email format')
      const response = NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
      return setCorsHeaders(response)
    }

    // Check if email already exists
    console.log('[REGISTER API] Checking for existing email:', email)
    const existingMerchant = await prisma.merchant.findUnique({
      where: { email }
    })

    if (existingMerchant) {
      console.log('[REGISTER API] Email already exists')
      const response = NextResponse.json(
        { error: 'A merchant with this email already exists' },
        { status: 409 }
      )
      return setCorsHeaders(response)
    }

    // Hash password
    console.log('[REGISTER API] Hashing password')
    const hashedPassword = await hashPassword(password)

    // Create new merchant
    console.log('[REGISTER API] Creating merchant in database:', {
      businessName,
      ownerName,
      email,
      phone,
      businessType,
      businessAddress,
      idType,
      idFrontProvided: !!body.idFrontUrl,
      idBackProvided: !!body.idBackUrl
    })
    
    const merchant = await prisma.merchant.create({
      data: {
        businessName,
        ownerName,
        email,
        phone,
        businessType,
        businessAddress,
        password: hashedPassword,
        idType,
        idFrontUrl: body.idFrontUrl || null,
        idBackUrl: body.idBackUrl || null,
        status: 'pending'
      }
    })

    console.log('[REGISTER API] Merchant created successfully:', merchant.id)

    // Create activity log for registration
    try {
      await prisma.merchantActivityLog.create({
        data: {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          merchantId: merchant.id,
          action: 'MERCHANT_CREATED',
          description: `Merchant account created. Business: ${businessName}. Owner: ${ownerName}`,
          performedByRole: 'SYSTEM',
          performedByIp: request.headers.get('x-forwarded-for') || 'unknown',
          performedByUserAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            email,
            businessType,
            registrationDate: new Date().toISOString(),
          },
        },
      })
      console.log('[REGISTER API] Activity log created for merchant:', merchant.id)
    } catch (logError) {
      console.error('[REGISTER API] Error creating activity log:', logError)
      // Don't fail the registration if activity log fails
    }

    // Return merchant without password
    const { password: _, ...merchantData } = merchant

    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Merchant registered successfully. Please log in with your credentials.',
        merchant: merchantData
      },
      { status: 201 }
    )
    return setCorsHeaders(response)
  } catch (error) {
    console.error('[REGISTER API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[REGISTER API] Error details:', errorMessage)
    
    const response = NextResponse.json(
      { error: 'Failed to register merchant: ' + errorMessage },
      { status: 500 }
    )
    return setCorsHeaders(response)
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ message: 'Registration endpoint ready' })
  return setCorsHeaders(response)
}

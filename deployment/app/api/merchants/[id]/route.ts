import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, requireAuth } from '@/lib/auth.middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAuth(user)

    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          select: {
            id: true,
            documentType: true,
            isVerified: true,
            uploadedAt: true,
          },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Merchant not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: merchant,
    })
  } catch (error: any) {
    console.error('[MERCHANTS]', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: error.message === 'Unauthorized' ? 401 : 400 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, requireAuth } from '@/lib/auth.middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request)
    requireAuth(user, 'HUNTER')

    const merchants = await prisma.merchantHunterMerchant.findMany({
      where: { merchantHunterId: params.id },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            email: true,
            status: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: merchants,
      count: merchants.length,
    })
  } catch (error: any) {
    console.error('[HUNTERS]', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: error.message === 'Unauthorized' ? 401 : 400 }
    )
  }
}

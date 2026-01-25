import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, requireAuth } from '@/lib/auth.middleware'

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    requireAuth(user, 'HUNTER')

    const hunter = await prisma.merchantHunter.findUnique({
      where: { id: user!.id },
      include: {
        merchants: {
          include: {
            merchant: {
              select: {
                id: true,
                businessName: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!hunter) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Hunter not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hunter,
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

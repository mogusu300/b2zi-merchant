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

    const documents = await prisma.merchantOnboardingDocument.findMany({
      where: { merchantId: params.id },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
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

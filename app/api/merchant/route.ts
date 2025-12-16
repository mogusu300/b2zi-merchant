import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantId, status } = body

    if (!merchantId || !status) {
      return NextResponse.json(
        { error: 'Missing merchantId or status' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const merchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      message: `Merchant status updated to ${status}`,
      merchant
    })
  } catch (error) {
    console.error('[Merchant Update] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update merchant status' },
      { status: 500 }
    )
  }
}

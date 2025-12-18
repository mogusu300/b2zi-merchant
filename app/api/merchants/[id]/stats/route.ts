import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: { products: true },
    })

    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Calculate stats (mock data for now)
    const stats = {
      totalRevenue: 12500,
      totalOrders: 48,
      totalProducts: merchant.products.length,
      totalViews: 2340,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching merchant stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

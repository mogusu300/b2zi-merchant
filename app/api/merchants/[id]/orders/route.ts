import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get all products from this merchant
    const merchantProducts = await prisma.product.findMany({
      where: { sellerId: params.id },
      select: { id: true },
    })

    const productIds = merchantProducts.map((p) => p.id)

    // Get all orders that contain items from this merchant's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: { in: productIds },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching merchant orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get merchant ID from query params
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchantId')

    if (!merchantId) {
      // If no merchantId provided, return empty array with success
      return NextResponse.json({ 
        data: [],
        message: 'No merchant ID provided'
      })
    }

    // Fetch all orders with their items and products
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { 
            product: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter orders to only include items from this merchant (using sellerId, not merchantId)
    const sellerOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => item.product.sellerId === merchantId)
    })).filter(order => order.items.length > 0)

    return NextResponse.json({ 
      data: sellerOrders,
      count: sellerOrders.length
    })
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders', data: [], error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

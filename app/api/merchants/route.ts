import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform dates to strings for JSON serialization
    const transformedMerchants = merchants.map(merchant => ({
      ...merchant,
      createdAt: merchant.createdAt.toISOString(),
      updatedAt: merchant.updatedAt.toISOString()
    }))

    return NextResponse.json(transformedMerchants)
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return NextResponse.json(
      { message: 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}

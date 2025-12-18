import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let products
    if (category && category !== 'all' && search) {
      products = await prisma.product.findMany({
        where: {
          AND: [
            { category },
            {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: { seller: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (category && category !== 'all') {
      products = await prisma.product.findMany({
        where: { category },
        include: { seller: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (search) {
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: { seller: true },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      products = await prisma.product.findMany({
        include: { seller: true },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { message: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, images, colors, types, sellerId } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        images,
        colors: colors || [],
        types: types || [],
        sellerId,
        inStock: true,
      },
      include: { seller: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

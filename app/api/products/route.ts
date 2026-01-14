import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  category: true,
  images: true,
  sellerId: true,
  inStock: true,
  totalStock: true,
  rating: true,
  reviews: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      businessName: true,
      ownerName: true,
    }
  },
  variantGroups: {
    select: {
      name: true,
      values: true,
    }
  },
  variants: {
    where: { active: true },
    select: {
      id: true,
      attributes: true,
      sku: true,
      price: true,
      stock: true,
      images: true,
      weight: true,
      dimensions: true,
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const whereClause: any = {}
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: productSelect,
      orderBy: { createdAt: 'desc' },
    })

    // Map seller info to response
    const productsWithSeller = products.map(product => ({
      ...product,
      sellerName: product.seller?.businessName || product.seller?.ownerName || 'Unknown Seller',
      sellerCompany: product.seller?.businessName,
    }))

    return NextResponse.json(productsWithSeller)
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
    const { 
      name, 
      description, 
      price, 
      category, 
      images, 
      sellerId,
      stock,
      variantGroups,
      variants,
      colorVariants,
      typeVariants,
    } = body

    // Validate required fields
    if (!name || !price || !category || !sellerId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, category, sellerId' },
        { status: 400 }
      )
    }

    const totalStock = parseInt(stock) || 0

    // Handle both old format (colorVariants/typeVariants) and new format (variants/variantGroups)
    let processedVariantGroups = variantGroups
    let processedVariants = variants

    // Convert old format to new format if needed
    if (!processedVariants && (colorVariants || typeVariants)) {
      processedVariantGroups = []
      const variantCombinations = []

      // Add color variants group
      if (colorVariants && colorVariants.length > 0) {
        processedVariantGroups.push({
          name: 'Color',
          values: colorVariants.map((cv: any) => cv.color),
        })
      }

      // Add type variants group
      if (typeVariants && typeVariants.length > 0) {
        processedVariantGroups.push({
          name: 'Type',
          values: typeVariants.map((tv: any) => tv.type),
        })
      }

      // Create variant combinations
      if (colorVariants && colorVariants.length > 0) {
        if (typeVariants && typeVariants.length > 0) {
          // Both colors and types
          for (const color of colorVariants) {
            for (const type of typeVariants) {
              variantCombinations.push({
                attributes: { Color: color.color, Type: type.type },
                sku: `${name.toUpperCase()}-${color.color.substring(0, 2).toUpperCase()}-${type.type.substring(0, 2).toUpperCase()}`,
                price: color.price || type.price,
                stock: 0,
                images: [],
              })
            }
          }
        } else {
          // Only colors
          for (const color of colorVariants) {
            variantCombinations.push({
              attributes: { Color: color.color },
              sku: `${name.toUpperCase()}-${color.color.substring(0, 3).toUpperCase()}`,
              price: color.price,
              stock: 0,
              images: [],
            })
          }
        }
      } else if (typeVariants && typeVariants.length > 0) {
        // Only types
        for (const type of typeVariants) {
          variantCombinations.push({
            attributes: { Type: type.type },
            sku: `${name.toUpperCase()}-${type.type.substring(0, 3).toUpperCase()}`,
            price: type.price,
            stock: 0,
            images: [],
          })
        }
      }

      processedVariants = variantCombinations
    }

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        images,
        sellerId,
        inStock: totalStock > 0,
        totalStock,
        // Create variant groups if provided
        variantGroups: processedVariantGroups && processedVariantGroups.length > 0 ? {
          create: processedVariantGroups.map((group: any) => ({
            name: group.name,
            values: group.values,
          }))
        } : undefined,
        // Create variants if provided
        variants: processedVariants && processedVariants.length > 0 ? {
          create: processedVariants.map((variant: any) => ({
            attributes: variant.attributes || {},
            sku: variant.sku,
            price: variant.price ? parseFloat(variant.price) : undefined,
            stock: parseInt(variant.stock) || 0,
            images: variant.images || [],
            active: true,
          }))
        } : undefined,
      },
      select: productSelect,
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

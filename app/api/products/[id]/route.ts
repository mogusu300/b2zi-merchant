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
      id: true,
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await req.json()
    const {
      name,
      description,
      price,
      category,
      images,
      stock,
      variantGroups,
      variants,
      colorVariants,
      typeVariants,
    } = data

    // Update product with basic fields
    const updateData: any = {
      name,
      description,
      price: parseFloat(price),
      category,
      images,
      totalStock: parseInt(stock) || 0,
      inStock: parseInt(stock) > 0,
    }

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

    // Handle variant updates
    if (processedVariantGroups && processedVariantGroups.length > 0) {
      // Delete old variant groups and create new ones
      await prisma.productVariantGroup.deleteMany({
        where: { productId: id }
      })
      updateData.variantGroups = {
        create: processedVariantGroups.map((group: any) => ({
          name: group.name,
          values: group.values,
        }))
      }
    }

    if (processedVariants && processedVariants.length > 0) {
      // Delete old variants and create new ones
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      })
      updateData.variants = {
        create: processedVariants.map((variant: any) => ({
          attributes: variant.attributes || {},
          sku: variant.sku,
          price: variant.price ? parseFloat(variant.price) : undefined,
          stock: parseInt(variant.stock) || 0,
          images: variant.images || [],
          active: true,
        }))
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      select: productSelect,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Cascade delete is handled by Prisma schema
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

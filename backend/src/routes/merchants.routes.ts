import { Router } from 'express'
import { asyncHandler } from '@/middleware/index'
import { verifyToken, requireMerchant, AuthRequest } from '@/middleware/auth'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// All routes require authentication
router.use(verifyToken)
router.use(requireMerchant)

/**
 * GET /api/v1/merchants/me
 * Get current merchant profile
 */
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res) => {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.user!.id },
      include: {
        category: true,
        merchantLogin: {
          select: {
            phone: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
    })

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Merchant not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: merchant,
    })
  })
)

/**
 * GET /api/v1/merchants/:id
 * Get merchant details (public, but merchant can see all)
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const merchant = await prisma.merchant.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        documents: {
          select: {
            id: true,
            documentType: true,
            isVerified: true,
            uploadedAt: true,
          },
        },
      },
    })

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: { message: 'Merchant not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: merchant,
    })
  })
)

/**
 * GET /api/v1/merchants/:id/documents
 * Get merchant's documents
 */
router.get(
  '/:id/documents',
  asyncHandler(async (req: AuthRequest, res) => {
    const documents = await prisma.merchantOnboardingDocument.findMany({
      where: { merchantId: req.params.id },
      orderBy: { uploadedAt: 'desc' },
    })

    res.json({
      success: true,
      data: documents,
      count: documents.length,
    })
  })
)

/**
 * GET /api/v1/merchants/:id/activity-log
 * Get merchant's activity log
 */
router.get(
  '/:id/activity-log',
  asyncHandler(async (req: AuthRequest, res) => {
    const logs = await prisma.merchantActivityLog.findMany({
      where: { merchantId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  })
)

export default router

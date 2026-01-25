import { Router } from 'express'
import { asyncHandler } from '@/middleware/index'
import { verifyToken, requireHunter, AuthRequest } from '@/middleware/auth'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// All routes require authentication
router.use(verifyToken)
router.use(requireHunter)

/**
 * GET /api/v1/hunters/me
 * Get current hunter profile
 */
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res) => {
    const hunter = await prisma.merchantHunter.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        region: true,
        onboardedCount: true,
        rejectedCount: true,
        lastLoginAt: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!hunter) {
      return res.status(404).json({
        success: false,
        error: { message: 'Hunter not found', code: 'NOT_FOUND' },
      })
    }

    res.json({
      success: true,
      data: hunter,
    })
  })
)

/**
 * GET /api/v1/hunters/me/merchants
 * Get hunters merchants
 */
router.get(
  '/me/merchants',
  asyncHandler(async (req: AuthRequest, res) => {
    const hunterMerchants = await prisma.merchantHunterMerchant.findMany({
      where: { merchantHunterId: req.user!.id },
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      success: true,
      data: hunterMerchants,
      count: hunterMerchants.length,
    })
  })
)

/**
 * GET /api/v1/hunters/me/performance
 * Get hunter's performance metrics
 */
router.get(
  '/me/performance',
  asyncHandler(async (req: AuthRequest, res) => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const metrics = await prisma.agentPerformanceMetric.findFirst({
      where: {
        merchantHunterId: req.user!.id,
        year: currentYear,
        month: currentMonth,
      },
    })

    const hunters = await prisma.merchantHunter.findUnique({
      where: { id: req.user!.id },
      select: {
        onboardedCount: true,
        rejectedCount: true,
        targetMonthly: true,
      },
    })

    res.json({
      success: true,
      data: {
        current: metrics || {
          totalOnboarded: 0,
          totalRejected: 0,
          conversionRate: 0,
        },
        summary: hunters,
      },
    })
  })
)

export default router

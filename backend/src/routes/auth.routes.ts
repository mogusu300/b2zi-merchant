import { Router } from 'express'
import { asyncHandler } from '@/middleware/index'
import { AuthService } from '@/services/auth.service'
import {
  hunterRegisterSchema,
  hunterLoginSchema,
  merchantRegisterSchema,
  merchantLoginSchema,
  refreshTokenSchema,
} from '@/validators/index'

const router = Router()

// ===== HUNTER AUTHENTICATION =====

/**
 * POST /api/v1/auth/hunter/register
 * Register a new merchant hunter
 */
router.post(
  '/hunter/register',
  asyncHandler(async (req, res) => {
    const validatedData = hunterRegisterSchema.parse(req.body)
    const result = await AuthService.registerHunter(validatedData)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Hunter registered successfully',
    })
  })
)

/**
 * POST /api/v1/auth/hunter/login
 * Login a merchant hunter
 */
router.post(
  '/hunter/login',
  asyncHandler(async (req, res) => {
    const { email, password } = hunterLoginSchema.parse(req.body)
    const result = await AuthService.loginHunter(email, password)

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    })
  })
)

// ===== MERCHANT AUTHENTICATION =====

/**
 * POST /api/v1/auth/merchant/register/:merchantId
 * Register merchant login (by hunter during onboarding)
 */
router.post(
  '/merchant/register/:merchantId',
  asyncHandler(async (req, res) => {
    const { merchantId } = req.params
    const validatedData = merchantRegisterSchema.parse(req.body)

    const result = await AuthService.registerMerchant(merchantId, validatedData)

    res.status(201).json({
      success: true,
      data: result,
      message: 'Merchant login created successfully',
    })
  })
)

/**
 * POST /api/v1/auth/merchant/login
 * Login a merchant
 */
router.post(
  '/merchant/login',
  asyncHandler(async (req, res) => {
    const { phone, password } = merchantLoginSchema.parse(req.body)
    const result = await AuthService.loginMerchant(phone, password)

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    })
  })
)

// ===== TOKEN MANAGEMENT =====

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      const result = await AuthService.refreshAccessToken(refreshToken)

      res.json({
        success: true,
        data: result,
        message: 'Token refreshed successfully',
      })
    } catch (err) {
      console.error('[AUTH] Refresh token error:', err)
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token. Please log in again.',
      })
    }
  })
)

/**
 * POST /api/v1/auth/logout
 * Logout user (revoke tokens)
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    // In a production system, you would revoke the token here
    // For now, clients just discard the token

    res.json({
      success: true,
      message: 'Logout successful',
    })
  })
)

export default router

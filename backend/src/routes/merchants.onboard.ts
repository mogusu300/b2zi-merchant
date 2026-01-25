import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()
const prisma = new PrismaClient()

// Multer for handling multipart/form-data (file uploads)
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    cb(null, name)
  }
})

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

interface OnboardMerchantRequest {
  businessName: string
  ownerName: string
  email: string
  phone: string
  businessType: string
  businessAddress: string
  idType: string
  password: string
  idFrontUrl?: string | null
  idBackUrl?: string | null
}

/**
 * POST /api/v1/merchants/onboard
 * Onboard a new merchant (public endpoint for PWA registration)
 */
router.post('/', upload.fields([{ name: 'idFront' }, { name: 'idBack' }]), async (req: Request, res: Response) => {
  try {
    // Support both JSON and multipart/form-data
    const body = req.body as any
    const files = (req as any).files as Record<string, Express.Multer.File[]>

    // Diagnostic info to help debug missing files in multipart requests
    try {
      console.log('[MERCHANTS ONBOARD] Headers Content-Type:', req.headers['content-type'])
      console.log('[MERCHANTS ONBOARD] Is multipart/form-data?', req.is('multipart/form-data'))
      console.log('[MERCHANTS ONBOARD] Body keys:', Object.keys(body || {}))
      console.log('[MERCHANTS ONBOARD] User-Agent:', req.headers['user-agent'])
      console.log('[MERCHANTS ONBOARD] Authorization header present:', !!req.headers['authorization'])
      // Best-effort client IP
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || null
      console.log('[MERCHANTS ONBOARD] Client IP:', ip)
    } catch (diagErr) {
      console.warn('[MERCHANTS ONBOARD] Diagnostic logging failed', diagErr)
    }

    // Also append a compact audit record to disk for offline inspection
    try {
      const auditDir = path.join(process.cwd(), 'backend-logs')
      if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true })
      const auditRecord = {
        ts: new Date().toISOString(),
        businessName: businessName || null,
        email: body.email || null,
        phone: body.phone || null,
        idType: body.idType || null,
        hasIdFront: !!(files?.idFront && files.idFront[0]),
        hasIdBack: !!(files?.idBack && files.idBack[0]),
        ua: String(req.headers['user-agent'] || null),
        auth: !!req.headers['authorization'],
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || null
      }
      const auditPath = path.join(auditDir, 'onboard-audit.log')
      fs.appendFileSync(auditPath, JSON.stringify(auditRecord) + '\n')
    } catch (logErr) {
      console.warn('[MERCHANTS ONBOARD] Failed to write audit log', logErr)
    }

    const businessName = body.businessName
    const ownerName = body.ownerName
    const email = body.email
    const phone = body.phone
    const businessType = body.businessType
    const businessAddress = body.businessAddress
    const idType = body.idType
    const password = body.password

    console.log('[MERCHANTS ONBOARD] Request received:', { businessName, email, phone, idType, files: { idFront: files?.idFront?.length, idBack: files?.idBack?.length } })

    // Validate required fields and files
    const missingFields: string[] = []
    const required = { businessName, ownerName, email, phone, businessType, businessAddress, idType, password }
    for (const [key, val] of Object.entries(required)) {
      if (!val) missingFields.push(key)
    }
    if (!files || !files.idFront || !files.idBack) {
      if (!files || !files.idFront) missingFields.push('idFront')
      if (!files || !files.idBack) missingFields.push('idBack')
    }

    if (missingFields.length > 0) {
      console.log('[MERCHANTS ONBOARD] Missing required fields:', missingFields)
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS',
          fields: missingFields,
          hint: 'Required: businessName, ownerName, email, phone, businessType, businessAddress, idType, password, idFront, idBack'
        }
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('[MERCHANTS ONBOARD] Invalid email format:', email)
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid email format', code: 'INVALID_EMAIL', field: 'email', example: 'business@example.com' }
      })
    }

    // Validate password length
    if (String(password).length < 8) {
      console.log('[MERCHANTS ONBOARD] Password too short')
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD', field: 'password' }
      })
    }

    // Check if email already exists
    console.log('[MERCHANTS ONBOARD] Checking for existing email:', email)
    const existingMerchant = await prisma.merchant.findUnique({ where: { email } })

    if (existingMerchant) {
      console.log('[MERCHANTS ONBOARD] Email already exists')
      return res.status(409).json({
        success: false,
        error: {
          message: 'A merchant with this email already exists',
          code: 'EMAIL_EXISTS',
          field: 'email',
          suggestion: 'If this is your account, try to login or reset the password. Use a different email to register a new account.'
        }
      })
    }

    // Hash password
    console.log('[MERCHANTS ONBOARD] Hashing password')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Persist uploaded files to local uploads folder and return accessible URLs
    let idFrontUrl: string | null = null
    let idBackUrl: string | null = null
    const base = process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
    if (files?.idFront && files.idFront[0]) {
      idFrontUrl = `${base}/uploads/${files.idFront[0].filename}`
    }
    if (files?.idBack && files.idBack[0]) {
      idBackUrl = `${base}/uploads/${files.idBack[0].filename}`
    }

    // Extract hunter ID from JWT token if provided
    let hunterId: string | null = null
    const authHeader = req.headers['authorization']
    console.log('[MERCHANTS ONBOARD] Authorization header:', authHeader ? 'YES' : 'NO')
    
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1]
        console.log('[MERCHANTS ONBOARD] Token found:', !!token)
        
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
          console.log('[MERCHANTS ONBOARD] Token decoded, type:', decoded.type, 'id:', decoded.id)
          
          if (decoded.type === 'HUNTER' && decoded.id) {
            hunterId = decoded.id
            console.log('[MERCHANTS ONBOARD] ✅ VALID HUNTER ID extracted:', hunterId)
          } else {
            console.log('[MERCHANTS ONBOARD] ❌ Token is not HUNTER type or has no ID')
          }
        }
      } catch (tokenErr) {
        console.warn('[MERCHANTS ONBOARD] ❌ Failed to extract hunter ID from token:', tokenErr instanceof Error ? tokenErr.message : tokenErr)
      }
    } else {
      console.log('[MERCHANTS ONBOARD] ❌ No Authorization header - merchant will NOT be linked to hunter')
    }

    // Create new merchant
    console.log('[MERCHANTS ONBOARD] Creating merchant in database', {
      businessName,
      ownerName,
      email,
      phone,
      businessType,
      businessAddress,
      idType,
      hasIdFront: !!(files?.idFront && files.idFront[0]),
      hasIdBack: !!(files?.idBack && files.idBack[0]),
      hunterId: hunterId || 'unauthenticated',
      authProvided: !!req.headers['authorization']
    })
    const merchant = await prisma.merchant.create({
      data: {
        businessName,
        ownerName,
        email,
        phone,
        businessType,
        businessAddress,
        password: hashedPassword,
        idType,
        idFrontUrl,
        idBackUrl,
        status: 'pending'
      }
    })

    console.log('[MERCHANTS ONBOARD] Merchant created successfully:', merchant.id)

    // CRITICAL: Create MerchantHunterMerchant relationship
    // If no hunter is logged in, assign to default/self-service merchant
    if (hunterId) {
      console.log('[MERCHANTS ONBOARD] 📌 Creating relationship with HUNTER:', hunterId)
      try {
        const merchantHunterMerchant = await prisma.merchantHunterMerchant.create({
          data: {
            merchantHunterId: hunterId,
            merchantId: merchant.id,
            status: 'not_started',
            onboardingStartedAt: new Date(),
            onboardingDaysElapsed: 0
          }
        })
        console.log('[MERCHANTS ONBOARD] ✅ MerchantHunterMerchant relationship created:', merchantHunterMerchant.id)

        // Log the activity
        await prisma.merchantActivityLog.create({
          data: {
            merchantId: merchant.id,
            merchantHunterId: hunterId,
            action: 'REGISTERED',
            description: `Merchant registered and assigned to hunter ${hunterId}`,
            performedByRole: 'HUNTER',
            performedByIp: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || 'unknown'
          }
        })
        console.log('[MERCHANTS ONBOARD] ✅ Activity log created')
      } catch (relationErr) {
        console.error('[MERCHANTS ONBOARD] ❌ Failed to create relationship:', relationErr instanceof Error ? relationErr.message : relationErr)
        // Don't fail the registration if relationship creation fails, but log it
      }
    } else {
      console.log('[MERCHANTS ONBOARD] ⚠️  NO HUNTER - Cannot create relationship (user not logged in)')
      // Try to create activity log for self-registered merchant
      try {
        await prisma.merchantActivityLog.create({
          data: {
            merchantId: merchant.id,
            action: 'REGISTERED',
            description: 'Merchant self-registered without hunter assignment',
            performedByRole: 'MERCHANT',
            performedByIp: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || req.ip || 'unknown'
          }
        })
        console.log('[MERCHANTS ONBOARD] ℹ️  Activity log created (no hunter)')
      } catch (logErr) {
        console.warn('[MERCHANTS ONBOARD] Failed to create activity log:', logErr instanceof Error ? logErr.message : logErr)
      }
    }

    // Return merchant without password
    const { password: _, ...merchantData } = merchant

    return res.status(201).json({
      success: true,
      data: { merchant: merchantData },
      message: 'Merchant registered successfully'
    })
  } catch (error) {
    console.error('[MERCHANTS ONBOARD] Error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[MERCHANTS ONBOARD] Error details:', errorMessage)

    const responseError: any = {
      message: 'Failed to register merchant',
      code: 'REGISTRATION_ERROR',
    }

    // Include details in development for easier debugging
    if (process.env.NODE_ENV !== 'production') {
      responseError.details = errorMessage
      if (error instanceof Error && (error as any).stack) responseError.stack = (error as any).stack
    }

    return res.status(500).json({ success: false, error: responseError })
  }
})

export default router

import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler, requestLogger } from '@/middleware/index'
import authRoutes from '@/routes/auth.routes'
import merchantRoutes from '@/routes/merchants.routes'
import { PrismaClient } from '@prisma/client'
import merchantOnboardRoutes from '@/routes/merchants.onboard'
import hunterRoutes from '@/routes/hunters.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ===== MIDDLEWARE =====

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Serve uploaded files (IDs) from the uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
app.use('/uploads', express.static(uploadsDir))

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN?.split(',') ?? [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
]).map((o) => o.trim()).filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log('[CORS] No origin (mobile/Postman) - ALLOWED')
      return callback(null, true)
    }
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] Origin ${origin} in whitelist - ALLOWED`)
      return callback(null, true)
    }
    // For development, log but don't block
    console.log(`[CORS] Unknown origin ${origin} - ALLOWED (dev mode)`)
    return callback(null, true) // Allow all in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
}))

// Explicitly handle OPTIONS for all routes
app.options('*', cors())

// Request logging
app.use(requestLogger)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  })
})
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'FieldPro Harare Backend API v1',
    endpoints: {
      auth: '/api/v1/auth',
      merchants: '/api/v1/merchants',
      hunters: '/api/v1/hunters',
    },
    status: 'operational'
  })
})

// ===== ROUTES =====

// Public onboarding routes (no auth required)
app.use('/api/v1/merchants/onboard', merchantOnboardRoutes)

// Public admin listing (no auth) - used by admin UI in development
const prisma = new PrismaClient()
app.get('/api/v1/merchants', async (req, res) => {
  try {
    const merchants = await prisma.merchant.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json(merchants)
  } catch (err) {
    console.error('[SERVER] Public GET /api/v1/merchants error', err)
    return res.status(500).json({ success: false, error: 'Failed to fetch merchants' })
  }
})

// Authentication routes (public)
app.use('/api/v1/auth', authRoutes)

// Merchant routes (requires merchant auth)
app.use('/api/v1/merchants', merchantRoutes)

// Hunter routes (requires hunter auth)
app.use('/api/v1/hunters', hunterRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  })
})

// ===== ERROR HANDLER =====
app.use(errorHandler)

// ===== START SERVER =====
const HOST = '0.0.0.0'
const server = app.listen(PORT, HOST, () => {
  console.log(`backend process pid=${process.pid} starting`)
  console.log(`Server listening on ${HOST}:${PORT} (pid=${process.pid})`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Local URL: http://localhost:${PORT}  API: http://localhost:${PORT}/api/v1  Health: http://localhost:${PORT}/health`)
  console.log(`Network URL: http://0.0.0.0:${PORT} (accessible from any IP)`)
})

server.on('error', (err: any) => {
  console.error('[SERVER] Error event on server:', err && err.stack ? err.stack : err)
})

process.on('uncaughtException', (err) => {
  console.error('[PROCESS] Uncaught Exception:', err && err.stack ? err.stack : err)
})

process.on('unhandledRejection', (reason) => {
  console.error('[PROCESS] Unhandled Rejection:', reason)
})

export default app

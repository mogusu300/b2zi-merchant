import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

export interface AuthPayload {
  id: string
  email: string
  type: 'merchant' | 'customer'
  iat?: number
  exp?: number
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create JWT token
 */
export function createToken(payload: AuthPayload): string {
  const expiresIn = SESSION_TIMEOUT / 1000 // Convert to seconds
  console.log('[CREATE TOKEN] Creating JWT with payload:', { id: payload.id, email: payload.email, type: payload.type })
  console.log('[CREATE TOKEN] JWT_SECRET set:', !!JWT_SECRET)
  console.log('[CREATE TOKEN] JWT_SECRET length:', JWT_SECRET.length)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn })
  console.log('[CREATE TOKEN] ✅ JWT created, length:', token.length)
  return token
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): AuthPayload | null {
  try {
    console.log('[VERIFY TOKEN] Attempting to verify token...')
    console.log('[VERIFY TOKEN] Token length:', token.length)
    console.log('[VERIFY TOKEN] JWT_SECRET set:', !!JWT_SECRET)
    console.log('[VERIFY TOKEN] JWT_SECRET length:', JWT_SECRET.length)
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    console.log('[VERIFY TOKEN] ✅ Token verified successfully:', { id: decoded.id, email: decoded.email, type: decoded.type })
    return decoded
  } catch (error) {
    console.error('[VERIFY TOKEN] ❌ Token verification failed:', error instanceof Error ? error.message : String(error))
    console.error('[VERIFY TOKEN] Error details:', error)
    return null
  }
}

/**
 * Create session in database
 */
export async function createSession(
  userId: string,
  type: 'merchant' | 'customer',
  token: string,
  ipAddress?: string,
  userAgent?: string
) {
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT)

  return prisma.session.create({
    data: {
      token,
      type,
      userId,
      ...(type === 'merchant' ? { merchantId: userId } : { customerId: userId }),
      ipAddress,
      userAgent,
      expiresAt,
    },
  })
}

/**
 * Get session by token
 */
export async function getSession(token: string) {
  return prisma.session.findUnique({
    where: { token },
    include: {
      merchant: true,
      customer: true,
    },
  })
}

/**
 * Invalidate session
 */
export async function invalidateSession(token: string) {
  return prisma.session.delete({
    where: { token },
  }).catch(() => null)
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllSessions(userId: string, type: 'merchant' | 'customer') {
  return prisma.session.deleteMany({
    where: {
      userId,
      type,
    },
  })
}

/**
 * Handle failed login attempt
 */
export async function handleFailedLogin(userId: string, type: 'merchant' | 'customer') {
  const user = type === 'merchant' 
    ? await prisma.merchant.findUnique({ where: { id: userId } })
    : await prisma.customer.findUnique({ where: { id: userId } })

  if (!user) return null

  const attempts = (user.loginAttempts || 0) + 1
  const updates: any = { loginAttempts: attempts }

  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    updates.lockedUntil = new Date(Date.now() + LOCKOUT_TIME)
  }

  if (type === 'merchant') {
    return prisma.merchant.update({
      where: { id: userId },
      data: updates,
    })
  } else {
    return prisma.customer.update({
      where: { id: userId },
      data: updates,
    })
  }
}

/**
 * Handle successful login
 */
export async function handleSuccessfulLogin(userId: string, type: 'merchant' | 'customer') {
  return type === 'merchant'
    ? prisma.merchant.update({
        where: { id: userId },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date(),
        },
      })
    : prisma.customer.update({
        where: { id: userId },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date(),
        },
      })
}

/**
 * Check if account is locked
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false
  return new Date() < lockedUntil
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

/**
 * Get active sessions for user
 */
export async function getActiveSessions(userId: string, type: 'merchant' | 'customer') {
  return prisma.session.findMany({
    where: {
      userId,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
  })
}

/**
 * Generate secure random token
 */
export function generateSecureToken(): string {
  const buffer = Buffer.alloc(32)
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = Math.floor(Math.random() * 256)
  }
  return buffer.toString('hex')
}

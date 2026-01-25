import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface TokenPayload {
  id: string
  type: 'HUNTER' | 'MERCHANT'
  email: string
  role?: string
}

export class AuthService {
  // ===== PASSWORD HASHING =====

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // ===== TOKEN GENERATION =====

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    })
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    })
  }

  // ===== HUNTER AUTHENTICATION =====

  static async registerHunter(data: {
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    region?: string
  }) {
    // Ensure Prisma model is available (helpful error if client not generated)
    const mhModel = (prisma as any).merchantHunter
    if (!mhModel) {
      throw new Error(
        'Prisma model `merchantHunter` not found on Prisma Client. Did you run `prisma generate` and restart the server?'
      )
    }

    // Check if hunter already exists
    const existing = await mhModel.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    })

    if (existing) {
      throw new Error(
        existing.email === data.email
          ? 'Email already registered'
          : 'Phone number already registered'
      )
    }

    const hashedPassword = await this.hashPassword(data.password)

    const hunter = await mhModel.create({
      data: {
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        region: data.region,
      },
    })

    const tokens = this.generateTokens({
      id: hunter.id,
      type: 'HUNTER',
      email: hunter.email,
    })

    return {
      hunter: {
        id: hunter.id,
        email: hunter.email,
        firstName: hunter.firstName,
        lastName: hunter.lastName,
        phone: hunter.phone,
      },
      ...tokens,
    }
  }

  static async loginHunter(email: string, password: string) {
    const mhModel = (prisma as any).merchantHunter
    if (!mhModel) {
      throw new Error('Prisma model `merchantHunter` not available on client')
    }

    const hunter = await mhModel.findUnique({
      where: { email },
    })

    if (!hunter) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await this.verifyPassword(password, hunter.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    if (!hunter.isActive) {
      throw new Error('Account is inactive')
    }

    // Update last login
    await prisma.merchantHunter.update({
      where: { id: hunter.id },
      data: {
        lastLoginAt: new Date(),
      },
    })

    const tokens = this.generateTokens({
      id: hunter.id,
      type: 'HUNTER',
      email: hunter.email,
    })

    return {
      hunter: {
        id: hunter.id,
        email: hunter.email,
        firstName: hunter.firstName,
        lastName: hunter.lastName,
        phone: hunter.phone,
        onboardedCount: hunter.onboardedCount,
      },
      ...tokens,
    }
  }

  // ===== MERCHANT AUTHENTICATION =====

  static async registerMerchant(merchantId: string, data: {
    phone: string
    password?: string
  }) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      throw new Error('Merchant not found')
    }

    const existing = await prisma.merchantLogin.findUnique({
      where: { phone: data.phone },
    })

    if (existing) {
      throw new Error('Phone number already registered')
    }

    const hashedPassword = data.password
      ? await this.hashPassword(data.password)
      : null

    const login = await prisma.merchantLogin.create({
      data: {
        merchantId,
        phone: data.phone,
        password: hashedPassword,
      },
    })

    return {
      merchant: {
        id: merchant.id,
        name: merchant.name,
        phone: data.phone,
      },
    }
  }

  static async loginMerchant(phone: string, password?: string) {
    const login = await prisma.merchantLogin.findUnique({
      where: { phone },
      include: { merchant: true },
    })

    if (!login) {
      throw new Error('Phone number not registered')
    }

    if (!login.isActive) {
      throw new Error('Account is inactive')
    }

    if (password && login.password) {
      const isPasswordValid = await this.verifyPassword(password, login.password)
      if (!isPasswordValid) {
        throw new Error('Invalid password')
      }
    }

    // Update last login
    await prisma.merchantLogin.update({
      where: { id: login.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
      },
    })

    const tokens = this.generateTokens({
      id: login.merchantId,
      type: 'MERCHANT',
      email: login.merchant.email,
    })

    return {
      merchant: {
        id: login.merchant.id,
        name: login.merchant.name,
        email: login.merchant.email,
        phone: login.phone,
      },
      ...tokens,
    }
  }

  // ===== UTILITY METHODS =====

  private static generateTokens(payload: TokenPayload) {
    const accessToken = this.generateAccessToken(payload)
    const refreshToken = this.generateRefreshToken(payload)

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as TokenPayload

      const newAccessToken = this.generateAccessToken(decoded)
      return {
        accessToken: newAccessToken,
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  static verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    return decoded as TokenPayload
  }
}

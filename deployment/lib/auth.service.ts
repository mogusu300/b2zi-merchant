import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export interface TokenPayload {
  id: string
  type: 'HUNTER' | 'MERCHANT'
  email: string
  role?: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12)
    return bcrypt.hash(password, salt)
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

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

  static generateTokens(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  static async registerHunter(data: {
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    region?: string
  }) {
    const existing = await prisma.merchantHunter.findFirst({
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

    const hunter = await prisma.merchantHunter.create({
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
    const hunter = await prisma.merchantHunter.findUnique({
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

  static async registerMerchant(merchantId: string, data: { phone: string; password?: string }) {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      throw new Error('Merchant not found')
    }

    const hashedPassword = data.password ? await this.hashPassword(data.password) : null

    const merchantLogin = await prisma.merchantLogin.create({
      data: {
        merchantId,
        phone: data.phone,
        password: hashedPassword,
        isActive: true,
      },
    })

    const tokens = this.generateTokens({
      id: merchantId,
      type: 'MERCHANT',
      email: merchant.email,
    })

    return {
      merchantLogin: {
        id: merchantLogin.id,
        phone: merchantLogin.phone,
        merchantId: merchantLogin.merchantId,
      },
      ...tokens,
    }
  }

  static async loginMerchant(phone: string, password?: string) {
    const merchantLogin = await prisma.merchantLogin.findUnique({
      where: { phone },
      include: { merchant: true },
    })

    if (!merchantLogin) {
      throw new Error('Invalid phone or password')
    }

    if (!merchantLogin.isActive) {
      throw new Error('Account is inactive')
    }

    if (password && merchantLogin.password) {
      const isPasswordValid = await this.verifyPassword(password, merchantLogin.password)
      if (!isPasswordValid) {
        throw new Error('Invalid phone or password')
      }
    }

    await prisma.merchantLogin.update({
      where: { id: merchantLogin.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
      },
    })

    const tokens = this.generateTokens({
      id: merchantLogin.merchantId,
      type: 'MERCHANT',
      email: merchantLogin.merchant.email,
    })

    return {
      merchant: {
        id: merchantLogin.merchant.id,
        businessName: merchantLogin.merchant.businessName,
        email: merchantLogin.merchant.email,
        phone: merchantLogin.merchant.phone,
      },
      ...tokens,
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as TokenPayload

      const newAccessToken = this.generateAccessToken(decoded)
      return { accessToken: newAccessToken }
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }
}

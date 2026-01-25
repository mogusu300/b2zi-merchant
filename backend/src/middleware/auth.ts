import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    type: 'HUNTER' | 'MERCHANT'
    email: string
    role?: string
  }
  token?: string
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'No token provided',
        code: 'NO_TOKEN',
      },
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
    req.user = decoded
    req.token = token
    next()
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
    })
  }
}

export function requireHunter(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'HUNTER') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'This endpoint is only for hunters',
        code: 'UNAUTHORIZED_ROLE',
      },
    })
  }
  next()
}

export function requireMerchant(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'MERCHANT') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'This endpoint is only for merchants',
        code: 'UNAUTHORIZED_ROLE',
      },
    })
  }
  next()
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'This endpoint is only for admins',
        code: 'UNAUTHORIZED_ROLE',
      },
    })
  }
  next()
}

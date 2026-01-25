import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  id: string
  type: 'HUNTER' | 'MERCHANT'
  email: string
  role?: string
}

export function verifyToken(request: NextRequest): AuthPayload | null {
  const token = request.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function requireAuth(user: AuthPayload | null, requiredType?: 'HUNTER' | 'MERCHANT') {
  if (!user) {
    throw new Error('Unauthorized')
  }

  if (requiredType && user.type !== requiredType) {
    throw new Error('Forbidden')
  }

  return user
}

import { z } from 'zod'

export const hunterRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  region: z.string().optional(),
})

export const hunterLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
})

export const merchantRegisterSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .optional(),
})

export const merchantLoginSchema = z.object({
  phone: z.string().min(10, 'Phone number required'),
  password: z.string().optional(),
  useOtp: z.boolean().optional(),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
})

export const merchantCreateSchema = z.object({
  name: z.string().min(2, 'Merchant name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone required'),
  ownerName: z.string().min(2, 'Owner name required'),
  location: z.string().min(2, 'Location required'),
  categoryId: z.string().min(1, 'Category required'),
})

export const merchantUpdateSchema = merchantCreateSchema.partial()

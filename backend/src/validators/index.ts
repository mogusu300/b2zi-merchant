import { z } from 'zod'

// ===== AUTH VALIDATORS =====

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

// ===== MERCHANT VALIDATORS =====

export const merchantCreateSchema = z.object({
  name: z.string().min(2, 'Merchant name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone required'),
  ownerName: z.string().min(2, 'Owner name required'),
  location: z.string().min(2, 'Location required'),
  categoryId: z.string().min(1, 'Category required'),
})

export const merchantUpdateSchema = merchantCreateSchema.partial()

// ===== HUNTER VALIDATORS =====

export const hunterUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
})

export const hunterPasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
})

// ===== DOCUMENT VALIDATORS =====

export const documentUploadSchema = z.object({
  documentType: z.enum([
    'NATIONAL_ID',
    'BUSINESS_REGISTRATION',
    'TAX_CERTIFICATE',
    'BANK_STATEMENT',
    'PROOF_OF_ADDRESS',
    'SHOP_PHOTO',
    'OWNER_PHOTO',
    'OTHER',
  ]),
  fileName: z.string().min(1, 'File name required'),
  fileSize: z.number().positive('File size must be positive'),
  mimeType: z.string().min(1, 'MIME type required'),
})

export const documentVerifySchema = z.object({
  isVerified: z.boolean(),
  verificationNotes: z.string().optional(),
})

// ===== MERCHANT ONBOARDING =====

export const merchantOnboardingStartSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID required'),
  hunterId: z.string().min(1, 'Hunter ID required'),
})

// Types
export type HunterRegister = z.infer<typeof hunterRegisterSchema>
export type HunterLogin = z.infer<typeof hunterLoginSchema>
export type MerchantRegister = z.infer<typeof merchantRegisterSchema>
export type MerchantLogin = z.infer<typeof merchantLoginSchema>
export type MerchantCreate = z.infer<typeof merchantCreateSchema>
export type HunterUpdate = z.infer<typeof hunterUpdateSchema>

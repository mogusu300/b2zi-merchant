export interface MerchantBase {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType?: string;
  businessAddress?: string;
  status: string;
  isVerified: boolean;
}

export interface MerchantDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  fileUrl: string;
  isVerified: boolean;
  ocrConfidence?: number;
  uploadedAt: Date;
  verificationNotes?: string;
}

export interface MerchantActivityLog {
  id: string;
  action: string;
  description: string;
  performedByRole: string;
  performedByIp?: string;
  createdAt: Date;
  metadata?: any;
}

export interface MerchantOnboardingInfo {
  id: string;
  merchantId: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType?: string;
  status: string; // 'not_started', 'in_progress', 'completed', 'rejected'
  merchantStatus: string; // 'pending', 'approved', 'rejected'
  isVerified: boolean;
  onboardingStartedAt: Date;
  completedAt?: Date;
  onboardingDaysElapsed: number;
  documents: MerchantDocument[];
  activityLog: MerchantActivityLog[];
}

export interface HunterSummary {
  totalMerchants: number;
  onboarded: number;
  inProgress: number;
  notStarted: number;
  rejected: number;
}

export interface MerchantHunter {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  region?: string;
  isActive: boolean;
  targetMonthly: number;
  onboardedCount: number;
  rejectedCount: number;
}

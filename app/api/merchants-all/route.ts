import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all merchants with their activity logs - simple and direct
    const merchants = await prisma.merchants.findMany({
      include: {
        merchant_activity_logs: {
          orderBy: { createdAt: 'desc' },
        },
        merchant_onboarding_documents: true,
        merchant_logins: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('[GET ALL MERCHANTS] Found:', merchants.length);

    // Transform the data
    const transformedMerchants = merchants.map((merchant) => ({
      id: merchant.id,
      merchantId: merchant.id,
      businessName: merchant.businessName,
      ownerName: merchant.ownerName,
      email: merchant.email,
      phone: merchant.phone,
      businessType: merchant.businessType,
      businessAddress: merchant.businessAddress,
      status: merchant.status === 'approved' ? 'completed' : merchant.status === 'pending' ? 'in_progress' : 'not_started',
      merchantStatus: merchant.status,
      isVerified: merchant.isVerified,
      onboardingStartedAt: merchant.createdAt,
      completedAt: merchant.updatedAt,
      onboardingDaysElapsed: Math.floor((new Date().getTime() - merchant.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      documents: merchant.merchant_onboarding_documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        isVerified: doc.isVerified,
        uploadedAt: doc.uploadedAt,
        fileUrl: doc.fileUrl,
      })),
      activityLog: merchant.merchant_activity_logs,
      loginInfo: merchant.merchant_logins,
    }));

    const summary = {
      totalMerchants: transformedMerchants.length,
      onboarded: transformedMerchants.filter((m) => m.merchantStatus === 'approved').length,
      inProgress: transformedMerchants.filter((m) => m.merchantStatus === 'pending').length,
      notStarted: 0,
      rejected: transformedMerchants.filter((m) => m.merchantStatus === 'rejected').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      merchants: transformedMerchants,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GET ALL MERCHANTS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchants',
      },
      { status: 500 }
    );
  }
}

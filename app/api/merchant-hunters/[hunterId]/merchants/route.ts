import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hunterId: string } }
) {
  try {
    const { hunterId } = params;

    // Get all merchants onboarded by this hunter with their current status
    const hunterMerchants = await prisma.merchantHunterMerchant.findMany({
      where: { merchantHunterId: hunterId },
      include: {
        merchants: {
          include: {
            merchant_activity_logs: {
              orderBy: { createdAt: 'desc' },
            },
            merchant_onboarding_documents: true,
            merchant_logins: true,
          },
        },
        merchant_hunters: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data to a more useful format
    const merchants = hunterMerchants.map((hm) => ({
      id: hm.id,
      merchantId: hm.merchants.id,
      businessName: hm.merchants.businessName,
      ownerName: hm.merchants.ownerName,
      email: hm.merchants.email,
      phone: hm.merchants.phone,
      businessType: hm.merchants.businessType,
      businessAddress: hm.merchants.businessAddress,
      status: hm.status, // 'not_started', 'in_progress', 'completed', 'rejected'
      merchantStatus: hm.merchants.status, // 'pending', 'approved', 'rejected'
      isVerified: hm.merchants.isVerified,
      onboardingStartedAt: hm.onboardingStartedAt,
      completedAt: hm.completedAt,
      onboardingDaysElapsed: hm.onboardingDaysElapsed,
      documents: hm.merchants.merchant_onboarding_documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        isVerified: doc.isVerified,
        uploadedAt: doc.uploadedAt,
        fileUrl: doc.fileUrl,
      })),
      activityLog: hm.merchants.merchant_activity_logs,
      loginInfo: hm.merchants.merchant_logins,
    }));

    const summary = {
      totalMerchants: merchants.length,
      onboarded: merchants.filter((m) => m.status === 'completed').length,
      inProgress: merchants.filter((m) => m.status === 'in_progress').length,
      notStarted: merchants.filter((m) => m.status === 'not_started').length,
      rejected: merchants.filter((m) => m.status === 'rejected').length,
    };

    return NextResponse.json({
      success: true,
      hunterId,
      summary,
      merchants,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching hunter merchants:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchants',
      },
      { status: 500 }
    );
  }
}

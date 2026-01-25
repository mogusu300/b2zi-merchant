import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { hunterId: string; merchantId: string } }
) {
  try {
    const { hunterId, merchantId } = params;

    // Get specific merchant details for this hunter
    const hunterMerchant = await prisma.merchantHunterMerchant.findUnique({
      where: {
        merchantHunterId_merchantId: {
          merchantHunterId: hunterId,
          merchantId: merchantId,
        },
      },
      include: {
        merchants: {
          include: {
            merchant_activity_logs: {
              orderBy: { createdAt: 'desc' },
            },
            merchant_onboarding_documents: true,
            merchant_logins: true,
            products: true,
          },
        },
      },
    });

    if (!hunterMerchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found for this hunter' },
        { status: 404 }
      );
    }

    const merchant = hunterMerchant.merchants;
    const hm = hunterMerchant;

    const detailedMerchant = {
      id: merchant.id,
      businessName: merchant.businessName,
      ownerName: merchant.ownerName,
      email: merchant.email,
      phone: merchant.phone,
      businessType: merchant.businessType,
      businessAddress: merchant.businessAddress,
      idType: merchant.idType,
      idFrontUrl: merchant.idFrontUrl,
      idBackUrl: merchant.idBackUrl,
      status: hm.status,
      merchantStatus: merchant.status,
      isVerified: merchant.isVerified,
      lastLogin: merchant.lastLogin,
      loginAttempts: merchant.loginAttempts,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
      onboardingInfo: {
        startedAt: hm.onboardingStartedAt,
        completedAt: hm.completedAt,
        daysElapsed: hm.onboardingDaysElapsed,
      },
      documents: merchant.merchant_onboarding_documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        fileUrl: doc.fileUrl,
        isVerified: doc.isVerified,
        ocrConfidence: doc.ocrConfidence,
        uploadedAt: doc.uploadedAt,
        verificationNotes: doc.verificationNotes,
      })),
      activityLog: merchant.merchant_activity_logs,
      products: merchant.products,
      loginInfo: merchant.merchant_logins,
    };

    return NextResponse.json({
      success: true,
      data: detailedMerchant,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching merchant details:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchant details',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { hunterId: string; merchantId: string } }
) {
  try {
    const { hunterId, merchantId } = params;
    const body = await request.json();

    // Update merchant onboarding status
    const hunterMerchant = await prisma.merchantHunterMerchant.update({
      where: {
        merchantHunterId_merchantId: {
          merchantHunterId: hunterId,
          merchantId: merchantId,
        },
      },
      data: {
        status: body.status, // 'not_started', 'in_progress', 'completed', 'rejected'
        completedAt: body.status === 'completed' ? new Date() : undefined,
      },
    });

    // Update merchant status if provided
    if (body.merchantStatus) {
      await prisma.merchants.update({
        where: { id: merchantId },
        data: {
          status: body.merchantStatus, // 'pending', 'approved', 'rejected'
          isVerified: body.merchantStatus === 'approved',
        },
      });
    }

    // Log the activity with detailed info
    const activityLog = await prisma.merchantActivityLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId,
        merchantHunterId: hunterId,
        action: 'STATUS_UPDATE',
        description: `Status updated from ${hunterMerchant.status} to ${body.status}. Merchant: ${body.merchantStatus || 'unchanged'}`,
        performedByRole: 'MERCHANT_HUNTER',
        performedByIp: request.headers.get('x-forwarded-for') || 'unknown',
        performedByUserAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          previousOnboardingStatus: hunterMerchant.status,
          newOnboardingStatus: body.status,
          merchantStatus: body.merchantStatus,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Fetch updated merchant with ALL activity logs to return fresh data
    const updatedMerchant = await prisma.merchantHunterMerchant.findUnique({
      where: {
        merchantHunterId_merchantId: {
          merchantHunterId: hunterId,
          merchantId: merchantId,
        },
      },
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
      },
    });

    const merchant = updatedMerchant?.merchants;
    const hm = updatedMerchant;

    const detailedMerchant = {
      id: merchant?.id,
      businessName: merchant?.businessName,
      ownerName: merchant?.ownerName,
      email: merchant?.email,
      phone: merchant?.phone,
      businessType: merchant?.businessType,
      businessAddress: merchant?.businessAddress,
      idType: merchant?.idType,
      idFrontUrl: merchant?.idFrontUrl,
      idBackUrl: merchant?.idBackUrl,
      status: hm?.status,
      merchantStatus: merchant?.status,
      isVerified: merchant?.isVerified,
      lastLogin: merchant?.lastLogin,
      loginAttempts: merchant?.loginAttempts,
      createdAt: merchant?.createdAt,
      updatedAt: merchant?.updatedAt,
      onboardingInfo: {
        startedAt: hm?.onboardingStartedAt,
        completedAt: hm?.completedAt,
        daysElapsed: hm?.onboardingDaysElapsed,
      },
      documents: merchant?.merchant_onboarding_documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        fileUrl: doc.fileUrl,
        isVerified: doc.isVerified,
        ocrConfidence: doc.ocrConfidence,
        uploadedAt: doc.uploadedAt,
        verificationNotes: doc.verificationNotes,
      })),
      activityLog: merchant?.merchant_activity_logs,
      products: merchant?.products,
      loginInfo: merchant?.merchant_logins,
    };

    return NextResponse.json({
      success: true,
      message: 'Merchant status updated successfully',
      data: detailedMerchant,
      activityLog,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update merchant',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const merchantOnboardingDocuments = await prisma.merchantOnboardingDocument.findMany({
      include: {
        merchants: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'merchant_onboarding_documents',
      count: merchantOnboardingDocuments.length,
      data: merchantOnboardingDocuments,
    });
  } catch (error) {
    console.error('Error fetching merchant onboarding documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchant onboarding documents',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const document = await prisma.merchantOnboardingDocument.create({
      data: {
        id: body.id || `doc_${Date.now()}`,
        merchantId: body.merchantId,
        documentType: body.documentType,
        fileName: body.fileName,
        fileSize: body.fileSize,
        mimeType: body.mimeType,
        fileUrl: body.fileUrl,
        uploadedByHunterId: body.uploadedByHunterId,
        extractedData: body.extractedData,
        ocrConfidence: body.ocrConfidence,
        isVerified: body.isVerified || false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Document created',
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document',
      },
      { status: 500 }
    );
  }
}

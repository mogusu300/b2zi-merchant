import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const hunterId = searchParams.get('hunterId');

    let where: any = { merchantId };
    if (hunterId) {
      where.merchantHunterId = hunterId;
    }

    const logs = await prisma.merchantActivityLog.findMany({
      where,
      include: {
        merchants: {
          select: { businessName: true, email: true },
        },
        merchant_hunters: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      merchantId,
      count: logs.length,
      data: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch activity logs',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params;
    const body = await request.json();

    const log = await prisma.merchantActivityLog.create({
      data: {
        id: `log_${Date.now()}`,
        merchantId,
        merchantHunterId: body.merchantHunterId,
        action: body.action,
        description: body.description,
        performedByRole: body.performedByRole || 'MERCHANT_HUNTER',
        performedByIp: body.ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
        performedByUserAgent: body.userAgent || request.headers.get('user-agent') || 'unknown',
        metadata: body.metadata,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Activity logged',
        data: log,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create activity log',
      },
      { status: 500 }
    );
  }
}

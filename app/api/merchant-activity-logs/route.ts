import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const merchantActivityLogs = await prisma.merchantActivityLog.findMany({
      include: {
        merchants: true,
        merchant_hunters: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'merchant_activity_logs',
      count: merchantActivityLogs.length,
      data: merchantActivityLogs,
    });
  } catch (error) {
    console.error('Error fetching merchant activity logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchant activity logs',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const log = await prisma.merchantActivityLog.create({
      data: {
        id: body.id || `log_${Date.now()}`,
        merchantId: body.merchantId,
        merchantHunterId: body.merchantHunterId,
        action: body.action,
        description: body.description,
        performedByRole: body.performedByRole,
        performedByIp: body.performedByIp,
        performedByUserAgent: body.performedByUserAgent,
        metadata: body.metadata,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Activity log created',
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

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { merchantId: string } }
) {
  try {
    const { merchantId } = params;

    // Get all activity logs for this merchant - simple and direct
    const logs = await prisma.merchantActivityLog.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      merchantId,
      logs,
      totalLogs: logs.length,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch logs',
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

    // Create activity log
    const log = await prisma.merchantActivityLog.create({
      data: {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchantId,
        action: body.action || 'ACTIVITY',
        description: body.description || 'No description provided',
        performedByRole: body.performedByRole || 'USER',
        performedByIp: request.headers.get('x-forwarded-for') || 'unknown',
        performedByUserAgent: request.headers.get('user-agent') || 'unknown',
        metadata: body.metadata || {},
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create log',
      },
      { status: 500 }
    );
  }
}

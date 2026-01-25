import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const merchantHunters = await prisma.merchantHunter.findMany({
      include: {
        merchant_hunter_merchants: true,
        agent_performance_metrics: true,
        agent_targets: true,
        merchant_activity_logs: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'merchant_hunters',
      count: merchantHunters.length,
      data: merchantHunters,
    });
  } catch (error) {
    console.error('Error fetching merchant hunters:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchant hunters',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const hunter = await prisma.merchantHunter.create({
      data: {
        id: body.id || `hunter_${Date.now()}`,
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        password: body.password,
        region: body.region,
        managerId: body.managerId,
        isActive: body.isActive || true,
        targetMonthly: body.targetMonthly || 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Merchant hunter created',
        data: hunter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating merchant hunter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create merchant hunter',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const agentPerformanceMetrics = await prisma.agentPerformanceMetric.findMany({
      include: {
        merchant_hunters: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'agent_performance_metrics',
      count: agentPerformanceMetrics.length,
      data: agentPerformanceMetrics,
    });
  } catch (error) {
    console.error('Error fetching agent performance metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agent performance metrics',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const metric = await prisma.agentPerformanceMetric.create({
      data: {
        id: body.id || `metric_${Date.now()}`,
        merchantHunterId: body.merchantHunterId,
        year: body.year,
        month: body.month,
        totalOnboarded: body.totalOnboarded || 0,
        totalPending: body.totalPending || 0,
        totalRejected: body.totalRejected || 0,
        conversionRate: body.conversionRate || 0,
        averageOnboardingDays: body.averageOnboardingDays || 0,
        isCalculated: body.isCalculated || false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Performance metric created',
        data: metric,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating performance metric:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create performance metric',
      },
      { status: 500 }
    );
  }
}

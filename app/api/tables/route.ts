import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all table data
    const [
      merchantHunters,
      merchantHunterMerchants,
      merchantOnboardingDocuments,
      merchantActivityLogs,
      agentTargets,
      agentPerformanceMetrics,
      merchantLogins,
      adminUsers,
      customers,
      merchants,
      orders,
      products,
      refreshTokens,
      sessions,
    ] = await Promise.all([
      prisma.merchantHunter.findMany(),
      prisma.merchantHunterMerchant.findMany(),
      prisma.merchantOnboardingDocument.findMany(),
      prisma.merchantActivityLog.findMany(),
      prisma.agentTarget.findMany(),
      prisma.agentPerformanceMetric.findMany(),
      prisma.merchantLogin.findMany(),
      prisma.admin_users.findMany(),
      prisma.customers.findMany(),
      prisma.merchants.findMany(),
      prisma.orders.findMany(),
      prisma.products.findMany(),
      prisma.refresh_tokens.findMany(),
      prisma.sessions.findMany(),
    ]);

    // Create summary
    const tables = [
      {
        name: 'merchant_hunters',
        count: merchantHunters.length,
        data: merchantHunters,
      },
      {
        name: 'merchant_hunter_merchants',
        count: merchantHunterMerchants.length,
        data: merchantHunterMerchants,
      },
      {
        name: 'merchant_onboarding_documents',
        count: merchantOnboardingDocuments.length,
        data: merchantOnboardingDocuments,
      },
      {
        name: 'merchant_activity_logs',
        count: merchantActivityLogs.length,
        data: merchantActivityLogs,
      },
      {
        name: 'agent_targets',
        count: agentTargets.length,
        data: agentTargets,
      },
      {
        name: 'agent_performance_metrics',
        count: agentPerformanceMetrics.length,
        data: agentPerformanceMetrics,
      },
      {
        name: 'merchant_logins',
        count: merchantLogins.length,
        data: merchantLogins,
      },
      {
        name: 'admin_users',
        count: adminUsers.length,
        data: adminUsers,
      },
      {
        name: 'customers',
        count: customers.length,
        data: customers,
      },
      {
        name: 'merchants',
        count: merchants.length,
        data: merchants,
      },
      {
        name: 'orders',
        count: orders.length,
        data: orders,
      },
      {
        name: 'products',
        count: products.length,
        data: products,
      },
      {
        name: 'refresh_tokens',
        count: refreshTokens.length,
        data: refreshTokens,
      },
      {
        name: 'sessions',
        count: sessions.length,
        data: sessions,
      },
    ];

    const totalRecords = tables.reduce((sum, table) => sum + table.count, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalTables: tables.length,
        totalRecords,
      },
      tables,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tables',
      },
      { status: 500 }
    );
  }
}

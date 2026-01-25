import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessions = await prisma.sessions.findMany({
      include: {
        customers: true,
        merchants: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'sessions',
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sessions',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const session = await prisma.sessions.create({
      data: {
        id: body.id || `session_${Date.now()}`,
        token: body.token,
        type: body.type,
        userId: body.userId,
        merchantId: body.merchantId,
        customerId: body.customerId,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        expiresAt: new Date(body.expiresAt),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Session created',
        data: session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      },
      { status: 500 }
    );
  }
}

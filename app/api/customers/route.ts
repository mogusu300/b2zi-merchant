import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customers.findMany({
      include: {
        orders: true,
        sessions: true,
      },
    });

    return NextResponse.json({
      success: true,
      table: 'customers',
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customer = await prisma.customers.create({
      data: {
        id: body.id || `customer_${Date.now()}`,
        email: body.email,
        name: body.name,
        password: body.password,
        phone: body.phone,
        isVerified: body.isVerified || false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Customer created',
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const adminUsers = await prisma.admin_users.findMany();

    return NextResponse.json({
      success: true,
      table: 'admin_users',
      count: adminUsers.length,
      data: adminUsers,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch admin users',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const admin = await prisma.admin_users.create({
      data: {
        id: body.id || `admin_${Date.now()}`,
        email: body.email,
        password: body.password,
        name: body.name,
        role: body.role || 'ADMIN',
        isActive: body.isActive || true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created',
        data: admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create admin user',
      },
      { status: 500 }
    );
  }
}

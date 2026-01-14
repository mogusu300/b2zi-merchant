import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { OrderTransitionValidator, formatValidationErrors, logValidationErrors } from "@/lib/order-transition-validator";
import { OrderStatus } from "@/lib/order-status";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token and extract merchant ID
    let merchantId: string;
    try {
      const payload = verifyToken(token);
      if (payload.type !== "merchant") {
        return NextResponse.json(
          { success: false, error: "Only merchants can reject orders" },
          { status: 403 }
        );
      }
      merchantId = payload.id;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reason } = body;

    // Fetch order with items and products
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { sellerId: true },
            },
          },
        },
        customer: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate state transition with comprehensive checks
    const validation = OrderTransitionValidator.validateReject(order, merchantId, reason);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "PUT /reject");
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedReason: reason.trim(),
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Create audit event
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "rejected",
        actorId: merchantId,
        actorType: "merchant",
        oldStatus: order.status,
        newStatus: OrderStatus.REJECTED,
        message: `Order rejected: ${reason.trim()}`,
      },
    });

    // TODO: Send notification to customer
    console.log(
      `[Order Rejection] Order ${orderId} rejected by merchant ${merchantId}`
    );
    console.log(
      `[Notification] Send to customer ${order.customer?.email}: Order rejected: ${reason}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        rejectedAt: updatedOrder.rejectedAt,
        rejectedReason: updatedOrder.rejectedReason,
        items: updatedOrder.items,
      },
    });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/reject] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
          { success: false, error: "Only merchants can approve orders" },
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
    const validation = OrderTransitionValidator.validateApprove(order, merchantId);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "PUT /approve");
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // Update order to READY_FOR_DISPATCH
    // (Payment is already authorized at checkout, no need to wait)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.READY_FOR_DISPATCH,
        approvedAt: new Date(),
        approvedBy: merchantId,
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sellerId: true },
            },
          },
        },
      },
    });

    // Create audit event
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "approved",
        actorId: merchantId,
        actorType: "merchant",
        oldStatus: order.status,
        newStatus: OrderStatus.READY_FOR_DISPATCH,
        message: "Order approved by merchant. Ready for dispatch. (Payment authorized at checkout)",
      },
    });

    // Log state transition
    console.log(`[STATE TRANSITION] Order ${orderId}: ${order.status} → ${OrderStatus.READY_FOR_DISPATCH}`);
    console.log(`[Order Approval] Order ${orderId} approved by merchant ${merchantId}`);
    console.log(`[Notification] Send to merchant ${merchantId}: Order approved and ready to dispatch!`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        approvedAt: updatedOrder.approvedAt,
        approvedBy: updatedOrder.approvedBy,
        items: updatedOrder.items,
      },
    });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/approve] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { OrderTransitionValidator, formatValidationErrors, logValidationErrors } from "@/lib/order-transition-validator";
import { OrderStatus, TRACKING_STATUS_VALUES } from "@/lib/order-status";

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
          { success: false, error: "Only merchants can update tracking" },
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
    const { trackingStatus, trackingMessage, driverName, driverPhone } = body;

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

    // Verify merchant owns at least one product in this order
    const merchantOwnsProduct = order.items.some(
      (item) => item.product.sellerId === merchantId
    );

    if (!merchantOwnsProduct) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to update tracking for this order",
        },
        { status: 403 }
      );
    }

    // Determine target status based on trackingStatus value
    let targetStatus = OrderStatus.IN_TRANSIT;
    if (trackingStatus === "delivered") {
      targetStatus = OrderStatus.DELIVERED;
    }

    // Comprehensive validation using OrderTransitionValidator
    const validation = OrderTransitionValidator.validateInTransit(order, merchantId);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "PUT /update-tracking");
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // Update order
    const updateData: any = {
      trackingStatus: trackingStatus,
      trackingMessage: trackingMessage.trim(),
      trackedAt: new Date(),
    };

    // Add optional driver info if provided
    if (driverName) {
      updateData.driverName = driverName;
    }
    if (driverPhone) {
      updateData.driverPhone = driverPhone;
    }

    // Update status if transitioning to delivered
    if (trackingStatus === "delivered") {
      updateData.status = OrderStatus.DELIVERED;
    } else if (order.status === OrderStatus.DISPATCHED && trackingStatus === "in_transit") {
      updateData.status = OrderStatus.IN_TRANSIT;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
        eventType: "tracking_updated",
        actorId: merchantId,
        actorType: "merchant",
        oldStatus: order.status,
        newStatus: updatedOrder.status,
        message: trackingMessage.trim(),
        metadata: {
          trackingStatus,
          driverName: driverName || null,
          driverPhone: driverPhone || null,
        },
      },
    });

    // TODO: Send notification to customer
    console.log(
      `[Order Tracking Update] Order ${orderId} tracking updated by merchant ${merchantId}`
    );
    console.log(
      `[Notification] Send to customer ${order.customer?.email}: ${trackingMessage}`
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        trackingStatus: updatedOrder.trackingStatus,
        trackingMessage: updatedOrder.trackingMessage,
        driverName: updatedOrder.driverName,
        driverPhone: updatedOrder.driverPhone,
        trackedAt: updatedOrder.trackedAt,
        items: updatedOrder.items,
      },
    });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/update-tracking] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

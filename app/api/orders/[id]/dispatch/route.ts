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
          { success: false, error: "Only merchants can dispatch orders" },
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
    const { trackingNumber, estimatedDelivery } = body;

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
          error: "You are not authorized to dispatch this order",
        },
        { status: 403 }
      );
    }

    // Comprehensive validation using OrderTransitionValidator
    const validation = OrderTransitionValidator.validateDispatch(order, merchantId);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "PUT /dispatch");
      console.log(`[STATE TRANSITION BLOCKED] Order ${orderId}: Cannot dispatch from status "${order.status}"`);
      console.log(`[VALIDATION ERRORS] ${validation.errors.join("; ")}`);
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DISPATCHED,
        dispatchedAt: new Date(),
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery || undefined,
        trackingStatus: "dispatched",
        // SIMULATED PAYMENT CAPTURE
        // In production, this would call Stripe/PayPal, but for now we simulate:
        paymentStatus: "captured",
        paidAt: new Date(),
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

    // SIMULATED: Credit seller (in production, this would be a payout/settlement)
    // For now, just log the credit
    console.log(
      `[PAYMENT CAPTURED] Order ${orderId}: $${order.total} captured and credited to merchant ${merchantId}`
    );

    // Create audit event
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "dispatched",
        actorId: merchantId,
        actorType: "merchant",
        oldStatus: order.status,
        newStatus: OrderStatus.DISPATCHED,
        message: "Order dispatched. (Simulated payment captured and credited to seller)",
        metadata: {
          trackingNumber: trackingNumber || null,
          estimatedDelivery: estimatedDelivery || null,
          paymentCaptured: true,
        },
      },
    });

    // Log state transition
    console.log(`[STATE TRANSITION] Order ${orderId}: ${order.status} → ${OrderStatus.DISPATCHED}`);
    console.log(
      `[Order Dispatch] Order ${orderId} dispatched by merchant ${merchantId}`
    );
    if (trackingNumber) {
      console.log(
        `[Notification] Send to customer ${order.customer?.email}: Your order is on its way! Tracking: ${trackingNumber}`
      );
    } else {
      console.log(
        `[Notification] Send to customer ${order.customer?.email}: Your order has been dispatched!`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        dispatchedAt: updatedOrder.dispatchedAt,
        trackingNumber: updatedOrder.trackingNumber,
        trackingStatus: updatedOrder.trackingStatus,
        items: updatedOrder.items,
      },
    });
  } catch (error) {
    console.error("[PUT /api/orders/[id]/dispatch] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

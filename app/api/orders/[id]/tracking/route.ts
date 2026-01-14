import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { formatValidationErrors, logValidationErrors } from "@/lib/order-transition-validator";

export async function GET(
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

    // Verify token and extract customer ID or merchant ID
    let userId: string;
    let userType: string;
    try {
      const payload = verifyToken(token);
      if (payload.type !== "customer" && payload.type !== "merchant") {
        return NextResponse.json(
          { success: false, error: "Invalid user type" },
          { status: 403 }
        );
      }
      userId = payload.id;
      userType = payload.type;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sellerId: true,
              },
            },
          },
        },
        orderEvents: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!order) {
      const errors = ["Order not found"];
      logValidationErrors(orderId, errors, "GET /tracking");
      return NextResponse.json(
        { success: false, error: formatValidationErrors(errors) },
        { status: 404 }
      );
    }

    // Verify access: customer can view their own orders, merchants can view orders containing their products
    if (userType === "customer") {
      if (order.customerId !== userId) {
        const errors = ["You are not authorized to view this order"];
        logValidationErrors(orderId, errors, "GET /tracking");
        return NextResponse.json(
          { success: false, error: formatValidationErrors(errors) },
          { status: 403 }
        );
      }
    } else if (userType === "merchant") {
      // Check if merchant sells any items in this order
      const hasMerchantItems = order.items.some((item) => item.product.sellerId === userId);
      if (!hasMerchantItems) {
        const errors = ["You are not authorized to view this order"];
        logValidationErrors(orderId, errors, "GET /tracking");
        return NextResponse.json(
          { success: false, error: formatValidationErrors(errors) },
          { status: 403 }
        );
      }
    }

    // Get merchant names for items
    const merchantIds = [
      ...new Set(order.items.map((item) => item.product.sellerId)),
    ];
    const merchants = await prisma.merchant.findMany({
      where: {
        id: { in: merchantIds },
      },
      select: {
        id: true,
        businessName: true,
      },
    });

    const merchantMap = Object.fromEntries(
      merchants.map((m) => [m.id, m.businessName])
    );

    // Transform items with merchant names
    const items = order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      sellerName: merchantMap[item.product.sellerId] || "Unknown Seller",
      quantity: item.quantity,
      price: item.price,
      variantData: item.variantData,
    }));

    // Transform events into timeline
    const timeline = order.orderEvents.map((event) => ({
      timestamp: event.createdAt,
      eventType: event.eventType,
      status: event.newStatus,
      message:
        event.message ||
        `Order ${event.eventType === "tracking_updated" ? "tracking updated" : event.eventType}`,
      actor: event.actorType,
    }));

    // Build response
    const response = {
      id: order.id,
      status: order.status,
      customerId: order.customerId,

      // ITEMS
      items,
      total: order.total,

      // TRACKING INFO
      trackingStatus: order.trackingStatus,
      trackingMessage: order.trackingMessage,
      trackingNumber: order.trackingNumber,
      driverName: order.driverName,
      driverPhone: order.driverPhone,
      estimatedDelivery: order.estimatedDelivery,
      dispatchedAt: order.dispatchedAt,
      trackedAt: order.trackedAt,

      // DELIVERY INFO
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryZipCode: order.deliveryZipCode,

      // PAYMENT INFO
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,

      // APPROVAL INFO
      approvedAt: order.approvedAt,
      approvedBy: order.approvedBy,
      rejectedAt: order.rejectedAt,
      rejectedReason: order.rejectedReason,

      // TIMELINE
      timeline,

      // TIMESTAMPS
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("[GET /api/orders/[id]/tracking] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

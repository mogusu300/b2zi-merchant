import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";
import { OrderTransitionValidator, formatValidationErrors, logValidationErrors } from "@/lib/order-transition-validator";
import { OrderStatus, PaymentStatus } from "@/lib/order-status";

const VALID_PAYMENT_METHODS = ["card", "bank_transfer", "cash_on_delivery"];

export async function POST(
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

    // Verify token and extract customer ID
    let customerId: string;
    try {
      const payload = verifyToken(token);
      if (payload.type !== "customer") {
        return NextResponse.json(
          { success: false, error: "Only customers can pay for orders" },
          { status: 403 }
        );
      }
      customerId = payload.id;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { paymentMethod, stripePaymentMethodId, bankName, accountNumber } =
      body;

    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sellerId: true },
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

    // Verify customer owns the order
    if (order.customerId !== customerId) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to pay for this order" },
        { status: 403 }
      );
    }

    // Comprehensive validation using OrderTransitionValidator
    const validation = OrderTransitionValidator.validatePay(order, customerId, paymentMethod);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "POST /pay");
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // Auto-transition from approved to awaiting_payment if needed
    let currentStatus = order.status;
    if (currentStatus === OrderStatus.APPROVED) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.AWAITING_PAYMENT },
      });
      currentStatus = OrderStatus.AWAITING_PAYMENT;
    }

    // TODO: Integrate with Stripe or payment provider
    let paymentStatus = PaymentStatus.PAID;
    let stripePaymentIntentId: string | null = null;
    let transactionId: string | null = null;

    // For now, all payments succeed (mock implementation)
    // In production, this would call Stripe API
    if (paymentMethod === "card") {
      // TODO: Call Stripe API
      // const result = await stripe.paymentIntents.create({...})
      // if (result.status !== "succeeded") {
      //   paymentStatus = PaymentStatus.FAILED;
      // }
      stripePaymentMethodId && (transactionId = stripePaymentMethodId);
      console.log(
        `[Payment] Processing card payment with method ID: ${stripePaymentMethodId}`
      );
    } else if (paymentMethod === "bank_transfer") {
      console.log(
        `[Payment] Bank transfer payment initiated: ${bankName} - ${accountNumber}`
      );
      // TODO: Generate bank transfer request with reference number
      transactionId = `BANK_${Date.now()}`;
    } else if (paymentMethod === "cash_on_delivery") {
      console.log(`[Payment] Cash on delivery payment - payment to be collected at delivery`);
      transactionId = `COD_${Date.now()}`;
    }

    // Create order payment record
    const orderPayment = await prisma.orderPayment.create({
      data: {
        orderId,
        amount: order.total,
        currency: "ZWL",
        method: paymentMethod,
        status: "completed",
        stripePaymentIntentId: stripePaymentIntentId || undefined,
        transactionId: transactionId || undefined,
        completedAt: new Date(),
      },
    });

    // Update order status to paid_pending_dispatch
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID_PENDING_DISPATCH,
        paidAt: new Date(),
        paymentStatus: "paid",
        paymentMethod: paymentMethod,
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
        eventType: "paid",
        actorId: customerId,
        actorType: "customer",
        oldStatus: currentStatus,
        newStatus: OrderStatus.PAID_PENDING_DISPATCH,
        message: `Payment received via ${paymentMethod}. Ready for dispatch.`,
        metadata: {
          method: paymentMethod,
          amount: order.total,
          transactionId: transactionId,
        },
      },
    });

    // Log state transition
    console.log(`[STATE TRANSITION] Order ${orderId}: ${currentStatus} → ${OrderStatus.PAID_PENDING_DISPATCH}`);
    // TODO: Send notifications
    // Notify customer: Payment successful
    console.log(
      `[Payment Success] Order ${orderId} paid by customer ${customerId}`
    );
    console.log(
      `[Notification] Send to customer ${order.customer?.email}: Payment successful!`
    );

    // Notify merchants: Payment received, ready to dispatch
    const merchantIds = [
      ...new Set(order.items.map((item) => item.product.sellerId)),
    ];
    for (const merchantId of merchantIds) {
      console.log(
        `[Notification] Send to merchant ${merchantId}: Payment received for Order ${orderId}. Please dispatch.`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paidAt: updatedOrder.paidAt,
        paymentStatus: updatedOrder.paymentStatus,
        paymentMethod: updatedOrder.paymentMethod,
        transactionId: orderPayment.transactionId,
        items: updatedOrder.items,
      },
    });
  } catch (error) {
    console.error("[POST /api/orders/[id]/pay] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

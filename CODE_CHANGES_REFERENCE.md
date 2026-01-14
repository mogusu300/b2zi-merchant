# CODE CHANGES REFERENCE - Order Flow Deadlock Fix

This document lists every code change made to fix the order status deadlock.

---

## 1. lib/order-status.ts

### Change 1a: Updated OrderStatus Enum
```diff
export enum OrderStatus {
  PENDING = "pending",
  APPROVED = "approved",
  AWAITING_PAYMENT = "awaiting_payment",
- PAID = "paid",
+ PAID_PENDING_DISPATCH = "paid_pending_dispatch",
  DISPATCHED = "dispatched",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}
```

### Change 1b: Updated ORDER_STATUS_LABELS
```diff
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending Approval",
  [OrderStatus.APPROVED]: "Approved",
  [OrderStatus.AWAITING_PAYMENT]: "Awaiting Payment",
- [OrderStatus.PAID]: "Paid",
+ [OrderStatus.PAID_PENDING_DISPATCH]: "Paid - Awaiting Dispatch",
  [OrderStatus.DISPATCHED]: "Dispatched",
  [OrderStatus.IN_TRANSIT]: "In Transit",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.REJECTED]: "Rejected",
  [OrderStatus.CANCELLED]: "Cancelled",
};
```

### Change 1c: Updated ORDER_STATUS_COLORS
```diff
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "yellow",
  [OrderStatus.APPROVED]: "blue",
  [OrderStatus.AWAITING_PAYMENT]: "orange",
- [OrderStatus.PAID]: "green",
+ [OrderStatus.PAID_PENDING_DISPATCH]: "green",
  [OrderStatus.DISPATCHED]: "cyan",
  [OrderStatus.IN_TRANSIT]: "blue",
  [OrderStatus.DELIVERED]: "green",
  [OrderStatus.REJECTED]: "red",
  [OrderStatus.CANCELLED]: "gray",
};
```

---

## 2. lib/order-state-machine.ts

### Change 2a: Updated AWAITING_PAYMENT Transitions
```diff
  // FROM AWAITING_PAYMENT
  {
    from: OrderStatus.AWAITING_PAYMENT,
-   to: OrderStatus.PAID,
+   to: OrderStatus.PAID_PENDING_DISPATCH,
    allowedRoles: ["customer", "system"],
    validator: (order) => order.paymentStatus === "paid",
    description: "Customer pays for the order",
  },

  // FROM PAID
  {
-   from: OrderStatus.PAID,
+   from: OrderStatus.PAID_PENDING_DISPATCH,
    to: OrderStatus.DISPATCHED,
    allowedRoles: ["merchant"],
-   validator: (order) => order.paymentStatus === "paid",
+   validator: (order) => order.paymentStatus === "paid" && order.paidAt,
    description: "Merchant dispatches the order",
  },
```

---

## 3. lib/order-transition-validator.ts

### Change 3a: Updated validateDispatch()
```diff
  static validateDispatch(
    order: any,
    merchantId: string
  ): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - order must be paid and pending dispatch
-   if (order.status !== OrderStatus.PAID) {
+   if (order.status !== OrderStatus.PAID_PENDING_DISPATCH) {
      errors.push(
-       `Order must be in paid status, currently: ${order.status}`
+       `Order must be in paid_pending_dispatch status, currently: ${order.status}`
      );
    }

    // ... rest of validation
  }
```

### Change 3b: Updated validateCancel()
```diff
  static validateCancel(order: any, customerId: string): ValidationResult {
    // ... validation code
    
    // Check status - only pending or awaiting_payment can be cancelled
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.AWAITING_PAYMENT
    ) {
      errors.push(
-       `Order cannot be cancelled from ${order.status} status. Only pending_approval or awaiting_payment orders can be cancelled.`
+       `Order cannot be cancelled from ${order.status} status. Only pending or awaiting_payment orders can be cancelled.`
      );
    }

    // ... rest of validation
  }
```

### Change 3c: Updated validateTransition() routing
```diff
    // Route to specific validation based on transition
    if (fromStatus === OrderStatus.PENDING) {
      if (toStatus === OrderStatus.APPROVED) {
        return this.validateApprove(order, userId);
      } else if (toStatus === OrderStatus.REJECTED) {
        return this.validateReject(order, userId, additionalData?.reason);
      } else if (toStatus === OrderStatus.CANCELLED) {
        return this.validateCancel(order, userId);
      }
    }

    if (
      fromStatus === OrderStatus.APPROVED ||
      fromStatus === OrderStatus.AWAITING_PAYMENT
    ) {
      if (toStatus === OrderStatus.AWAITING_PAYMENT) {
        return this.validateAwaitingPayment(order);
-     } else if (toStatus === OrderStatus.PAID) {
+     } else if (toStatus === OrderStatus.PAID_PENDING_DISPATCH) {
        return this.validatePay(order, userId, additionalData?.paymentMethod);
      }
    }

-   if (fromStatus === OrderStatus.PAID) {
+   if (fromStatus === OrderStatus.PAID_PENDING_DISPATCH) {
      if (toStatus === OrderStatus.DISPATCHED) {
        return this.validateDispatch(order, userId);
      }
    }
```

### Change 3d: Updated getPreConditions()
```diff
  static getPreConditions(targetStatus: string): string[] {
    const preConditions: Record<string, string[]> = {
      [OrderStatus.APPROVED]: [
        "Order must be in pending status",
        "Order must contain at least one item",
        "You must own at least one product in the order",
      ],
      [OrderStatus.REJECTED]: [
        "Order must be in pending status",
        "Rejection reason is required (max 500 characters)",
        "You must own at least one product in the order",
      ],
      [OrderStatus.AWAITING_PAYMENT]: [
        "Order must be in approved status",
        "Order must have been approved by a merchant",
      ],
-     [OrderStatus.PAID]: [
+     [OrderStatus.PAID_PENDING_DISPATCH]: [
        "Order must be in awaiting_payment status",
        "Valid payment method required",
        "You must be the customer who created the order",
      ],
      [OrderStatus.DISPATCHED]: [
-       "Order must be in paid status",
+       "Order must be in paid_pending_dispatch status",
        "Payment must have been received",
        "You must own at least one product in the order",
      ],
```

---

## 4. app/api/orders/[id]/approve/route.ts

### Change 4: Update order status and add logging

**Key Change:**
```diff
    // Update order to APPROVED first, then auto-transition to AWAITING_PAYMENT
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
-       status: OrderStatus.APPROVED,
+       status: OrderStatus.AWAITING_PAYMENT,
        approvedAt: new Date(),
        approvedBy: merchantId,
      },
      // ... include options
    });

    // Create audit events for both status changes
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "approved",
        actorId: merchantId,
        actorType: "merchant",
        oldStatus: order.status,
-       newStatus: OrderStatus.APPROVED,
-       message: "Order approved by merchant",
+       newStatus: OrderStatus.AWAITING_PAYMENT,
+       message: "Order approved by merchant. Awaiting payment.",
      },
    });

    // Log state transition
+   console.log(`[STATE TRANSITION] Order ${orderId}: ${order.status} → ${OrderStatus.AWAITING_PAYMENT}`);
    console.log(`[Order Approval] Order ${orderId} approved by merchant ${merchantId}`);
    console.log(`[Notification] Send to customer ${order.customer?.email}: Order approved! Proceed to payment.`);
```

---

## 5. app/api/orders/[id]/pay/route.ts

### Change 5: Update payment status transition and add logging

**Key Change:**
```diff
    // Update order status to paid_pending_dispatch
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
-       status: OrderStatus.PAID,
+       status: OrderStatus.PAID_PENDING_DISPATCH,
        paidAt: new Date(),
        paymentStatus: "paid",
        paymentMethod: paymentMethod,
      },
      // ... include options
    });

    // Create audit event
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: "paid",
        actorId: customerId,
        actorType: "customer",
        oldStatus: currentStatus,
-       newStatus: OrderStatus.PAID,
-       message: `Payment received via ${paymentMethod}`,
+       newStatus: OrderStatus.PAID_PENDING_DISPATCH,
+       message: `Payment received via ${paymentMethod}. Ready for dispatch.`,
        metadata: {
          method: paymentMethod,
          amount: order.total,
          transactionId: transactionId,
        },
      },
    });

    // Log state transition
+   console.log(`[STATE TRANSITION] Order ${orderId}: ${currentStatus} → ${OrderStatus.PAID_PENDING_DISPATCH}`);
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
```

---

## 6. app/api/orders/[id]/dispatch/route.ts

### Change 6: Add state transition logging to dispatch validation

**Key Change:**
```diff
    // Comprehensive validation using OrderTransitionValidator
    const validation = OrderTransitionValidator.validateDispatch(order, merchantId);
    if (!validation.valid) {
      logValidationErrors(orderId, validation.errors, "PUT /dispatch");
+     console.log(`[STATE TRANSITION BLOCKED] Order ${orderId}: Cannot dispatch from status "${order.status}"`);
+     console.log(`[VALIDATION ERRORS] ${validation.errors.join("; ")}`);
      return NextResponse.json(
        { success: false, error: formatValidationErrors(validation.errors) },
        { status: 400 }
      );
    }

    // ... update order ...

    // Log state transition
+   console.log(`[STATE TRANSITION] Order ${orderId}: ${order.status} → ${OrderStatus.DISPATCHED}`);
    console.log(
      `[Order Dispatch] Order ${orderId} dispatched by merchant ${merchantId}`
    );
```

---

## 7. app/sellers/dashboard/orders/[id]/page.tsx

### Change 7: Update dispatch button availability condition

**Key Change:**
```diff
  const canApprove = order.status === "pending";
  const canReject = order.status === "pending";
- const canDispatch = order.status === "paid" || order.status === "approved";
+ const canDispatch = order.status === "paid_pending_dispatch";
  const canPay = order.status === "awaiting_payment";
```

---

## Summary of Changes

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| order-status.ts | Data | 9 | Define new status value |
| order-state-machine.ts | Logic | 6 | Update valid transitions |
| order-transition-validator.ts | Logic | 18 | Update validators for new flow |
| approve route | Logic | 12 | Auto-transition to awaiting_payment |
| pay route | Logic | 12 | Transition to paid_pending_dispatch |
| dispatch route | Logic | 3 | Add debugging logs |
| seller orders page | UI | 1 | Enable dispatch only after payment |

**Total Lines Changed:** ~61 lines across 7 files

---

## Verification

To verify these changes are in place:

```bash
# Check order-status enum
grep "PAID_PENDING_DISPATCH" lib/order-status.ts

# Check state machine
grep -A2 "PAID_PENDING_DISPATCH" lib/order-state-machine.ts

# Check validators
grep -n "paid_pending_dispatch" lib/order-transition-validator.ts

# Check API routes
grep -n "PAID_PENDING_DISPATCH\|STATE TRANSITION" app/api/orders/[id]/*.ts

# Check frontend
grep -n "paid_pending_dispatch" app/sellers/dashboard/orders/[id]/page.tsx
```

All changes should be present and consistent across files.


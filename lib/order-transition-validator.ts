/**
 * Order State Transition Validator
 * Comprehensive validation logic for all state changes
 */

import { OrderStatus } from "./order-status";

type UserRole = "customer" | "merchant" | "admin" | "system";

/**
 * Result of validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Comprehensive order validation before state transitions
 */
export class OrderTransitionValidator {
  /**
   * Validate pending → approved transition
   * Merchant approves the order
   */
  static validateApprove(order: any, merchantId: string): ValidationResult {
    const errors: string[] = [];

    // Check order exists
    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status
    if (order.status !== OrderStatus.PENDING) {
      errors.push(
        `Order must be in pending status, currently: ${order.status}`
      );
    }

    // Check order has items
    if (!order.items || order.items.length === 0) {
      errors.push("Order must contain at least one item");
    }

    // Check merchant owns at least one product
    const merchantOwnsProduct = order.items?.some(
      (item: any) => item.product?.sellerId === merchantId
    );
    if (!merchantOwnsProduct) {
      errors.push(
        "You are not authorized to approve this order (do not own any products)"
      );
    }

    // Check order hasn't already been processed
    if (order.approvedAt || order.rejectedAt) {
      errors.push("Order has already been processed");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate pending → rejected transition
   * Merchant rejects the order with reason
   */
  static validateReject(
    order: any,
    merchantId: string,
    reason: string
  ): ValidationResult {
    const errors: string[] = [];

    // Check order exists
    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status
    if (order.status !== OrderStatus.PENDING) {
      errors.push(
        `Order must be in pending status, currently: ${order.status}`
      );
    }

    // Check merchant authorization
    const merchantOwnsProduct = order.items?.some(
      (item: any) => item.product?.sellerId === merchantId
    );
    if (!merchantOwnsProduct) {
      errors.push(
        "You are not authorized to reject this order (do not own any products)"
      );
    }

    // Validate reason
    if (!reason || typeof reason !== "string") {
      errors.push("Rejection reason must be a string");
    } else if (reason.trim().length === 0) {
      errors.push("Rejection reason cannot be empty");
    } else if (reason.length > 500) {
      errors.push("Rejection reason must be 500 characters or less");
    }

    // Check order hasn't already been processed
    if (order.approvedAt || order.rejectedAt) {
      errors.push("Order has already been processed");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate approved → awaiting_payment transition
   * Auto-transition after approval (system triggered)
   */
  static validateAwaitingPayment(order: any): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    if (order.status !== OrderStatus.APPROVED) {
      errors.push(
        `Order must be in approved status, currently: ${order.status}`
      );
    }

    if (!order.approvedAt || !order.approvedBy) {
      errors.push("Order must be approved with approval timestamp and merchant ID");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate awaiting_payment → paid transition
   * Customer pays for the order
   */
  static validatePay(
    order: any,
    customerId: string,
    paymentMethod: string
  ): ValidationResult {
    const errors: string[] = [];
    const validMethods = ["card", "bank_transfer", "cash_on_delivery"];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - can be awaiting_payment or approved
    if (
      order.status !== OrderStatus.AWAITING_PAYMENT &&
      order.status !== OrderStatus.APPROVED
    ) {
      errors.push(
        `Order must be in awaiting_payment or approved status, currently: ${order.status}`
      );
    }

    // Check customer owns order
    if (order.customerId !== customerId) {
      errors.push("You do not own this order");
    }

    // Validate payment method
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      errors.push(
        `Invalid payment method. Must be one of: ${validMethods.join(", ")}`
      );
    }

    // Check order has items
    if (!order.items || order.items.length === 0) {
      errors.push("Cannot pay for order with no items");
    }

    // Check order total
    if (!order.total || order.total <= 0) {
      errors.push("Order total must be greater than zero");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate paid → dispatched transition
   * Merchant dispatches the order
   */
  static validateDispatch(
    order: any,
    merchantId: string
  ): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - order must be ready for dispatch
    // (Payment was authorized at checkout, no separate payment needed)
    if (order.status !== OrderStatus.READY_FOR_DISPATCH) {
      errors.push(
        `Order must be in ready_for_dispatch status, currently: ${order.status}`
      );
    }

    // Check payment was authorized at checkout
    if (order.paymentStatus !== "authorized") {
      errors.push(
        `Payment must be authorized at checkout before dispatch. Current payment status: ${order.paymentStatus}`
      );
    }

    // Check merchant authorization
    const merchantOwnsProduct = order.items?.some(
      (item: any) => item.product?.sellerId === merchantId
    );
    if (!merchantOwnsProduct) {
      errors.push(
        "You are not authorized to dispatch this order (do not own any products)"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate dispatched → in_transit transition
   * Merchant updates tracking: item is in transit
   */
  static validateInTransit(
    order: any,
    merchantId: string,
    trackingStatus: string,
    trackingMessage: string
  ): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - can be dispatched or in_transit
    if (
      order.status !== OrderStatus.DISPATCHED &&
      order.status !== OrderStatus.IN_TRANSIT
    ) {
      errors.push(
        `Order must be in dispatched or in_transit status, currently: ${order.status}`
      );
    }

    // Check merchant authorization
    const merchantOwnsProduct = order.items?.some(
      (item: any) => item.product?.sellerId === merchantId
    );
    if (!merchantOwnsProduct) {
      errors.push(
        "You are not authorized to update tracking for this order"
      );
    }

    // Validate tracking status
    if (trackingStatus !== "in_transit") {
      errors.push("Tracking status must be 'in_transit' for this transition");
    }

    // Validate tracking message
    if (!trackingMessage || typeof trackingMessage !== "string") {
      errors.push("Tracking message must be a non-empty string");
    } else if (trackingMessage.trim().length === 0) {
      errors.push("Tracking message cannot be empty");
    } else if (trackingMessage.length > 1000) {
      errors.push("Tracking message must be 1000 characters or less");
    }

    // Check dispatch timestamp
    if (!order.dispatchedAt) {
      errors.push("Order must have dispatch timestamp");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate in_transit → delivered transition
   * Merchant marks order as delivered
   */
  static validateDelivered(
    order: any,
    merchantId: string,
    trackingStatus: string,
    trackingMessage: string
  ): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - can be in_transit or dispatched
    if (
      order.status !== OrderStatus.IN_TRANSIT &&
      order.status !== OrderStatus.DISPATCHED
    ) {
      errors.push(
        `Order must be in in_transit or dispatched status, currently: ${order.status}`
      );
    }

    // Check merchant authorization
    const merchantOwnsProduct = order.items?.some(
      (item: any) => item.product?.sellerId === merchantId
    );
    if (!merchantOwnsProduct) {
      errors.push(
        "You are not authorized to mark this order as delivered"
      );
    }

    // Validate tracking status
    if (trackingStatus !== "delivered") {
      errors.push("Tracking status must be 'delivered' for this transition");
    }

    // Validate tracking message
    if (!trackingMessage || typeof trackingMessage !== "string") {
      errors.push("Tracking message must be a non-empty string");
    } else if (trackingMessage.trim().length === 0) {
      errors.push("Tracking message cannot be empty");
    }

    // Check dispatch timestamp
    if (!order.dispatchedAt) {
      errors.push("Order must have dispatch timestamp");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate cancellation
   * Customer can cancel pending or awaiting_payment orders
   */
  static validateCancel(order: any, customerId: string): ValidationResult {
    const errors: string[] = [];

    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    // Check status - only pending or awaiting_payment can be cancelled
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.AWAITING_PAYMENT
    ) {
      errors.push(
        `Order cannot be cancelled from ${order.status} status. Only pending or awaiting_payment orders can be cancelled.`
      );
    }

    // Check customer owns order
    if (order.customerId !== customerId) {
      errors.push("You do not own this order");
    }

    // Check order hasn't been paid
    if (order.paidAt) {
      errors.push(
        "Cannot cancel order that has already been paid. Please contact support for refund."
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate generic state transition with comprehensive checks
   */
  static validateTransition(
    order: any,
    fromStatus: string,
    toStatus: string,
    userRole: UserRole,
    userId: string,
    additionalData?: any
  ): ValidationResult {
    const errors: string[] = [];

    // Basic checks
    if (!order) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    if (order.status !== fromStatus) {
      errors.push(
        `Expected order status to be ${fromStatus}, but it is ${order.status}`
      );
    }

    // Check order has required data
    if (!order.items || order.items.length === 0) {
      errors.push("Order must have at least one item");
    }

    if (!order.total || order.total < 0) {
      errors.push("Order must have a valid total");
    }

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
      }
    }

    if (fromStatus === OrderStatus.APPROVED) {
      if (toStatus === OrderStatus.READY_FOR_DISPATCH) {
        // Payment was authorized at checkout, ready for dispatch
        return {
          valid: order.paymentStatus === "authorized",
          errors: order.paymentStatus !== "authorized" 
            ? ["Payment must be authorized at checkout"]
            : [],
        };
      }
    }

    if (fromStatus === OrderStatus.READY_FOR_DISPATCH) {
      if (toStatus === OrderStatus.DISPATCHED) {
        return this.validateDispatch(order, userId);
      }
    }

    if (
      fromStatus === OrderStatus.DISPATCHED ||
      fromStatus === OrderStatus.IN_TRANSIT
    ) {
      if (toStatus === OrderStatus.IN_TRANSIT) {
        return this.validateInTransit(
          order,
          userId,
          additionalData?.trackingStatus,
          additionalData?.trackingMessage
        );
      } else if (toStatus === OrderStatus.DELIVERED) {
        return this.validateDelivered(
          order,
          userId,
          additionalData?.trackingStatus,
          additionalData?.trackingMessage
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all pre-condition errors for a status
   * Useful for showing what must happen before a status can be reached
   */
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
      [OrderStatus.READY_FOR_DISPATCH]: [
        "Order must be in approved status",
        "Payment must be authorized at checkout",
      ],
      [OrderStatus.DISPATCHED]: [
        "Order must be in ready_for_dispatch status",
        "Payment must be authorized at checkout",
        "You must own at least one product in the order",
      ],
      [OrderStatus.IN_TRANSIT]: [
        "Order must be in dispatched or in_transit status",
        "Tracking message is required",
        "You must own at least one product in the order",
      ],
      [OrderStatus.DELIVERED]: [
        "Order must be in in_transit or dispatched status",
        "Tracking message is required",
        "Order must have been dispatched",
      ],
    };

    return preConditions[targetStatus] || [];
  }
}

/**
 * Validation error formatter for API responses
 */
export function formatValidationErrors(
  errors: string[]
): string {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];
  return errors.join(" | ");
}

/**
 * Validation error formatter for logging
 */
export function logValidationErrors(
  orderId: string,
  errors: string[],
  context: string
): void {
  console.error(
    `[Order Validation] ${context} - Order ${orderId}:`,
    errors
  );
}

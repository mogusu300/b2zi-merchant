/**
 * Order Status Enums and Constants
 * Defines all valid order statuses and related enums
 */

export enum OrderStatus {
  PENDING = "pending",
  APPROVED = "approved",
  READY_FOR_DISPATCH = "ready_for_dispatch",
  DISPATCHED = "dispatched",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum TrackingStatus {
  DISPATCHED = "dispatched",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
}

export const ORDER_STATUS_VALUES = Object.values(OrderStatus);
export const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus);
export const TRACKING_STATUS_VALUES = Object.values(TrackingStatus);

/**
 * Status display names for UI
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending Approval",
  [OrderStatus.APPROVED]: "Approved",
  [OrderStatus.READY_FOR_DISPATCH]: "Ready for Dispatch",
  [OrderStatus.DISPATCHED]: "Dispatched",
  [OrderStatus.IN_TRANSIT]: "In Transit",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.REJECTED]: "Rejected",
  [OrderStatus.CANCELLED]: "Cancelled",
};

/**
 * Status colors for UI badges
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "yellow",
  [OrderStatus.APPROVED]: "blue",
  [OrderStatus.READY_FOR_DISPATCH]: "green",
  [OrderStatus.DISPATCHED]: "cyan",
  [OrderStatus.IN_TRANSIT]: "blue",
  [OrderStatus.DELIVERED]: "green",
  [OrderStatus.REJECTED]: "red",
  [OrderStatus.CANCELLED]: "gray",
};

/**
 * End states (no further transitions allowed)
 */
export const END_STATES = [
  OrderStatus.DELIVERED,
  OrderStatus.REJECTED,
  OrderStatus.CANCELLED,
];

/**
 * Check if order is in an end state
 */
export function isEndState(status: string): boolean {
  return END_STATES.includes(status as OrderStatus);
}

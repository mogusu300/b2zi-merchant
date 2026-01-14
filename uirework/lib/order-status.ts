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

export const ORDER_STATUS_VALUES = Object.values(OrderStatus)
export const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus)
export const TRACKING_STATUS_VALUES = Object.values(TrackingStatus)

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
}

/**
 * CHANGE: Updated status colors to use brand-aligned CSS variables instead of arbitrary color names
 * Maps order statuses to CSS custom properties defined in globals.css
 * Each status has a foreground (text) color and a background color
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  [OrderStatus.PENDING]: { bg: "bg-status-pending-bg", text: "text-status-pending" },
  [OrderStatus.APPROVED]: { bg: "bg-status-approved-bg", text: "text-status-approved" },
  [OrderStatus.READY_FOR_DISPATCH]: { bg: "bg-status-ready-bg", text: "text-status-ready" },
  [OrderStatus.DISPATCHED]: { bg: "bg-status-dispatched-bg", text: "text-status-dispatched" },
  [OrderStatus.IN_TRANSIT]: { bg: "bg-status-transit-bg", text: "text-status-transit" },
  [OrderStatus.DELIVERED]: { bg: "bg-status-delivered-bg", text: "text-status-delivered" },
  [OrderStatus.REJECTED]: { bg: "bg-status-rejected-bg", text: "text-status-rejected" },
  [OrderStatus.CANCELLED]: { bg: "bg-status-cancelled-bg", text: "text-status-cancelled" },
}

/**
 * End states (no further transitions allowed)
 */
export const END_STATES = [OrderStatus.DELIVERED, OrderStatus.REJECTED, OrderStatus.CANCELLED]

/**
 * Check if order is in an end state
 */
export function isEndState(status: string): boolean {
  return END_STATES.includes(status as OrderStatus)
}

/**
 * Get color classes for a given order status
 * Returns { bg: bgClass, text: textClass } for use in className
 */
export function getStatusColors(status: OrderStatus) {
  return ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS[OrderStatus.PENDING]
}

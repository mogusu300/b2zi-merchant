/**
 * Order State Machine
 * Defines valid state transitions and rules
 */

import { OrderStatus, END_STATES } from "./order-status";

type UserRole = "customer" | "merchant" | "admin" | "system";

interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: UserRole[];
  validator?: (order: any) => boolean;
  description: string;
}

/**
 * Valid state transitions for the order lifecycle
 */
const VALID_TRANSITIONS: StateTransition[] = [
  // FROM PENDING
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.APPROVED,
    allowedRoles: ["merchant"],
    validator: (order) => order.items && order.items.length > 0,
    description: "Merchant approves the order",
  },
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.REJECTED,
    allowedRoles: ["merchant"],
    validator: (order) => order.items && order.items.length > 0,
    description: "Merchant rejects the order",
  },
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.CANCELLED,
    allowedRoles: ["customer"],
    validator: (order) => !order.paidAt,
    description: "Customer cancels before approval",
  },

  // FROM APPROVED → READY_FOR_DISPATCH
  // Payment is already authorized at checkout, no waiting needed
  {
    from: OrderStatus.APPROVED,
    to: OrderStatus.READY_FOR_DISPATCH,
    allowedRoles: ["system"],
    validator: (order) => order.paymentStatus === "authorized",
    description: "Payment authorized at checkout, ready for merchant to dispatch",
  },

  // FROM READY_FOR_DISPATCH
  {
    from: OrderStatus.READY_FOR_DISPATCH,
    to: OrderStatus.DISPATCHED,
    allowedRoles: ["merchant"],
    validator: (order) => order.paymentStatus === "authorized",
    description: "Merchant dispatches the order (simulated payment captured)",
  },

  // FROM DISPATCHED
  {
    from: OrderStatus.DISPATCHED,
    to: OrderStatus.IN_TRANSIT,
    allowedRoles: ["merchant"],
    validator: (order) => !!order.trackingNumber || true,
    description: "Update tracking: item in transit",
  },

  // FROM IN_TRANSIT
  {
    from: OrderStatus.IN_TRANSIT,
    to: OrderStatus.DELIVERED,
    allowedRoles: ["merchant"],
    validator: () => true,
    description: "Update tracking: item delivered",
  },
];

/**
 * Check if a state transition is valid
 */
export function isValidTransition(
  from: string,
  to: string,
  userRole: UserRole,
  order?: any
): boolean {
  const transition = VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);

  if (!transition) {
    return false;
  }

  // Check if user role is allowed
  if (!transition.allowedRoles.includes(userRole)) {
    return false;
  }

  // Run optional validator
  if (transition.validator && order && !transition.validator(order)) {
    return false;
  }

  return true;
}

/**
 * Get description of a state transition
 */
export function getTransitionDescription(
  from: string,
  to: string
): string | null {
  const transition = VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition?.description || null;
}

/**
 * Get all valid next states for a given status and user role
 */
export function getValidNextStates(
  currentStatus: string,
  userRole: UserRole
): OrderStatus[] {
  return VALID_TRANSITIONS.filter(
    (t) => t.from === currentStatus && t.allowedRoles.includes(userRole)
  ).map((t) => t.to);
}

/**
 * Check if a status is a terminal/end state
 */
export function isTerminalState(status: string): boolean {
  return END_STATES.includes(status as OrderStatus);
}

/**
 * Validate state transition and provide detailed error
 */
export function validateTransition(
  from: string,
  to: string,
  userRole: UserRole,
  order?: any
): { valid: boolean; error?: string } {
  // Check if from state is terminal
  if (isTerminalState(from)) {
    return {
      valid: false,
      error: `Cannot transition from terminal state '${from}'`,
    };
  }

  // Check if transition exists
  const transition = VALID_TRANSITIONS.find((t) => t.from === from && t.to === to);
  if (!transition) {
    return {
      valid: false,
      error: `Invalid transition from '${from}' to '${to}'`,
    };
  }

  // Check role permission
  if (!transition.allowedRoles.includes(userRole)) {
    return {
      valid: false,
      error: `User role '${userRole}' is not allowed to make this transition`,
    };
  }

  // Run validator
  if (transition.validator && order && !transition.validator(order)) {
    return {
      valid: false,
      error: `Order does not meet requirements for this transition`,
    };
  }

  return { valid: true };
}

/**
 * Get all valid transitions
 */
export function getAllTransitions(): StateTransition[] {
  return VALID_TRANSITIONS;
}

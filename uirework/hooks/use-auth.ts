/**
 * CHANGE: Created new unified auth hook for convenience
 * Re-exports merchant and user session hooks as a single interface
 */

export { useMerchantSession as useAuth, useUserSession, useMerchantSession } from "./use-session"

// Type exports
export type { UserSession } from "@/lib/session-storage"

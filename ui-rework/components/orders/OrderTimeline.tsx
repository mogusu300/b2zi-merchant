"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Package,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface TimelineEvent {
  id?: string;
  timestamp?: string;
  createdAt?: string;
  eventType: string;
  status?: string;
  newStatus?: string;
  message?: string;
  actor?: string;
  actorType?: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <Package className="w-5 h-5" />,
  approved: <CheckCircle2 className="w-5 h-5" />,
  rejected: <XCircle className="w-5 h-5" />,
  paid: <CreditCard className="w-5 h-5" />,
  dispatched: <Truck className="w-5 h-5" />,
  in_transit: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle2 className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

const EVENT_COLORS: Record<string, string> = {
  created: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-emerald-100 text-emerald-700",
  dispatched: "bg-orange-100 text-orange-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

const EVENT_LABELS: Record<string, string> = {
  created: "Order Created",
  approved: "Order Approved",
  rejected: "Order Rejected",
  paid: "Payment Received",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const getActorLabel = (actorType: string, actorId: string) => {
  return actorType === "merchant" ? "Merchant" : "You";
};

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const sortedEvents = [...(events || [])].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt || 0).getTime();
    const dateB = new Date(b.timestamp || b.createdAt || 0).getTime();
    return dateA - dateB;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="space-y-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sortedEvents.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Clock className="w-5 h-5 mr-2" />
          <p>No timeline events yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-gray-200" />

          {/* Timeline events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="relative pl-16"
              >
                {/* Timeline dot */}
                <motion.div
                  className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${EVENT_COLORS[event.eventType]} border-4 border-white shadow-sm`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {EVENT_ICONS[event.eventType]}
                </motion.div>

                {/* Event content */}
                <motion.div
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {EVENT_LABELS[event.eventType] || event.eventType}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${EVENT_COLORS[event.eventType] || "bg-gray-100 text-gray-700"}`}>
                          {event.eventType}
                        </span>
                      </div>

                      {event.message && (
                        <p className="text-sm text-gray-600 mb-2">
                          {event.message}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {event.actor && (
                          <span>{event.actor}</span>
                        )}
                        <span>
                          {new Date(event.timestamp || event.createdAt || new Date()).toLocaleDateString()}{" "}
                          {new Date(event.timestamp || event.createdAt || new Date()).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {event.newStatus && (
                      <div className="text-right text-xs">
                        <div className="text-gray-500">
                          {event.oldStatus} → {event.newStatus}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

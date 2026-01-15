"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  CreditCard,
  Truck,
  AlertCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderQueue {
  status: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  count: number;
  orders: any[];
}

const QUEUE_CONFIGS = {
  pending: {
    label: "Awaiting Approval",
    icon: <Clock className="w-5 h-5" />,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  awaiting_payment: {
    label: "Awaiting Payment",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-pending",
    bgColor: "bg-pending/10",
    borderColor: "border-pending/30",
  },
  paid: {
    label: "Ready to Dispatch",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
  },
  dispatched: {
    label: "In Transit",
    icon: <Truck className="w-5 h-5" />,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
  },
};

export default function SellerApprovalDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQueue, setExpandedQueue] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get merchant ID from localStorage
      const merchant = localStorage.getItem('b2zi_merchant');
      if (!merchant) {
        setError("No merchant session found. Please log in again.");
        setLoading(false);
        return;
      }

      const merchantData = JSON.parse(merchant);
      const merchantId = merchantData.id;
      console.log('[SELLER ORDERS] Fetching orders for merchant:', merchantId);

      const response = await fetch(`/api/seller/orders?merchantId=${merchantId}`, {
        credentials: "include",
      });

      console.log('[SELLER ORDERS] Response status:', response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log('[SELLER ORDERS] Full response data:', data);
      console.log('[SELLER ORDERS] Orders count:', data.data?.length || 0);
      console.log('[SELLER ORDERS] Full orders array:', JSON.stringify(data.data, null, 2));
      
      setOrders(data.data || []);
      setError(null);
    } catch (err) {
      console.error('[SELLER ORDERS] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Group orders by status
  const queues = Object.entries(QUEUE_CONFIGS).map(([status, config]) => ({
    status,
    label: config.label,
    icon: config.icon,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.borderColor,
    orders: orders.filter((o) => o.status === status),
  }));

  const visibleQueues = queues.filter((q) => q.orders.length > 0);
  console.log('[SELLER ORDERS] All queues:', queues);
  console.log('[SELLER ORDERS] Visible queues:', visibleQueues);

  const selectedQueue = queues.find((q) => q.status === expandedQueue);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-secondary/30 to-secondary/50"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background border-b border-border sticky top-0 z-10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              Order Management
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchOrders}
              className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
            >
              Refresh
            </motion.button>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </motion.div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">
              No orders to manage
            </p>
            <p className="text-muted-foreground mt-2">All orders are up to date!</p>
          </motion.div>
        ) : (
          <>
            {/* Queue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {visibleQueues.map((queue, index) => (
                <motion.button
                  key={queue.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setExpandedQueue(queue.status)}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    expandedQueue === queue.status
                      ? `${queue.bgColor} ${queue.borderColor} shadow-lg`
                      : `bg-background border-border hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={queue.color}>{queue.icon}</div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform ${
                        expandedQueue === queue.status ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {queue.label}
                  </h3>
                  <p className="text-2xl font-bold text-foreground">
                    {queue.orders.length}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Detailed Queue View */}
            {selectedQueue && selectedQueue.orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-background rounded-lg border border-border shadow-sm overflow-hidden"
              >
                {/* Queue Header */}
                <div className={`${selectedQueue.bgColor} border-b border-border px-6 py-4`}>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedQueue.icon}
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedQueue.label}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedQueue.orders.length}{" "}
                    {selectedQueue.orders.length === 1 ? "order" : "orders"} awaiting
                    action
                  </p>
                </div>

                {/* Orders List */}
                <div className="divide-y divide-border">
                  {selectedQueue.orders.map((order, index) => (
                    <OrderQueueItem
                      key={order.id}
                      order={order}
                      index={index}
                      status={selectedQueue.status}
                      onRefresh={fetchOrders}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function OrderQueueItem({
  order,
  index,
  status,
  onRefresh,
}: {
  order: any;
  index: number;
  status: string;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/orders/${order.id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve order");
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt(
      "Please provide a reason for rejection (max 500 characters):"
    );
    if (!reason) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/orders/${order.id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject order");
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    const trackingNumber = prompt("Enter tracking number (optional):");

    try {
      setActionLoading(true);
      const response = await fetch(`/api/orders/${order.id}/dispatch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          trackingNumber: trackingNumber || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to dispatch order");
      }

      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 hover:bg-secondary/30 transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Order Info */}
        <div>
          <p className="text-xs text-muted-foreground font-semibold mb-1">ORDER ID</p>
          <p className="font-mono text-sm font-semibold text-foreground break-all">
            {order.id.slice(0, 12)}...
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Customer Info */}
        <div>
          <p className="text-xs text-muted-foreground font-semibold mb-1">CUSTOMER</p>
          <p className="font-semibold text-foreground">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
        </div>

        {/* Order Details */}
        <div>
          <p className="text-xs text-muted-foreground font-semibold mb-1">ORDER TOTAL</p>
          <p className="text-2xl font-bold text-foreground">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {order.items?.length || 0} items
          </p>
        </div>
      </div>

      {/* Items Preview */}
      <div className="mb-4 max-h-24 overflow-y-auto bg-secondary/30 rounded p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">ITEMS:</p>
        <div className="space-y-1">
          {order.items?.map((item: any) => (
            <div key={item.id} className="text-sm text-foreground">
              <span className="font-medium">{item.product?.name}</span>
              <span className="text-muted-foreground"> × {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-destructive/10 border border-destructive/30 rounded p-3 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {status === "pending_approval" && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-success text-background rounded-lg hover:bg-success/90 disabled:opacity-50 font-medium text-sm transition-colors"
            >
              {actionLoading ? "Processing..." : "✓ Approve"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 bg-destructive text-background rounded-lg hover:bg-destructive/90 disabled:opacity-50 font-medium text-sm transition-colors"
            >
              {actionLoading ? "Processing..." : "✗ Reject"}
            </motion.button>
          </>
        )}

        {status === "paid" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDispatch}
            disabled={actionLoading}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            {actionLoading ? "Processing..." : "📦 Dispatch"}
          </motion.button>
        )}

        {/* View Order Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/sellers/dashboard/orders/${order.id}`)}
          className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 font-medium text-sm transition-colors"
        >
          View Details →
        </motion.button>
      </div>
    </motion.div>
  );
}

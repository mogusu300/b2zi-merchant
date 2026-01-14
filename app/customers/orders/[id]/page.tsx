"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  MapPin,
  Package,
  Truck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

interface OrderDetailPageProps {
  orderId: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending_approval: "bg-blue-50 border-blue-200 text-blue-900",
  approved: "bg-green-50 border-green-200 text-green-900",
  awaiting_payment: "bg-amber-50 border-amber-200 text-amber-900",
  paid: "bg-emerald-50 border-emerald-200 text-emerald-900",
  dispatched: "bg-orange-50 border-orange-200 text-orange-900",
  in_transit: "bg-blue-50 border-blue-200 text-blue-900",
  delivered: "bg-green-50 border-green-200 text-green-900",
  rejected: "bg-red-50 border-red-200 text-red-900",
  cancelled: "bg-gray-50 border-gray-200 text-gray-900",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending_approval: <Clock className="w-5 h-5" />,
  approved: <CheckCircle2 className="w-5 h-5" />,
  awaiting_payment: <CreditCard className="w-5 h-5" />,
  paid: <CheckCircle2 className="w-5 h-5" />,
  dispatched: <Truck className="w-5 h-5" />,
  in_transit: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle2 className="w-5 h-5" />,
  rejected: <XCircle className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
};

const STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  awaiting_payment: "Awaiting Payment",
  paid: "Paid",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      console.log('[ORDER DETAIL] Fetching order:', orderId);
      
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        credentials: "include",
      });

      console.log('[ORDER DETAIL] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('[ORDER DETAIL] Error response text:', errorData);
        try {
          const errorJson = JSON.parse(errorData);
          console.log('[ORDER DETAIL] Error response JSON:', errorJson);
        } catch (e) {
          console.log('[ORDER DETAIL] Could not parse error as JSON');
        }
        
        throw new Error(
          response.status === 404
            ? "Order not found"
            : "Failed to fetch order"
        );
      }

      const data = await response.json();
      console.log('[ORDER DETAIL] Order data:', data);
      setOrder(data.data || data);
      setError(null);
    } catch (err) {
      console.error('[ORDER DETAIL] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaying(true);
      const response = await fetch(`/api/orders/${orderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentMethod,
          // Payment method specific fields (optional for mock)
          stripePaymentMethodId: "pm_test_" + Math.random().toString(36),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }

      // Refresh order data
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4"
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white rounded-lg border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-red-900 mb-1">Error</h2>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  const canPay =
    order.status === "awaiting_payment" || order.status === "approved";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.id.slice(0, 8)}
            </h1>
          </div>

          {/* Status Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-3 rounded-lg border-2 flex items-center gap-2 font-semibold ${STATUS_COLORS[order.status]}`}
          >
            {STATUS_ICONS[order.status]}
            {STATUS_LABELS[order.status]}
          </motion.div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Information
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Items
              </h2>

              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.product?.name || "Product"}
                      </p>
                      {item.product?.seller && (
                        <p className="text-sm text-gray-600">
                          by {item.product.seller.businessName}
                        </p>
                      )}
                      {item.variantData &&
                        typeof item.variantData === "object" && (
                          <p className="text-sm text-gray-500">
                            {Object.entries(item.variantData)
                              .filter(([, v]) => v)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </p>
                        )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {item.quantity}x
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Address
              </h2>

              <p className="text-gray-900 font-semibold">
                {order.customerName}
              </p>
              <p className="text-gray-600">{order.deliveryAddress}</p>
              <p className="text-gray-600">
                {order.deliveryCity}, {order.deliveryState}{" "}
                {order.deliveryZipCode}
              </p>
              <p className="text-gray-600 mt-2">{order.customerPhone}</p>
            </motion.div>

            {/* Tracking Info (if dispatched) */}
            {order.dispatchedAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Tracking Information
                </h2>

                {order.trackingNumber && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono text-gray-900 font-semibold">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}

                {order.driverName && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Driver</p>
                    <p className="font-semibold text-gray-900">
                      {order.driverName}
                      {order.driverPhone && ` - ${order.driverPhone}`}
                    </p>
                  </div>
                )}

                {order.trackingMessage && (
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-gray-900">{order.trackingMessage}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Timeline
              </h2>
              <OrderTimeline events={order.timeline || []} currentStatus={order.status} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Section */}
            {canPay && !order.paidAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Required
                </h3>

                <div className="bg-white rounded-lg p-3 mb-4 border border-amber-100">
                  <p className="text-sm text-gray-600">Total Due</p>
                  <p className="text-2xl font-bold text-amber-900">
                    ${order.total.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">
                      Credit/Debit Card
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">
                      Bank Transfer
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment-method"
                      value="cash_on_delivery"
                      checked={paymentMethod === "cash_on_delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">
                      Cash on Delivery
                    </span>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Now
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-amber-800 text-center mt-3">
                  All payments are secure and encrypted
                </p>
              </motion.div>
            )}

            {/* Payment Received */}
            {order.paidAt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Payment Received
                  </h3>
                </div>
                <p className="text-sm text-green-800">
                  {new Date(order.paidAt).toLocaleDateString()} at{" "}
                  {new Date(order.paidAt).toLocaleTimeString()}
                </p>
                <p className="text-sm text-green-800 mt-1">
                  Method: {order.paymentMethod || "Not specified"}
                </p>
              </motion.div>
            )}

            {/* Order Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                Order Status
              </h3>

              <div className="space-y-3">
                <StatusStep
                  label="Order Placed"
                  completed={true}
                  active={order.status === "pending_approval"}
                />
                <StatusStep
                  label="Merchant Review"
                  completed={["approved", "awaiting_payment", "paid", "dispatched", "in_transit", "delivered"].includes(
                    order.status
                  )}
                  active={order.status === "pending_approval"}
                />
                <StatusStep
                  label="Payment Pending"
                  completed={["paid", "dispatched", "in_transit", "delivered"].includes(
                    order.status
                  )}
                  active={["awaiting_payment", "approved"].includes(order.status)}
                />
                <StatusStep
                  label="Payment Received"
                  completed={["dispatched", "in_transit", "delivered"].includes(
                    order.status
                  )}
                  active={order.status === "paid"}
                />
                <StatusStep
                  label="Dispatched"
                  completed={["in_transit", "delivered"].includes(
                    order.status
                  )}
                  active={order.status === "dispatched"}
                />
                <StatusStep
                  label="In Transit"
                  completed={order.status === "delivered"}
                  active={order.status === "in_transit"}
                />
                <StatusStep
                  label="Delivered"
                  completed={order.status === "delivered"}
                  active={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusStep({
  label,
  completed,
  active,
}: {
  label: string;
  completed: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={{
          scale: active ? [1, 1.2, 1] : 1,
          backgroundColor: completed ? "#10b981" : "#e5e7eb",
        }}
        transition={{ duration: 0.5, repeat: active ? Infinity : 0 }}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-white rounded-full"
          />
        )}
      </motion.div>
      <span
        className={`text-sm ${
          completed || active
            ? "font-semibold text-gray-900"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

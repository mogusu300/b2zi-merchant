"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  CreditCard,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-50 border-blue-200 text-blue-900",
  approved: "bg-green-50 border-green-200 text-green-900",
  awaiting_payment: "bg-amber-50 border-amber-200 text-amber-900",
  paid: "bg-emerald-50 border-emerald-200 text-emerald-900",
  dispatched: "bg-orange-50 border-orange-200 text-orange-900",
  in_transit: "bg-blue-50 border-blue-200 text-blue-900",
  delivered: "bg-green-50 border-green-200 text-green-900",
  rejected: "bg-red-50 border-red-200 text-red-900",
  cancelled: "bg-gray-50 border-gray-200 text-gray-900",
};

export default function SellerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      console.log("[SELLER ORDER DETAIL] Fetching order:", orderId);

      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        credentials: "include",
      });

      console.log("[SELLER ORDER DETAIL] Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.log("[SELLER ORDER DETAIL] Error:", errorData);
        throw new Error(
          response.status === 404 ? "Order not found" : "Failed to fetch order"
        );
      }

      const data = await response.json();
      console.log("[SELLER ORDER DETAIL] Order data:", data);
      setOrder(data.data || data);
      setError(null);
    } catch (err) {
      console.error("[SELLER ORDER DETAIL] Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve order");
      }

      await fetchOrder();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "An error occurred"
      );
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
      setActionError(null);

      const response = await fetch(`/api/orders/${orderId}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject order");
      }

      await fetchOrder();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async () => {
    const trackingNumber = prompt("Enter tracking number (optional):");

    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trackingNumber: trackingNumber || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to dispatch order");
      }

      await fetchOrder();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Error
              </h2>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  const canApprove = order.status === "pending";
  const canReject = order.status === "pending";
  const canDispatch = order.status === "ready_for_dispatch";
  const canPay = order.status === "awaiting_payment";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-gray-600 mt-1">
                Order Value: ${order.total.toFixed(2)}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg border font-medium ${
                STATUS_COLORS[order.status] || "bg-gray-50"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{actionError}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 pb-4 border-b last:pb-0 last:border-0"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Seller: {item.sellerName}
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-medium text-gray-900">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">
                    {order.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {order.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium text-gray-900">
                    {order.deliveryAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryCity}, {order.deliveryState}{" "}
                    {order.deliveryZipCode}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Status & Tracking */}
            {order.trackingStatus && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Tracking Information
                </h2>
                <div className="space-y-3">
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Tracking Number
                      </p>
                      <p className="font-medium text-gray-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.driverName && (
                    <div>
                      <p className="text-sm text-gray-600">Driver Name</p>
                      <p className="font-medium text-gray-900">
                        {order.driverName}
                      </p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Estimated Delivery
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {order.trackingMessage && (
                    <div>
                      <p className="text-sm text-gray-600">Status Message</p>
                      <p className="font-medium text-gray-900">
                        {order.trackingMessage}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {canApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Order
                  </Button>
                )}

                {canReject && (
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Order
                  </Button>
                )}

                {canDispatch && (
                  <Button
                    onClick={handleDispatch}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Dispatch Order
                  </Button>
                )}

                {!canApprove && !canReject && !canDispatch && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                    No actions available for this order status
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {order.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Received</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.dispatchedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispatched</span>
                    <span className="font-medium text-gray-900">
                      {new Date(order.dispatchedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

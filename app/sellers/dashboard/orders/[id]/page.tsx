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
  pending: "bg-primary/10 border-primary/30 text-primary",
  approved: "bg-success/10 border-success/30 text-success",
  awaiting_payment: "bg-pending/10 border-pending/30 text-pending",
  paid: "bg-success/10 border-success/30 text-success",
  dispatched: "bg-accent/10 border-accent/30 text-accent",
  in_transit: "bg-accent/10 border-accent/30 text-accent",
  delivered: "bg-success/10 border-success/30 text-success",
  rejected: "bg-destructive/10 border-destructive/30 text-destructive",
  cancelled: "bg-muted border-muted text-muted-foreground",
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
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-destructive mb-2">
                Error
              </h2>
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  const canApprove = order.status === "pending";
  const canReject = order.status === "pending";
  const canDispatch = order.status === "ready_for_dispatch";
  const canPay = order.status === "awaiting_payment";

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-background shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-muted-foreground mt-1">
                Order Value: ${order.total.toFixed(2)}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg border font-medium ${
                STATUS_COLORS[order.status] || "bg-secondary"
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
            className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{actionError}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4 pb-4 border-b last:pb-0 last:border-0 border-border"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Seller: {item.sellerName}
                      </p>
                      <p className="font-semibold text-foreground mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium text-foreground">
                    {order.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">
                    {order.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">
                    {order.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium text-foreground">
                    {order.deliveryAddress}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryCity}, {order.deliveryState}{" "}
                    {order.deliveryZipCode}
                  </p>
                </div>
              </div>
            </Card>

            {/* Order Status & Tracking */}
            {order.trackingStatus && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Tracking Information
                </h2>
                <div className="space-y-3">
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tracking Number
                      </p>
                      <p className="font-medium text-foreground">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.driverName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Driver Name</p>
                      <p className="font-medium text-foreground">
                        {order.driverName}
                      </p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Estimated Delivery
                      </p>
                      <p className="font-medium text-foreground">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {order.trackingMessage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Status Message</p>
                      <p className="font-medium text-foreground">
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
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                {canApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full bg-success hover:bg-success/90 text-background"
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
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Order
                  </Button>
                )}

                {canDispatch && (
                  <Button
                    onClick={handleDispatch}
                    disabled={actionLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-background"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Dispatch Order
                  </Button>
                )}

                {!canApprove && !canReject && !canDispatch && (
                  <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground text-center">
                    No actions available for this order status
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium text-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {order.approvedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Received</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {order.dispatchedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dispatched</span>
                    <span className="font-medium text-foreground">
                      {new Date(order.dispatchedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">
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

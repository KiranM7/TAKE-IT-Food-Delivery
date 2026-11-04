import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

const ORDER_STAGES = [
  {
    status: "PLACED",
    label: "Order Placed",
    description: "Your order has been received.",
    icon: ShoppingBag,
  },
  {
    status: "CONFIRMED",
    label: "Order Confirmed",
    description: "Your order has been confirmed.",
    icon: CheckCircle2,
  },
  {
    status: "PREPARING",
    label: "Preparing Your Food",
    description: "The restaurant is preparing your food.",
    icon: Package,
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Your food is on its way.",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: Check,
  },
];

const STATUS_MESSAGES = {
  PLACED: "Your order has been placed successfully.",
  CONFIRMED: "The restaurant has confirmed your order.",
  PREPARING: "Your food is being prepared.",
  OUT_FOR_DELIVERY: "Your order is on its way!",
  DELIVERED: "Your order has been delivered. Enjoy your meal!",
  CANCELLED: "This order has been cancelled.",
};

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0.00";

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

function getItemName(item) {
  return (
    item?.dishName ??
    item?.foodName ??
    item?.productName ??
    item?.itemName ??
    item?.name ??
    "Food item"
  );
}

function getItemQuantity(item) {
  const quantity = Number(item?.quantity ?? item?.qty ?? 1);

  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function getItemPrice(item) {
  return Number(
    item?.price ??
      item?.unitPrice ??
      item?.dishPrice ??
      item?.productPrice ??
      0
  );
}

function getItemSubtotal(item) {
  const subtotal =
    item?.subtotal ??
    item?.subTotal ??
    item?.totalPrice ??
    item?.itemTotal;

  if (subtotal !== undefined && subtotal !== null) {
    return Number(subtotal);
  }

  return getItemPrice(item) * getItemQuantity(item);
}

function OrderDetailsPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(
    async (isAutomaticRefresh = false) => {
      if (!orderId) {
        setError("Invalid order ID.");
        setLoading(false);
        return;
      }

      if (isAutomaticRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await apiRequest(
          `/orders/${encodeURIComponent(orderId)}`
        );

        if (!data || typeof data !== "object") {
          throw new Error("Invalid order information received.");
        }

        setOrder(data);
        setError("");
      } catch (err) {
        setError(err.message || "Unable to load order details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchOrder();

    const intervalId = window.setInterval(() => {
      fetchOrder(true);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-orange-500" />
          <p className="text-lg font-semibold text-gray-800">
            Loading your order...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Please wait while we fetch your order details.
          </p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />

          <h1 className="text-2xl font-bold text-gray-900">
            Unable to Load Order
          </h1>

          <p className="mt-3 text-gray-600">{error}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => fetchOrder()}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Try Again
            </button>

            <Link
              to="/orders"
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = String(order.orderStatus ?? "").toUpperCase();

  const isCancelled = currentStatus === "CANCELLED";
  const isDelivered = currentStatus === "DELIVERED";

  const currentStageIndex = ORDER_STAGES.findIndex(
    (stage) => stage.status === currentStatus
  );

  const items = Array.isArray(order.items) ? order.items : [];

  const orderNumber = order.orderNumber ?? order.id ?? orderId;

  const isPaid = String(order.paymentStatus ?? "").toUpperCase() === "PAID";

  const paymentStatus = order.paymentStatus
    ? formatStatus(order.paymentStatus)
    : "Unknown";

  const paymentMethod = order.paymentMethod
    ? formatStatus(order.paymentMethod)
    : "Not specified";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Back navigation */}
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Back to My Orders
        </Link>

        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-500">
              TAKE IT · Order Tracking
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-2 text-gray-500">
              Order #{orderNumber}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Status
          </button>
        </div>

        {/* Refresh error: preserve the last successfully loaded order */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            Could not refresh the latest order status. Showing the last
            available details. Please try refreshing again.
          </div>
        )}

        {/* Current order status */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div
            className={`p-6 sm:p-8 ${
              isCancelled
                ? "bg-red-50"
                : isDelivered
                  ? "bg-green-50"
                  : "bg-orange-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                  isCancelled
                    ? "bg-red-100 text-red-600"
                    : isDelivered
                      ? "bg-green-100 text-green-600"
                      : "bg-orange-100 text-orange-600"
                }`}
              >
                {isCancelled ? (
                  <XCircle size={30} />
                ) : isDelivered ? (
                  <CheckCircle2 size={30} />
                ) : (
                  <Truck size={30} />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Order Status
                </p>

                <h2
                  className={`mt-1 text-2xl font-extrabold ${
                    isCancelled
                      ? "text-red-700"
                      : isDelivered
                        ? "text-green-700"
                        : "text-gray-900"
                  }`}
                >
                  {formatStatus(currentStatus)}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  {STATUS_MESSAGES[currentStatus] ??
                    "Check back for the latest order status."}
                </p>
              </div>
            </div>
          </div>

          {/* Order tracking timeline */}
          {!isCancelled && (
            <div className="p-6 sm:p-8">
              <h3 className="mb-7 text-lg font-bold text-gray-900">
                Track Your Order
              </h3>

              <div className="relative">
                {ORDER_STAGES.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isComplete = index <= currentStageIndex;
                  const isCurrent = index === currentStageIndex;

                  return (
                    <div
                      key={stage.status}
                      className="relative flex gap-4 pb-8 last:pb-0"
                    >
                      {/* Timeline connector */}
                      {index < ORDER_STAGES.length - 1 && (
                        <div
                          className={`absolute left-5 top-11 h-[calc(100%-1rem)] w-0.5 ${
                            index < currentStageIndex
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      )}

                      {/* Stage icon */}
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isComplete
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        } ${
                          isCurrent
                            ? "ring-4 ring-orange-100"
                            : ""
                        }`}
                      >
                        {isComplete ? (
                          <StageIcon size={19} />
                        ) : (
                          <Clock size={19} />
                        )}
                      </div>

                      {/* Stage information */}
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-bold ${
                              isComplete
                                ? "text-gray-900"
                                : "text-gray-400"
                            }`}
                          >
                            {stage.label}
                          </h4>

                          {isCurrent && (
                            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                              Current Status
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 text-sm ${
                            isComplete
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Order details and payment */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900">
                Order Items
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {items.length} {items.length === 1 ? "item" : "items"} in
                this order
              </p>
            </div>

            {items.length > 0 ? (
              <div className="divide-y divide-gray-100 px-6">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? item.orderItemId ?? index}
                    className="flex items-center justify-between gap-4 py-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <ShoppingBag size={22} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="break-words font-semibold text-gray-900">
                          {getItemName(item)}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {getItemQuantity(item)}
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 font-bold text-gray-900">
                      {formatAmount(getItemSubtotal(item))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No item details are available for this order.
              </div>
            )}
          </section>

          {/* Payment and delivery */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">
                Payment Summary
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500">
                    Payment Method
                  </span>

                  <span className="text-right text-sm font-semibold text-gray-800">
                    {paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500">
                    Payment Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isPaid
                        ? "bg-green-100 text-green-700"
                        : String(order.paymentStatus ?? "").toUpperCase() ===
                            "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-gray-700">
                      Total Amount
                    </span>

                    <span className="text-xl font-extrabold text-orange-600">
                      {formatAmount(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="shrink-0 text-orange-500" size={22} />

                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Address
                </h3>
              </div>

              <p className="mt-4 whitespace-pre-line break-words text-sm leading-6 text-gray-600">
                {order.deliveryAddress || "No delivery address available."}
              </p>
            </section>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            <ArrowLeft size={18} />
            All My Orders
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Order status refreshes automatically every 15 seconds while this
          page is open.
        </p>
      </div>
    </div>
  );
}

export default OrderDetailsPage;

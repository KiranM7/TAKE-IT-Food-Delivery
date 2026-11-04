import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  ShoppingBag,
  Eye,
  X,
  PackageCheck,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiRequest } from "../services/api";

const STATUS_OPTIONS = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES = {
  PLACED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
};

function AdminOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiRequest("/orders/admin/all");

      const orderList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setOrders(orderList);
    } catch (err) {
      setError(
        err?.message ||
        "Unable to load orders. Check your login and backend server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        order.orderStatus === statusFilter;

      const normalizedPaymentMethod = String(
        order.paymentMethod || ""
      )
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

      const matchesPaymentMethod =
        paymentMethodFilter === "ALL" ||
        (
          paymentMethodFilter === "COD"
            ? ["COD", "CASH_ON_DELIVERY", "CASH"].includes(
              normalizedPaymentMethod
            )
            : normalizedPaymentMethod === paymentMethodFilter
        );

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        String(order.paymentStatus || "").toUpperCase() ===
        paymentStatusFilter;

      const searchableText = [
        order.orderNumber,
        order.id,
        order.paymentMethod,
        order.paymentStatus,
        order.orderStatus,
        order.deliveryAddress,
        order.customerName,
        order.customerEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        matchesPaymentMethod &&
        matchesPaymentStatus &&
        searchableText.includes(query)
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentMethodFilter,
    paymentStatusFilter,
  ]);

  const updateOrderStatus = async (order, newStatus) => {
    if (!newStatus || newStatus === order.orderStatus) return;

    const confirmed = window.confirm(
      `Change order ${order.orderNumber || `#${order.id}`} from ${formatStatus(
        order.orderStatus
      )} to ${formatStatus(newStatus)}?`
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/orders/${order.id}/status?status=${encodeURIComponent(newStatus)}`,
        { method: "PUT" }
      );

      setNotice(
        `Order ${order.orderNumber || `#${order.id}`} updated to ${formatStatus(
          newStatus
        )}.`
      );

      await loadOrders(true);
    } catch (err) {
      setError(err?.message || "Unable to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const stats = useMemo(() => {
    const active = orders.filter(
      (order) =>
        !["DELIVERED", "CANCELLED"].includes(order.orderStatus)
    ).length;

    const delivered = orders.filter(
      (order) => order.orderStatus === "DELIVERED"
    ).length;

    const cancelled = orders.filter(
      (order) => order.orderStatus === "CANCELLED"
    ).length;

    return {
      total: orders.length,
      active,
      delivered,
      cancelled,
    };
  }, [orders]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
                title="Back to dashboard"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                  TAKE IT / ADMIN
                </p>
                <h1 className="text-xl font-extrabold sm:text-2xl">
                  Order Management
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8">
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                label: "Total Orders",
                value: stats.total,
                icon: ShoppingBag,
                color: "text-orange-600 bg-orange-50",
              },
              {
                label: "Active Orders",
                value: stats.active,
                icon: Clock,
                color: "text-blue-600 bg-blue-50",
              },
              {
                label: "Delivered",
                value: stats.delivered,
                icon: PackageCheck,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                icon: XCircle,
                color: "text-red-600 bg-red-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </span>
                    <span className={`rounded-xl p-2 ${stat.color}`}>
                      <Icon size={19} />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-extrabold">{stat.value}</p>
                </div>
              );
            })}
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                <X size={18} />
              </button>
            </div>
          )}

          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              {notice}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-extrabold">All Orders</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search orders, check payment information, and manage order status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search orders..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  aria-label="Filter by order status"
                >
                  <option value="ALL">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <select
                  value={paymentMethodFilter}
                  onChange={(event) => setPaymentMethodFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  aria-label="Filter by payment method"
                >
                  <option value="ALL">All payment methods</option>
                  <option value="RAZORPAY">Razorpay</option>
                  <option value="COD">Cash on Delivery</option>
                </select>

                <select
                  value={paymentStatusFilter}
                  onChange={(event) => setPaymentStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  aria-label="Filter by payment status"
                >
                  <option value="ALL">All payment statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              {loading ? (
                <div className="py-16 text-center text-sm text-slate-500">
                  Loading orders...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag
                    size={36}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 font-bold">No orders found</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or status filter.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-4 font-bold">Order</th>
                      <th className="px-3 py-4 font-bold">Date</th>
                      <th className="px-3 py-4 font-bold">Amount</th>
                      <th className="px-3 py-4 font-bold">Payment</th>
                      <th className="px-3 py-4 font-bold">Status</th>
                      <th className="px-3 py-4 font-bold">Update status</th>
                      <th className="px-3 py-4 font-bold">Details</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="transition hover:bg-slate-50">
                        <td className="px-3 py-4">
                          <p className="font-extrabold text-slate-900">
                            {order.orderNumber || `#${order.id}`}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.customerName || "Customer"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.customerEmail || ""}
                          </p>
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-3 py-4 font-bold">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td className="px-3 py-4">
                          <p className="font-semibold">
                            {formatStatus(order.paymentMethod)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatStatus(order.paymentStatus)}
                          </p>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_STYLES[order.orderStatus] ||
                              "bg-slate-100 text-slate-700"
                              }`}
                          >
                            {formatStatus(order.orderStatus)}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {["DELIVERED", "CANCELLED"].includes(
                            order.orderStatus
                          ) ? (
                            <span className="text-xs text-slate-400">
                              Final status
                            </span>
                          ) : (
                            <select
                              value={order.orderStatus || ""}
                              disabled={updatingOrderId === order.id}
                              onChange={(event) =>
                                updateOrderStatus(order, event.target.value)
                              }
                              className="max-w-48 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold outline-none focus:border-orange-400 disabled:opacity-50"
                              aria-label={`Update status for order ${order.orderNumber || order.id
                                }`}
                            >
                              {STATUS_OPTIONS.filter((status) => {
                                if (status === order.orderStatus) return true;

                                const allowedTransitions = {
                                  PLACED: ["CONFIRMED", "CANCELLED"],
                                  CONFIRMED: ["PREPARING", "CANCELLED"],
                                  PREPARING: [
                                    "OUT_FOR_DELIVERY",
                                    "CANCELLED",
                                  ],
                                  OUT_FOR_DELIVERY: ["DELIVERED"],
                                };

                                return (
                                  allowedTransitions[order.orderStatus] || []
                                ).includes(status);
                              }).map((status) => (
                                <option key={status} value={status}>
                                  {formatStatus(status)}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && (
              <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            )}
          </section>
        </main>

        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-details-title"
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Order details
                  </p>
                  <h2
                    id="order-details-title"
                    className="mt-1 text-xl font-extrabold"
                  >
                    {selectedOrder.orderNumber || `#${selectedOrder.id}`}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close order details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Order status
                    </p>
                    <p className="mt-2 font-bold">
                      {formatStatus(selectedOrder.orderStatus)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Total amount
                    </p>
                    <p className="mt-2 text-lg font-extrabold">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Payment method
                    </p>
                    <p className="mt-2 font-bold">
                      {formatStatus(selectedOrder.paymentMethod)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatStatus(selectedOrder.paymentStatus)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Order date
                    </p>
                    <p className="mt-2 font-bold">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold">Customer information</h3>

                  <div className="mt-3 rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold">
                      {selectedOrder.customerName || "Customer name unavailable"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOrder.customerEmail || "Email unavailable"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold">Delivery address</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedOrder.deliveryAddress || "No address provided"}
                  </p>
                </div>

                <div>
                  <h3 className="font-extrabold">Order items</h3>
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.length > 0 ? (
                    <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.dishName ||
                                item.productName ||
                                item.name ||
                                `Item ${index + 1}`}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Quantity: {item.quantity ?? "—"}
                            </p>
                          </div>

                          <p className="whitespace-nowrap font-bold">
                            {formatCurrency(
                              item.subtotal ??
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No item details were returned for this order.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-700"
                >
                  Close details
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;
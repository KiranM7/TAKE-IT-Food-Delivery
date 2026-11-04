import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Truck,
  XCircle,
  MapPin,
  CreditCard,
  ChevronDown,
  LoaderCircle,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../services/api";

const STATUSES = [
  "ALL",
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_CONFIG = {
  PLACED: {
    label: "New Order",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-indigo-100 text-indigo-700",
    icon: CheckCircle2,
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-amber-100 text-amber-700",
    icon: ChefHat,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-green-100 text-green-700",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

const NEXT_STATUS = {
  PLACED: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const ACTION_LABELS = {
  CONFIRMED: "Confirm Order",
  PREPARING: "Start Preparing",
  OUT_FOR_DELIVERY: "Mark Ready for Delivery",
  DELIVERED: "Mark Delivered",
};

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function getPaymentLabel(status) {
  if (!status) return "Unknown";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function OwnerOrdersPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState("");

  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [expandedOrders, setExpandedOrders] = useState({});

  const selectedRestaurant = restaurants.find(
    (restaurant) => String(restaurant.id) === String(restaurantId),
  );

  const loadRestaurants = useCallback(async () => {
    setLoadingRestaurants(true);
    setError("");

    try {
      const data = await apiRequest("/owner/restaurants");
      const list = Array.isArray(data) ? data : [];

      setRestaurants(list);

      setRestaurantId((current) => {
        if (list.some((restaurant) => String(restaurant.id) === current)) {
          return current;
        }

        return String(list[0]?.id ?? "");
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingRestaurants(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!restaurantId) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    setError("");

    try {
      const endpoint =
        selectedStatus === "ALL"
          ? `/owner/restaurants/${restaurantId}/orders`
          : `/owner/restaurants/${restaurantId}/orders/status?status=${selectedStatus}`;

      const data = await apiRequest(endpoint);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrders([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingOrders(false);
    }
  }, [restaurantId, selectedStatus]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return orders;

    return orders.filter((order) => {
      const orderNumber = String(order.orderNumber ?? order.id ?? "");
      const address = String(order.deliveryAddress ?? "");

      const itemMatches = (order.items ?? []).some((item) =>
        String(item.dishName ?? "").toLowerCase().includes(query),
      );

      return (
        orderNumber.toLowerCase().includes(query) ||
        address.toLowerCase().includes(query) ||
        itemMatches
      );
    });
  }, [orders, search]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      newOrders: orders.filter((order) => order.orderStatus === "PLACED").length,
      preparing: orders.filter(
        (order) => order.orderStatus === "PREPARING",
      ).length,
      completed: orders.filter(
        (order) => order.orderStatus === "DELIVERED",
      ).length,
    }),
    [orders],
  );

  async function updateOrderStatus(order, newStatus) {
    const action = ACTION_LABELS[newStatus] ?? newStatus;

    const confirmed = window.confirm(
      `${action} for order ${order.orderNumber ?? `#${order.id}`}?`,
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);
    setError("");
    setNotice("");

    try {
      const endpoint =
        `/owner/restaurants/${restaurantId}/orders/${order.id}/status` +
        `?status=${newStatus}`;

      const updatedOrder = await apiRequest(endpoint, {
        method: "PUT",
      });

      setNotice(
        `Order ${order.orderNumber ?? `#${order.id}`} updated successfully.`,
      );

      // Update immediately if the order remains in the current filter.
      if (
        selectedStatus === "ALL" ||
        updatedOrder.orderStatus === selectedStatus
      ) {
        setOrders((current) =>
          current.map((item) =>
            item.id === updatedOrder.id ? updatedOrder : item,
          ),
        );
      } else {
        setOrders((current) =>
          current.filter((item) => item.id !== order.id),
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function toggleExpanded(orderId) {
    setExpandedOrders((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  }

  if (loadingRestaurants) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <LoaderCircle className="h-6 w-6 animate-spin text-orange-500" />
        Loading your restaurants...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-600">
              Restaurant Owner
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Orders Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage incoming orders and keep customers updated.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={!restaurantId || loadingOrders}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingOrders ? "animate-spin" : ""}`}
            />
            Refresh Orders
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {notice}
          </div>
        )}

        {restaurants.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">
              No restaurants found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Add a restaurant before managing its orders.
            </p>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <label
                htmlFor="orders-restaurant"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Select Restaurant
              </label>

              <select
                id="orders-restaurant"
                value={restaurantId}
                onChange={(event) => {
                  setRestaurantId(event.target.value);
                  setSearch("");
                  setNotice("");
                  setError("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>

              {selectedRestaurant && (
                <p className="mt-3 text-sm text-gray-500">
                  Managing orders for{" "}
                  <span className="font-semibold text-gray-800">
                    {selectedRestaurant.name}
                  </span>
                </p>
              )}
            </section>

            <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Orders in View",
                  value: stats.total,
                  icon: ShoppingBag,
                  style: "bg-orange-50 text-orange-600",
                },
                {
                  label: "New Orders",
                  value: stats.newOrders,
                  icon: Clock,
                  style: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Preparing",
                  value: stats.preparing,
                  icon: ChefHat,
                  style: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Delivered",
                  value: stats.completed,
                  icon: PackageCheck,
                  style: "bg-green-50 text-green-600",
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.style}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </section>

            <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm ${
                      selectedStatus === status
                        ? "bg-orange-500 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600"
                    }`}
                  >
                    {status === "ALL"
                      ? "All Orders"
                      : STATUS_CONFIG[status]?.label ?? status}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order or dish..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </section>

            {loadingOrders ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-gray-500">
                <LoaderCircle className="h-6 w-6 animate-spin text-orange-500" />
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />

                <h2 className="text-xl font-bold text-gray-900">
                  No orders found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try another filter or refresh to check for new orders.
                </p>
              </div>
            ) : (
              <section className="space-y-5">
                {filteredOrders.map((order) => {
                  const statusConfig =
                    STATUS_CONFIG[order.orderStatus] ??
                    STATUS_CONFIG.PLACED;

                  const StatusIcon = statusConfig.icon;
                  const nextStatus = NEXT_STATUS[order.orderStatus];
                  const isExpanded = Boolean(expandedOrders[order.id]);
                  const items = order.items ?? [];

                  return (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-extrabold text-gray-900">
                              Order {order.orderNumber ?? `#${order.id}`}
                            </h2>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig.color}`}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Order Total
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                        <div>
                          <h3 className="mb-3 text-sm font-bold text-gray-800">
                            Payment Information
                          </h3>

                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-gray-600">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              Method:{" "}
                              <span className="font-semibold text-gray-800">
                                {getPaymentLabel(order.paymentMethod)}
                              </span>
                            </p>

                            <p className="text-gray-600">
                              Payment status:{" "}
                              <span className="font-semibold text-gray-800">
                                {getPaymentLabel(order.paymentStatus)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-sm font-bold text-gray-800">
                            Delivery Address
                          </h3>

                          <p className="flex items-start gap-2 text-sm leading-6 text-gray-600">
                            <MapPin className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                            <span>
                              {order.deliveryAddress ||
                                "No delivery address provided"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(order.id)}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <span className="text-sm font-bold text-gray-800">
                            Order Items ({items.length})
                          </span>

                          <ChevronDown
                            className={`h-5 w-5 text-gray-500 transition ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            {items.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No item details are available.
                              </p>
                            ) : (
                              items.map((item, index) => (
                                <div
                                  key={`${item.dishId ?? item.dishName}-${index}`}
                                  className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 p-3"
                                >
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {item.dishName ?? "Unnamed dish"}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      Quantity: {item.quantity ?? 0} ×{" "}
                                      {formatPrice(item.unitPrice)}
                                    </p>
                                  </div>

                                  <p className="shrink-0 font-bold text-gray-900">
                                    {formatPrice(item.subtotal)}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-xs leading-5 text-gray-500">
                          Update the order when its preparation or delivery
                          stage changes.
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order, nextStatus)
                              }
                              disabled={updatingOrderId === order.id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingOrderId === order.id ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}

                              {updatingOrderId === order.id
                                ? "Updating..."
                                : ACTION_LABELS[nextStatus]}
                            </button>
                          )}

                          {!["DELIVERED", "CANCELLED"].includes(
                            order.orderStatus,
                          ) && (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order, "CANCELLED")
                              }
                              disabled={updatingOrderId === order.id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel Order
                            </button>
                          )}

                          {!nextStatus &&
                            ["DELIVERED", "CANCELLED"].includes(
                              order.orderStatus,
                            ) && (
                              <span className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-500">
                                Order Completed
                              </span>
                            )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default OwnerOrdersPage;

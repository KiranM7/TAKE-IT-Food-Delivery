import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Clock,
  MapPin,
  CreditCard,
  RefreshCw,
  Receipt,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
} from "lucide-react";

import { apiRequest } from "../services/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const formatDate = (date) => {
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
};

const getStatusStyle = (status) => {
  switch (String(status ?? "").toUpperCase()) {
    case "PAID":
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";

    case "PENDING":
    case "PLACED":
    case "CONFIRMED":
      return "bg-amber-100 text-amber-700";

    case "PREPARING":
    case "OUT_FOR_DELIVERY":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
    case "FAILED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-stone-100 text-stone-700";
  }
};

const formatStatus = (status) =>
  String(status ?? "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/orders");

        if (!active) return;

        // Supports an array or a response wrapped in { orders: [...] }.
        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : null;

        if (!orderList) {
          throw new Error("Unexpected orders response from the server.");
        }

        setOrders(orderList);
      } catch (err) {
        if (!active) return;

        if (
          err.message === "Please log in to continue." ||
          !localStorage.getItem("token")
        ) {
          navigate("/login", {
            replace: true,
            state: { from: "/orders" },
          });
          return;
        }

        setError(err.message || "Unable to load your orders.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [navigate]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((previous) => ({
      ...previous,
      [orderId]: !previous[orderId],
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-black tracking-tight text-orange-600"
          >
            <UtensilsCrossed size={26} />
            TAKE IT
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold transition hover:bg-stone-100"
          >
            <ArrowLeft size={16} />
            Continue shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Your account
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              My Orders
            </h1>

            <p className="mt-2 text-stone-500">
              View your orders, payment details, and delivery status.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex w-fit items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
              <Package size={18} />
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-stone-200 bg-white p-8">
            <RefreshCw className="mb-4 animate-spin text-orange-500" size={34} />

            <p className="font-semibold">Loading your orders...</p>

            <p className="mt-1 text-sm text-stone-500">
              Please wait a moment.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Package size={28} />
            </div>

            <h2 className="text-xl font-bold">Couldn't load your orders</h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-stone-500">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {/* Empty orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <ShoppingBag size={36} />
            </div>

            <h2 className="text-2xl font-black">No orders yet</h2>

            <p className="mx-auto mt-3 max-w-md text-stone-500">
              Your next delicious meal is waiting. Explore restaurants and
              place your first order!
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Explore restaurants
              <ShoppingBag size={18} />
            </Link>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderId = order.id;
              const items = Array.isArray(order.items) ? order.items : [];
              const expanded = Boolean(expandedOrders[orderId]);

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Order top section */}
                  <div className="flex flex-col gap-4 border-b border-stone-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-black">
                          Order #{order.orderNumber || order.id}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            order.orderStatus
                          )}`}
                        >
                          {formatStatus(order.orderStatus)}
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                        <Clock size={15} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-stone-500">Order total</p>

                      <p className="mt-1 text-2xl font-black text-orange-600">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Order information */}
                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                        <CreditCard size={20} />
                      </div>

                      <div>
                        <p className="text-sm text-stone-500">Payment method</p>

                        <p className="mt-1 font-bold">
                          {formatStatus(order.paymentMethod)}
                        </p>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            order.paymentStatus
                          )}`}
                        >
                          {formatStatus(order.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                        <MapPin size={20} />
                      </div>

                      <div>
                        <p className="text-sm text-stone-500">
                          Delivery address
                        </p>

                        <p className="mt-1 break-words font-semibold">
                          {order.deliveryAddress || "Address unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                        <Receipt size={20} />
                      </div>

                      <div>
                        <p className="text-sm text-stone-500">Items ordered</p>

                        <p className="mt-1 font-bold">
                          {items.length} {items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order items toggle */}
                  <div className="border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => toggleOrder(orderId)}
                      aria-expanded={expanded}
                      className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-bold transition hover:bg-stone-50 sm:px-6"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-orange-500" />
                        Order items
                      </span>

                      <span className="flex items-center gap-2 text-sm text-stone-500">
                        {expanded ? "Hide items" : "View items"}
                        {expanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </span>
                    </button>

                    {expanded && (
                      <div className="space-y-3 bg-stone-50 px-5 py-4 sm:px-6">
                        {items.length === 0 ? (
                          <p className="text-sm text-stone-500">
                            No item details are available for this order.
                          </p>
                        ) : (
                          items.map((item, index) => (
                            <div
                              key={item.id ?? `${orderId}-${index}`}
                              className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4"
                            >
                              <div>
                                <p className="font-semibold">
                                  {item.dishName ||
                                    item.name ||
                                    item.dish?.name ||
                                    `Item ${index + 1}`}
                                </p>

                                <p className="mt-1 text-sm text-stone-500">
                                  Quantity: {item.quantity ?? 1}
                                </p>
                              </div>

                              <p className="whitespace-nowrap font-bold">
                                {formatCurrency(
                                  item.subtotal ??
                                    Number(item.price ?? item.unitPrice ?? 0) *
                                      Number(item.quantity ?? 1)
                                )}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                  </div>

                  {/* View order details and tracking */}
                  <div className="border-t border-stone-100 p-5 sm:px-6">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      View Order Details & Tracking
                    </Link>
                  </div>

                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-stone-500 sm:px-6">
          © {new Date().getFullYear()} TAKE IT. Made for your cravings.
        </div>
      </footer>
    </div>
  );
}

export default OrdersPage;

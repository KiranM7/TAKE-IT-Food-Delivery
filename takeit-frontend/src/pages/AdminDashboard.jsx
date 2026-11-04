import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    Users,
    UtensilsCrossed,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    LogOut,
    Menu,
    X,
    ArrowUpRight,
    CircleDollarSign,
    Package,
    CalendarDays,
} from "lucide-react";

import { apiRequest } from "../services/api";

const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const number = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value ?? 0));

const dateFormat = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusStyle = (status) => {
    switch (String(status ?? "").toUpperCase()) {
        case "DELIVERED":
        case "PAID":
            return "bg-emerald-50 text-emerald-700";

        case "CONFIRMED":
        case "PLACED":
        case "PENDING":
            return "bg-amber-50 text-amber-700";

        case "PREPARING":
        case "OUT_FOR_DELIVERY":
            return "bg-blue-50 text-blue-700";

        case "CANCELLED":
        case "FAILED":
            return "bg-red-50 text-red-700";

        default:
            return "bg-stone-100 text-stone-600";
    }
};

const readableStatus = (value) =>
    String(value ?? "UNKNOWN")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

const initialStatistics = {
    totalOrders: 0,
    totalRevenue: 0,
    placedOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingPayments: 0,
    paidPayments: 0,
};

const navigation = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Orders", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Restaurants", icon: Store },
    { label: "Customers", icon: Users },
    { label: "Dishes", icon: UtensilsCrossed },
    { label: "Payments", icon: CreditCard },
];

function AdminDashboard() {
    const navigate = useNavigate();

    const [statistics, setStatistics] = useState(initialStatistics);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            if (!localStorage.getItem("token")) {
                navigate("/login", {
                    replace: true,
                    state: { from: "/admin/dashboard" },
                });
                return;
            }

            const [statsResult, ordersResult] = await Promise.all([
                apiRequest("/orders/admin/statistics"),
                apiRequest("/orders/admin/all"),
            ]);

            const stats = {
                ...initialStatistics,
                ...(statsResult ?? {}),
            };

            setStatistics(stats);
            setOrders(Array.isArray(ordersResult) ? ordersResult : []);
            setLastUpdated(new Date());
        } catch (err) {
            const message = err?.message || "Unable to load dashboard data.";

            if (
                message === "Please log in to continue." ||
                message.includes("401") ||
                message.includes("403")
            ) {
                setError(
                    message.includes("403")
                        ? "Access denied. Please log in with an administrator account."
                        : "Your session may have expired. Please log in again."
                );
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
    };

    const pendingOrders =
        Number(statistics.placedOrders ?? 0) +
        Number(statistics.confirmedOrders ?? 0);

    const statCards = [
        {
            label: "Total Orders",
            value: number(statistics.totalOrders),
            icon: ShoppingBag,
            iconStyle: "bg-orange-100 text-orange-600",
            note: "All-time orders",
        },
        {
            label: "Total Revenue",
            value: currency(statistics.totalRevenue),
            icon: CircleDollarSign,
            iconStyle: "bg-emerald-100 text-emerald-700",
            note: "From delivered orders",
        },
        {
            label: "Pending Orders",
            value: number(pendingOrders),
            icon: Clock,
            iconStyle: "bg-amber-100 text-amber-700",
            note: "Placed and confirmed",
        },
        {
            label: "Cancelled Orders",
            value: number(statistics.cancelledOrders),
            icon: XCircle,
            iconStyle: "bg-red-100 text-red-700",
            note: "Orders cancelled",
        },
        {
            label: "Paid Payments",
            value: number(statistics.paidPayments),
            icon: CheckCircle2,
            iconStyle: "bg-green-100 text-green-700",
            note: "Successful payments",
        },
        {
            label: "Pending Payments",
            value: number(statistics.pendingPayments),
            icon: CreditCard,
            iconStyle: "bg-purple-100 text-purple-700",
            note: "Awaiting payment",
        },
    ];

    const statusItems = [
        {
            label: "Placed",
            value: Number(statistics.placedOrders ?? 0),
            color: "bg-amber-400",
        },
        {
            label: "Confirmed",
            value: Number(statistics.confirmedOrders ?? 0),
            color: "bg-orange-400",
        },
        {
            label: "Preparing",
            value: Number(statistics.preparingOrders ?? 0),
            color: "bg-blue-500",
        },
        {
            label: "Out for delivery",
            value: Number(statistics.outForDeliveryOrders ?? 0),
            color: "bg-violet-500",
        },
        {
            label: "Delivered",
            value: Number(statistics.deliveredOrders ?? 0),
            color: "bg-emerald-500",
        },
        {
            label: "Cancelled",
            value: Number(statistics.cancelledOrders ?? 0),
            color: "bg-red-500",
        },
    ];

    const totalStatusOrders = statusItems.reduce(
        (total, item) => total + item.value,
        0
    );

    const recentOrders = [...orders]
        .sort(
            (a, b) =>
                new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, 7);

    const maxStatusValue = Math.max(
        ...statusItems.map((item) => item.value),
        1
    );

    return (
        <div className="min-h-screen bg-[#f6f7fb] text-slate-800">
            {/* Mobile overlay */}
            {mobileSidebarOpen && (
                <button
                    aria-label="Close sidebar"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#171923] text-white transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                            <UtensilsCrossed size={22} />
                        </div>

                        <div>
                            <h1 className="text-xl font-black tracking-wide">TAKE IT</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="text-slate-400 hover:text-white lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="px-4 pt-8">
                    <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Main Menu
                    </p>

                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isAvailable = Boolean(item.path);

                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    disabled={!isAvailable}
                                    title={
                                        isAvailable
                                            ? `Go to ${item.label}`
                                            : `${item.label} page will be built next`
                                    }
                                    onClick={() => {
                                        if (item.path) {
                                            navigate(item.path);
                                            setMobileSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${item.label === "Dashboard"
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-950/20"
                                            : isAvailable
                                                ? "text-slate-300 hover:bg-white/10 hover:text-white"
                                                : "cursor-not-allowed text-slate-400 opacity-80"
                                        }`}
                                >
                                    <Icon size={19} />
                                    {item.label}

                                    {!isAvailable && (
                                        <span className="ml-auto text-[9px] uppercase tracking-wider text-slate-500">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto border-t border-white/10 p-4">
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 font-bold text-orange-400">
                            A
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-bold">Administrator</p>
                            <p className="text-xs text-slate-400">Platform Management</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="min-h-screen lg:ml-64">
                {/* Topbar */}
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileSidebarOpen(true)}
                                className="rounded-lg border border-slate-200 p-2 lg:hidden"
                                aria-label="Open navigation"
                            >
                                <Menu size={21} />
                            </button>

                            <div>
                                <h2 className="text-xl font-black sm:text-2xl">
                                    Dashboard Overview
                                </h2>
                                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                                    Welcome back! Here's what's happening with TAKE IT.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => fetchDashboard(true)}
                                disabled={refreshing || loading}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 sm:px-4"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 md:flex">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                                    A
                                </div>

                                <div>
                                    <p className="text-sm font-bold">Admin</p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="space-y-7 p-4 sm:p-6 lg:p-8">
                    {/* Page intro */}
                    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-slate-500">
                                Overview / Dashboard
                            </p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                                Platform Analytics
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Monitor orders, revenue, and payments in one place.
                            </p>
                        </div>

                        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
                            <CalendarDays size={17} className="text-orange-500" />
                            {new Date().toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>
                    </section>

                    {/* Error */}
                    {error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <p className="font-bold text-red-800">
                                Unable to load dashboard data
                            </p>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                            <button
                                onClick={() => fetchDashboard()}
                                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Statistics cards */}
                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-black">Business Summary</h3>
                            {loading && (
                                <span className="text-xs font-medium text-slate-500">
                                    Loading...
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {statCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <article
                                        key={card.label}
                                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {card.label}
                                                </p>
                                                <p className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                                    {loading ? "—" : card.value}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconStyle}`}
                                            >
                                                <Icon size={23} />
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                                            <span className="text-xs font-medium text-slate-500">
                                                {card.note}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {/* Analytics */}
                    <section className="grid gap-6 xl:grid-cols-5">
                        {/* Order status chart */}
                        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-black">Order Analytics</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Current distribution of orders by status
                                    </p>
                                </div>

                                <div className="rounded-xl bg-orange-50 p-2.5 text-orange-600">
                                    <TrendingUp size={20} />
                                </div>
                            </div>

                            <div className="mt-8 space-y-5">
                                {statusItems.map((item) => {
                                    const percentage =
                                        totalStatusOrders > 0
                                            ? (item.value / totalStatusOrders) * 100
                                            : 0;

                                    return (
                                        <div key={item.label}>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <span className="text-sm font-semibold text-slate-600">
                                                    {item.label}
                                                </span>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400">
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                    <span className="min-w-6 text-right text-sm font-black">
                                                        {number(item.value)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-600">
                                        Orders by status
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Based on current order records
                                    </p>
                                </div>

                                <p className="text-xl font-black text-slate-900">
                                    {number(totalStatusOrders)}
                                </p>
                            </div>
                        </article>

                        {/* Revenue overview */}
                        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-black">Revenue Overview</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Delivered orders only
                                    </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                                    <CircleDollarSign size={21} />
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white sm:p-6">
                                <p className="text-sm font-medium text-orange-100">
                                    Total delivered-order revenue
                                </p>

                                <p className="mt-3 break-words text-3xl font-black sm:text-4xl">
                                    {loading ? "—" : currency(statistics.totalRevenue)}
                                </p>

                                <div className="mt-5 flex items-center gap-2 text-sm text-orange-100">
                                    <TrendingUp size={17} />
                                    <span>
                                        {number(statistics.deliveredOrders)} delivered orders
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                            <CheckCircle2 size={19} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Paid payments</p>
                                            <p className="text-xs text-slate-500">
                                                Successfully paid
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-lg font-black">
                                        {number(statistics.paidPayments)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                                            <Clock size={19} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Pending payments</p>
                                            <p className="text-xs text-slate-500">
                                                Awaiting completion
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-lg font-black">
                                        {number(statistics.pendingPayments)}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                                Revenue is calculated from delivered orders, not all orders
                                or pending payments.
                            </p>
                        </article>
                    </section>

                    {/* Recent orders */}
                    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
                            <div>
                                <h3 className="text-lg font-black">Recent Orders</h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    The latest orders placed on TAKE IT
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                <Package size={17} className="text-orange-500" />
                                {number(orders.length)} total records
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-48 items-center justify-center gap-3 text-slate-500">
                                <RefreshCw size={20} className="animate-spin" />
                                Loading recent orders...
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
                                <div className="rounded-2xl bg-orange-50 p-4 text-orange-500">
                                    <ShoppingBag size={30} />
                                </div>

                                <h4 className="mt-4 font-bold">No orders found</h4>
                                <p className="mt-1 text-sm text-slate-500">
                                    New orders will appear here when customers place them.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                            <th className="px-6 py-4 font-bold">Order ID</th>
                                            <th className="px-6 py-4 font-bold">Customer</th>
                                            <th className="px-6 py-4 font-bold">Date</th>
                                            <th className="px-6 py-4 font-bold">Amount</th>
                                            <th className="px-6 py-4 font-bold">Payment</th>
                                            <th className="px-6 py-4 font-bold">Order Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="transition hover:bg-orange-50/30"
                                            >
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-slate-800">
                                                        #{order.orderNumber || order.id}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
                                                            U
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {order.customerName ||
                                                                    order.userName ||
                                                                    order.user?.fullName ||
                                                                    order.user?.name ||
                                                                    "Customer"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {order.user?.email || order.customerEmail || ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-slate-500">
                                                    {dateFormat(order.createdAt)}
                                                </td>

                                                <td className="px-6 py-5 font-bold text-slate-800">
                                                    {currency(order.totalAmount)}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {readableStatus(order.paymentMethod)}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(
                                                                order.paymentStatus
                                                            )}`}
                                                        >
                                                            {readableStatus(order.paymentStatus)}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(
                                                            order.orderStatus
                                                        )}`}
                                                    >
                                                        {readableStatus(order.orderStatus)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
                            <p className="text-xs text-slate-500">
                                Showing the latest {recentOrders.length} orders
                            </p>

                            <button
                                onClick={() => navigate("/admin/orders")}
                                className="flex items-center gap-2 text-sm font-bold text-orange-600 transition hover:text-orange-700"
                            >
                                Manage orders
                                <ArrowUpRight size={17} />
                            </button>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="flex flex-col justify-between gap-2 pb-2 text-xs text-slate-400 sm:flex-row sm:items-center">
                        <p>© {new Date().getFullYear()} TAKE IT. Admin Panel.</p>

                        <p>
                            {lastUpdated
                                ? `Last updated at ${lastUpdated.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`
                                : "Waiting for dashboard data"}
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
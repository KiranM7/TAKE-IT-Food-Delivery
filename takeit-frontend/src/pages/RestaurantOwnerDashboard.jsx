import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  StoreIcon,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { apiRequest } from "../services/api";

const initialStats = {
  totalRestaurants: 0,
  activeRestaurants: 0,
  inactiveRestaurants: 0,
  totalDishes: 0,
  availableDishes: 0,
  unavailableDishes: 0,
};

const statCards = [
  {
    key: "totalRestaurants",
    title: "Total Restaurants",
    icon: Store,
    description: "Restaurants you manage",
  },
  {
    key: "activeRestaurants",
    title: "Active Restaurants",
    icon: CheckCircle,
    description: "Visible to customers",
  },
  {
    key: "inactiveRestaurants",
    title: "Inactive Restaurants",
    icon: XCircle,
    description: "Currently deactivated",
  },
  {
    key: "totalDishes",
    title: "Total Dishes",
    icon: UtensilsCrossed,
    description: "Across your restaurants",
  },
  {
    key: "availableDishes",
    title: "Available Dishes",
    icon: TrendingUp,
    description: "Available for ordering",
  },
  {
    key: "unavailableDishes",
    title: "Unavailable Dishes",
    icon: StoreIcon,
    description: "Not currently available",
  },
];

export default function RestaurantOwnerDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/owner/restaurants/dashboard");

      setStats({
        totalRestaurants: data.totalRestaurants ?? 0,
        activeRestaurants: data.activeRestaurants ?? 0,
        inactiveRestaurants: data.inactiveRestaurants ?? 0,
        totalDishes: data.totalDishes ?? 0,
        availableDishes: data.availableDishes ?? 0,
        unavailableDishes: data.unavailableDishes ?? 0,
      });
    } catch (err) {
      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
              TAKE IT · Restaurant Partner
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Owner Dashboard
            </h1>

            <p className="mt-2 text-sm text-stone-500 sm:text-base">
              Manage your restaurants and keep track of your dishes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Manage Restaurants Button */}
            <button
              type="button"
              onClick={() => navigate("/owner/restaurants")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              <Store size={18} />
              Manage Restaurants
              <ArrowRight size={18} />
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">Dashboard could not load</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="self-start rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold hover:bg-red-100 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-stone-500">
              <LoaderCircle
                size={36}
                className="animate-spin text-orange-500"
              />
              <p className="text-sm font-medium">
                Loading your dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        {!loading && !error && (
          <>
            <section
              aria-label="Restaurant statistics"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.key}
                    className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-stone-500">
                          {card.title}
                        </p>

                        <p className="mt-3 text-4xl font-extrabold tracking-tight text-stone-900">
                          {stats[card.key].toLocaleString("en-IN")}
                        </p>

                        <p className="mt-3 text-sm text-stone-500">
                          {card.description}
                        </p>
                      </div>

                      <div className="rounded-xl bg-orange-50 p-3 text-orange-600 transition group-hover:bg-orange-100">
                        <Icon size={24} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Summary */}
            <section className="mt-8 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                  <Store size={26} />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-stone-900">
                    Your business at a glance
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    You manage{" "}
                    <strong>{stats.totalRestaurants}</strong>{" "}
                    restaurant(s) with{" "}
                    <strong>{stats.totalDishes}</strong>{" "}
                    dish(es) in total.{" "}
                    <strong>{stats.availableDishes}</strong>{" "}
                    dish(es) are currently available for customers to order.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Plus,
  Pencil,
  Power,
  RefreshCw,
  X,
  MapPin,
  UtensilsCrossed,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { apiRequest } from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  address: "",
  cuisineType: "",
  imageUrl: "",
};

export default function OwnerRestaurantsPage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/owner/restaurants");
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load restaurants.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setNotice("");
  }

  function openEditForm(restaurant) {
    setEditingId(restaurant.id);
    setForm({
      name: restaurant.name ?? "",
      description: restaurant.description ?? "",
      address: restaurant.address ?? "",
      cuisineType: restaurant.cuisineType ?? "",
      imageUrl: restaurant.imageUrl ?? "",
    });
    setFormOpen(true);
    setNotice("");
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const endpoint = editingId
        ? `/owner/restaurants/${editingId}`
        : "/owner/restaurants";

      await apiRequest(endpoint, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      setNotice(
        editingId
          ? "Restaurant updated successfully."
          : "Restaurant created successfully."
      );

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Unable to save restaurant.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRestaurant(restaurant) {
    const isActive = restaurant.active;

    const confirmed = window.confirm(
      isActive
        ? `Deactivate "${restaurant.name}"?`
        : `Reactivate "${restaurant.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      if (isActive) {
        await apiRequest(`/owner/restaurants/${restaurant.id}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest(
          `/owner/restaurants/${restaurant.id}/reactivate`,
          { method: "PATCH" }
        );
      }

      setNotice(
        isActive
          ? "Restaurant deactivated successfully."
          : "Restaurant reactivated successfully."
      );

      await loadRestaurants();
    } catch (err) {
      setError(err.message || "Unable to update restaurant status.");
    }
  }

  const activeCount = restaurants.filter((restaurant) => restaurant.active).length;
  const inactiveCount = restaurants.length - activeCount;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-orange-600">
              TAKE IT · Partner Portal
            </p>

            <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              My Restaurants
            </h1>

            <p className="mt-2 text-stone-500">
              Manage your restaurant profiles and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            <Plus size={19} />
            Add Restaurant
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {notice && !error && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard title="Total Restaurants" value={restaurants.length} />
          <SummaryCard title="Active" value={activeCount} />
          <SummaryCard title="Inactive" value={inactiveCount} />
        </section>

        {formOpen && (
          <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-stone-900">
                {editingId ? "Edit Restaurant" : "Add Restaurant"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="Restaurant Name" required>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    className={inputClass}
                    placeholder="e.g. Spice Garden"
                  />
                </FormField>

                <FormField label="Cuisine Type">
                  <input
                    name="cuisineType"
                    value={form.cuisineType}
                    onChange={handleChange}
                    maxLength={100}
                    className={inputClass}
                    placeholder="e.g. Indian, Chinese"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Address" required>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      rows={2}
                      className={inputClass}
                      placeholder="Full restaurant address"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Description">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      maxLength={1000}
                      rows={3}
                      className={inputClass}
                      placeholder="Describe your restaurant..."
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Restaurant Image URL">
                    <input
                      type="url"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      maxLength={500}
                      className={inputClass}
                      placeholder="https://example.com/restaurant.jpg"
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={18} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Restaurant"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-stone-900">
            Restaurant List
          </h2>

          <button
            type="button"
            onClick={loadRestaurants}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-stone-500">
            <RefreshCw size={22} className="animate-spin text-orange-500" />
            Loading restaurants...
          </div>
        ) : restaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <Store size={42} className="mx-auto text-stone-300" />

            <h3 className="mt-4 text-lg font-bold text-stone-900">
              No restaurants yet
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Add your first restaurant to start managing your menu.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Add Your First Restaurant
            </button>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="h-48 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-orange-50 text-orange-300">
                    <Store size={48} />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">
                        {restaurant.name}
                      </h3>

                      {restaurant.cuisineType && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                          <UtensilsCrossed size={15} />
                          {restaurant.cuisineType}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        restaurant.active
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {restaurant.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {restaurant.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                      {restaurant.description}
                    </p>
                  )}

                  <p className="mt-3 flex items-start gap-2 text-sm text-stone-500">
                    <MapPin size={17} className="mt-0.5 shrink-0" />
                    <span>{restaurant.address}</span>
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(restaurant)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/owner/dishes?restaurantId=${restaurant.id}`)
                      }
                      disabled={!restaurant.active}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-e-amber-700 px-3 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <UtensilsCrossed size={16} />
                      Manage Dishes
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleRestaurant(restaurant)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        restaurant.active
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      <Power size={16} />
                      {restaurant.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SummaryCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-stone-900">
        {value.toLocaleString("en-IN")}
      </p>
    </article>
  );
}

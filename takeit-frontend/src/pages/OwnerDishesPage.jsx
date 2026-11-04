import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


import {
  Plus,
  Pencil,
  Trash2,
  X,
  UtensilsCrossed,
  RefreshCw,
  Search,
  ImageOff,
  Leaf,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from "lucide-react";
import { apiRequest } from "../services/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountedPrice: "",
  imageUrl: "",
  vegetarian: true,
  available: true,
  categoryId: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

function formatPrice(value) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function OwnerDishesPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const restaurantIdFromUrl = searchParams.get("restaurantId");

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    () => String(restaurantIdFromUrl ?? ""),
  );
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingDishId, setEditingDishId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingDishId, setDeletingDishId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedRestaurant = restaurants.find(
    (restaurant) =>
      String(restaurant.id) === String(selectedRestaurantId),
  );

  const activeCategories = useMemo(
    () => categories.filter((category) => category.active),
    [categories],
  );

  const filteredDishes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return dishes;

    return dishes.filter(
      (dish) =>
        dish.name?.toLowerCase().includes(query) ||
        dish.description?.toLowerCase().includes(query) ||
        dish.categoryName?.toLowerCase().includes(query),
    );
  }, [dishes, searchTerm]);

  const stats = useMemo(
    () => ({
      total: dishes.length,
      available: dishes.filter((dish) => dish.available).length,
      vegetarian: dishes.filter((dish) => dish.vegetarian).length,
      unavailable: dishes.filter((dish) => !dish.available).length,
    }),
    [dishes],
  );

  const loadRestaurants = useCallback(async () => {
    setLoadingRestaurants(true);
    setError("");

    try {
      const data = await apiRequest("/owner/restaurants");
      const restaurantList = Array.isArray(data) ? data : [];

      setRestaurants(restaurantList);

      setSelectedRestaurantId((currentId) => {
        if (
          currentId &&
          restaurantList.some(
            (restaurant) => String(restaurant.id) === String(currentId),
          )
        ) {
          return currentId;
        }

        const requestedRestaurant = restaurantList.find(
          (restaurant) =>
            String(restaurant.id) === String(restaurantIdFromUrl),
        );

        return String(
          requestedRestaurant?.id ?? restaurantList[0]?.id ?? "",
        );
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingRestaurants(false);
    }
  }, [restaurantIdFromUrl]);

  const loadMenu = useCallback(async () => {
    if (!selectedRestaurantId) {
      setCategories([]);
      setDishes([]);
      return;
    }

    setLoadingMenu(true);
    setError("");

    try {
      const [categoryData, dishData] = await Promise.all([
        apiRequest(
          `/owner/restaurants/${selectedRestaurantId}/categories`,
        ),
        apiRequest(
          `/owner/restaurants/${selectedRestaurantId}/dishes`,
        ),
      ]);

      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setDishes(Array.isArray(dishData) ? dishData : []);
    } catch (err) {
      setCategories([]);
      setDishes([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingMenu(false);
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function openAddForm() {
    setEditingDishId(null);
    setForm({
      ...EMPTY_FORM,
      categoryId: String(activeCategories[0]?.id ?? ""),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(dish) {
    setEditingDishId(dish.id);
    setForm({
      name: dish.name ?? "",
      description: dish.description ?? "",
      price: String(dish.price ?? ""),
      discountedPrice:
        dish.discountedPrice == null ? "" : String(dish.discountedPrice),
      imageUrl: dish.imageUrl ?? "",
      vegetarian: Boolean(dish.vegetarian),
      available: Boolean(dish.available),
      categoryId: String(dish.categoryId ?? ""),
    });
    setError("");
    setNotice("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingDishId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedRestaurantId) {
      setError("Please select a restaurant.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter a dish name.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    const price = Number(form.price);
    const discountedPrice =
      form.discountedPrice.trim() === ""
        ? null
        : Number(form.discountedPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (
      discountedPrice !== null &&
      (!Number.isFinite(discountedPrice) ||
        discountedPrice <= 0 ||
        discountedPrice > price)
    ) {
      setError("The discounted price must be positive and no greater than the original price.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      discountedPrice,
      imageUrl: form.imageUrl.trim(),
      vegetarian: form.vegetarian,
      available: form.available,
      categoryId: Number(form.categoryId),
    };

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const endpoint =
        `/owner/restaurants/${selectedRestaurantId}/dishes` +
        (editingDishId !== null ? `/${editingDishId}` : "");

      await apiRequest(endpoint, {
        method: editingDishId !== null ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      await loadMenu();
      closeForm();
      setNotice(
        editingDishId !== null
          ? "Dish updated successfully."
          : "Dish added successfully.",
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dish) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${dish.name}"?`,
    );

    if (!confirmed) return;

    setDeletingDishId(dish.id);
    setError("");
    setNotice("");

    try {
      await apiRequest(
        `/owner/restaurants/${selectedRestaurantId}/dishes/${dish.id}`,
        { method: "DELETE" },
      );

      setDishes((current) =>
        current.filter((item) => item.id !== dish.id),
      );

      setNotice(`"${dish.name}" was deleted successfully.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingDishId(null);
    }
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
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
              Restaurant Owner
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Dish Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
              Manage your menu, update prices, and control dish availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            disabled={!selectedRestaurantId || activeCategories.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Add New Dish
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {restaurants.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">
              No restaurants found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add a restaurant first before managing its dishes.
            </p>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <label
                htmlFor="restaurant-select"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Select Restaurant
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  id="restaurant-select"
                  value={selectedRestaurantId}
                  onChange={(event) => {
                    setSelectedRestaurantId(event.target.value);
                    closeForm();
                    setSearchTerm("");
                    setNotice("");
                    setError("");
                  }}
                  className={inputClass}
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    loadRestaurants();
                    loadMenu();
                  }}
                  disabled={loadingMenu}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingMenu ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {selectedRestaurant && (
                <p className="mt-3 text-sm text-gray-500">
                  Managing the menu for{" "}
                  <span className="font-semibold text-gray-800">
                    {selectedRestaurant.name}
                  </span>
                </p>
              )}
            </section>

            <section className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Total Dishes",
                  value: stats.total,
                  icon: UtensilsCrossed,
                  color: "text-orange-600 bg-orange-50",
                },
                {
                  label: "Available",
                  value: stats.available,
                  icon: CheckCircle2,
                  color: "text-green-600 bg-green-50",
                },
                {
                  label: "Vegetarian",
                  value: stats.vegetarian,
                  icon: Leaf,
                  color: "text-emerald-600 bg-emerald-50",
                },
                {
                  label: "Unavailable",
                  value: stats.unavailable,
                  icon: XCircle,
                  color: "text-red-600 bg-red-50",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div
                      className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </section>

            {showForm && (
              <section className="mb-8 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingDishId !== null ? "Edit Dish" : "Add New Dish"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the dish details below.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    aria-label="Close form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {activeCategories.length === 0 ? (
                  <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    This restaurant has no active categories. Create a category
                    before adding dishes.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Dish Name *
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={updateField}
                          required
                          maxLength={120}
                          placeholder="e.g. Paneer Tikka"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Category *
                        </label>
                        <select
                          name="categoryId"
                          value={form.categoryId}
                          onChange={updateField}
                          required
                          className={inputClass}
                        >
                          <option value="">Select category</option>
                          {activeCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Original Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={updateField}
                          min="0.01"
                          step="0.01"
                          required
                          placeholder="249.00"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Discounted Price (₹)
                        </label>
                        <input
                          type="number"
                          name="discountedPrice"
                          value={form.discountedPrice}
                          onChange={updateField}
                          min="0.01"
                          step="0.01"
                          placeholder="Optional"
                          className={inputClass}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={form.imageUrl}
                          onChange={updateField}
                          placeholder="https://example.com/dish.jpg"
                          className={inputClass}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={updateField}
                          rows={3}
                          maxLength={1000}
                          placeholder="Describe the dish and its ingredients..."
                          className={`${inputClass} resize-y`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:gap-8">
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="vegetarian"
                          checked={form.vegetarian}
                          onChange={updateField}
                          className="h-4 w-4 accent-green-600"
                        />
                        Vegetarian
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          name="available"
                          checked={form.available}
                          onChange={updateField}
                          className="h-4 w-4 accent-orange-500"
                        />
                        Available for ordering
                      </label>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={closeForm}
                        disabled={saving}
                        className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving || activeCategories.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                      >
                        {saving && (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        )}
                        {saving
                          ? "Saving..."
                          : editingDishId !== null
                            ? "Save Changes"
                            : "Add Dish"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            )}

            <section>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Menu
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredDishes.length}{" "}
                    {filteredDishes.length === 1 ? "dish" : "dishes"} found
                  </p>
                </div>

                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search dishes..."
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {loadingMenu ? (
                <div className="flex min-h-48 items-center justify-center gap-3 text-gray-500">
                  <LoaderCircle className="h-6 w-6 animate-spin text-orange-500" />
                  Loading menu...
                </div>
              ) : filteredDishes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                  <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {searchTerm ? "No matching dishes" : "Your menu is empty"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                    {searchTerm
                      ? "Try another search term."
                      : "Add your first dish to start building your restaurant menu."}
                  </p>

                  {!searchTerm && activeCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={openAddForm}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Dish
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredDishes.map((dish) => (
                    <article
                      key={dish.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative h-48 bg-gray-100">
                        {dish.imageUrl ? (
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-300">
                            <ImageOff className="h-12 w-12" />
                          </div>
                        )}

                        <span
                          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${dish.available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {dish.available ? "Available" : "Unavailable"}
                        </span>

                        <span
                          className={`absolute right-3 top-3 rounded-md border-2 bg-white p-1 ${dish.vegetarian
                              ? "border-green-600"
                              : "border-red-600"
                            }`}
                          title={dish.vegetarian ? "Vegetarian" : "Non-vegetarian"}
                        >
                          <span
                            className={`block h-2.5 w-2.5 rounded-full ${dish.vegetarian ? "bg-green-600" : "bg-red-600"
                              }`}
                          />
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            {dish.name}
                          </h3>
                          <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                            {dish.categoryName || "Uncategorized"}
                          </span>
                        </div>

                        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                          {dish.description || "No description provided."}
                        </p>

                        <div className="mb-5 flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-gray-900">
                            {formatPrice(dish.discountedPrice ?? dish.price)}
                          </span>

                          {dish.discountedPrice != null &&
                            Number(dish.discountedPrice) <
                            Number(dish.price) && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(dish.price)}
                              </span>
                            )}
                        </div>

                        <div className="flex gap-3 border-t border-gray-100 pt-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/owner/dishes/edit?restaurantId=${selectedRestaurantId}&dishId=${dish.id}`
                              )
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(dish)}
                            disabled={deletingDishId === dish.id}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingDishId === dish.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default OwnerDishesPage;

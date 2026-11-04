import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cartService } from "../services/cartService";
import {
  ArrowLeft,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  Clock,
  Star,
  UtensilsCrossed,
  LoaderCircle,
  AlertCircle,
  Leaf,
  X,
} from "lucide-react";

import { restaurantService } from "../services/restaurantService";
import { dishService } from "../services/dishService";

const FALLBACK_RESTAURANT_IMAGE =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85";

const FALLBACK_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

const categories = [
  "All",
  "Biryani",
  "Starters",
  "Main Course",
  "Pizza",
  "Burgers",
  "Chinese",
  "Desserts",
  "Beverages",
];

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(price ?? 0));
}

function FoodCard({ dish, quantity, onAdd, onRemove }) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    !imageFailed && dish.imageUrl ? dish.imageUrl : FALLBACK_FOOD_IMAGE;

  const currentPrice = Number(dish.discountedPrice ?? dish.price ?? 0);
  const originalPrice = Number(dish.price ?? 0);
  const hasDiscount =
    dish.discountedPrice != null && currentPrice < originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={dish.name}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
            dish.vegetarian
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {dish.vegetarian ? "● VEG" : "● NON-VEG"}
        </span>

        {discountPercentage > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-stone-900">
            {dish.name}
          </h3>

          <span className="shrink-0 rounded-lg border border-green-200 px-2 py-1 text-xs font-bold text-green-700">
            {dish.vegetarian ? "VEG" : "NON-VEG"}
          </span>
        </div>

        <p className="mb-3 line-clamp-2 min-h-10 text-sm leading-5 text-stone-500">
          {dish.description || "Freshly prepared with delicious ingredients."}
        </p>

        <p className="mb-4 text-sm text-stone-400">
          {dish.category?.name || "Chef's Special"}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-stone-900">
              {formatPrice(currentPrice)}
            </p>

            {hasDiscount && (
              <p className="text-xs text-stone-400 line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              disabled={dish.available === false}
              onClick={() => onAdd(dish)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              <Plus size={16} />
              {dish.available === false ? "Unavailable" : "Add"}
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-1">
              <button
                type="button"
                aria-label={`Remove one ${dish.name}`}
                onClick={() => onRemove(dish.id)}
                className="rounded-lg bg-white p-2 text-orange-600 shadow-sm hover:bg-orange-100"
              >
                <Minus size={16} />
              </button>

              <span className="min-w-4 text-center font-extrabold text-stone-900">
                {quantity}
              </span>

              <button
                type="button"
                aria-label={`Add one ${dish.name}`}
                onClick={() => onAdd(dish)}
                className="rounded-lg bg-orange-500 p-2 text-white hover:bg-orange-600"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurantImageFailed, setRestaurantImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setError("");

      try {
        const [restaurantData, dishData] = await Promise.all([
          restaurantService.getById(restaurantId),
          dishService.getByRestaurant(restaurantId),
        ]);

        if (cancelled) return;

        setRestaurant(restaurantData);
        setDishes(Array.isArray(dishData) ? dishData : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load this restaurant.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        dish.name?.toLowerCase().includes(searchText) ||
        dish.description?.toLowerCase().includes(searchText) ||
        dish.category?.name?.toLowerCase().includes(searchText);

      const matchesCategory =
        selectedCategory === "All" ||
        dish.category?.name?.toLowerCase() ===
          selectedCategory.toLowerCase();

      const matchesVegetarian = !vegOnly || dish.vegetarian === true;

      return matchesSearch && matchesCategory && matchesVegetarian;
    });
  }, [dishes, search, selectedCategory, vegOnly]);

  const cartItems = useMemo(() => {
    return dishes
      .filter((dish) => (cart[dish.id] || 0) > 0)
      .map((dish) => ({
        ...dish,
        quantity: cart[dish.id],
        itemPrice: Number(dish.discountedPrice ?? dish.price ?? 0),
      }));
  }, [dishes, cart]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.itemPrice * item.quantity,
    0
  );

async function addToCart(dish) {
  if (dish.available === false) return;

  // Login is required before saving items to the backend cart.
  if (!localStorage.getItem("token")) {
    navigate("/login", {
      state: {
        message: "Please log in before adding items to your cart.",
        from: {
          pathname: `/restaurant/${restaurantId}`,
        },
      },
    });

    return;
  }

  try {
    // Save the selected dish in the backend cart.
    await cartService.addItem(dish.id, 1);

    // Update the visible quantity after the backend confirms success.
    setCart((previous) => ({
      ...previous,
      [dish.id]: (previous[dish.id] || 0) + 1,
    }));
  } catch (err) {
    window.alert(err.message || "Unable to add this dish to your cart.");
  }
}


  function removeFromCart(dishId) {
    setCart((previous) => {
      const updated = { ...previous };
      const currentQuantity = updated[dishId] || 0;

      if (currentQuantity <= 1) {
        delete updated[dishId];
      } else {
        updated[dishId] = currentQuantity - 1;
      }

      return updated;
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-orange-500"
          />
          <p className="mt-4 font-semibold text-stone-600">
            Preparing your menu...
          </p>
        </div>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5">
        <div className="max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle size={44} className="mx-auto text-red-500" />

          <h1 className="mt-4 text-2xl font-black text-stone-900">
            Restaurant unavailable
          </h1>

          <p className="mt-2 text-stone-500">
            {error || "We couldn't find this restaurant."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
          >
            Back to restaurants
          </button>
        </div>
      </main>
    );
  }

  const restaurantImage =
    !restaurantImageFailed && restaurant.imageUrl
      ? restaurant.imageUrl
      : FALLBACK_RESTAURANT_IMAGE;

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-28 text-stone-900">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-bold text-stone-600 transition hover:text-orange-600"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to restaurants</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-2xl font-black tracking-tight"
            aria-label="TAKE IT home"
          >
            TAKE<span className="text-orange-500">IT.</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-600">
            <ShoppingBag size={18} />
            {cartCount}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        {/* Restaurant hero */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="relative h-56 sm:h-72 lg:h-80">
            <img
              src={restaurantImage}
              alt={restaurant.name}
              onError={() => setRestaurantImageFailed(true)}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                <UtensilsCrossed size={14} />
                RESTAURANT
              </span>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {restaurant.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
                {restaurant.description || "Delicious food, freshly prepared."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <MapPin size={20} />
              </span>
              <div>
                <p className="text-xs text-stone-500">Location</p>
                <p className="font-bold">
                  {restaurant.address || "Location not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <UtensilsCrossed size={20} />
              </span>
              <div>
                <p className="text-xs text-stone-500">Cuisine</p>
                <p className="font-bold">
                  {restaurant.cuisineType || "Various cuisines"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <Clock size={20} />
              </span>
              <div>
                <p className="text-xs text-stone-500">Menu</p>
                <p className="font-bold">
                  {dishes.length} {dishes.length === 1 ? "dish" : "dishes"}{" "}
                  available
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Menu heading */}
        <section className="mb-6 mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Freshly prepared for you
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Explore our menu<span className="text-orange-500">.</span>
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Discover your next favourite dish.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-600 shadow-sm sm:self-auto">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              Made fresh to order
            </div>
          </div>
        </section>

        {/* Search and filters */}
        <section className="mb-7 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search biryani, starters, desserts..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-12 pr-10 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setVegOnly((value) => !value)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                vegOnly
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-stone-200 text-stone-600 hover:border-green-300"
              }`}
            >
              <Leaf size={17} />
              Vegetarian only
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  selectedCategory === category
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-stone-100 text-stone-600 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Dish cards */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black sm:text-2xl">
              {selectedCategory === "All"
                ? "Popular dishes"
                : selectedCategory}
            </h2>

            <span className="text-sm font-medium text-stone-500">
              {filteredDishes.length}{" "}
              {filteredDishes.length === 1 ? "item" : "items"}
            </span>
          </div>

          {filteredDishes.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDishes.map((dish) => (
                <FoodCard
                  key={dish.id}
                  dish={dish}
                  quantity={cart[dish.id] || 0}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-5 py-14 text-center">
              <Search size={40} className="mx-auto text-stone-300" />

              <h3 className="mt-4 text-xl font-extrabold">
                No dishes found
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Try another search or choose a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setVegOnly(false);
                }}
                className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Cart summary */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-stone-950 p-4 text-white shadow-2xl sm:px-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-300">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
              </p>

              <p className="mt-1 text-xl font-black">
                {formatPrice(cartTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 sm:px-7"
            >
              <ShoppingBag size={18} />
              View cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

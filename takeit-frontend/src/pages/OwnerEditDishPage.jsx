import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
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

export default function OwnerEditDishPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const restaurantId = searchParams.get("restaurantId");
  const dishId = searchParams.get("dishId");

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDish() {
      if (!restaurantId || !dishId) {
        setError("Restaurant ID or dish ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const [categoryData, dishData] = await Promise.all([
          apiRequest(`/owner/restaurants/${restaurantId}/categories`),
          apiRequest(`/owner/restaurants/${restaurantId}/dishes`),
        ]);

        const categoryList = Array.isArray(categoryData) ? categoryData : [];
        const dishList = Array.isArray(dishData) ? dishData : [];
        const dish = dishList.find((item) => String(item.id) === String(dishId));

        if (!dish) throw new Error("Dish was not found.");

        if (!cancelled) {
          setCategories(categoryList.filter((category) => category.active));
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
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load dish.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDish();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, dishId]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const price = Number(form.price);
    const discountedPrice =
      form.discountedPrice.trim() === "" ? null : Number(form.discountedPrice);

    if (!form.name.trim()) return setError("Enter a dish name.");
    if (!form.categoryId) return setError("Select a category.");
    if (!Number.isFinite(price) || price <= 0)
      return setError("Enter a valid price greater than zero.");
    if (
      discountedPrice !== null &&
      (!Number.isFinite(discountedPrice) ||
        discountedPrice <= 0 ||
        discountedPrice > price)
    ) {
      return setError("Discounted price must be positive and no greater than the original price.");
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
    try {
      await apiRequest(`/owner/restaurants/${restaurantId}/dishes/${dishId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      navigate(`/owner/dishes?restaurantId=${restaurantId}`, {
        state: { notice: "Dish updated successfully." },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update dish.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <LoaderCircle className="h-6 w-6 animate-spin text-orange-500" />
        Loading dish...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(`/owner/dishes?restaurantId=${restaurantId || ""}`)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </button>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Dish</h1>
          <p className="mt-2 text-sm text-gray-500">Update the dish details and price.</p>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Dish name">
                <input name="name" value={form.name} onChange={updateField} required maxLength={120} className={inputClass} />
              </Field>
              <Field label="Category">
                <select name="categoryId" value={form.categoryId} onChange={updateField} required className={inputClass}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Original price (₹)">
                <input type="number" name="price" min="0.01" step="0.01" value={form.price} onChange={updateField} required className={inputClass} />
              </Field>
              <Field label="Discounted price (₹), optional">
                <input type="number" name="discountedPrice" min="0.01" step="0.01" value={form.discountedPrice} onChange={updateField} className={inputClass} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Image URL">
                  <input type="url" name="imageUrl" value={form.imageUrl} onChange={updateField} className={inputClass} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea name="description" rows={4} maxLength={1000} value={form.description} onChange={updateField} className={`${inputClass} resize-y`} />
                </Field>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 rounded-xl bg-gray-50 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" name="vegetarian" checked={form.vegetarian} onChange={updateField} className="accent-green-600" />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input type="checkbox" name="available" checked={form.available} onChange={updateField} className="accent-orange-500" />
                Available for ordering
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate(`/owner/dishes?restaurantId=${restaurantId || ""}`)} className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving || categories.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ShoppingBag,
    Plus,
    Minus,
    Trash2,
    LoaderCircle,
    ShoppingCart,
    AlertCircle,
} from "lucide-react";

import { cartService } from "../services/cartService";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

export default function CartPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busyItemId, setBusyItemId] = useState(null);
    const [error, setError] = useState("");

    const loadCart = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await cartService.getCart();

            setItems(Array.isArray(data?.items) ? data.items : []);
            setTotal(Number(data?.total ?? 0));
        } catch (err) {
            setError(err.message || "Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    async function changeQuantity(item, quantity) {
        setError("");
        setBusyItemId(item.id);

        try {
            if (quantity <= 0) {
                await cartService.removeItem(item.id);
            } else {
                await cartService.updateQuantity(item.id, quantity);
            }

            await loadCart();
        } catch (err) {
            setError(err.message || "Unable to update the cart.");
        } finally {
            setBusyItemId(null);
        }
    }

    async function removeItem(item) {
        setError("");
        setBusyItemId(item.id);

        try {
            await cartService.removeItem(item.id);
            await loadCart();
        } catch (err) {
            setError(err.message || "Unable to remove this item.");
        } finally {
            setBusyItemId(null);
        }
    }

    async function clearCart() {
        if (!window.confirm("Remove all items from your cart?")) return;

        setError("");

        try {
            await cartService.clearCart();
            setItems([]);
            setTotal(0);
        } catch (err) {
            setError(err.message || "Unable to clear the cart.");
        }
    }

    const itemCount = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-stone-50">
                <div className="text-center">
                    <LoaderCircle className="mx-auto animate-spin text-orange-500" size={40} />
                    <p className="mt-3 font-semibold text-stone-600">
                        Loading your cart...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#faf9f6] pb-12">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 font-semibold text-stone-600 hover:text-orange-600"
                    >
                        <ArrowLeft size={18} />
                        Continue shopping
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-2xl font-black"
                    >
                        TAKE<span className="text-orange-500">IT.</span>
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-5 py-10">
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                        Your order
                    </p>

                    <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
                        Shopping cart
                    </h1>

                    <p className="mt-2 text-stone-500">
                        {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p>{error}</p>

                            {error.toLowerCase().includes("log in") && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="mt-2 font-bold underline"
                                >
                                    Go to login
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={loadCart}
                                className="ml-3 font-bold underline"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {items.length === 0 ? (
                    <section className="rounded-3xl border border-stone-200 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                            <ShoppingCart size={36} />
                        </div>

                        <h2 className="mt-6 text-2xl font-black text-stone-900">
                            Your cart is empty
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-stone-500">
                            Discover delicious dishes from our restaurants and add your
                            favourites to your cart.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-7 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                        >
                            Explore restaurants
                        </button>
                    </section>
                ) : (
                    <div className="grid items-start gap-7 lg:grid-cols-[1fr_360px]">
                        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                                <h2 className="font-extrabold text-stone-900">
                                    Cart items
                                </h2>

                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={16} />
                                    Clear cart
                                </button>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {items.map((item) => {
                                    const unitPrice = Number(
                                        item.discountedPrice ?? item.price ?? 0
                                    );

                                    const itemTotal = Number(
                                        item.itemTotal ?? unitPrice * item.quantity
                                    );

                                    const isBusy = busyItemId === item.id;

                                    return (
                                        <article
                                            key={item.id}
                                            className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-center ${isBusy ? "opacity-60" : ""
                                                }`}
                                        >
                                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-orange-50">
                                                <img
                                                    src={item.imageUrl || "/food-placeholder.svg"}
                                                    alt={item.dishName}
                                                    className="h-full w-full object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.onerror = null;
                                                        event.currentTarget.src = "/food-placeholder.svg";
                                                    }}
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-extrabold text-stone-900">
                                                    {item.dishName}
                                                </h3>

                                                <p className="mt-1 text-sm text-stone-500">
                                                    {item.restaurantName}
                                                </p>

                                                <p className="mt-2 font-bold text-orange-600">
                                                    {money(unitPrice)}
                                                    <span className="ml-1 text-xs font-normal text-stone-400">
                                                        per item
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                <div className="flex items-center gap-3 rounded-xl border border-stone-200 p-1">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        aria-label={`Decrease ${item.dishName} quantity`}
                                                        onClick={() =>
                                                            changeQuantity(item, item.quantity - 1)
                                                        }
                                                        className="rounded-lg p-2 text-stone-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                                                    >
                                                        <Minus size={15} />
                                                    </button>

                                                    <span className="min-w-5 text-center font-bold">
                                                        {item.quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        aria-label={`Increase ${item.dishName} quantity`}
                                                        onClick={() =>
                                                            changeQuantity(item, item.quantity + 1)
                                                        }
                                                        className="rounded-lg p-2 text-stone-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50"
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-stone-900">
                                                        {money(itemTotal)}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        aria-label={`Remove ${item.dishName}`}
                                                        onClick={() => removeItem(item)}
                                                        className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                            <h2 className="text-xl font-black text-stone-900">
                                Order summary
                            </h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between gap-3 text-sm text-stone-600">
                                    <span>Items ({itemCount})</span>
                                    <span>{money(total)}</span>
                                </div>

                                <div className="flex justify-between gap-3 text-sm text-stone-600">
                                    <span>Delivery fee</span>
                                    <span className="font-semibold text-green-600">
                                        Calculated at checkout
                                    </span>
                                </div>

                                <div className="border-t border-dashed border-stone-200 pt-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-bold text-stone-900">
                                            Subtotal
                                        </span>

                                        <span className="text-2xl font-black text-stone-900">
                                            {money(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const token = localStorage.getItem("token");

                                    if (!token) {
                                        navigate("/login", {
                                            state: {
                                                message: "Please log in before checking out.",
                                                from: { pathname: "/checkout" },
                                            },
                                        });
                                        return;
                                    }

                                    navigate("/checkout");
                                }}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600"
                            >
                                Proceed to checkout
                                <ArrowLeft className="rotate-180" size={18} />
                            </button>

                            <p className="mt-4 text-center text-xs leading-5 text-stone-400">
                                Delivery charges and payment options will be confirmed at
                                checkout.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}

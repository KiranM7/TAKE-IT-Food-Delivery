import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    CreditCard,
    Banknote,
    ShieldCheck,
    ShoppingBag,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    Utensils,
} from "lucide-react";

import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [successOrder, setSuccessOrder] = useState(null);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
    });

    const [paymentMethod, setPaymentMethod] = useState("COD");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login", {
                replace: true,
                state: {
                    message: "Please log in before checking out.",
                    from: { pathname: "/checkout" },
                },
            });
            return;
        }

        let cancelled = false;

        async function loadCheckout() {
            try {
                setLoading(true);
                setError("");

                const data = await cartService.getCart();

                if (cancelled) return;

                const cartItems = Array.isArray(data?.items) ? data.items : [];

                setItems(cartItems);
                setCartTotal(Number(data?.total ?? 0));

                if (cartItems.length === 0) {
                    setError("Your cart is empty. Add some dishes before checking out.");
                }

                const savedAddress = localStorage.getItem("deliveryAddress") || "";
                const savedPhone = localStorage.getItem("deliveryPhone") || "";

                setForm((previous) => ({
                    ...previous,
                    address: savedAddress,
                    phone: savedPhone,
                }));
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Unable to load your cart.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadCheckout();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    const itemCount = items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    const deliveryFee = 0;
    const grandTotal = cartTotal + deliveryFee;

    async function handlePlaceOrder(event) {
        event.preventDefault();
        setError("");

        if (!localStorage.getItem("token")) {
            navigate("/login", {
                state: {
                    message: "Please log in to place your order.",
                    from: { pathname: "/checkout" },
                },
            });
            return;
        }

        if (items.length === 0) {
            setError("Your cart is empty. Please add dishes before ordering.");
            return;
        }

        if (
            !form.fullName.trim() ||
            !form.phone.trim() ||
            !form.address.trim() ||
            !form.city.trim() ||
            !form.state.trim() ||
            !form.pincode.trim()
        ) {
            setError("Please complete all required delivery details.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!/^\d{6}$/.test(form.pincode.trim())) {
            setError("Enter a valid 6-digit Indian PIN code.");
            return;
        }

        const deliveryAddress = [
            form.fullName.trim(),
            form.phone.trim(),
            form.address.trim(),
            form.landmark.trim(),
            form.city.trim(),
            form.state.trim(),
            `PIN: ${form.pincode.trim()}`,
        ]
            .filter(Boolean)
            .join(", ");

        try {
            setPlacingOrder(true);

            // CASH ON DELIVERY
            if (paymentMethod === "COD") {
                const order = await orderService.createOrder(
                    "COD",
                    deliveryAddress
                );

                localStorage.setItem(
                    "deliveryAddress",
                    form.address.trim()
                );

                localStorage.setItem(
                    "deliveryPhone",
                    form.phone.trim()
                );

                setSuccessOrder(order);
                setItems([]);
                setCartTotal(0);
                setPlacingOrder(false);

                return;
            }

            // LOAD RAZORPAY CHECKOUT
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error(
                    "Unable to load Razorpay. Please check your internet connection."
                );
            }

            // CREATE PAYMENT ORDER ON THE BACKEND
            const razorpayOrder =
                await orderService.createRazorpayOrder(
                    deliveryAddress
                );

            // OPEN RAZORPAY CHECKOUT
            const options = {
                key: razorpayOrder.keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "TAKE IT",
                description: "Food order payment",
                order_id: razorpayOrder.razorpayOrderId,

                prefill: {
                    name: form.fullName,
                    contact: form.phone,
                },

                theme: {
                    color: "#f97316",
                },

                // VERIFY PAYMENT WITH THE BACKEND
                handler: async (paymentResponse) => {
                    try {
                        const verifiedOrder =
                            await orderService.verifyRazorpayPayment({
                                orderId: razorpayOrder.orderId,
                                razorpayPaymentId:
                                    paymentResponse.razorpay_payment_id,
                                razorpaySignature:
                                    paymentResponse.razorpay_signature,
                            });

                        localStorage.setItem(
                            "deliveryAddress",
                            form.address.trim()
                        );

                        localStorage.setItem(
                            "deliveryPhone",
                            form.phone.trim()
                        );

                        setSuccessOrder(verifiedOrder);
                        setItems([]);
                        setCartTotal(0);
                        setError("");
                    } catch (err) {
                        setError(
                            err.message ||
                            "Payment verification failed. Please contact support before retrying."
                        );
                    } finally {
                        setPlacingOrder(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setPlacingOrder(false);
                    },
                },
            };

            const checkout = new window.Razorpay(options);

            checkout.on("payment.failed", (response) => {
                setError(
                    response.error?.description ||
                    "Payment failed. Please try again."
                );

                setPlacingOrder(false);
            });

            checkout.open();
        } catch (err) {
            setError(
                err.message ||
                "Unable to place your order. Please try again."
            );

            setPlacingOrder(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
                <div className="text-center">
                    <LoaderCircle
                        className="mx-auto animate-spin text-orange-500"
                        size={42}
                    />
                    <p className="mt-4 font-semibold text-stone-600">
                        Preparing your checkout...
                    </p>
                </div>
            </main>
        );
    }

    if (successOrder) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-12">
                <section className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-xl sm:p-12">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <CheckCircle2 size={44} />
                    </div>

                    <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-green-600">
                        Order confirmed
                    </p>

                    <h1 className="mt-3 text-3xl font-black text-stone-900">
                        Thank you for ordering!
                    </h1>

                    <p className="mt-3 leading-7 text-stone-500">
                        Your order has been placed successfully. Please keep your phone
                        available for delivery updates.
                    </p>

                    <div className="mt-8 rounded-2xl bg-stone-50 p-5 text-left">
                        <div className="flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
                            <span className="text-sm text-stone-500">Order number</span>
                            <span className="font-extrabold text-stone-900">
                                {successOrder.orderNumber || `#${successOrder.id}`}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-b border-stone-200 py-4">
                            <span className="text-sm text-stone-500">Payment method</span>
                            <span className="font-bold text-stone-900">
                                {successOrder.paymentMethod === "RAZORPAY"
                                    ? "Razorpay"
                                    : "Cash on Delivery"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-4">
                            <span className="text-sm text-stone-500">Order total</span>
                            <span className="text-xl font-black text-orange-600">
                                {money(successOrder.totalAmount)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="rounded-xl bg-orange-500 px-5 py-3.5 font-extrabold text-white transition hover:bg-orange-600"
                        >
                            Continue shopping
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/orders")}
                            className="rounded-xl border border-stone-200 px-5 py-3.5 font-extrabold text-stone-700 transition hover:bg-stone-50"
                        >
                            View my orders
                        </button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#faf9f6] pb-14">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
                    <button
                        type="button"
                        onClick={() => navigate("/cart")}
                        className="flex items-center gap-2 font-semibold text-stone-600 transition hover:text-orange-600"
                    >
                        <ArrowLeft size={18} />
                        Back to cart
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="text-2xl font-black tracking-tight text-stone-900"
                    >
                        TAKE<span className="text-orange-500">IT.</span>
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-5 py-10">
                <div className="mb-9">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                        Almost there
                    </p>

                    <h1 className="mt-2 text-3xl font-black text-stone-900 sm:text-4xl">
                        Checkout
                    </h1>

                    <p className="mt-2 text-stone-500">
                        Confirm your delivery details and place your order.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p>{error}</p>

                            {items.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="mt-2 font-bold underline"
                                >
                                    Explore restaurants
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={handlePlaceOrder}>
                    <div className="grid items-start gap-7 lg:grid-cols-[1fr_390px]">
                        <div className="space-y-7">
                            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-7 flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <MapPin size={23} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-stone-900">
                                            Delivery details
                                        </h2>
                                        <p className="mt-1 text-sm text-stone-500">
                                            Where should we deliver your food?
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            Full name *
                                        </span>
                                        <input
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            autoComplete="name"
                                            maxLength={100}
                                            required
                                            placeholder="Enter your full name"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            Mobile number *
                                        </span>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            autoComplete="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            required
                                            placeholder="10-digit mobile number"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            House number, street and area *
                                        </span>
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            autoComplete="street-address"
                                            maxLength={300}
                                            required
                                            rows={3}
                                            placeholder="Flat/house number, building, street, area"
                                            className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block sm:col-span-2">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            Landmark (optional)
                                        </span>
                                        <input
                                            name="landmark"
                                            value={form.landmark}
                                            onChange={handleChange}
                                            maxLength={150}
                                            placeholder="Near a shop, school, or other landmark"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            City *
                                        </span>
                                        <input
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            autoComplete="address-level2"
                                            maxLength={100}
                                            required
                                            placeholder="Your city"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            State *
                                        </span>
                                        <input
                                            name="state"
                                            value={form.state}
                                            onChange={handleChange}
                                            autoComplete="address-level1"
                                            maxLength={100}
                                            required
                                            placeholder="Your state"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="mb-2 block text-sm font-bold text-stone-700">
                                            PIN code *
                                        </span>
                                        <input
                                            name="pincode"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            autoComplete="postal-code"
                                            inputMode="numeric"
                                            maxLength={6}
                                            required
                                            placeholder="6-digit PIN code"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                                        />
                                    </label>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                                <div className="mb-6 flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <CreditCard size={23} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-black text-stone-900">
                                            Payment method
                                        </h2>
                                        <p className="mt-1 text-sm text-stone-500">
                                            Choose how you want to pay.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label
                                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${paymentMethod === "COD"
                                                ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                                                : "border-stone-200 hover:border-stone-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === "COD"}
                                            onChange={() => setPaymentMethod("COD")}
                                            className="h-4 w-4 accent-orange-500"
                                        />

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                                            <Banknote size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-extrabold text-stone-900">
                                                Cash on Delivery
                                            </p>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Pay when your order arrives.
                                            </p>
                                        </div>

                                        <ShieldCheck className="text-green-600" size={22} />
                                    </label>

                                    <label
                                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${paymentMethod === "RAZORPAY"
                                                ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                                                : "border-stone-200 hover:border-stone-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="RAZORPAY"
                                            checked={paymentMethod === "RAZORPAY"}
                                            onChange={() => setPaymentMethod("RAZORPAY")}
                                            className="h-4 w-4 accent-orange-500"
                                        />

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                                            <CreditCard size={23} />
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-extrabold text-stone-900">
                                                Pay Online with Razorpay
                                            </p>
                                            <p className="mt-1 text-sm text-stone-500">
                                                Secure online payment through Razorpay.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </section>
                        </div>

                        <aside className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <ShoppingBag size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-stone-900">
                                        Order summary
                                    </h2>
                                    <p className="text-sm text-stone-500">
                                        {itemCount} {itemCount === 1 ? "item" : "items"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 max-h-72 space-y-4 overflow-y-auto">
                                {items.map((item) => {
                                    const unitPrice = Number(
                                        item.discountedPrice ?? item.price ?? 0
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3"
                                        >
                                            <img
                                                src={item.imageUrl || FALLBACK_IMAGE}
                                                alt={item.dishName || "Food"}
                                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = FALLBACK_IMAGE;
                                                }}
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-stone-900">
                                                    {item.dishName}
                                                </p>
                                                <p className="mt-1 text-xs text-stone-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>

                                            <span className="text-sm font-extrabold text-stone-900">
                                                {money(
                                                    item.itemTotal ?? unitPrice * Number(item.quantity)
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 space-y-4 border-t border-stone-100 pt-5">
                                <div className="flex justify-between gap-3 text-sm text-stone-600">
                                    <span>Item subtotal</span>
                                    <span>{money(cartTotal)}</span>
                                </div>

                                <div className="flex justify-between gap-3 text-sm text-stone-600">
                                    <span>Delivery fee</span>
                                    <span className="font-semibold text-green-600">
                                        Free
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3 border-t border-dashed border-stone-200 pt-5">
                                    <span className="font-bold text-stone-900">
                                        Total payable
                                    </span>
                                    <span className="text-2xl font-black text-orange-600">
                                        {money(grandTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={placingOrder || items.length === 0}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-extrabold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {placingOrder ? (
                                    <>
                                        <LoaderCircle className="animate-spin" size={19} />
                                        Placing order...
                                    </>
                                ) : (
                                    <>
                                        <Utensils size={19} />
                                        Place order · {money(grandTotal)}
                                    </>
                                )}
                            </button>

                            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-stone-400">
                                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                                <p>
                                    Your order will be submitted securely using your account.
                                    For COD, payment is due on delivery.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/cart")}
                                className="mt-5 w-full text-sm font-bold text-stone-500 transition hover:text-orange-600"
                            >
                                Return to cart
                            </button>
                        </aside>
                    </div>
                </form>
            </div>
        </main>
    );
}
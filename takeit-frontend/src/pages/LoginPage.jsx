
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UtensilsCrossed,
  UserRound,
  Store,
  ShieldCheck,
} from "lucide-react";

import { authService } from "../services/authService";

const ROLES = [
  {
    value: "USER",
    label: "User",
    description: "Order delicious food",
    icon: UserRound,
  },
  {
    value: "RESTAURANT_OWNER",
    label: "Restaurant Owner",
    description: "Manage your restaurant",
    icon: Store,
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Manage TAKE IT",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [role, setRole] = useState("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    location.state?.message || ""
  );

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password: form.password,
        role,
      });

      // The backend must verify the account's actual role.
      // This check prevents navigation to a mismatched role dashboard.
      const actualRole = String(
        response?.role || response?.user?.role || ""
      ).toUpperCase();

      if (actualRole && actualRole !== role) {
        setError(
          `This account is registered as ${actualRole.replaceAll(
            "_",
            " "
          )}. Please select the correct account type.`
        );
        return;
      }

      const destination = location.state?.from;

      if (
        destination?.pathname &&
        destination.pathname.startsWith("/") &&
        !destination.pathname.startsWith("//")
      ) {
        navigate(
          destination.pathname +
            destination.search +
            destination.hash,
          { replace: true }
        );
      } else if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "RESTAURANT_OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#faf9f6] lg:grid-cols-2">
      {/* Branding panel */}
      <section className="relative hidden overflow-hidden bg-stone-950 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-700/20 blur-3xl" />

        <Link to="/" className="relative z-10 w-fit text-3xl font-black">
          TAKE<span className="text-orange-500">IT.</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-orange-300">
            <UtensilsCrossed size={16} />
            Good food. Great moments.
          </span>

          <h1 className="mt-8 text-5xl font-black leading-tight xl:text-6xl">
            Your next
            <br />
            favourite meal
            <br />
            is just a click
            <br />
            <span className="text-orange-500">away.</span>
          </h1>

          <p className="mt-6 max-w-md leading-7 text-stone-400">
            Sign in to discover restaurants, order delicious food,
            and enjoy a simpler way to satisfy your cravings.
          </p>
        </div>

        <p className="relative z-10 text-sm text-stone-500">
          © {new Date().getFullYear()} TAKE IT. Made for food lovers.
        </p>
      </section>

      {/* Login form */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-10 inline-block text-3xl font-black lg:hidden"
          >
            TAKE<span className="text-orange-500">IT.</span>
          </Link>

          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Welcome back
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-stone-900">
              Sign in<span className="text-orange-500">.</span>
            </h2>

            <p className="mt-3 text-stone-500">
              Choose your account type and enter your details.
            </p>
          </div>

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account type selector */}
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-stone-700">
                Sign in as
              </legend>

              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((item) => {
                  const Icon = item.icon;
                  const selected = role === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setRole(item.value);
                        setError("");
                      }}
                      aria-pressed={selected}
                      className={`flex min-h-24 flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition ${
                        selected
                          ? "border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-100"
                          : "border-stone-200 bg-white text-stone-600 hover:border-orange-300"
                      }`}
                    >
                      <Icon size={21} className="mb-2" />

                      <span className="text-xs font-extrabold sm:text-sm">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-stone-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-stone-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-12 pr-12 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-extrabold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-stone-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-extrabold text-orange-600 hover:text-orange-700"
            >
              Create account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-stone-400">
            By signing in, you agree to use TAKE IT responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}

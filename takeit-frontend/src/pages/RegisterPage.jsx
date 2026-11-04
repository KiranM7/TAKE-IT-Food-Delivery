import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  UserRound,
  Mail,
  LockKeyhole,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";

import { authService } from "../services/authService";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  address: "",
  dateOfBirth: "",
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (!fullName || !email || !form.password || !form.dateOfBirth) {
      setError("Please complete all required fields.");
      return;
    }

    if (fullName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (new Date(form.dateOfBirth) >= new Date()) {
      setError("Date of birth must be in the past.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        fullName,
        email,
        password: form.password,
        phone,
        address,
        dateOfBirth: form.dateOfBirth,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful! Please sign in.",
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

  return (
    <main className="min-h-screen bg-[#faf9f6] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-3xl font-black">
          TAKE<span className="text-orange-500">IT.</span>
        </Link>

        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Join TAKE IT
            </p>

            <h1 className="mt-3 text-3xl font-black text-stone-900 sm:text-4xl">
              Create your account<span className="text-orange-500">.</span>
            </h1>

            <p className="mt-3 text-stone-500">
              Register to discover restaurants and order your favourite food.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-bold">
                Full name *
              </label>

              <div className="relative">
                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">
                Email address *
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
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-bold">
                  Password *
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
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold"
                >
                  Confirm password *
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="accent-orange-500"
              />
              Show passwords
              <Eye size={16} />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-bold">
                  Phone number
                </label>

                <div className="relative">
                  <Phone
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-2 block text-sm font-bold"
                >
                  Date of birth *
                </label>

                <div className="relative">
                  <CalendarDays
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
                  />

                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    autoComplete="bday"
                    max={new Date().toLocaleDateString("en-CA")}
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-bold">
                Address
              </label>

              <div className="relative">
                <MapPin
                  size={19}
                  className="absolute left-4 top-4 text-stone-400"
                />

                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="Enter your delivery address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className={`${inputClass} resize-y`}
                />
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-extrabold text-orange-600 hover:text-orange-700"
            >
              Sign in
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} TAKE IT
        </p>
      </div>
    </main>
  );
}
